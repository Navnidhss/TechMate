import type { Metadata } from "next";

import { AdminBanner } from "@/components/admin/AdminBanner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { saveSettings } from "@/lib/actions/admin";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Content — settings" };

interface SettingsPageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminSettingsContentPage({ searchParams }: SettingsPageProps) {
  const { saved, error } = await searchParams;
  const settings = await getSettings();

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Site settings"
        description="Your business details. These power the header, footer, contact page, email notifications and the tracking instructions — change them once, and the whole site updates."
      />

      <AdminBanner saved={saved} error={error} />

      <form action={saveSettings} className="space-y-5">
        <section className="card space-y-4 p-5">
          <h2 className="font-display text-base font-bold text-ink">Business details</h2>

          <FormInput
            name="businessName"
            label="Business name"
            defaultValue={settings.businessName}
            hint="Shown in the header, footer, emails and page titles."
            required
          />
          <FormInput
            name="tagline"
            label="Tagline"
            defaultValue={settings.tagline}
            hint="One short line used in the footer, on the home page and in search results."
            required
          />
          <FormInput
            name="abn"
            label="ABN (optional)"
            defaultValue={settings.abn}
            hint="Shown in the footer once you have it. Leave blank to hide."
          />
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-display text-base font-bold text-ink">Contact details</h2>

          <div className="rounded-xl bg-primary/5 p-3 text-sm">
            <p className="font-semibold text-ink">This is where all enquiry emails are sent.</p>
            <p className="mt-0.5 text-xs text-primary-dark">
              Change it here and every form notification follows automatically — no code changes needed.
            </p>
          </div>

          <FormInput
            name="contactEmail"
            label="Contact email"
            type="email"
            defaultValue={settings.contactEmail}
            hint="Used for enquiry notifications and shown on the site."
            required
          />
          <FormInput
            name="contactPhone"
            label="Contact phone"
            type="tel"
            defaultValue={settings.contactPhone}
            hint="Shown in the header, footer, contact page and customer emails."
            required
          />
          <FormInput
            name="tradingHours"
            label="Trading hours"
            defaultValue={settings.tradingHours}
            hint="e.g. Monday–Saturday 8am–6pm · Sunday by appointment."
            required
          />
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-display text-base font-bold text-ink">Workshop &amp; remote support</h2>

          <FormTextarea
            name="workshopAddress"
            label="Workshop / drop-off details"
            defaultValue={settings.workshopAddress}
            rows={3}
            hint="What customers should do if they need to drop a device off."
            required
          />
          <FormTextarea
            name="anydeskInfo"
            label="Remote support instructions"
            defaultValue={settings.anydeskInfo}
            rows={3}
            hint="Shown on the remote support page and contact page. Mention where to download AnyDesk and what to send you."
            required
          />
        </section>

        <section className="card space-y-4 p-5">
          <div>
            <h2 className="font-display text-base font-bold text-ink">Live booking availability</h2>
            <p className="text-sm text-muted">
              These control the time slots customers can book on the website. Times are Perth time.
            </p>
          </div>

          <FormInput
            name="schedDays"
            label="Days you work"
            defaultValue={settings.schedDays}
            hint="Numbers 1–7 separated by commas, where 1 = Monday and 7 = Sunday. Default is 1,2,3,4,5,6 (Mon–Sat)."
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              name="schedStart"
              label="Earliest booking time"
              type="time"
              defaultValue={settings.schedStart}
              hint="First slot of the day, e.g. 08:00."
              required
            />
            <FormInput
              name="schedEnd"
              label="Latest booking time"
              type="time"
              defaultValue={settings.schedEnd}
              hint="Jobs must finish by this time, e.g. 18:00."
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              name="schedHorizonDays"
              label="Book ahead (days)"
              type="number"
              defaultValue={settings.schedHorizonDays}
              hint="How far ahead the calendar opens."
              required
            />
            <FormInput
              name="schedNoticeHours"
              label="Minimum notice (hours)"
              type="number"
              defaultValue={settings.schedNoticeHours}
              hint="No bookings closer than this to now."
              required
            />
            <FormInput
              name="schedBufferMinutes"
              label="Break between jobs (minutes)"
              type="number"
              defaultValue={settings.schedBufferMinutes}
              hint="Travel/reset time kept free after each job."
              required
            />
          </div>
          <FormTextarea
            name="schedPolicyNote"
            label="Cancellation policy shown at booking"
            defaultValue={settings.schedPolicyNote}
            rows={2}
            hint="A friendly note under the booking confirmation — no aggressive no-show wording."
            required
          />
        </section>

        <div className="flex items-center gap-3">
          <SubmitButton pendingLabel="Saving settings…">Save settings</SubmitButton>
          <p className="text-xs text-muted">Changes appear on the public site immediately.</p>
        </div>
      </form>
    </div>
  );
}
