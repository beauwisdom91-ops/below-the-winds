# Below the Winds

Scholarly used-book shop in Johnson / Northwest Arkansas.
This site is the catalog and the bag. Amazon Fulfilled by Merchant is the other register — not FBA.

- Live (once Git is linked or CLI deploys): https://below-the-winds.netlify.app
- Source: this repo
- Shop email (interim through 2026-09-17): `beauraywisd@proton.me`
- Amazon store name: `BelowtheWinds`
- Netlify site id: `a5368a05-70f4-41f3-a8c0-4bd238ec02ba`

## How money comes in

1. **Bag + checkout hold** (primary tonight) — add a used copy, send the `order` form. Copies stay on hold until the shop emails. USPS Media Mail is a flat **$4.75** from Johnson.
2. **Card / PayPal / Cash App** — empty slots in `js/config.js` (`stripePaymentLink`, `paypalMe`, `cashApp`). Paste a Stripe Payment Link or PayPal.me and the checkout buttons light up. There is no Stripe processor in this repo.
3. **Amazon** — title search until Seller Central is live as **Individual, FBM**, store name `BelowtheWinds`. Use sell.amazon.com. Do not turn on FBA. When a seller id exists, put it in `amazonSellerId`.

Netlify forms: `contact`, `wants`, `order`. Amazon Associates stays off until `amazonAssociatesTag` is set. See `affiliates.html`.

## Catalog

`data/books.json` is PageKeep. Fields that matter: `id`, `sku` (`BTW-{inv}`), `price`, `condition`, `status` (`in_shop` | `seeking` | `sold`), `featured`.

Do not invent ISBNs. Do not mark `in_stock` without a real copy. New Amazon FBM listings keep an **$8 net floor**.

The 239-title Buying Guide file lived on a local tree (`/home/workdir/artifacts/below-the-winds`) that is not in this cloud workspace. GitHub still holds the 38 described shop copies. When that JSON is available, overwrite `data/books.json` — seeking titles stay `seeking`.

Keep the GitHub repo private. Keep the Netlify demo password-protected until Beau says the shop is public.

## Remaining clicks for Beau

1. **Netlify Git link** — [app.netlify.com](https://app.netlify.com) → site `below-the-winds` (`a5368a05-70f4-41f3-a8c0-4bd238ec02ba`) → **Set up and deploy** / **Import from Git** → `beauwisdom91-ops/below-the-winds`, production branch `main`, publish directory `.`, build command `echo ready` (already in `netlify.toml`). Forms are already enabled on that project. After the first Git deploy, set form notifications to `beauraywisd@proton.me`.
2. **Payments** — paste Stripe Payment Link and/or PayPal.me into `js/config.js`. Do not open a Stripe account from this agent.
3. **Amazon** — sell.amazon.com, Individual, FBM, store name `BelowtheWinds`. Media Mail. Not FBA. Not a second seller account.
4. **Domain (do not buy unless you mean to)** — `thelandbelowthewinds.store` is taken. `belowthewinds.store` (~$1.99) and `thelandbelowthewinds.com` (~$11.25) were free as of 2026-09-16.

Do not commit secrets. `.netlify` and `.env` are gitignored.

## Local

```bash
npm test
python3 -m http.server 8080
```

Open `/catalog.html`, add a copy, `/checkout.html`. Forms need a Netlify deploy to land in the inbox.
