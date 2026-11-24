/**
 * Edge-safe session verification for middleware.
 *
 * Middleware runs on the Edge runtime, which does not support Node's
 * `crypto.createHmac`. This mirrors the HMAC-SHA256 signing in `session.ts`
 * using Web Crypto, so tokens created there verify here.
 *
 * IMPORTANT: keep the payload shape, secret and signature encoding in sync
 * with `src/lib/session.ts`.
 */

function base64Url(bytes: ArrayBuffer): string {
  const binary = Array.from(new Uint8Array(bytes), (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

export async function verifySessionTokenEdge(token: string | undefined): Promise<number | null> {
  if (!token?.includes(".")) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(process.env.SESSION_SECRET ?? ""),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const expected = base64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
    if (signature !== expected) return null;

    const data = JSON.parse(decodeBase64Url(payload)) as { uid: number; exp: number };
    if (!data.exp || data.exp < Date.now()) return null;
    return data.uid;
  } catch {
    return null;
  }
}
