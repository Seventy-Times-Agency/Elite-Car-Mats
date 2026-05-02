# EliteCarMats

Premium EVA car-mat e-commerce storefront for the U.S. market.
Production: **https://elitecarmats.us** (Vercel, autodeploys from `main`).

## Stack

| Layer       | Choice                                           |
|-------------|--------------------------------------------------|
| Framework   | Next.js 16 (App Router, Turbopack) + React 19    |
| Language    | TypeScript                                       |
| Styling     | Tailwind v4 (`@theme inline` in `globals.css`)   |
| Animations  | Framer Motion (light, only Hero + mobile menu)   |
| Database    | Postgres on Neon (`@neondatabase/serverless`)    |
| ORM         | Prisma 7 (`@prisma/adapter-neon`)                |
| Payments    | Stripe Checkout (optional — falls back to manual)|
| Email       | Resend                                           |
| Rate limit  | Upstash Redis (in-memory fallback for dev)       |
| Hosting     | Vercel                                           |

## Local development

```bash
cp .env.example .env       # fill in DATABASE_URL + ADMIN_PASSWORD at minimum
npm install
npm run dev                # http://localhost:3000
```

Useful scripts:

| Command                  | What it does                                          |
|--------------------------|-------------------------------------------------------|
| `npm run dev`            | Next dev server with Turbopack                        |
| `npm run build`          | `prisma generate && next build`                       |
| `npm run lint`           | ESLint                                                |
| `npm run prisma:migrate` | Run Prisma dev migrations                             |
| `npm run prisma:deploy`  | Apply Prisma migrations (production)                  |
| `npm run prisma:studio`  | GUI over the live DB                                  |
| `npm run db:seed`        | Seed catalog from `src/data/catalog/*` via `prisma/seed.ts` |

The runtime also self-heals: the first authenticated admin login (or first
public POST) calls `ensureSchema()` (`src/lib/db/setup.ts`) which runs
idempotent `CREATE TABLE/INDEX/TRIGGER IF NOT EXISTS` statements under a
Postgres advisory lock. The catalog seed in `src/lib/db/seed.ts` runs on
the first order if the catalog tables are empty.

## Repo layout

```
src/
├── app/                       Next.js App Router
│   ├── (root pages)           /, /catalog, /about, /contacts, etc.
│   ├── admin/                 password-gated dashboard
│   │   ├── orders, promos, reviews, custom-orders, newsletter
│   │   └── login / logout
│   ├── api/
│   │   ├── orders/            POST /create, GET/PATCH /[id]
│   │   ├── checkout/stripe/   create Stripe Checkout session
│   │   ├── webhooks/stripe/   idempotent Stripe webhook handler
│   │   ├── promo/validate/    public promo-code validator
│   │   ├── contact/           contact-form mailer
│   │   ├── custom-order/      custom-order request
│   │   ├── newsletter/        public subscribe
│   │   └── admin/             gated migrate / seed / promos / reviews / …
│   ├── checkout/              checkout + success / cancel pages
│   ├── order/[id]/            customer order view (HMAC-token gated)
│   ├── track/                 order-number + email lookup form
│   └── catalog/[brand]/[model] product configurator
├── components/                React components, grouped by area
│   ├── layout/                Header, Footer, FloatingCTA
│   ├── home/                  Hero, CarSelector, Features, FAQ, Reviews
│   ├── product/               MatPreview, MatColorSwatch
│   ├── cart/                  CartDrawer
│   ├── admin/                 dashboard widgets
│   ├── seo/                   ProductJsonLd, BreadcrumbJsonLd
│   ├── legal/                 boilerplate page wrappers
│   └── common/                Reveal etc.
├── context/CartContext.tsx    localStorage-backed cart
├── data/
│   ├── catalog/               source-of-truth catalog (split below)
│   │   ├── brands.ts          ~50 brand records + badges allowlist
│   │   ├── models.ts          ~700+ CarModel rows w/ year ranges
│   │   ├── colors.ts          evaColors + edgeColors
│   │   ├── mat-sets.ts        4 set types + categoryLabels
│   │   └── index.ts           re-export aggregator
│   ├── reviews.ts             customer reviews seed (currently empty)
│   └── mock.ts                deprecated re-export shim — see catalog/
├── i18n/                      en / ru / uk dictionaries + helpers
├── lib/
│   ├── pricing.ts             unit-price math (placeholder $100 for now)
│   ├── promo.ts               validate + atomic consume (race-safe)
│   ├── vehicle-profile.ts     2-seater / pickup / standard set rules
│   ├── validations/           zod schemas (orders, …)
│   ├── security/
│   │   ├── auth.ts            HMAC session cookie + scrypt password
│   │   ├── order-token.ts     HMAC tokens for /order/<n>?t=
│   │   └── rate-limit.ts      Upstash Redis adapter + in-memory fallback
│   ├── payments/
│   │   ├── stripe.ts          lazy-loaded Stripe SDK
│   │   └── stripe-checkout.ts session create + webhook verify
│   ├── db/
│   │   ├── prisma.ts          PrismaClient singleton on globalThis
│   │   ├── setup.ts           runtime DDL (idempotent, advisory-locked)
│   │   └── seed.ts            catalog bootstrap from data/catalog
│   └── email/
│       ├── transport.ts       Resend wrapper + orderUrl helper
│       ├── templates/         per-message HTML builders
│       │   ├── base.ts        shared baseTemplate, swatch, itemsTable
│       │   ├── order-customer.ts
│       │   ├── order-owner.ts
│       │   ├── shipped.ts
│       │   └── contact.ts
│       └── index.ts           re-export sendXEmail()
├── types/                     shared types
└── generated/prisma/          generated client (gitignored in CI)

prisma/
├── schema.prisma              source of truth for the schema
└── seed.ts                    one-shot upsert of catalog + reviews
```

