@AGENTS.md

# EliteCarMats — agent briefing

## What this is

Premium EVA car-mat e-commerce site for the U.S. market.

- **Domain**: elitecarmats.us (GoDaddy → Vercel nameservers).
- **Repo**: github.com/seventy-times-agency/elite-car-mats.
- **Production branch**: `main`. Vercel auto-deploys on push.
- **Audience**: U.S. customers (English) plus the Russian/Ukrainian
  diaspora — i18n is wired up but defaults to EN.

## Brand

- Logo: gold "E" on honeycomb texture, "ELITE CAR MATS" in chrome.
- Mat tag: small black tag (~5×3 cm) reading "ELITECARMATS.US" in yellow,
  sewn to the side.
- Palette: black `#0F0F0F` + gold `#D4A54A`, premium dark theme.
- Address: Rochester, NY, USA.

## Stack

- Next.js **16** (App Router, Turbopack) + React **19** + TypeScript.
- Tailwind v4 (`@theme inline` in `globals.css`).
- Framer Motion — kept light (Hero entrance, mobile menu).
- Postgres on Neon via `@prisma/adapter-neon`.
- Prisma 7.
- Stripe Checkout (optional flag — falls back to manual confirm).
- Resend for transactional email.
- Upstash Redis for cross-instance rate limiting (in-memory fallback for dev).
- Local Inter font (woff2). Google Fonts intentionally avoided — flaky on Vercel.

## Where stuff lives

```
src/
├── app/                      pages + API routes (App Router)
├── components/               grouped by area: layout, home, product, cart, admin, seo, common, legal
├── context/CartContext.tsx   localStorage cart with schema validation
├── data/
│   ├── catalog/              source-of-truth catalog
│   │   ├── brands.ts         brand list + badges allowlist
│   │   ├── models.ts         CarModel rows w/ year ranges (~700+)
│   │   ├── colors.ts         eva + edge colours
│   │   ├── mat-sets.ts       4 set types + categoryLabels
│   │   └── index.ts          aggregator (also hydrates brand.modelsCount)
│   ├── reviews.ts            customer reviews seed
│   └── mock.ts               deprecated re-export shim
├── i18n/                     en/ru/uk dictionaries + helpers
└── lib/
    ├── pricing.ts            unit-price math (still placeholder $100)
    ├── promo.ts              validatePromoCode + tryConsumePromoUse (race-safe)
    ├── vehicle-profile.ts    2-seater / pickup / standard set rules
    ├── validations/          zod schemas
    ├── security/             auth, order-token, rate-limit
    ├── payments/             stripe SDK + checkout-session builder
    ├── db/                   prisma client, runtime setup, catalog seed
    └── email/                Resend transport + per-message templates
```

The Prisma schema lives in `prisma/schema.prisma`; the runtime DDL in
`src/lib/db/setup.ts` mirrors it under an advisory lock so concurrent
serverless cold starts don't race `CREATE TYPE`.

## Critical paths

- **Order creation**: `POST /api/orders` opens a `$transaction`, atomically
  consumes promo via `tryConsumePromoUse`, creates Order + items, returns
  `{id, orderNumber, orderToken}`. Owner email fires immediately; customer
  email moves to the Stripe webhook when payments are enabled, otherwise
  fires inline.
- **Stripe**: `/api/checkout/stripe` requires the order's HMAC token, then
  re-derives line-item prices from `lib/pricing.ts` (DB row is advisory)
  and converts the promo discount into a one-shot Stripe coupon.
- **Webhook**: `/api/webhooks/stripe` claims the event id in the
  `WebhookEvent` table (`INSERT … ON CONFLICT DO NOTHING`) before any side
  effect; the order is then flipped PENDING → CONFIRMED via a guarded
  `updateMany` so re-deliveries are no-ops.
- **Order view**: `/order/<n>` reads the DB directly server-side. Without
  a valid `?t=<token>` (or admin cookie) it bounces to `/track`. `/track`
  requires order number + matching email and rate-limits per-IP.

## Security baseline (already wired)

- Admin password is **never** the cookie value. `lib/security/auth.ts`
  signs HMAC sessions; supports optional scrypt password hash; rejects
  passwords <12 chars + a small forbidden list.
- `lib/security/rate-limit.ts` uses Upstash REST when configured, else
  warns and falls back to per-instance Map.
- IP picker prefers `x-vercel-forwarded-for` (signed by the platform)
  over client-controlled headers.
- `next.config.ts` ships HSTS, X-Frame-Options DENY, `frame-ancestors`,
  Referrer-Policy, Permissions-Policy, X-Content-Type-Options.
- `checkAdminCsrf` on every admin POST/PATCH/DELETE.
- Diagnostic admin endpoints (`/api/admin/migrate`, `/seed`) are
  **POST-only** with cookie or `x-admin-token` (no query-string token).
