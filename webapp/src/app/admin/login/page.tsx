import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { COOKIE_NAME, verifySessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  // Already signed in? Go straight to the dashboard.
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (verifySessionToken(token) !== null) redirect("/admin");

  return (
    <div className="hero-glow flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.svg" alt="" width={56} height={56} className="h-14 w-14" />
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">
            <span className="text-ink">Tech</span>
            <span className="text-primary">Mate</span> Admin
          </h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage jobs and website content.</p>
        </div>

        <div className="card p-6">
          <LoginForm next={next} />
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Private area — authorised staff only. All activity is logged.
        </p>
      </div>
    </div>
  );
}
