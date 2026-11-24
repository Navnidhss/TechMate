export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
}

/** Page/section heading with the signature amber underline bar. */
export function SectionHeading({ eyebrow, title, intro, align = "left", className = "" }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      )}
      <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      <div className={`heading-bar ${centered ? "mx-auto" : ""}`} />
      {intro && <p className="mt-4 text-base leading-relaxed">{intro}</p>}
    </div>
  );
}
