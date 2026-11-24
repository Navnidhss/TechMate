import type { Metadata } from "next";

import { AdminBanner } from "@/components/admin/AdminBanner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { deleteService, saveService, toggleServiceActive } from "@/lib/actions/admin";
import { getActiveServices, parseCsv } from "@/lib/content";
import { prisma } from "@/lib/db";
import { DELIVERY_OPTIONS, DELIVERY_SHORT_LABELS } from "@/lib/statuses";

export const metadata: Metadata = { title: "Content — services" };

const ICON_OPTIONS = [
  "laptop",
  "shield",
  "drive",
  "headset",
  "briefcase",
  "setup",
  "wifi",
  "devices",
  "cart",
  "tool",
];

interface ServicesPageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminServicesContentPage({ searchParams }: ServicesPageProps) {
  const { saved, error } = await searchParams;
  const [services, activeServices, bookingCounts] = await Promise.all([
    prisma.service.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    getActiveServices(),
    prisma.bookingRequest.groupBy({ by: ["serviceSlug"], _count: { _all: true } }),
  ]);
  const countBySlug = new Map(bookingCounts.map((row) => [row.serviceSlug, row._count._all]));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Services"
        description="What you offer, how it's described and what it costs. Edits appear on the public site immediately."
      >
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
          {activeServices.length} active / {services.length} total
        </span>
      </AdminPageHeader>

      <AdminBanner saved={saved} error={error} />

      <details className="card p-5">
        <summary className="cursor-pointer font-display text-sm font-bold text-primary">
          + Add a new service
        </summary>
        <form action={saveService} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="new-name" className="field-label">Service name</label>
              <input id="new-name" name="name" className="input" placeholder="e.g. Smart TV Setup" maxLength={80} />
            </div>
            <div>
              <label htmlFor="new-slug" className="field-label">Web address name</label>
              <input id="new-slug" name="slug" className="input" placeholder="e.g. smart-tv-setup" maxLength={60} />
              <p className="field-hint">Lowercase letters, numbers and hyphens. This becomes /services/your-name.</p>
            </div>
          </div>

          <div>
            <label htmlFor="new-shortDesc" className="field-label">Card summary</label>
            <input id="new-shortDesc" name="shortDesc" className="input" maxLength={160} placeholder="One friendly sentence for the service cards" />
          </div>

