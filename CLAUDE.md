@AGENTS.md

# EliteCarMats — agent briefing

## What this is

Premium EVA car-mat e-commerce site for the U.S. market.

- **Domain**: elitecarmats.us (GoDaddy → Vercel nameservers).
- **Repo**: github.com/seventy-times-agency/elite-car-mats.
- **Production branch**: `main`. Vercel auto-deploys on push.
- **Audience**: U.S. customers (English) plus the Russian/Ukrainian
  diaspora — i18n is wired up but defaults to RU until further notice.

## Brand

- Logo: gold "E" on honeycomb texture, "ELITE CAR MATS" in chrome.
- Mat tag: small black tag (~5×3 cm) reading "ELITECARMATS.US" in
  yellow, sewn to the side of every mat.
- Palette: black `#0F0F0F` + gold `#D4A54A`, premium dark theme.
- Workshop: Rochester, NY, USA.

## Stack

- Next.js **16** (App Router, Turbopack) + React **19** + TypeScript.
- Tailwind v4 (`@theme inline` in `globals.css`).
- Framer Motion — kept light (Hero entrance, mobile menu).
- Postgres on Neon via `@prisma/adapter-neon`.
- Prisma 7.
- Stripe Checkout (optional flag — falls back to manual confirm).
- Resend for transactional email.
- Upstash Redis for cross-instance rate limiting (in-memory fallback
  for dev only).
- Local Inter font (woff2). Google Fonts intentionally avoided —
  flaky on Vercel.

## Where stuff lives

```
src/
├── app/                          pages + API routes (App Router)
│   ├── admin/                    operator dashboard
│   │   ├── page.tsx              KPI tiles + top-5 models + recent orders
│   │   ├── blog/                 markdown post CRUD
│   │   ├── catalog/              custom brands & models CRUD
│   │   │   ├── BrandManager.tsx
│   │   │   ├── ModelManager.tsx
│   │   │   └── CatalogManager.tsx (tab switcher)
│   │   ├── pricing/              live mat-set price overrides
│   │   ├── promos/ orders/ reviews/ custom-orders/ newsletter/
│   ├── api/
│   │   ├── orders/               place order, server-billed
│   │   ├── checkout/stripe/      Stripe Checkout session
│   │   ├── webhooks/stripe/      idempotent webhook
│   │   ├── feed.xml/             Google Merchant Center feed
│   │   ├── admin/blog|catalog|pricing|promos|reviews/...
│   │   └── promo/validate/  contact/  custom-order/  newsletter/
│   ├── blog/                     public /blog list + /blog/[slug]
│   ├── catalog/                  brand grid + brand page + product page
│   │   ├── page.tsx              (server) — brand grid via getMergedCatalog
│   │   ├── CatalogClient.tsx     filter / sort / search UI
│   │   └── [brand]/
│   │       ├── page.tsx          (server) — fetches merged + props down
│   │       ├── BrandClient.tsx   model grid UI
│   │       └── [model]/
│   │           ├── page.tsx      (server)
│   │           ├── ProductClient.tsx  configurator UI
│   │           └── layout.tsx    metadata (server)
│   ├── checkout/  cart/  custom-order/  contacts/  reviews/
│   ├── delivery/  warranty/  refund/  privacy/  terms/  about/
│   ├── order/[id]/               authenticated order view
│   ├── track/                    public order lookup
│   ├── wishlist/                 saved-for-later page
│   ├── layout.tsx                root layout, providers
│   └── sitemap.ts robots.ts
│
├── components/
│   ├── layout/                   Header / Footer / AnnouncementBar /
│   │                             CookieBanner / FloatingCTA /
│   │                             HeaderSearch / LanguageSwitcher /
│   │                             NewsletterForm
│   ├── product/                  MatPreview / MatColorSwatch /
│   │                             ProductFaq / WishlistButton
│   ├── cart/                     CartDrawer
│   ├── common/                   TrustBadges / Reveal
│   ├── seo/                      ProductJsonLd (Product + Faq + Org +
│   │                             Breadcrumb helpers)
│   ├── admin/  home/  legal/
│
├── context/
│   ├── CartContext.tsx           localStorage cart, schema-validated
│   └── WishlistContext.tsx       localStorage wishlist (cap 100)
│
├── data/
│   ├── catalog/                  source-of-truth catalog (code)
│   │   ├── brands.ts             ~60 brands + BRAND_POPULARITY
│   │   ├── models.ts             ~700 CarModels w/ year ranges
│   │   ├── colors.ts             eva + edge colours
│   │   ├── mat-sets.ts           profile-aware sets + prices
│   │   └── index.ts              aggregator (hydrates modelsCount,
│   │                             popularity, categories)
│   └── reviews.ts                customer reviews seed (currently empty)
│
├── i18n/
│   ├── config.ts                 LOCALES, cookie name, html-lang map
│   ├── dictionary.ts             Dict / TFn types + makeT()
│   ├── getDictionary.ts          server, reads cookie → dict
│   ├── I18nProvider.tsx          client provider
│   ├── labels.ts                 mat-set / colour / body localisers
│   └── dictionaries/
│       ├── en.ts ru.ts uk.ts     thin aggregator: { ...storefront, ...operations }
│       ├── en/storefront.ts      public-facing keys (~770 each)
│       ├── en/operations.ts      admin + email keys (~245 each)
│       └── ru/ uk/               same shape per locale
│
└── lib/
    ├── pricing.ts                unit-price math, accepts overrides
    ├── pricing-overrides.ts      server-only loader for admin overrides
    ├── catalog-merge.ts          server-only: code catalog + DB customs
    ├── markdown.ts               tiny dependency-free MD → HTML for blog
    ├── blog.ts                   server-only: published-post queries
    ├── promo.ts                  validatePromoCode + tryConsumePromoUse
    ├── vehicle-profile.ts        2-seater / pickup / minivan / semi rules
    ├── validations/              zod schemas (order/post/catalog/pricing)
    ├── security/                 auth (HMAC sessions) / order-token /
    │                             rate-limit (Upstash REST)
    ├── payments/                 stripe SDK + checkout-session builder
    ├── db/                       prisma client / setup.ts (DDL bootstrap) /
    │                             seed.ts (catalog mirror)
    └── email/                    Resend transport + per-message templates
```

