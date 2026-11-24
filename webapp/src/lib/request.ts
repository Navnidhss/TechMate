import { headers } from "next/headers";

/** Best-effort client IP for rate limiting (proxy-aware, falls back to "local"). */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "local";
}
