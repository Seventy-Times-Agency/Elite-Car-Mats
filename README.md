# Elite Car Mats

Premium EVA car-mat e-commerce site for the U.S. market.
Production: **[elitecarmats.us](https://elitecarmats.us)** (Vercel,
auto-deploy from `main`).

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + TypeScript
- **Tailwind v4**, dark luxury theme (black `#0F0F0F` + gold `#D4A54A`)
- **Postgres on Neon** via `@prisma/adapter-neon` + **Prisma 7**
- **Stripe Checkout** (optional flag — falls back to manual confirm)
- **Resend** for transactional email
- **Upstash Redis** for cross-instance rate-limiting
- Local Inter font (Google Fonts intentionally avoided — flaky on
  Vercel)

## Quick start

```bash
npm install            # also runs `prisma generate` post-install
cp .env.example .env   # fill in DATABASE_URL, ADMIN_PASSWORD, etc.
npm run dev            # http://localhost:3000
```

The catalog seeds itself on the first public POST or
`POST /api/admin/seed`. The DB schema bootstraps on the first
admin login (`ensureSchema()` runs under an advisory lock so
parallel cold starts don't race `CREATE TYPE`).

## Project layout

```
src/
├── app/                          pages + API routes (App Router)
│   ├── admin/                    operator dashboard
│   ├── api/                      JSON + xml endpoints
│   ├── blog/                     public /blog list + /blog/[slug]
│   ├── catalog/                  brand grid → brand page → product page
│   ├── checkout/  cart/  order/  track/  wishlist/
│   ├── about/  contacts/  delivery/  warranty/  refund/
│   │   privacy/  terms/
│   └── sitemap.ts robots.ts
├── components/                   layout / product / cart / common /
│                                 seo / admin / home / legal
├── context/                      CartContext + WishlistContext
│                                 (localStorage)
├── data/
│   └── catalog/                  source-of-truth catalog
│                                 (~60 brands, ~700 models)
├── i18n/
│   ├── config.ts dictionary.ts getDictionary.ts
│   │   I18nProvider.tsx labels.ts
│   └── dictionaries/
│       ├── en.ts ru.ts uk.ts        thin aggregators
│       └── {en,ru,uk}/
│           ├── storefront.ts        public-facing keys (~770 each)
│           └── operations.ts        admin + email keys (~245 each)
└── lib/
    ├── pricing.ts pricing-overrides.ts  billing maths + overrides
    ├── catalog-merge.ts                 code catalog ⊎ DB customs
    ├── markdown.ts blog.ts              markdown engine + queries
    ├── promo.ts vehicle-profile.ts
    ├── validations/                     zod schemas
    ├── security/                        auth + order-token + rate-limit
    ├── payments/                        Stripe SDK + checkout helper
    ├── db/                              prisma + DDL bootstrap + seed
    └── email/                           Resend transport + templates
```

## Features

### Customer-facing

- **Catalog** with US-popularity sort (default) and body-type filter
  chips: Cars / SUVs / Pickups & vans / Commercial.
- **Header search** dialog with autocomplete across every brand and
  model — keyboard-first, **⌘K / Ctrl-K** shortcut.
- **Product configurator** — year, set type (profile-aware: sedan,
  pickup, two-seater, semi, minivan), mat colour, edge colour,
  optional metal brand badge.
- **Wishlist** at `/wishlist` (localStorage, capped at 100 saves).
- **Cart drawer** with promo code + Stripe Checkout / manual confirm.
- **Order tracking** at `/track` (HMAC-token URLs that survive email
  forwarding) + per-IP rate limit.
- **Custom-order form** for vehicles not in the catalog.
- **Blog** at `/blog` with markdown body + Schema.org Article.
- **3 locales** — English (default), Russian, Ukrainian.
- **A11y** — WCAG-compliant form labels, `aria-pressed` toggles,
  skip-to-content link, `prefers-reduced-motion` respected.

### Operator panel (`/admin`)

| Page                | What                                          |
|---------------------|-----------------------------------------------|
| `/admin`            | Daily / weekly / monthly revenue, AOV (30 d), top-5 models, recent orders |
| `/admin/orders`     | Status timeline, tracking number, owner email re-send |
| `/admin/pricing`    | Live editor for per-(profile, matSet) price overrides + Google Shopping feed URL |
| `/admin/catalog`    | Additive CRUD for brands & models not in code |
| `/admin/blog`       | Markdown post editor with publish toggle and locale filter |
| `/admin/promos`     | Discount codes (atomic redemption)            |
| `/admin/reviews`    | Moderate customer reviews                     |
| `/admin/custom-orders` | Leads from the public custom-order form    |
| `/admin/newsletter` | Subscribers + CSV export                      |

### SEO & marketing

- Sitemap covers static + brand + model + custom + blog URLs.
- **Schema.org** — Product (with optional AggregateRating), Offer
  (shipping + return policy), Organization, BreadcrumbList,
  FAQPage, Article.
- **OpenGraph** images per page.
- **Google Merchant Center feed** at `/api/feed.xml` — RSS 2.0 with
  the `g:` namespace, one item per (brand × model × matSet),
  picks up admin price overrides automatically.

### Security

- HMAC-signed admin sessions; optional scrypt password hashing.
- CSRF token check on every admin state-changing endpoint.
- Per-IP rate-limit on order, contact and promo endpoints
  (Upstash Redis when configured, in-memory fallback for dev).
- Stripe webhook idempotency ledger (`WebhookEvent` table).
- HSTS / X-Frame-Options DENY / `frame-ancestors` /
  Referrer-Policy / Permissions-Policy / X-Content-Type-Options
  headers.
- IP picker prefers `x-vercel-forwarded-for` (signed by the
  platform) over client-controlled headers.
- Markdown renderer HTML-escapes input first, then interprets
  blocks — pasted `<script>` is rendered as text.
- CCPA / CPRA section + footer "Do Not Sell or Share My Personal
  Information" link.

## Environment

Required:

| Var                          | Purpose                              |
|------------------------------|--------------------------------------|
| `DATABASE_URL`               | Neon Postgres pooler URL             |
| `ADMIN_PASSWORD`             | ≥12 chars, blocked-list rejected     |
| `SESSION_SECRET`             | 32 random hex bytes                  |
| `ORDER_TOKEN_SECRET`         | 32 random hex bytes                  |
| `NEXT_PUBLIC_SITE_URL`       | `https://elitecarmats.us`            |

Strongly recommended:

| Var                                  | Purpose                          |
|--------------------------------------|----------------------------------|
| `UPSTASH_REDIS_REST_URL` / `_TOKEN`  | Cross-instance rate-limit        |
| `RESEND_API_KEY`                     | Transactional email              |
| `EMAIL_FROM`, `OWNER_EMAIL`          | Sender + leads inbox             |

Optional:

| Var                                    | Purpose                          |
|----------------------------------------|----------------------------------|
| `STRIPE_SECRET_KEY`                    | Live Stripe Checkout             |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`   | Stripe.js                        |
| `STRIPE_WEBHOOK_SECRET`                | Webhook signature                |
| `ADMIN_PASSWORD_HASH`                  | scrypt hash; supersedes plain    |
| `ADMIN_API_TOKEN`                      | `x-admin-token` curl access      |

See `.env.example` for the canonical list with notes.

## Pricing model

`src/lib/pricing.ts` is the single source of truth for prices. The
default price table lives in `src/data/catalog/mat-sets.ts`, keyed
by vehicle profile:

- **Sedan / SUV (default):** front+rear $119, cargo $79, full $198
- **Minivan (3 rows):** front+middle $119, all 3 rows $198,
  cargo $79, full $277
- **Pickup:** cabin $119
- **Two-seater (roadster, supercar):** first row $119, cargo $79,
  both $198 — flagged for supplier review
- **Semi-truck:** cabin $119
- **Metallic brand badge:** +$9 (only where the supplier stocks it)

Every server billing path
(`/api/orders`, `/api/checkout/stripe`, `/api/webhooks/stripe`)
loads `loadPriceOverrides()` from the `MatSetPriceOverride` table
and passes it through `calculateItemUnitPrice(...)`. Admin can
change prices live at `/admin/pricing`; the customer is billed at
the new price on the very next request.

The cart drawer and product page run client-side and keep showing
the code default until the next Vercel deploy. The admin editor's
banner spells this out so the operator isn't surprised.

## Catalog model

The bulk of the catalog (~60 brands, ~700 models) lives in code at
`src/data/catalog/`. `lib/catalog-merge.ts#getMergedCatalog()`
merges that with admin-managed `CustomBrand` / `CustomModel` rows,
filtering custom slugs that clash with code slugs (code wins). The
public catalog (`/catalog`, `/catalog/<brand>`,
`/catalog/<brand>/<model>`) reads through this merge — server
components fetch the merged catalog and pass `brand` + `models` as
props to client children — so admin additions show up immediately
without a redeploy.

## i18n

Three locales: `en` (default), `ru`, `uk`. Locale is a cookie
(`ecm_locale`), not a path prefix — every URL serves every
language. Each locale's keys are split between two files:

- `dictionaries/<locale>/storefront.ts` — public-facing UI strings
- `dictionaries/<locale>/operations.ts` — admin panel + email
  templates

The aggregator (`dictionaries/<locale>.ts`) merges them with
`{ ...storefront, ...operations }`. Add new keys to whichever
sibling matches their audience and to all three locales in the
same commit.

## Deployment

- Vercel Pro, auto-deploy on push to `main`.
- Postgres on Neon, pooler URL in `DATABASE_URL`.
- DNS at GoDaddy → nameservers pointed at Vercel.

First-time setup of a fresh project:

1. Set the env vars above on Vercel.
2. First admin login (`/admin/login`) triggers `ensureSchema()`
   and creates every table under the advisory lock.
3. `POST /api/admin/seed` (or the first public order) mirrors the
   code catalog into Postgres.
4. Verify the domain on Resend so customer emails ship from
   `orders@elitecarmats.us`.
5. Submit `https://elitecarmats.us/api/feed.xml` to **Google
   Merchant Center → Products → Feeds → Add data source**. Daily
   fetch is fine; the feed itself caches at the edge for an hour.

## Scripts

```bash
npm run dev            # next dev (Turbopack)
npm run build          # prisma generate + next build
npm run start          # production
npm run lint           # eslint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:studio
npm run db:seed
```

## License

Proprietary. © Elite Car Mats. All rights reserved.
