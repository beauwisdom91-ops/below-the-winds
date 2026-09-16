# Below the Winds

Scholarly used-book shop in Johnson / Northwest Arkansas.
This site is the catalog and the shop till. Amazon is the other register.

- Live (once Netlify is linked): https://below-the-winds.netlify.app
- Source: this repo
- Shop email: `beau.wisdom91+shop@gmail.com`
- Amazon store name: `BelowtheWinds`
- Custom domain to attach later: belowthewinds.com → `shop@belowthewinds.com`

## How money comes in

1. **Buy this copy** (primary tonight) — Stripe Checkout, US Media Mail $4.99, packed from Johnson. Unique copies are held 30 minutes while Checkout is open.
2. **Request this copy** — Netlify form if Stripe keys are not in yet. Invoice from the shop email / a Stripe payment link.
3. **Amazon** — ISBN search (or this seller’s offer once `amazonSellerId` is set in `js/config.js`). List the same ISBNs in Seller Central.

Want-list and contact forms land in Netlify Forms.

## Tonight — do these in order

1. **Netlify** — Log in at [app.netlify.com](https://app.netlify.com), **Add new site → Import from Git** → `beauwisdom91-ops/below-the-winds`, publish directory `.`, build command `npm ci --omit=dev` (already in `netlify.toml`). Confirm the production URL. Enable **Forms**. Site settings → **Form notifications** → email `beau.wisdom91+shop@gmail.com` for `contact`, `order`, and `want`.
2. **Stripe** — [dashboard.stripe.com](https://dashboard.stripe.com) → Activate account (business: Below the Winds, Johnson AR). Developers → API keys. Prefer a [restricted key](https://docs.stripe.com/keys/restricted-api-keys) that can create Checkout Sessions. Netlify → Environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET` (after step 3)
   - `URL` = the Netlify site URL
3. **Stripe webhook** — Developers → Webhooks → add `https://<your-site>/api/stripe-webhook` for `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`. Paste the signing secret into `STRIPE_WEBHOOK_SECRET`. Redeploy.
4. **Smoke test** — Open `/api/health` (should show `"stripe": true`). Buy a $1 test book in Stripe test mode first (`sk_test_…`), then switch to live keys. Pack from the Stripe email + shipping address.
5. **Amazon Seller Central** — Account name `BelowtheWinds`. List each catalog ISBN (see `data/books.json`) as FBM, condition matching the note, 1-day handle, Media Mail. When the storefront exists, put the seller ID in `js/config.js` as `amazonSellerId`.
6. **Domain (optional tonight)** — Netlify → Domain management → add `belowthewinds.com`. Then change shop email to `shop@belowthewinds.com` in `js/config.js`.

Do not commit secrets. `.env` is gitignored; `.env.example` is the map.

## Local

```bash
npm install
npm test
npx netlify dev
```

Card checkout against Stripe requires `STRIPE_SECRET_KEY` in the Netlify UI or a local `.env`. Without it, **Buy this copy** tells the customer to use the request form.

## Catalog edits

`data/books.json` is the inventory. Fields that matter: `id`, `price`, `condition`, `isbn10`, `isbn13`, `status` (`in_shop` or `sold`), `featured`. After a copy leaves, set `"status": "sold"` and deploy (the paid Stripe webhook also marks it sold in the orders table).
