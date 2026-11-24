# TechMate — Content Editing Guide (for the business owner)

This guide is for you — no technical knowledge needed. Everything on the website can be changed from
the admin area, and your changes appear on the public site immediately.

---

## 1. Signing in

1. Go to **`/admin`** on your website (for example `https://yourdomain.com.au/admin`).
2. Enter your username and password.
3. The first time you sign in, you'll be asked to choose a new password. Make it at least 10
   characters and something you'll remember — a short phrase works well.
4. You stay signed in for 12 hours. Use **Log out** in the sidebar when you're finished, especially on
   a shared computer.

If you forget your password, you can't reset it by email yet — see section 9 for what to do.

---

## 2. The dashboard

When you sign in you'll see:

- **Four number cards** — new bookings, new enquiries, new recoveries and active jobs.
- **Latest activity** — the five newest requests across all the forms.
- **Quick links** — jump straight to jobs, services, FAQs, areas or settings.

---

## 3. Handling customer requests

The left menu has one page for each kind of request:

| Page | What's in it |
|---|---|
| **Bookings** | Appointment requests from the booking form |
| **Enquiries** | General messages from the contact form |
| **Quotes** | Requests for a price |
| **Recoveries** | Data recovery intake forms |
| **Remote** | AnyDesk / remote support requests |
| **Appointments** | Live bookings made through the scheduler (real times in your calendar) |
| **Calendar** | Connect Google Calendar, block days/times off, and force a sync |

Each request shows the person's name, contact details, a summary, and a **status dropdown**.

### Changing a status

Pick a new status from the dropdown — it saves straight away. The statuses mean whatever you want
them to mean, but a sensible routine is:

- **New** → you haven't dealt with it yet (this drives the dashboard counts).
- **Contacted** → you've replied or called.
- **Confirmed / Quoted / Assessing** → work is arranged or underway.
- **Completed / Closed** → done and dusted.
- **Cancelled** → the customer pulled out.

Click **View full details** to see everything the customer wrote, including their message, preferred
day/time and address.

---

## 4. Live bookings (appointments)

Customers can also book a real time slot at **Book now** on the website:

1. They pick a service, how they'd like help, a day and a time, then their details.
2. The slot is booked instantly — no confirmation step. They get a reference and a confirmation email
   with a link to change or cancel.
3. The booking appears under **Appointments** in admin, and in your Google Calendar once it's
   connected.

### Cancelling an appointment

- **You:** open **Appointments**, find the booking and press **Cancel booking**. The customer is
  emailed and the time becomes bookable again immediately.
- **The customer:** they use the cancel link in their confirmation email. You're emailed automatically.
- **Via Google:** if you delete the event in Google Calendar, the website notices within about five
  minutes (or press **Sync now** on the Calendar page), cancels the booking and frees the slot.
- **Changing the time:** don't drag the event in Google. Cancel in admin and ask the customer to
  rebook — the website keeps the original time otherwise.

### Days off and blocked times

**Calendar → Days off & blocked time** — block a whole day (holiday, family day) or just a window
(lunch, school pickup). The times disappear from the booking page straight away. Events you add in
Google Calendar block time as well.

### Google Calendar

See **docs/CALENDAR_SETUP.md** for the one-time setup. Without it, live bookings still work but you
manage the times yourself and your Google events don't block slots. The Calendar page tells you
whether it's connected.

## 5. Turning a booking request into a job (with a tracking code)

When you're ready to take on a booking:

1. Open **Bookings**.
2. Find the booking and press **Create job**.
3. The job gets a unique code like **TM-8G9UUS**. The booking is marked **Confirmed** and you're taken
   to the job page.