The Prisma schema lives in `prisma/schema.prisma`; the runtime DDL in
`src/lib/db/setup.ts` mirrors it under an advisory lock so concurrent
serverless cold starts don't race `CREATE TYPE`.

## Database tables

| Table                  | Purpose                                                   |
|------------------------|-----------------------------------------------------------|
| `Brand`, `Model`, `ModelYear` | Code-mirrored catalog (FK target for orders) |
| `Product`              | (model, matSet) Cartesian product, FK target              |
| `EvaColor`, `EdgeColor`, `Badge` | Reference data                                  |
| `Order`, `OrderItem`   | Customer orders                                           |
| `PromoCode`            | Discount codes (atomic redeem)                            |
| `Review`               | Customer reviews (admin-moderated)                        |
| `CustomOrderRequest`   | Public custom-order form submissions                      |
| `WebhookEvent`         | Stripe webhook idempotency ledger                         |
| `NewsletterSubscriber` | Email signups                                             |
| `Post`                 | Blog posts (markdown body, optional locale)               |
| `MatSetPriceOverride`  | Admin live price overrides per (profile, matSet)          |
| `CustomBrand`          | Admin-added brands not in code                            |
| `CustomModel`          | Admin-added models not in code                            |

## Critical paths

- **Order creation** (`POST /api/orders`): opens a `$transaction`,
  loads admin price overrides once at the top, atomically consumes
  promo via `tryConsumePromoUse`, creates Order + items, returns
  `{id, orderNumber, orderToken}`. Owner email fires immediately;
  customer email moves to the Stripe webhook when payments are
  enabled, else fires inline.
- **Stripe checkout** (`POST /api/checkout/stripe`): requires the
  order's HMAC token, then re-derives line-item prices from
  `lib/pricing.ts` + `loadPriceOverrides()` (DB row is advisory) and
  converts the promo discount into a one-shot Stripe coupon.
- **Webhook** (`POST /api/webhooks/stripe`): claims the event id in
  `WebhookEvent` (`INSERT … ON CONFLICT DO NOTHING`) before any side
  effect; the order is then flipped PENDING → CONFIRMED via a
  guarded `updateMany` so re-deliveries are no-ops.
