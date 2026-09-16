# Below the Winds

Scholarly used-book shop in Johnson / Northwest Arkansas.
This site is the catalog and the bag. Amazon Fulfilled by Merchant is the other register — not FBA.

- Live (once Git is linked): https://below-the-winds.netlify.app
- Netlify site id: `a5368a05-70f4-41f3-a8c0-4bd238ec02ba`
- Shop email (interim): `beauraywisd@proton.me`
- Amazon store name: `BelowtheWinds`

## How money comes in

1. **Pay with card** (shop till) — bag copies, Stripe Checkout, US Media Mail **$4.75**, packed from Johnson. Unique copies held 30 minutes while Checkout is open.
2. **Hold / invoice** — same checkout page posts a Netlify `order` form if Stripe keys are not in yet. Shop emails a payment link.
3. **Amazon FBM** — title search until Seller Central is live as Individual, FBM, store name `BelowtheWinds`. Then put the seller ID in `js/config.js`. Do not turn on FBA.

Want-list: `wants.html`. Contact: `contact.html`.

## Tonight — remaining clicks

1. **Netlify Git** — [app.netlify.com](https://app.netlify.com) → site `below-the-winds` (`a5368a05-70f4-41f3-a8c0-4bd238ec02ba`) → Import this GitHub repo, production branch `main` (or this PR branch for a preview). Publish directory `.`. Build command is `npm ci --omit=dev` in `netlify.toml`. Enable Forms. Form notifications to `beauraywisd@proton.me` for `contact`, `wants`, and `order`.
2. **Stripe** — [dashboard.stripe.com](https://dashboard.stripe.com) → Activate. Prefer a [restricted key](https://docs.stripe.com/keys/restricted-api-keys). Netlify env:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `URL` = the Netlify site URL
3. **Webhook** — Stripe Developers → Webhooks → `https://<site>/api/stripe-webhook` for `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`. Redeploy after setting the signing secret.
4. **Smoke** — `/api/health` should show `"stripe": true`. Test-mode card (`sk_test_…`) before live keys. Pack from the Stripe email + shipping address.
5. **Amazon** — sell.amazon.com, Individual, FBM, `BelowtheWinds`, Media Mail, 1-day handle. Not FBA.
6. **Domain (optional)** — `belowthewinds.com` is the long-term name. Do not buy a domain unless you mean to.

Do not commit secrets. `.env` is gitignored; `.env.example` is the map.

## Local

```bash
npm install
npm test
npx netlify dev
```

Without `STRIPE_SECRET_KEY`, **Pay with card** tells the buyer to send the hold form.

## Catalog

`data/books.json` is PageKeep. Fields: `id`, `sku` (`BTW-{id}`), `price`, `condition`, `status` (`in_shop` | `seeking` | `sold`), `featured`. After a copy leaves, set `"status": "sold"` and deploy. Paid Stripe webhooks also mark it sold in the orders table.
