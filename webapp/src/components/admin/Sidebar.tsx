"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/Icon";

const MAIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: "sparkle" },
  { href: "/admin/bookings", label: "Bookings", icon: "calendar" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "mail" },
  { href: "/admin/quotes", label: "Quotes", icon: "check-circle" },
  { href: "/admin/recoveries", label: "Recoveries", icon: "drive" },
  { href: "/admin/remote", label: "Remote", icon: "laptop" },
  { href: "/admin/jobs", label: "Jobs", icon: "tool" },
  { href: "/admin/appointments", label: "Appointments", icon: "calendar" },
  { href: "/admin/calendar", label: "Calendar", icon: "clock" },
];

const CONTENT_LINKS = [
  { href: "/admin/content/services", label: "Services", icon: "briefcase" },
  { href: "/admin/content/faq", label: "FAQ", icon: "headset" },
  { href: "/admin/content/areas", label: "Areas", icon: "pin" },
  { href: "/admin/content/settings", label: "Settings", icon: "lock" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon,
  pathname,
  compact = false,
}: {
  href: string;
  label: string;
  icon: string;
  pathname: string;
  compact?: boolean;
}) {
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        compact
          ? `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${
              active ? "bg-primary/10 text-primary" : "text-body hover:bg-surface"
            }`
          : `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-primary/10 text-primary" : "text-body hover:bg-surface hover:text-ink"
            }`
      }
    >
      <Icon name={icon} size={compact ? 15 : 17} className={active ? "text-primary" : "text-muted"} />
      {label}
    </Link>
  );
}

export interface SidebarProps {
  username: string;
}

export function Sidebar({ username }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-card md:flex">
        <div className="border-b border-line px-4 py-5">
          <Link href="/admin" className="flex items-center gap-2" aria-label="TechMate admin home">
            <Image src="/logo.svg" alt="" width={32} height={32} className="h-8 w-8" />
            <span className="font-display text-base font-bold tracking-tight">
              <span className="text-ink">Tech</span>
              <span className="text-primary">Mate</span>
              <span className="ml-1 text-xs font-semibold uppercase tracking-wide text-muted">Admin</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin navigation">
          <div className="space-y-0.5">
            {MAIN_LINKS.map((link) => (
              <NavLink key={link.href} {...link} pathname={pathname} />
            ))}
          </div>

          <p className="mt-5 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Content</p>
          <div className="space-y-0.5">
            {CONTENT_LINKS.map((link) => (
              <NavLink key={link.href} {...link} pathname={pathname} />
            ))}
          </div>
        </nav>

        <div className="border-t border-line p-3">
          <p className="px-3 pb-2 text-xs text-muted">
            Signed in as <span className="font-semibold text-ink">{username}</span>
          </p>
          <Link
            href="/admin/change-password"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-body hover:bg-surface hover:text-ink"
          >
            <Icon name="lock" size={16} className="text-muted" />
            Change password
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-body hover:bg-surface hover:text-ink"
          >
            <Icon name="arrow-right" size={16} className="text-muted" />
            View website
          </Link>
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger hover:bg-danger/5"
            >
              <Icon name="close" size={16} />
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile horizontal nav */}
      <div className="sticky top-14 z-30 border-b border-line bg-card md:hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="" width={26} height={26} className="h-6 w-6" />
            <span className="font-display text-sm font-bold text-ink">TechMate Admin</span>
          </Link>
          <form action="/admin/logout" method="post">
            <button type="submit" className="text-xs font-semibold text-danger">
              Log out
            </button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-1.5" aria-label="Admin navigation">
          {[...MAIN_LINKS, ...CONTENT_LINKS].map((link) => (
            <NavLink key={link.href} {...link} pathname={pathname} compact />
          ))}
        </nav>
      </div>
    </>
  );
}
