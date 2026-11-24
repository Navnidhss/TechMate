import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { refreshAccessToken } from "@/lib/google";

/** True when the owner has supplied Google OAuth credentials in .env. */
export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export async function getConnection() {
  return prisma.calendarConnection.findUnique({ where: { id: 1 } });
}

/**
 * A usable access token: decrypted from the DB, refreshed when it is within
 * 60 seconds of expiry. Returns null when Google isn't configured/connected or
 * if anything goes wrong — callers treat that as "local-only mode".
 */
export async function getValidAccessToken(): Promise<string | null> {
  if (!isGoogleConfigured()) return null;

  const connection = await getConnection();
  if (!connection) return null;

  try {
    if (connection.accessTokenExpiry.getTime() - Date.now() > 60_000) {
      return decryptSecret(connection.accessTokenEnc);
    }

    const refreshToken = decryptSecret(connection.refreshTokenEnc);
    if (!refreshToken) return null;

    const refreshed = await refreshAccessToken(refreshToken);
    await prisma.calendarConnection.update({
      where: { id: 1 },
      data: {
        accessTokenEnc: encryptSecret(refreshed.accessToken),
        accessTokenExpiry: new Date(Date.now() + refreshed.expiresIn * 1000),
        ...(refreshed.refreshToken
          ? { refreshTokenEnc: encryptSecret(refreshed.refreshToken) }
          : {}),
      },
    });
    return refreshed.accessToken;
  } catch (error) {
    console.error("[google] could not refresh access token:", error);
    return null;
  }
}
