# Google Calendar Setup (for the business owner)

This one-time setup connects your Google Calendar to the TechMate website so that:

- new customer bookings appear in your calendar automatically;
- events already in your calendar (appointments, personal commitments) block those times on the website;
- deleting a booking's event in Google frees the slot again.

You only need to do this once. It takes about 10–15 minutes. You'll need your Google account
(`nsabharwal97@gmail.com`) and access to the website's `.env` file (ask your developer if unsure).

> The website works without this — customers can still book, but you'll manage the times yourself and
> your Google events won't block slots. The admin Calendar page says "Local availability only" when
> it isn't connected.

---

## Step 1 — Create a Google Cloud project

1. Go to <https://console.cloud.google.com>.
2. Sign in with `nsabharwal97@gmail.com`.
3. At the top, click the project selector → **New project**.
4. Name it **TechMate** → **Create**, then make sure it's selected.

## Step 2 — Enable the Calendar API

1. In the left menu: **APIs & Services → Library**.
2. Search for **Google Calendar API**.
3. Open it and click **Enable**.

## Step 3 — Set up the consent screen

1. **APIs & Services → OAuth consent screen**.
2. Choose **External** → **Create**.
3. App name: **TechMate**. User support email: your email. Developer contact email: your email.
4. **Save and continue** through Scopes (you don't need to add scopes manually).
5. **Test users**: add `nsabharwal97@gmail.com` → **Save**.
6. **Important — publish the app:** on the OAuth consent screen, click **Publish app** and confirm.
   While an app is in "Testing", Google expires its permission every ~7 days, so syncing would stop
   weekly. Publishing keeps it connected. Google may show an "unverified app" warning when you
   connect — that's expected for a personal app; choose **Advanced → Go to TechMate (unsafe)** to
   continue. (Only you use it, and the only permission requested is Calendar events.)

## Step 4 — Create the login credentials

1. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Application type: **Web application**. Name: **TechMate website**.
3. Under **Authorised redirect URIs**, add exactly:

   ```
   http://localhost:3000/admin/calendar/callback
   ```

   When the site is deployed, also add the real address, e.g.
   `https://yourdomain.com.au/admin/calendar/callback` (keep both).
4. Click **Create**. Copy the **Client ID** and **Client secret**.

## Step 5 — Put the credentials in `.env`

Open `webapp/.env` (in the project folder) and fill in:

```env
GOOGLE_CLIENT_ID="paste-client-id-here"
GOOGLE_CLIENT_SECRET="paste-client-secret-here"
GOOGLE_CALENDAR_ID="primary"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- `GOOGLE_CALENDAR_ID` stays `primary` (your main calendar) unless you want a different one.
- `NEXT_PUBLIC_SITE_URL` must match the address you use in the browser (port 3000 in local dev).

Save the file and restart the website (`Ctrl+C` in the terminal, then `npm run dev`).

## Step 6 — Connect

1. Sign in to the admin area and open **Calendar**.
2. It should now say **Connect Google Calendar**. Click it.
3. Choose your Google account, review the permission (Calendar events), and approve.
4. You'll come back to the Calendar page showing **Connected as nsabharwal97@gmail.com**.

## Step 7 — Check it works

1. **Booking → calendar:** make a test booking on the website 3+ days ahead, then open Google
   Calendar — the event should be there with the service, customer and reference.
2. **Calendar → slots:** add an event directly in Google Calendar for tomorrow at 11am, then open the
   public booking page for a service: 11am (and neighbouring times, allowing the 30-minute buffer)
   should no longer be offered. If not, press **Sync now** on the admin Calendar page.
3. **Delete in Google:** delete the test booking's event in Google Calendar, wait a few minutes (or
   press **Sync now**) — the booking becomes "Cancelled (removed from Google)", you get an email, and
   the slot is bookable again.
4. Delete any other test events you created.

---

## Everyday use

- **Days off / appointments elsewhere:** add them to Google Calendar as normal — they block slots
  within about 5 minutes. You can also use **Calendar → Days off & blocked time** in admin.
- **Cancelling a booking:** use the admin **Appointments** page (the customer is emailed), or delete
  the event in Google Calendar. Either way the slot frees.
- **Changing a time:** don't drag the event in Google — the website won't know. Cancel the booking in
  admin and ask the customer to rebook, or use the calendar page's guidance.
- **Working hours, buffer, notice, booking window:** admin **Settings → Live booking availability**.
- **How long each service takes:** admin **Content → Services → Edit → Booking length**.

---

## Troubleshooting

| Symptom | What to do |
|---|---|
| Calendar page says "Local availability only" | The `GOOGLE_CLIENT_ID`/`SECRET` aren't set. Check `.env`, restart the app, reload. |
| "That connection attempt didn't match" | The browser took too long (over 10 minutes) or cookies were cleared. Click Connect again. |
| "Google didn't return a refresh token" | Click Connect again and approve. If it persists, remove TechMate from <https://myaccount.google.com/permissions> and reconnect. |
| "redirect_uri_mismatch" in Google | The redirect URI in Google Cloud must match exactly — including `http://` vs `https://` and the port. Copy the URI shown at the bottom of the admin Calendar page. |
| Sync stopped after about a week | The OAuth app was left in "Testing". Publish it (Step 3) and reconnect. |
| Google events not blocking slots | Press **Sync now**. Google is only checked every 5 minutes (or when a booking happens). |
| Booking didn't appear in Google | Check the admin Appointments list for "— Google" (not synced); make sure the connection is active, then try **Sync now**. |

If something still looks wrong, the server log shows `[google]` / `[calendar]` messages that will help
your developer diagnose it.
