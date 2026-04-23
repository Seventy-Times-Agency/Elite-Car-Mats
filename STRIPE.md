# Stripe Payments — Activation Notes

The Stripe integration is already wired into the codebase. Payments are **off by
default** and turn on automatically the moment the env vars below are present.
No code changes are required to enable it.

## Required env vars

Add these to Vercel (Production + Preview) and to `.env.local` for development.

| Var | Required | Example | Notes |
| --- | --- | --- | --- |
| `STRIPE_SECRET_KEY` | yes | `sk_live_...` / `sk_test_...` | Server-only. Never ship to the client. |
| `STRIPE_WEBHOOK_SECRET` | yes | `whsec_...` | Provided by Stripe when you create the webhook endpoint. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | yes | `pk_live_...` / `pk_test_...` | Read on the client to decide whether to route checkout through Stripe. |
| `NEXT_PUBLIC_SITE_URL` | recommended | `https://elitecarmats.us` | Used to build `success_url` / `cancel_url`. Falls back to `https://elitecarmats.us`. |

After setting the vars, redeploy. No migrations are required — the Prisma
schema already carries `stripeSessionId`, `stripePaymentIntentId`, and `paidAt`
columns on `Order`.

## Stripe Dashboard configuration

1. Enable **Checkout** (Products → Checkout).
2. Create a webhook endpoint with URL:
   `https://elitecarmats.us/api/webhooks/stripe`
3. Select these events (others are ignored but safe to subscribe to):
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Under Settings → Branding, upload the EliteCarMats logo so the Checkout
   page matches the storefront.

## How the flow works

1. Customer fills out `/checkout` and clicks **Pay by card**.
2. Browser POSTs `/api/orders` — the order is persisted with `status=PENDING`.
3. If `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set, the browser immediately POSTs
   `/api/checkout/stripe` with `{ orderId, locale }`.
4. The server loads the order from Prisma, builds USD line items from the
   cart contents, calls Stripe, and persists `stripeSessionId` on the order.
5. Browser redirects to `session.url` → customer pays on Stripe.
6. Stripe redirects back to `/checkout/success?session_id=…&order=…` (paid) or
   `/checkout/cancel?order=…` (abandoned).
7. Stripe also fires `checkout.session.completed` to
   `/api/webhooks/stripe`, which verifies the signature and flips the order
   to `CONFIRMED` with `paidAt` + `stripePaymentIntentId` set.

If Stripe is **not** configured, the button label falls back to "Confirm
order" and the existing manual-confirm flow runs (order stored, status
`PENDING`, customer sent to `/order/[orderNumber]`). This means the site works
end-to-end even before Stripe is activated.

## Local testing

```bash
# Install Stripe CLI, log in, then forward webhooks to the dev server:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# That command prints a webhook signing secret — put it in STRIPE_WEBHOOK_SECRET
# for your local .env.local.

# Use Stripe test cards:
#   4242 4242 4242 4242  — success
#   4000 0000 0000 9995  — declined
```

## Files of interest

- `src/lib/stripe.ts` — lazy SDK loader + feature-flag predicates.
- `src/lib/stripe-checkout.ts` — `createCheckoutSession` + webhook verification.
- `src/app/api/checkout/stripe/route.ts` — POST endpoint that creates the session.
- `src/app/api/webhooks/stripe/route.ts` — webhook handler (raw body, signature verified).
- `src/app/checkout/page.tsx` — client page that bridges order creation → Stripe redirect.
- `src/app/checkout/success/page.tsx`, `src/app/checkout/cancel/page.tsx` — return pages.
- `prisma/schema.prisma` — `Order.stripeSessionId`, `stripePaymentIntentId`, `paidAt`.

## Notes

- Currency is USD and that is hard-coded in `createCheckoutSession`.
- Shipping countries allowed on Stripe Checkout: US, CA, MX. Change the
  `shipping_address_collection.allowed_countries` array in
  `src/lib/stripe-checkout.ts` to adjust.
- Refunds are not wired yet; add a `charge.refunded` case in
  `src/app/api/webhooks/stripe/route.ts` when that flow is needed.