          <div>
            <label htmlFor="new-description" className="field-label">Full description</label>
            <textarea id="new-description" name="description" rows={6} className="textarea" placeholder="Two or three short paragraphs. Leave a blank line between paragraphs." />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="new-priceFrom" className="field-label">Price guide</label>
              <input id="new-priceFrom" name="priceFrom" className="input" placeholder="From $89" maxLength={40} />
            </div>
            <div>
              <label htmlFor="new-priceNotes" className="field-label">Price note</label>
              <input id="new-priceNotes" name="priceNotes" className="input" placeholder="Fixed quote before work begins" maxLength={300} />
            </div>
            <div>
              <label htmlFor="new-icon" className="field-label">Icon</label>
              <select id="new-icon" name="icon" className="select" defaultValue="tool">
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className="field-label">How is it delivered?</legend>
            <div className="flex flex-wrap gap-4 text-sm">
              {DELIVERY_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input type="checkbox" name="delivery" value={option} defaultChecked={option === "onsite"} className="h-4 w-4 accent-primary" />
                  {DELIVERY_SHORT_LABELS[option]}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="new-sortOrder" className="field-label">Order on the page</label>
            <input id="new-sortOrder" name="sortOrder" type="number" min={0} max={9999} defaultValue={services.length + 1} className="input max-w-32" />
          </div>

          <SubmitButton pendingLabel="Adding…">Add service</SubmitButton>
        </form>
      </details>

      <div className="space-y-3">
        {services.map((service) => {
          const delivery = parseCsv(service.delivery);
          const bookings = countBySlug.get(service.slug) ?? 0;

          return (
            <article key={service.id} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-sm font-bold text-ink">{service.name}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        service.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {service.active ? "Active" : "Hidden"}
                    </span>
                    <span className="text-xs text-muted">#{service.sortOrder}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    /services/{service.slug} · {service.priceFrom ?? "no price shown"} · {delivery.join(", ")}
                  </p>
                </div>

                <form action={toggleServiceActive}>
                  <input type="hidden" name="id" value={service.id} />
                  <SubmitButton variant="outline" pendingLabel="Saving…">
                    {service.active ? "Hide from site" : "Show on site"}
                  </SubmitButton>
                </form>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-semibold text-primary">Edit this service</summary>

                <form action={saveService} className="mt-3 space-y-4 border-t border-line pt-4">
                  <input type="hidden" name="id" value={service.id} />
                  <input type="hidden" name="slug" value={service.slug} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`name-${service.id}`} className="field-label">Service name</label>
                      <input id={`name-${service.id}`} name="name" defaultValue={service.name} className="input" maxLength={80} />
                    </div>
                    <div>
                      <label className="field-label">Web address</label>
                      <p className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-muted">
                        /services/{service.slug} <span className="text-xs">(fixed)</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`short-${service.id}`} className="field-label">Card summary</label>
                    <input id={`short-${service.id}`} name="shortDesc" defaultValue={service.shortDesc} className="input" maxLength={160} />
                  </div>

                  <div>
                    <label htmlFor={`desc-${service.id}`} className="field-label">Full description</label>
                    <textarea id={`desc-${service.id}`} name="description" defaultValue={service.description} rows={8} className="textarea" />
                    <p className="field-hint">Leave a blank line between paragraphs.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor={`price-${service.id}`} className="field-label">Price guide</label>
                      <input id={`price-${service.id}`} name="priceFrom" defaultValue={service.priceFrom ?? ""} className="input" maxLength={40} />
                    </div>
                    <div>
                      <label htmlFor={`notes-${service.id}`} className="field-label">Price note</label>
                      <input id={`notes-${service.id}`} name="priceNotes" defaultValue={service.priceNotes ?? ""} className="input" maxLength={300} />
                    </div>
                    <div>
                      <label htmlFor={`icon-${service.id}`} className="field-label">Icon</label>
                      <select id={`icon-${service.id}`} name="icon" className="select" defaultValue={service.icon ?? "tool"}>
                        {ICON_OPTIONS.map((icon) => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <fieldset>
                    <legend className="field-label">How is it delivered?</legend>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {DELIVERY_OPTIONS.map((option) => (
                        <label key={option} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="delivery"
                            value={option}
                            defaultChecked={delivery.includes(option)}
                            className="h-4 w-4 accent-primary"
                          />
                          {DELIVERY_SHORT_LABELS[option]}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label htmlFor={`order-${service.id}`} className="field-label">Order on the page</label>
                    <input id={`order-${service.id}`} name="sortOrder" type="number" min={0} max={9999} defaultValue={service.sortOrder} className="input max-w-32" />
                  </div>

                  <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
                </form>

                <details className="mt-3 rounded-xl border border-danger/20 bg-danger/5 p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-danger">Delete this service</summary>
                  <div className="mt-2 text-xs leading-relaxed text-body">
                    {bookings > 0 ? (
                      <p>
                        This service has {bookings} booking(s) linked to it, so it can&apos;t be deleted. Use “Hide from site”
                        instead so it disappears from the public pages but the history stays intact.
                      </p>
                    ) : (
                      <>
                        <p>This permanently removes the service and its page. This can&apos;t be undone.</p>
                        <form action={deleteService} className="mt-2">
                          <input type="hidden" name="id" value={service.id} />
                          <SubmitButton variant="outline" pendingLabel="Deleting…">
                            Yes, delete permanently
                          </SubmitButton>
                        </form>
                      </>
                    )}
                  </div>
                </details>
              </details>
            </article>
          );
        })}
      </div>
    </div>
  );
}
