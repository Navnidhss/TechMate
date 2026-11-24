import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

import { buildAuthUrl, oauthRedirectUri } from "@/lib/google";
import { isGoogleConfigured } from "@/lib/google-auth";

/** GET /admin/calendar/connect — starts the Google OAuth flow (session already checked by middleware). */
export async function GET(request: NextRequest) {
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/admin/calendar?error=not-configured", request.url));
  }

  const state = crypto.randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("tm_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
  });

  return NextResponse.redirect(buildAuthUrl(oauthRedirectUri(request.nextUrl.origin), state));
}
