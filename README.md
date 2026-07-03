# ReminderFlow — setup guide

This is a real, working app: business owners log in, add clients, and send
personalized reminder emails with a one-click reschedule link. Follow these
steps in order — none of them require touching code.

## What you'll create accounts on (all free to start)

1. **Supabase** — your database and login system
2. **Resend** — actually sends the emails
3. **GitHub** — stores your code
4. **Vercel** — hosts the live website

---

## Step 1 — Create your Supabase project

1. Go to supabase.com and sign up (free).
2. Click "New project." Name it anything (e.g. "reminderflow"). Pick a
   database password and save it somewhere safe.
3. Once the project loads, go to the **SQL Editor** tab (left sidebar).
4. Open the file `supabase-schema.sql` in this project, copy all of it,
   paste it into the SQL Editor, and click **Run**. This creates your
   database tables.

   **Already set this up before?** If you ran this file previously (before
   billing was added), instead run `supabase-migration-billing.sql` — it
   safely adds the new billing columns without touching your existing data.

5. Go to **Project Settings → API** (left sidebar, gear icon). You'll need
   three values from this page in Step 4:
   - `Project URL`
   - `anon public` key
   - `service_role` key (click "Reveal" — keep this one secret)

## Step 2 — Create your Resend account

1. Go to resend.com and sign up (free tier: 3,000 emails/month).
2. Go to **API Keys** and create a new key. Copy it — you'll need it in
   Step 4.
3. For real use, go to **Domains** and add your own domain (e.g.
   `yourbusiness.com`) so emails come from an address like
   `reminders@yourbusiness.com` instead of a generic one. Resend will show
   you DNS records to add — if you don't have a domain yet, you can skip
   this at first and use Resend's test sending address to try things out.

## Step 3 — Put the project on GitHub

1. Create a free account at github.com if you don't have one.
2. Create a new repository (e.g. "reminderflow").
3. Upload all the files in this project folder to that repository (GitHub's
   website lets you drag and drop files if you don't want to use the
   command line — look for "uploading an existing file" on the repo page).

## Step 4 — Deploy on Vercel

1. Go to vercel.com and sign up using your GitHub account.
2. Click "Add New → Project" and select the GitHub repository you just
   created.
3. Before clicking Deploy, open **Environment Variables** and add these,
   using the values you saved from Steps 1 and 2:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service_role key |
   | `RESEND_API_KEY` | your Resend API key |
   | `REMINDER_FROM_EMAIL` | e.g. `reminders@yourbusiness.com` |
   | `NEXT_PUBLIC_APP_URL` | your Vercel URL, e.g. `https://reminderflow.vercel.app` (you can update this after your first deploy once you know the URL) |

4. Click **Deploy**. In a minute or two, you'll get a live URL.
5. Go back into Vercel's environment variables and make sure
   `NEXT_PUBLIC_APP_URL` matches your real deployed URL, then redeploy
   (Vercel → Deployments → ⋯ → Redeploy) so reschedule links in emails
   point to the right place.

## Step 2.5 — Set up billing (Stripe)

Businesses now have to subscribe ($79.99/mo) before they can use the dashboard.

1. Go to **stripe.com** and sign up (free — you don't pay anything to set this up).
2. Once in your Stripe Dashboard, make sure you're in **Test mode** first (toggle
   usually top-right) so you can try everything without real money.
3. Go to **Product catalog → Add product**. Name it "ReminderFlow subscription,"
   set the price to **$79.99**, billing period **monthly**. Save it.
4. Click into the product you just made and copy its **Price ID** (starts with
   `price_...`) — save it in your notes as `STRIPE PRICE ID`.
5. Go to **Developers → API keys**. Copy the **Secret key** (starts with
   `sk_...`) — save it as `STRIPE SECRET KEY`. Keep this one private.
6. Go to **Developers → Webhooks → Add endpoint**. For the endpoint URL, use
   your live site URL plus `/api/stripe-webhook`, e.g.:
   ```
   https://reminderflow-xxxx.vercel.app/api/stripe-webhook
   ```
   Under "Select events," add: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
7. After creating it, click into the webhook and copy the **Signing secret**
   (starts with `whsec_...`) — save it as `STRIPE WEBHOOK SECRET`.

When you get to Step 4 (Vercel), add three more environment variables using
these saved values: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`,
`STRIPE_WEBHOOK_SECRET`.

Test mode uses fake card numbers — Stripe's docs list `4242 4242 4242 4242`
with any future expiry date and any 3-digit CVC as a working test card.

When you're ready to accept real payments, switch Stripe out of Test mode and
redo steps 4-7 to get live-mode keys, then update those same environment
variables in Vercel.

## Importing clients from a CSV

Instead of adding clients one at a time, a business can click **Import CSV**
on the dashboard and upload a spreadsheet exported from wherever they
currently track clients. The file needs these column headers exactly:

```
name,email,service,appointment_date,appointment_time
```

A sample file is available for download right on the dashboard.



1. Visit your live URL, click "Get started," and sign up as a business.
2. Add a test client using your own email address.
3. Click "Send reminder" — check your inbox.
4. Click the reschedule link in that email and confirm the flow works.

## Trying it locally first (optional)

If you want to preview changes on your own computer before they go live:

1. Install Node.js from nodejs.org (choose the LTS version).
2. Copy `.env.example` to a new file named `.env.local` and fill in the
   same values you used in Vercel.
3. Open a terminal in this project folder and run:
   ```
   npm install
   npm run dev
   ```
4. Visit `http://localhost:3000`.

## What to build next

- **Billing**: add Stripe so you can actually charge the $79.99/month —
  happy to build this next whenever you're ready.
- **Automatic sending**: right now reminders send when you click the
  button. A scheduled job (e.g. Vercel Cron) can send them automatically
  X days before the appointment.
- **CSV import**: let businesses upload their existing client list instead
  of adding people one at a time.

Ask me to build any of these next and I will.
