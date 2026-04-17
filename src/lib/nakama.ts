/**
 * Nakama client — thin wrapper around @heroiclabs/nakama-js
 *
 * Handles authentication, socket connection, matchmaking, and
 * sending match data. Event handlers (onmatchdata, onmatchmakermatched)
 * are set directly on the socket by the consumer.
 *
 * healthcheck() — fires a GET to /healthcheck on mount so Render
 * has time to spin the server back up before the user clicks anything.
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
  process.env.NEXT_PUBLIC_NAKAMA_PORT ||  "",
  true,
);

let session: Session | null = null;
let socket: Socket | null = null;

// ── Healthcheck ──────────────────────────────────────────────────────────────

/**
 * Silently pings /healthcheck to wake up the Render backend.
 * Should be called once when the page mounts.
 * Errors are intentionally swallowed — this is a best-effort warm-up.
 */
export async function healthcheck(): Promise<void> {
  const host = process.env.NEXT_PUBLIC_NAKAMA_HOST || "tic-tac-toe-nakama-backend.onrender.com";
  const url = `https://${host}/healthcheck`;
  try {
    await fetch(url, { method: "GET", mode: "no-cors" });
  } catch {
    //server may still be waking up
  }
}
 
// ── Helpers ──────────────────────────────────────────────────────────────────

function getDeviceId(): string {
  const key = "device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
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
  if (!socket) return;
  await socket.sendMatchState(matchId, OpCode.MOVE, JSON.stringify({ position }));
}

export async function leaveMatch(matchId: string) {
  if (socket) await socket.leaveMatch(matchId);
}

// ── Private Rooms ─────────────────────────────────────────────────────────────

/**
 * Create a private authoritative match via RPC.
 * Returns the match ID and the short room code the creator should share.
 */
export async function createPrivateRoom(): Promise<{ matchId: string; roomCode: string }> {
  const sess = await authenticate();
  const result = await client.rpc(sess, "rpc_create_match", {});
  const { matchId, roomCode } = result.payload as { matchId: string; roomCode: string };
  return { matchId, roomCode };
}

/**
 * Resolve a 6-char room code to a match ID via RPC, then join the match.
 * Returns the full matchId.
 */
export async function joinPrivateRoom(code: string): Promise<string> {
  const sess = await authenticate();
  const result = await client.rpc(sess, "rpc_join_private_room", { code: code.toUpperCase() });
  const { matchId } = result.payload as { matchId: string };
  // Join on the socket so match state events start flowing
  const s = await connectSocket();
  await s.joinMatch(matchId);
  return matchId;
}