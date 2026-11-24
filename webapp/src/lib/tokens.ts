import crypto from "crypto";

/** Constant-time comparison for opaque tokens (cancel links). */
export function tokensMatch(provided: string, expected: string): boolean {
  if (!provided || provided.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(provided, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}
