"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "@/components/Icon";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/service-areas", label: "Areas" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export interface SiteHeaderProps {
  phone: string;
}

export function SiteHeader({ phone }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const telHref = `tel:${phone.replace(/[^0-9+]/g, "")}`;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-card/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4 sm:h-20">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="TechMate home">
          <Image src="/logo.svg" alt="" width={40} height={40} className="h-9 w-9 sm:h-10 sm:w-10" priority />
          <span className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            <span className="text-ink">Tech</span>
            <span className="text-primary">Mate</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-primary/5 text-primary"
                  : "text-body hover:bg-surface hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <a
            href={telHref}
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink transition-colors hover:text-primary md:inline-flex"
          >
            <Icon name="phone" size={16} className="text-primary" />
            {phone}
          </a>
          <Link href="/book" className="btn-accent btn-small sm:px-5 sm:py-2.5 sm:text-sm">
            Book now
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <Icon name={open ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-card lg:hidden">
          <nav className="container-page grid gap-1 py-4" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(link.href) ? "bg-primary/5 text-primary" : "text-body"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a href={telHref} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink">
              <Icon name="phone" size={16} className="text-primary" />
              {phone}
            </a>
            <Link href="/track" className="rounded-lg px-3 py-2.5 text-sm font-medium text-body">
              Track your repair
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