- **Order view** (`/order/<n>`): reads the DB directly server-side.
  Without a valid `?t=<token>` (or admin cookie) it bounces to
  `/track`. `/track` requires order number + matching email and
  rate-limits per-IP.
- **Catalog read path**: every public catalog page is a server
  component that calls `getMergedCatalog()` and passes brands/models
  as props to a client child. So custom brands/models added in admin
  show up immediately without a redeploy.
- **Pricing**: `lib/pricing.ts` is the single source of truth for
  prices. Server billing paths pass `loadPriceOverrides()` through;
  client display callers omit overrides and stay on code defaults
  until next deploy. Never trust the DB-stored `Order.total` /
  `OrderItem.price` for billing — always recompute.

## Security baseline (already wired)

- Admin password is **never** the cookie value. `lib/security/auth.ts`
  signs HMAC sessions; supports optional scrypt password hash;
  rejects passwords <12 chars + a small forbidden list.
- `lib/security/rate-limit.ts` uses Upstash REST when configured,
  else warns and falls back to per-instance Map.
- IP picker prefers `x-vercel-forwarded-for` (signed by the platform)
  over client-controlled headers.
- `next.config.ts` ships HSTS, X-Frame-Options DENY, frame-ancestors,
  Referrer-Policy, Permissions-Policy, X-Content-Type-Options.
- `checkAdminCsrf` on every admin POST/PATCH/DELETE.
- Diagnostic admin endpoints (`/api/admin/migrate`, `/seed`) are
  POST-only with cookie or `x-admin-token` (no query-string token).
- `/api/promo/validate` collapses every failure to generic `invalid`
  so it can't be used to enumerate codes.
- `/blog/[slug]` markdown renderer (`lib/markdown.ts`) HTML-escapes
  input first, then interprets markdown — pasted `<script>` is text.

## What's done

- Catalog with ~60 brands and ~700 models (commercial trucks
  included). Popularity sort + body-type filter chips.
- Real prices in `lib/pricing.ts` (sedan/SUV $119/$79/$198, minivan
  $119/$198/$79/$277, pickup $119, two-seater $119/$79/$198, semi
  $119, badge +$9). Admin can override live via `/admin/pricing`.
- Full admin: dashboard (revenue / AOV / top-5 models), orders,
  promos, reviews, custom-orders, newsletter, blog, catalog,
  pricing.
- Header search dialog (⌘K) + wishlist (`/wishlist`) + product-page
  FAQ + brand-page landing intro + checkout trust badges +
  announcement bar.
- Blog: admin CRUD + public `/blog` and `/blog/[slug]` + Schema.org
  Article + sitemap entries. Markdown renderer is dependency-free.
- Custom catalog: admin can add brands and models that aren't in
  code; public pages merge them on top of the code catalog.
- Stripe Checkout integration (optional).
- Resend transactional email (customer + owner + shipped + contact +
  blog noop).
- HMAC-token order URLs + `/track` flow.
- Atomic promo redemption inside a transaction.
- Stripe webhook idempotency ledger.
- DB schema indexed on hot columns; updatedAt triggers; advisory-
  locked DDL bootstrap.
- Security headers, CSRF, rate limiting (Upstash-ready).
- CCPA/CPRA section in privacy policy + footer link.
- Cookie-banner, legal pages, sitemap (incl. blog + custom catalog),
  robots, OG image.
- Cart drawer + cart page, checkout, success / cancel pages,
  custom-order form.
- Google Merchant Center XML feed at `/api/feed.xml` —
  one item per (brand × model × matSet), picks up admin price
  overrides automatically.
- Schema.org: Product (with optional AggregateRating), Offer
  (shipping + return), Organization, BreadcrumbList, FAQPage,
  Article (blog).
- i18n: `en` / `ru` / `uk`, dictionaries split per locale into
  `storefront.ts` (public) + `operations.ts` (admin + email).
- EN copy was given a US-market marketing pass (Stage 7).

## Still TODO (in priority order)

1. **Customer accounts** — registration, order history, address
   book, garage, "reorder". No `Customer` table yet; not started.