Give the customer their code (it's also emailed to them when you update the job). They can enter it on
the **Track your repair** page to see the status and your latest update — nothing else about them is
shown.

---

## 6. Updating a job

On the job page there are two different notes. This is the important bit:

- **Customer update** (teal box) — written in plain English. It is shown on the tracking page **and
  emailed to the customer** when you save a changed status or note. Example:
  *"We've ordered the replacement screen — it should arrive Thursday. We'll text you when it's in."*
- **Private notes** (amber box) — for your eyes only. Parts ordered, phone call summaries, where the
  spare key is. Never shown to the customer.

Change the **Job status** dropdown as the work progresses. Press **Save job** when you're done —
the customer is emailed automatically.

The **Jobs** page lists every job with a quick status dropdown, so you can move several along without
opening each one.

---

## 7. Editing your services and prices

**Content → Services**

- Press **+ Add a new service** to create one. The "web address name" becomes the page address, e.g.
  `smart-tv-setup` → `/services/smart-tv-setup`. Use lowercase letters, numbers and hyphens.
- Press **Edit this service** on any service to change its name, card summary, full description,
  price guide, price note, icon, delivery options, **booking length** and order.
- **Booking length** is how much time the service needs in the live calendar (15–240 minutes, in
  15-minute steps). Customers see "About 90 minutes" on the booking page.
- Leave a **blank line** between paragraphs in the description.
- **Hide from site** removes a service from the public pages without deleting anything. Use this when
  you no longer offer something but want to keep the history.
- **Delete** permanently removes a service — but only if no bookings are linked to it. If it has
  bookings, hide it instead.

Prices are free text, so you can write `From $89`, `$79 per hour`, `Free assessment` or
`Quoted per order`.

---

## 8. Editing FAQs, service areas and settings

### FAQs

**Content → FAQ** — add a question, edit an existing one, change the order, or delete it. The first
four appear on the home page and on service pages; all of them appear on the FAQ page.

### Service areas

**Content → Areas** — add a suburb and choose its zone (pick an existing zone from the list or type a
new one). Press the **×** next to a suburb to remove it. These suburbs appear on the service areas page
and in the booking form's suggestions.

### Settings

**Content → Settings** — your business details:

- **Business name** and **tagline** — used across the whole site and in emails.
- **Contact email** — **this is where every enquiry email is sent.** Change it here and all future
  notifications follow automatically. No code needed.
- **Contact phone** — shown in the header, footer, contact page and customer emails.
- **Trading hours** — shown on the contact page and footer.
- **Workshop / drop-off details** — what customers should do if they need to drop a device off.
- **AnyDesk instructions** — shown on the remote support page.
- **ABN** — appears in the footer once you add it.

**Live booking availability** (same page):

- **Days you work** — numbers 1–7 (1 = Monday). Default 1,2,3,4,5,6 = Mon–Sat.
- **Earliest / latest booking time** — e.g. 08:00 and 18:00. Jobs must finish by the latest time.
- **Book ahead** — how many days into the future customers can book (default 30).
- **Minimum notice** — no bookings closer than this to now (default 2 hours).
- **Break between jobs** — travel/reset time after each booking (default 30 minutes).
- **Cancellation policy** — the friendly note shown at booking and in confirmation emails.

Press **Save settings** at the bottom. Changes appear immediately.

---

## 9. What customers see

- **Service pages** update as soon as you save a service.
- **Pricing** uses each service's price guide and price note.
- **Service areas** uses the suburb list.
- **Booking form** offers your active services and suggests your suburbs.
- **Contact page and footer** use your settings.
- **Tracking page** shows only a job's status and customer update — never personal details.
- **Book page** offers live times based on your working hours, existing bookings, Google Calendar
  events and days off.

---

## 10. Good habits

- **Change the starter password immediately.** The temporary login is `admin` /
  `TechMateAdmin2025!` — replace it on first sign-in. Use **Change password** in the sidebar any time.
- **Log out** when you finish, especially on a shared computer.
- **Back up occasionally.** Ask your developer to take a copy of the database file
  (`webapp/prisma/dev.db`) or use the project's git history. There is no automatic backup yet.
- **Forgot your password?** Ask your developer to reset it from the server. (A self-service
  "forgot password" email flow is not part of v1.)
- **Made a mistake?** Nothing is permanent except deleting a service or a FAQ — you can edit anything
  else again straight away. If you delete something by accident, ask your developer to restore it from
  a backup.

---

## 11. Quick reference

| I want to… | Go to |
|---|---|
| See what needs attention | Dashboard |
| Reply to a booking | Bookings → View full details |
| Give a customer a tracking code | Bookings → Create job |
| Tell a customer what's happening | Jobs → open the job → Customer update → Save |
| Change a price | Content → Services → Edit this service |
| Change how long a service takes | Content → Services → Booking length |
| See live bookings | Appointments |
| Cancel a live booking | Appointments → Cancel booking |
| Block a day off | Calendar → Days off & blocked time |
| Connect Google Calendar | Calendar |
| Change booking hours/notice/buffer | Content → Settings → Live booking availability |
| Stop offering a service | Content → Services → Hide from site |
| Add a suburb | Content → Areas |
| Change where emails go | Content → Settings → Contact email |
| Change my password | Sidebar → Change password |