## Environment variables

Required to boot:

| Var                  | Purpose                                                  |
|----------------------|----------------------------------------------------------|
| `DATABASE_URL`       | Neon Postgres pooled connection string                   |
| `ADMIN_PASSWORD`     | Min 12 chars; common passwords (`admin`, `password`, …) refused |
| `SESSION_SECRET`     | 32-byte hex, signs admin session cookie                  |
| `ORDER_TOKEN_SECRET` | 32-byte hex, signs `/order/<n>?t=` tokens                |
| `NEXT_PUBLIC_SITE_URL` | `https://elitecarmats.us`                              |

Strongly recommended:

| Var                       | Purpose                                          |
|---------------------------|--------------------------------------------------|
| `UPSTASH_REDIS_REST_URL`  | shared rate-limit counter across lambdas         |
| `UPSTASH_REDIS_REST_TOKEN`| ↑                                                |
| `RESEND_API_KEY`          | transactional email                              |
| `EMAIL_FROM`              | `EliteCarMats <orders@elitecarmats.us>`          |
| `OWNER_EMAIL`             | inbox for new-order alerts                       |

Optional:

| Var                                  | Purpose                              |
|--------------------------------------|--------------------------------------|
| `ADMIN_PASSWORD_HASH`                | scrypt hash, supersedes plain passwd |
| `ADMIN_API_TOKEN`                    | bearer for `x-admin-token`           |
| `STRIPE_SECRET_KEY`                  | enables Stripe Checkout flow         |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | client-side Stripe.js                |
| `STRIPE_WEBHOOK_SECRET`              | signs incoming `/api/webhooks/stripe`|

See `.env.example` for the canonical template + generation snippets.

## Order flow

1. **Cart**: `CartContext` keeps items in `localStorage` (schema-validated,
   year-aware dedup).
2. **POST `/api/orders`**: opens a `$transaction`, atomically consumes promo
   via `tryConsumePromoUse`, creates the row, returns `{id, orderNumber,
   orderToken}`. Owner email fires immediately (so leads aren't lost on
   abandoned Stripe checkouts).
3. **Stripe path** (when configured): client POSTs `/api/checkout/stripe`
   with `{orderId, orderToken, locale}`. The route re-derives line-item
   prices from `lib/pricing.ts` (DB row is advisory only) and translates
   the promo discount into a one-shot Stripe coupon so what Stripe shows
   matches the DB total.
4. **Webhook** `/api/webhooks/stripe` claims the event id in the
   `WebhookEvent` ledger (idempotent), flips `Order.status` PENDING →
   CONFIRMED via a guarded `updateMany`, then sends the customer's
   confirmation email.
5. **No-Stripe path**: customer email + redirect to
   `/order/<orderNumber>?t=<orderToken>`.

## Security highlights

- Admin sessions are HMAC-signed tokens (24h, sliding); cookie value is
  never the password.
- `/api/orders/[id]` GET requires the per-order HMAC token or admin auth
  — guards against IDOR even though order numbers contain a timestamp.
- `/track` requires order number + matching customer email before issuing
  a token, with a 5-min IP-based rate-limit.
- `checkAdminCsrf` on every state-changing admin endpoint, on top of
  `sameSite: "strict"` cookies.
- `next.config.ts` ships HSTS, `X-Frame-Options DENY`, `frame-ancestors`,
  `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options`.
- `/api/promo/validate` collapses every failure mode to a generic
  `invalid` so the endpoint can't be used to enumerate live codes.

## Deployment

`main` branch = production. Pushes trigger Vercel build. After any change
to `prisma/schema.prisma` make sure `ensureSchema()` covers the new
columns (it usually does — check `src/lib/db/setup.ts`), or run
`npm run prisma:deploy` against the live DB.

For first-deploy bootstrap call `POST /api/admin/seed` (admin cookie
required) to populate the catalog.

## License

Proprietary — internal Seventy Times Agency project.
