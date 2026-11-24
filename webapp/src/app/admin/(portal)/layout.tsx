import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/admin/Sidebar";
import { prisma } from "@/lib/db";
import { COOKIE_NAME, verifySessionToken } from "@/lib/session";

// Admin data must always be fresh (statuses, notes, content edits).
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const uid = verifySessionToken(token);
  if (uid === null) redirect("/admin/login");

  // Double-check the user still exists (and enforce the first-login change here too).
  const user = await prisma.adminUser.findUnique({ where: { id: uid } });
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword) redirect("/admin/change-password");

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar username={user.username} />
      <div className="min-w-0 flex-1">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
