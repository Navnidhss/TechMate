import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { COOKIE_NAME, verifySessionToken } from "@/lib/session";

/**
 * Shared guard for admin server actions.
 * The middleware protects page navigation, but actions are callable directly,
 * so every one must verify the signed session cookie and that the user exists.
 */
export async function requireAdmin(): Promise<number> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const uid = verifySessionToken(token);
  if (uid === null) redirect("/admin/login");

  const user = await prisma.adminUser.findUnique({ where: { id: uid } });
  if (!user) redirect("/admin/login");
  return uid;
}
