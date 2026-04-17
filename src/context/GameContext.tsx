"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import * as nakama from "@/lib/nakama";

// ── Types ────────────────────────────────────────────────────────────────────

export type Screen = "home" | "room" | "searching" | "game" | "result";

// Win-line check (used by Board component for highlighting)
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
];

export function getWinningLine(board: (string | null)[]): number[] | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

// ── Context shape ────────────────────────────────────────────────────────────

export interface AppState {
  screen: Screen;
  matchId: string | null;
  playerMark: "X" | "O" | null;
  opponentName: string | null;
  board: (string | null)[];
  currentTurn: "X" | "O";
  winner: string | null;
  gameOver: boolean;
  ticket: string | null;
  error: string | null;
  roomCode: string | null;
}

interface GameContextValue {
  state: AppState;
  play: () => Promise<void>;
  cancelSearch: () => Promise<void>;
  makeMove: (position: number) => Promise<void>;
  reset: () => void;
  // Room mode
  goToRoom: () => void;
  createRoom: () => Promise<void>;
  joinRoom: (roomCode: string) => Promise<void>;
  isRoomLoading: boolean;
  isPlayLoading: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>("home");
  const [matchId, setMatchId] = useState<string | null>(null);
  const [playerMark, setPlayerMark] = useState<"X" | "O" | null>(null);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isRoomLoading, setIsRoomLoading] = useState(false);
  const [isPlayLoading, setIsPlayLoading] = useState(false);
  const socketReady = useRef(false);

  /**
   * Attach event handlers directly on the Nakama socket.
   * onmatchdata handles all server messages (state updates, game over, etc.)
   */
  const setupSocket = useCallback(() => {
    const socket = nakama.getSocket();
    if (!socket) return;

    socket.onmatchdata = (result) => {

      let data: any = {};
      try {
        if (result.data) {
          data = typeof result.data === "string"
            ? JSON.parse(result.data)
            : JSON.parse(String.fromCharCode(...new Uint8Array(result.data)));
        }
      } catch {
        return;
      }
      console.log('backend daata',data)

      switch (result.op_code) {
        
        case nakama.OpCode.STATE_UPDATE: {
          console.log('result.op_code',result.op_code);
          // Server sends full game state — just render it
          const userId = nakama.getUserId();
          const players = data.players || [];
          const me = players.find((p: any) => p.userId === userId);
          const opponent = players.find((p: any) => p.userId !== userId);

          setBoard(data.board.map((c: string) => (c === "" ? null : c)));
          setCurrentTurn(data.currentTurn);
          if (me) setPlayerMark(me.mark);
          if (opponent) setOpponentName(opponent.username);
          if (data.winner) setWinner(data.winner);
          setGameOver(data.gameOver || false);
          setScreen(data.gameOver ? "result" : "game");
          break;
        }
        case nakama.OpCode.GAME_OVER:
          setWinner(data.winner);
          setGameOver(true);
          setScreen("result");
          break;
        case nakama.OpCode.ERROR:
          setError(data.message);
          break;
        case nakama.OpCode.OPPONENT_LEFT:
          // Server also sends GAME_OVER right after, which sets the winner
          setGameOver(true);
          setScreen("result");
          break;
      }
    };
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────

  const play = useCallback(async () => {
    setIsPlayLoading(true);
    setError(null);
    try {
      await nakama.authenticate();
      await nakama.connectSocket();

      if (!socketReady.current) {
        setupSocket();
        socketReady.current = true;
      }

      const socket = nakama.getSocket()!;

      // When matchmaker finds an opponent, join the match
      socket.onmatchmakermatched = async (matched) => {
        console.log('matched',matched)
        let match;
        if (matched.match_id) {
          match = await nakama.joinMatch(matched.match_id);
        } else {
          return;
        }

        const userId = nakama.getUserId();
        const opponent = (match.presences || []).find((p: any) => p.user_id !== userId);

        setMatchId(match.match_id);
        setPlayerMark(null); // Server corrects this via STATE_UPDATE
        setOpponentName(opponent?.username || "Opponent");
        setBoard(Array(9).fill(null));
        setCurrentTurn("X");
        setWinner(null);
        setGameOver(false);
        setError(null);
        setScreen("game");
      };

      const t = await nakama.startMatchmaking();
      setTicket(t);
      setIsPlayLoading(false);
      setScreen("searching");
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to connect. Try again.");
    }
  }, [setupSocket]);

  const cancelSearch = useCallback(async () => {
    if (ticket) await nakama.cancelMatchmaking(ticket);
    setScreen("home");
    setTicket(null);
  }, [ticket]);

  // Send move to server — no local validation, server handles everything
  const makeMove = useCallback(async (position: number) => {
    console.log('position from frontend',position)
    if (!matchId || gameOver || currentTurn !== playerMark) return;
    await nakama.sendMove(matchId, position);
  }, [matchId, gameOver, currentTurn, playerMark]);

  const reset = useCallback(() => {
    if (matchId) nakama.leaveMatch(matchId);
    setScreen("home");
    setMatchId(null);
    setPlayerMark(null);
    setOpponentName(null);
    setBoard(Array(9).fill(null));
    setCurrentTurn("X");
    setWinner(null);
    setGameOver(false);
    setTicket(null);
    setError(null);
    setRoomCode(null);
  }, [matchId]);

  // ── Room Actions (connect to backend when ready) ───────────────────────

  const goToRoom = useCallback(() => {
    setScreen("room");
  }, []);

  const createRoom = useCallback(async () => {
    setIsRoomLoading(true);
    setError(null);
    setIsPlayLoading(true);
    try {
      await nakama.authenticate();
      await nakama.connectSocket();
      if (!socketReady.current) {
        setupSocket();
        socketReady.current = true;
      }
      const { matchId: mid, roomCode: code } = await nakama.createPrivateRoom();
      // Creator must join the match on the socket to receive STATE_UPDATE
      // when the opponent connects and the game begins.
      await nakama.joinMatch(mid);
      setMatchId(mid);
      setRoomCode(code);
      setBoard(Array(9).fill(null));
      setCurrentTurn("X");
      setWinner(null);
      setGameOver(false);
      // Stay on "room" screen — code is shown while waiting for opponent.
      // STATE_UPDATE will fire when both players are present → setScreen("game")
      setIsPlayLoading(false);
    } catch (e: any) {
      setError(e?.message || "Failed to create room.");
    } finally {
      setIsRoomLoading(false);
    }
  }, [setupSocket]);

  const joinRoom = useCallback(async (code: string) => {
    setIsRoomLoading(true);
    setError(null);
    setIsPlayLoading(true);
    try {
      await nakama.authenticate();
      await nakama.connectSocket();
      if (!socketReady.current) {
        setupSocket();
        socketReady.current = true;
      }
      const mid = await nakama.joinPrivateRoom(code);
      setMatchId(mid);
      setBoard(Array(9).fill(null));
      setCurrentTurn("X");
      setWinner(null);
      setGameOver(false);
      setError(null);
      // STATE_UPDATE from the server will set playerMark and transition to "game"
      setIsPlayLoading(false);
    } catch (e: any) {
      setError(e?.message || "Room not found. Check the code and try again.");
    } finally {
      setIsRoomLoading(false);
    }
  }, [setupSocket]);

  // Build state object for consumers
  const state: AppState = {
    screen, matchId, playerMark, opponentName,
    board, currentTurn, winner, gameOver, ticket, error, roomCode,
  };

  return (
    <GameContext.Provider value={{ state, play, cancelSearch, makeMove, reset, goToRoom, createRoom, joinRoom, isRoomLoading, isPlayLoading }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
