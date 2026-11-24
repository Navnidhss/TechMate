import { Icon } from "@/components/Icon";

const STEPS = [
  {
    title: "Tell us the problem",
    text: "Fill in a short, plain-English form — or just give us a call. No tech knowledge needed.",
    icon: "headset",
  },
  {
    title: "We visit, or connect remotely",
    text: "You pick what suits you: we come to you, you drop it off, or we help over the screen with AnyDesk.",
    icon: "tool",
  },
  {
    title: "It's fixed, explained plainly",
    text: "Fixed quote first, then the repair — and a clear explanation of what was wrong and what we changed.",
    icon: "check-circle",
  },
] as const;

/** Three-step explainer used on the home page. */
export function HowItWorks() {
  return (
    <ol className="mt-10 grid gap-5 md:grid-cols-3">
      {STEPS.map((step, index) => (
        <li key={step.title} className="card flex gap-4 p-6">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
            <Icon name={step.icon} size={22} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Step {index + 1}</p>
            <h3 className="mt-1 font-display text-base font-bold text-ink">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
