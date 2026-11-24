import crypto from "crypto";

const COOKIE_NAME = "tm_admin_session";
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12h

function sign(payload: string): string {
  // TypeScript sees process.env values as possibly undefined; SESSION_SECRET is
  // required by .env.example, so fall back to an empty string for type safety.
  const secret = process.env.SESSION_SECRET ?? "";
  return crypto.createHmac("sha256", secret)
    .update(payload).digest("base64url");
}

export function createSessionToken(userId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE_MS }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): number | null {
  if (!token?.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (sig !== sign(payload)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { uid: number; exp: number };
    if (data.exp < Date.now()) return null;
    return data.uid;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