2. **Real product photos** — replace the SVG mat preview + Wikipedia
   car thumbnails as soon as supplier sends shots.
3. **Texture choice** (honeycomb / rhombus) and **Heel Pad** option
   in the configurator (matches EVAtech).
4. **Real EVA / edge colour palette** — current list is provisional.
5. **Two-seater pricing review** — the strict 2-seater profile
   (roadsters, supercars) currently reuses the sedan price table;
   confirm with the supplier whether a smaller cabin warrants a
   different price.
6. **Pickup truck-bed liner** — the bed-liner option was removed
   when the supplier stopped making it; restore the `pickup`
   profile's `cargo` / `full-cargo` options if the supplier brings
   it back.
7. **DNS verification for Google Workspace** (`info@elitecarmats.us`)
   and Resend (`elitecarmats.us`).

## Operator actions outside the codebase

Required env vars on Vercel (see `.env.example` for the canonical
list):

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
`ensureSchema()`. First public POST (or admin's
`POST /api/admin/seed`) seeds the catalog.

**Google Merchant Center**: paste
`https://elitecarmats.us/api/feed.xml` into Products → Feeds → Add
data source. Daily fetch is fine; the feed itself caches at the
edge for an hour.

## Competitors (reference)

- FortunaCarMats (USA / Miami) — jQuery, $109 / set.
- PrimeEVA (Europe) — Shopify, €140 full+cargo. Closest analogue.
- EVAtech (Ukraine) — Bitrix, advanced configurator with colour
  preview and texture pick. Inspiration for our roadmap.
- FitMyCar (Australia) — Magento 2.

## House rules for code changes

- Read the relevant guide in `node_modules/next/dist/docs/` before
  editing — Next 16 has breaking changes vs. 14.
- Treat `lib/pricing.ts` as the single source of truth for prices.
  Never trust the DB-stored `Order.total` or `OrderItem.price` for
  anything the customer is being billed for; always recompute
  server-side, passing `loadPriceOverrides()`.
- Never spread `parsed.data` into a Prisma `update.data` — pluck
  fields explicitly.
- Don't introduce a new `useSearchParams()` consumer without a
  `<Suspense>` boundary (Next 16 requirement).
- When adding a new admin endpoint, gate it with both `requireAdmin`
  / `requireAdminApi` AND `checkAdminCsrf` if it's state-changing.
- Money in Postgres is `Decimal(10,2)`. Read with `Number(x ?? 0)` or
  keep as Decimal — never cast through string concat.
- New i18n keys go to `i18n/dictionaries/<locale>/storefront.ts` for
  public copy or `operations.ts` for admin / email. Add the matching
  key to all three locales (en / ru / uk) in the same commit. Key
  overlap between `storefront` and `operations` is a bug; the
  per-locale aggregator merges both with `{ ...storefront,
  ...operations }`.
- Catalog data is code-source-of-truth. Add brands / models in
  `src/data/catalog/`. Use `/admin/catalog` only for one-offs the
  code list doesn't cover.

## Key files quick reference

- `src/app/globals.css` — theme tokens via `@theme inline`.
- `src/data/catalog/index.ts` — catalog aggregator (hydrates
  `modelsCount`, `popularity`, `categories`).
- `src/lib/catalog-merge.ts` — code + DB merge for public reads.
- `src/lib/pricing.ts` — billing maths.
- `src/lib/pricing-overrides.ts` — admin live overrides.
- `src/components/product/MatPreview.tsx` — SVG mat preview.
- `src/app/api/car-image/route.ts` — Wikipedia car-photo proxy.
- `src/app/api/orders/route.ts` — order creation flow.
- `src/app/api/checkout/stripe/route.ts` — Stripe checkout session.
- `src/app/api/webhooks/stripe/route.ts` — Stripe webhook.
- `src/app/api/feed.xml/route.ts` — Google Merchant feed.
- `src/lib/security/auth.ts` — admin session.
- `src/lib/security/order-token.ts` — HMAC for `/order/<n>`.
- `src/lib/db/setup.ts` — runtime DDL bootstrap.
- `prisma/schema.prisma` — DB schema.
- `public/placeholder-car.svg` — fallback for missing car photos.
