import type { ReactNode } from "react";

export interface PageHeroProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  children?: ReactNode;
}

/** Shared page header used across the public site for a consistent rhythm. */
export function PageHero({ eyebrow, title, intro, align = "left", children }: PageHeroProps) {
  const centered = align === "center";
  return (
    <section className="hero-glow border-b border-line bg-surface">
      <div className="container-page py-12 sm:py-16">
        <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          )}
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <div className={`heading-bar ${centered ? "mx-auto" : ""}`} />
          {intro && <p className="mt-4 text-base leading-relaxed sm:text-lg">{intro}</p>}
        </div>
        {children && <div className={centered ? "mt-7 text-center" : "mt-7"}>{children}</div>}
      </div>
    </section>
  );
}
