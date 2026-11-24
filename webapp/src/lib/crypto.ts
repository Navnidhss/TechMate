import crypto from "crypto";

const ALGO = "aes-256-gcm";

/** Deterministic key from SESSION_SECRET (never stored alongside the DB). */
function key(): Buffer {
  return crypto.scryptSync(process.env.SESSION_SECRET ?? "", "techmate-calendar", 32);
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${enc.toString("base64url")}.${tag.toString("base64url")}`;
}

export function decryptSecret(packed: string): string {
  const [ivB64, dataB64, tagB64] = packed.split(".");
  const decipher = crypto.createDecipheriv(ALGO, key(), Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
