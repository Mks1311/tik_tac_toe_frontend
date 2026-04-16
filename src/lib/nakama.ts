/**
 * Nakama client — thin wrapper around @heroiclabs/nakama-js
 *
 * Handles authentication, socket connection, matchmaking, and
 * sending match data. Event handlers (onmatchdata, onmatchmakermatched)
 * are set directly on the socket by the consumer.
 */

import { Client, Session, Socket } from "@heroiclabs/nakama-js";

// OpCodes must match the backend
export const OpCode = {
  MOVE: 1,
  STATE_UPDATE: 2,
  GAME_OVER: 3,
  ERROR: 4,
  OPPONENT_LEFT: 5,
};

// ── Nakama client (singleton) ────────────────────────────────────────────────

const client = new Client(
  process.env.NEXT_PUBLIC_NAKAMA_KEY || "defaultkey",
  process.env.NEXT_PUBLIC_NAKAMA_HOST || "tic-tac-toe-nakama-backend.onrender.com",
  process.env.NEXT_PUBLIC_NAKAMA_PORT || "",
  true,
);

let session: Session | null = null;
let socket: Socket | null = null;
 
// ── Helpers ──────────────────────────────────────────────────────────────────

function getDeviceId(): string {
  const key = "device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  console.log('id',id," key ",key)
  return id;
}

// ── Auth & Socket ────────────────────────────────────────────────────────────

export async function authenticate(): Promise<Session> {
  if (session && !session.isexpired(Date.now() / 1000)) return session;
  session = await client.authenticateDevice(getDeviceId(), true);
  return session;
}

export async function connectSocket(): Promise<Socket> {
  if (socket) return socket;
  const sess = await authenticate();
  socket = client.createSocket(true, false);
  await socket.connect(sess, false);
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function getUserId(): string | null {
  return session?.user_id || null;
}

// ── Matchmaking ──────────────────────────────────────────────────────────────

export async function startMatchmaking(): Promise<string> {
  const s = await connectSocket();
  const result = await s.addMatchmaker("*", 2, 2);
  return result.ticket;
}

export async function cancelMatchmaking(ticket: string) {
  if (socket) await socket.removeMatchmaker(ticket);
}

// ── Match actions ────────────────────────────────────────────────────────────

export async function joinMatch(matchId: string) {
  const s = await connectSocket();
  return await s.joinMatch(matchId);
}

export async function joinMatchByToken(token: string) {
  const s = await connectSocket();
  return await s.joinMatch(undefined as unknown as string, token);
}

export async function sendMove(matchId: string, position: number) {
  console.log('JSON.stringify({ position })',JSON.stringify({ position }))
  if (!socket) return;
  await socket.sendMatchState(matchId, OpCode.MOVE, JSON.stringify({ position }));
}

export async function leaveMatch(matchId: string) {
  if (socket) await socket.leaveMatch(matchId);
}
