import { NextResponse } from "next/server";

import { COOKIE_NAME } from "@/lib/session";

/** POST /admin/logout — clears the session cookie and returns to the login page. */
export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return response;
}
