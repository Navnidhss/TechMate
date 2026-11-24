import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

import { encryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { exchangeCode, oauthRedirectUri } from "@/lib/google";
import { isGoogleConfigured } from "@/lib/google-auth";

/** Best-effort display email from the OAuth id_token (no signature verification needed for display). */
function emailFromIdToken(idToken: string | undefined): string {
  if (!idToken) return "";
  try {
    const payload = idToken.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string };
    return decoded.email ?? "";
  } catch {
    return "";
  }
}

function failure(request: NextRequest, reason: string) {
  return NextResponse.redirect(new URL(`/admin/calendar?error=${encodeURIComponent(reason)}`, request.url));
}

/** GET /admin/calendar/callback — Google redirects here after the owner approves access. */
export async function GET(request: NextRequest) {
  if (!isGoogleConfigured()) return failure(request, "Google Calendar isn't configured on this server.");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("tm_oauth_state")?.value;
  cookieStore.delete("tm_oauth_state");

  if (oauthError) return failure(request, "Google access was not approved.");
  if (!code || !state || !expectedState || state !== expectedState) {
    return failure(request, "That connection attempt didn't match. Please try connecting again.");
  }

  try {
    const tokens = await exchangeCode(code, oauthRedirectUri(request.nextUrl.origin));
    if (!tokens.refreshToken) {
      return failure(request, "Google didn't return a refresh token. Please try again and approve offline access.");
    }

    const googleEmail = emailFromIdToken(tokens.idToken) || "Connected Google account";
    const data = {
      googleEmail,
      accessTokenEnc: encryptSecret(tokens.accessToken),
      refreshTokenEnc: encryptSecret(tokens.refreshToken),
      accessTokenExpiry: new Date(Date.now() + tokens.expiresIn * 1000),
      lastSyncedAt: null,
    };

    await prisma.calendarConnection.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    await prisma.calendarCache.deleteMany();

    return NextResponse.redirect(new URL("/admin/calendar?connected=1", request.url));
  } catch (error) {
    console.error("[google] OAuth exchange failed:", error);
    return failure(request, "We couldn't complete the Google connection. Please try again.");
  }
}
