import type { Metadata } from "next";

import { AdminBanner } from "@/components/admin/AdminBanner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { deleteArea, saveArea } from "@/lib/actions/admin";
import { getAreasByZone } from "@/lib/content";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Content — service areas" };

interface AreasPageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminAreasContentPage({ searchParams }: AreasPageProps) {
  const { saved, error } = await searchParams;
  const [zones, areas] = await Promise.all([
    getAreasByZone(),
    prisma.serviceArea.findMany({ orderBy: [{ sortOrder: "asc" }, { suburb: "asc" }] }),
  ]);
  const idByZoneSuburb = new Map(areas.map((area) => [`${area.zone}|${area.suburb}`, area.id]));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Service areas"
        description="The suburbs you cover. These appear on the service areas page and in the booking form's suburb suggestions."
      >
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
          {areas.length} suburbs · {zones.length} zones
        </span>
      </AdminPageHeader>

      <AdminBanner saved={saved} error={error} />

      <details className="card p-5" open>
        <summary className="cursor-pointer font-display text-sm font-bold text-primary">+ Add a suburb</summary>
        <form action={saveArea} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor="zone" className="field-label">Zone</label>
            <input id="zone" name="zone" list="zone-list" className="input" placeholder="e.g. Northern Suburbs" maxLength={60} />
            <datalist id="zone-list">
              {zones.map((zone) => (
                <option key={zone.zone} value={zone.zone} />
              ))}
            </datalist>
            <p className="field-hint">Pick an existing zone or type a new one.</p>
          </div>
          <div>
            <label htmlFor="suburb" className="field-label">Suburb</label>
            <input id="suburb" name="suburb" className="input" placeholder="e.g. Alkimos" maxLength={60} />
          </div>
          <SubmitButton pendingLabel="Adding…">Add suburb</SubmitButton>
        </form>
      </details>

      <div className="grid gap-4 sm:grid-cols-2">
        {zones.map((zone) => (
          <section key={zone.zone} className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-ink">{zone.zone}</h2>
              <span className="text-xs text-muted">{zone.suburbs.length}</span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {zone.suburbs.map((suburb) => {
                const areaId = idByZoneSuburb.get(`${zone.zone}|${suburb}`);
                return (
                  <li
                    key={`${zone.zone}-${suburb}`}
                    className="group inline-flex items-center gap-1 rounded-full border border-line bg-surface py-1 pl-2.5 pr-1 text-xs font-medium text-body"
                  >
                    {suburb}
                    {areaId && (
                      <form action={deleteArea}>
                        <input type="hidden" name="id" value={areaId} />
                        <button
                          type="submit"
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"
                          aria-label={`Remove ${suburb} from ${zone.zone}`}
                          title={`Remove ${suburb}`}
                        >
                          ×
                        </button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <p className="text-xs text-muted">
        Removing a suburb only affects the website lists — existing bookings keep their suburb. Press × to remove, and add it
        again above if you made a mistake.
      </p>
    </div>
  );
}
