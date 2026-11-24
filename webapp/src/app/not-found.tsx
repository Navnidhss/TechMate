import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="hero-glow flex min-h-screen flex-col bg-surface">
      <header className="container-page flex h-20 items-center">
        <Link href="/" className="flex items-center gap-2.5" aria-label="TechMate home">
          <Image src="/logo.svg" alt="" width={40} height={40} className="h-10 w-10" />
          <span className="font-display text-xl font-bold tracking-tight">
            <span className="text-ink">Tech</span>
            <span className="text-primary">Mate</span>
          </span>
        </Link>
      </header>

      <div className="flex flex-1 items-center">
        <div className="container-page py-16 text-center">
          <p className="font-display text-6xl font-bold text-primary/60">404</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            This page seems to have wandered off
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed">
            Don&apos;t worry — it happens to the best of us. Let&apos;s get you back on track.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary">
              Back to home
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
