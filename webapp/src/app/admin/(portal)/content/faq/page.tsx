import type { Metadata } from "next";

import { AdminBanner } from "@/components/admin/AdminBanner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { deleteFaq, saveFaq } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Content — FAQ" };

interface FaqPageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminFaqContentPage({ searchParams }: FaqPageProps) {
  const { saved, error } = await searchParams;
  const faqs = await prisma.faq.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="FAQs"
        description="Questions and answers shown on the FAQ page and (the first four) on the home page and service pages."
      >
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">{faqs.length} questions</span>
      </AdminPageHeader>

      <AdminBanner saved={saved} error={error} />

      <details className="card p-5">
        <summary className="cursor-pointer font-display text-sm font-bold text-primary">+ Add a question</summary>
        <form action={saveFaq} className="mt-4 space-y-4">
          <div>
            <label htmlFor="new-question" className="field-label">Question</label>
            <input id="new-question" name="question" className="input" maxLength={200} placeholder="e.g. Do you fix Macs?" />
          </div>
          <div>
            <label htmlFor="new-answer" className="field-label">Answer</label>
            <textarea id="new-answer" name="answer" rows={4} className="textarea" maxLength={5000} placeholder="Answer in plain English, like you're talking to a friend." />
          </div>
          <div>
            <label htmlFor="new-faq-order" className="field-label">Order</label>
            <input id="new-faq-order" name="sortOrder" type="number" min={0} max={9999} defaultValue={faqs.length + 1} className="input max-w-32" />
          </div>
          <SubmitButton pendingLabel="Adding…">Add question</SubmitButton>
        </form>
      </details>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <article key={faq.id} className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-sm font-bold text-ink">
                <span className="mr-1.5 text-xs font-semibold text-muted">#{faq.sortOrder}</span>
                {faq.question}
              </h2>
            </div>
            <p className="mt-1.5 line-clamp-2 text-sm text-body">{faq.answer}</p>

            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-semibold text-primary">Edit this question</summary>
              <form action={saveFaq} className="mt-3 space-y-3 border-t border-line pt-4">
                <input type="hidden" name="id" value={faq.id} />
                <div>
                  <label htmlFor={`q-${faq.id}`} className="field-label">Question</label>
                  <input id={`q-${faq.id}`} name="question" defaultValue={faq.question} className="input" maxLength={200} />
                </div>
                <div>
                  <label htmlFor={`a-${faq.id}`} className="field-label">Answer</label>
                  <textarea id={`a-${faq.id}`} name="answer" defaultValue={faq.answer} rows={4} className="textarea" maxLength={5000} />
                </div>
                <div>
                  <label htmlFor={`o-${faq.id}`} className="field-label">Order</label>
                  <input id={`o-${faq.id}`} name="sortOrder" type="number" min={0} max={9999} defaultValue={faq.sortOrder} className="input max-w-32" />
                </div>
                <SubmitButton pendingLabel="Saving…">Save question</SubmitButton>
              </form>

              <form action={deleteFaq} className="mt-4 border-t border-line pt-3">
                <input type="hidden" name="id" value={faq.id} />
                <SubmitButton variant="outline" pendingLabel="Deleting…">Delete this question</SubmitButton>
              </form>
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}
