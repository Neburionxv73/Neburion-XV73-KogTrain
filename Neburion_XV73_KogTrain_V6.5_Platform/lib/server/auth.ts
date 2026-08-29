import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "kogtrain_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET_NOT_CONFIGURED");
  return value;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, encoded: string) {
  const [salt, hash] = encoded.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function createSessionToken(userId: string) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { uid?: string; exp?: number };
    if (!parsed.uid || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed.uid;
  } catch { return null; }
}

export const sessionMaxAge = SESSION_TTL_SECONDS;
