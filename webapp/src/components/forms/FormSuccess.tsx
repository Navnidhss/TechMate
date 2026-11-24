import Link from "next/link";

import { Icon } from "@/components/Icon";

export interface FormSuccessProps {
  title: string;
  message: string;
}

/** Friendly confirmation panel shown in place of the form after a successful submit. */
export function FormSuccess({ title, message }: FormSuccessProps) {
  return (
    <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center sm:p-8">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
        <Icon name="check-circle" size={26} />
      </span>
      <h3 className="mt-4 font-display text-xl font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed">{message}</p>
      <p className="mx-auto mt-3 max-w-md text-xs text-muted">
        A copy is on its way to your inbox. If it doesn&apos;t arrive in a few minutes, check your spam folder — or just reply
        to us another way.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn-outline btn-small">
          Back to home
        </Link>
        <Link href="/services" className="btn-outline btn-small">
          Browse services
        </Link>
      </div>
    </div>
  );
}
