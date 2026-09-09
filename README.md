# Ziganya

Finance tracking that doesn't feel like work. Ziganya turns receipts, bank screenshots, and messages into a clear picture of your spending, subscriptions, and budget.

- **Dashboard** – real KPIs (balance with month-to-date net, spending vs. the same point last month, normalized subscription cost, savings-goal progress), a spending chart with 7-day / 30-day / 3-month ranges and a table view, category breakdown, a live budget meter, upcoming renewals, recent activity and receipt uploads.
- **Transactions** – add, edit, delete, search (also from the top bar), filter by date range / type / category, cash-flow chart, CSV export.
- **Subscriptions** – add, edit, delete, monthly & yearly totals, projected charges for the next six months.
- **Calendar** – day / week / month views of transactions and renewals.
- **Settings** – display name, balance & savings goal, light / dark / system theme, CSV export, account deletion.

## Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · TanStack Query · React Router 7 · Recharts · Framer Motion · Supabase (auth, Postgres, storage) · Vitest.

## Getting started

```bash
npm install
cp .env.example .env.local      # fill in your Supabase URL + anon key
npm run dev
```

No Supabase project yet? Run the UI against an in-memory mock backend with seeded demo data (sign in with any email/password):

```bash
npm run dev:mock
```

### Scripts

| Command             | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Vite dev server (needs `.env.local`)                    |
| `npm run dev:mock`  | Dev server + mock Supabase with demo data               |
| `npm run build`     | Type-check then production build to `dist/`             |
| `npm run preview`   | Serve the production build                              |
| `npm run typecheck` | `tsc -b`                                                |
| `npm run lint`      | ESLint                                                  |
| `npm test`          | Vitest unit tests (analytics, dates, formatting)        |
| `npm run db:types`  | Regenerate `sdk/db/database.types.ts` from your project |

## Environment variables

| Variable              | Purpose                                                  |
| --------------------- | -------------------------------------------------------- |
| `VITE_SUPABASE_URL`   | Your project URL, e.g. `https://xyz.supabase.co`         |
| `VITE_API_KEY`        | The public **anon** key (row-level security protects data) |
| `SUPABASE_PROJECT_ID` | Only for `npm run db:types`                              |

On Netlify set the first two under *Site configuration → Environment variables* and redeploy (see `netlify.toml`).

## Supabase setup

Tables (see `sdk/db/database.types.ts`): `users`, `transactions`, `subscriptions`, `budgets`, `categories`, `merchants`, `uploads`. Every user-owned table has a `user_id` column; enable RLS with policies that compare `user_id` to `auth.uid()`.

Receipt uploads need a storage bucket named **`receipts`** with a policy that lets authenticated users read/write objects under their own `user_id/` folder. Uploaded files are recorded in `uploads` and processed by the `extract-receipt` Edge Function (see below).

Enable the **Google** provider in Authentication → Providers for one-click sign-in; email/password works out of the box.

## Receipt scanning

**Add transaction → Scan receipt** lets you take a photo (or upload an image/PDF) and have the merchant, total, currency, date and category read for you. You always review a prefilled form and press **Confirm & save** before anything is written.

Two readers are built in; pick one under **Settings → Receipt reader** or set `VITE_RECEIPT_ENGINE`:

| Reader | Cost | How it works | Trade-off |
| --- | --- | --- | --- |
| **On this device** (default fallback) | Free, no account | [Tesseract.js](https://tesseract.projectnaptha.com/) OCR runs in a web worker in the browser; a rule-based parser finds the total, date, merchant, payment method, line items and a keyword-matched category. Language data (~2 MB) downloads once from a CDN and is cached. | Less accurate on blurry, crumpled or faded receipts; category is keyword-based. Images stay on the device (they are still stored in your own Supabase bucket if configured). |
| **AI reader** (optional) | Anthropic API usage, about a cent per scan | The `extract-receipt` Edge Function sends the image to Claude and gets a schema-validated extraction back. | Requires deploying the function and an API key; the image is sent to Anthropic. |

**Automatic** (the default) uses the AI reader when it's deployed and falls back to on-device OCR otherwise, so the feature works out of the box for free.

iPhone HEIC photos are converted to JPEG in the browser before anything reads or stores them (a ~0.7 MB decoder loads on first use).

Whatever the reader, values that fail sanity checks (future dates, zero totals, unknown currency) are cleared and highlighted for review. On confirm, the transaction is saved with `source = 'receipt'`, `is_verified = true` and the reader's `confidence`; the upload row is marked `processed` and linked to the transaction in `raw_text`. PDFs need the AI reader.

To enable the AI reader (requires the [Supabase CLI](https://supabase.com/docs/guides/cli) and an [Anthropic API key](https://console.anthropic.com/)):

```bash
supabase login
supabase functions deploy extract-receipt --project-ref <your-project-ref>
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
# optional tuning
supabase secrets set ANTHROPIC_MODEL=claude-opus-5 ANTHROPIC_EFFORT=medium
```

`npm run dev:mock` returns a canned AI extraction; set `VITE_RECEIPT_ENGINE=device` to exercise the on-device reader locally.

## Project layout

```
sdk/            Supabase layer: client, types, auth, storage, query hooks
src/lib/        Pure logic: analytics (bucketing, budgets, renewals), dates, formatting, CSV
src/components/ ui/ (design system) · charts/ · Dashboard/ · Transactions/ · Subscriptions/ · Calendar/ · Settings/ · Landing/ · Auth/
src/pages/      Route components
src/providers/  Theme provider
scripts/mock/   Mock backend for local development
supabase/functions/extract-receipt   Edge Function: receipt → structured transaction (Claude)
```

Design tokens live in `src/index.css` (`--c-*` variables mapped to Tailwind utilities like `bg-surface`, `text-ink`, `border-line`); dark mode is the `.dark` class on `<html>`, applied before first paint by a small inline script in `index.html`.