- `/api/promo/validate` collapses every failure to generic `invalid` so
  it can't be used to enumerate codes.

## Status

What's **done** (don't redo):

- Catalog with ~50 brands and 700+ models (commercial trucks included).
- Full admin dashboard: orders, promos, reviews, custom-orders, newsletter.
- Stripe Checkout integration (optional).
- Resend transactional email (customer + owner + shipped + contact).
- HMAC-token order URLs + `/track` flow.
- Atomic promo redemption inside a transaction.
- Stripe webhook idempotency ledger.
- DB schema indexed on hot columns; updatedAt triggers; advisory-locked
  DDL bootstrap.
- Security headers, CSRF, rate limiting (Upstash-ready).
- Cookie-banner, legal pages, sitemap, robots, OG image.
- Cart drawer + cart page, checkout, success / cancel pages, custom-order form.

Still **TODO** (in priority order):

1. **Real prices** — `lib/pricing.ts` ships placeholder `$100` for every
   set; `EDGE_SURCHARGE` and `BADGE_PRICE` are zero. Need real numbers
   from supplier before opening sales.
2. **Real product photos** — replace the SVG mat preview + Wikipedia car
   thumbnails as soon as supplier sends shots.
3. **Texture choice** (honeycomb / rhombus) and **Heel Pad** option in
   the configurator (matches EVAtech).
4. **Real EVA / edge colour palette** — current list is provisional.
5. **DNS verification for Google Workspace** (`info@elitecarmats.us`)
   and Resend (`elitecarmats.us`).
6. **EN translations review** — i18n keys exist in all three locales but
   English copy hasn't had a marketing pass.
7. **Admin CRUD for brands/models** — currently the catalog is code-only;
   editing requires a deploy.
8. **Blog** for SEO.

## Operator actions outside the codebase

Required env vars on Vercel (see `.env.example` for the canonical list):

- `DATABASE_URL`, `ADMIN_PASSWORD` (≥12 chars), `SESSION_SECRET`,
  `ORDER_TOKEN_SECRET`, `NEXT_PUBLIC_SITE_URL`.

Strongly recommended:

- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (otherwise
  rate-limiting is per-lambda and effectively useless).
- `RESEND_API_KEY` + verified domain.

Optional:

- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
  `STRIPE_WEBHOOK_SECRET`.
- `ADMIN_PASSWORD_HASH` (scrypt) — supersedes the plain password.
- `ADMIN_API_TOKEN` for `x-admin-token` curl access on diagnostics.

After env changes: Vercel → Redeploy. First admin login triggers
`ensureSchema()`. First public POST (or admin's `POST /api/admin/seed`)
seeds the catalog.

## Competitors (reference)

- FortunaCarMats (USA / Miami) — jQuery, $109 / set.
- PrimeEVA (Europe) — Shopify, €140 full+cargo. Closest analogue.
- EVAtech (Ukraine) — Bitrix, advanced configurator with colour preview
  and texture pick. Inspiration for our roadmap.
- FitMyCar (Australia) — Magento 2.

## House rules for code changes

- Read the relevant guide in `node_modules/next/dist/docs/` before
  editing — Next 16 has breaking changes vs. 14.
- Treat `lib/pricing.ts` as the single source of truth for prices. Never
  trust the DB-stored `Order.total` or `OrderItem.price` for anything
  the customer is being billed for; always recompute server-side.
- Never spread `parsed.data` into a Prisma `update.data` — pluck fields
  explicitly.
- Don't introduce a new `useSearchParams()` consumer without a
  `<Suspense>` boundary (Next 16 requirement).
- When adding a new admin endpoint, gate it with both `requireAdmin` /
  `requireAdminApi` AND `checkAdminCsrf` if it's state-changing.
- Money in Postgres is `Decimal(10,2)`. Read with `Number(x ?? 0)` or
  keep as Decimal — never cast through string concat.

## Key files quick reference

- `src/app/globals.css` — theme tokens via `@theme inline`.
- `src/data/catalog/index.ts` — catalog aggregator.
- `src/components/product/MatPreview.tsx` — SVG mat preview.
- `src/app/api/car-image/route.ts` — Wikipedia car-photo proxy.
- `src/app/api/orders/route.ts` — order creation flow.
- `src/app/api/webhooks/stripe/route.ts` — Stripe webhook.
- `src/lib/security/auth.ts` — admin session.
- `src/lib/security/order-token.ts` — HMAC for `/order/<n>`.
- `src/lib/db/setup.ts` — runtime DDL.
- `prisma/schema.prisma` — DB schema.
- `public/placeholder-car.svg` — fallback for missing car photos.
