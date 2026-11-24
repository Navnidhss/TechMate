import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { prisma } from "@/lib/db";
import { COOKIE_NAME, verifySessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Change password",
  robots: { index: false, follow: false },
};

export default async function ChangePasswordPage() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const uid = verifySessionToken(token);
  if (uid === null) redirect("/admin/login");

  const user = await prisma.adminUser.findUnique({ where: { id: uid } });
  if (!user) redirect("/admin/login");

  return (
    <div className="hero-glow flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.svg" alt="" width={48} height={48} className="h-12 w-12" />
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">
            {user.mustChangePassword ? "Choose a new password" : "Change your password"}
          </h1>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {user.mustChangePassword
              ? "This is your first sign-in, so please replace the temporary password before continuing."
              : "Pick something long and memorable — at least 10 characters."}
          </p>
        </div>

        <div className="card p-6">
          <ChangePasswordForm mustChange={user.mustChangePassword} />
        </div>

        {user.mustChangePassword ? (
          <form action="/admin/logout" method="post" className="mt-4 text-center">
            <button type="submit" className="text-xs font-semibold text-muted hover:text-danger">
              Log out instead
            </button>
          </form>
        ) : (
          <p className="mt-4 text-center text-xs text-muted">
            <a href="/admin" className="font-semibold text-primary hover:text-primary-dark">
              Back to dashboard
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
