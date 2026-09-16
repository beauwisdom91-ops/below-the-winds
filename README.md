# Below the Winds

Scholarly used-book shop in Johnson / Northwest Arkansas.
This site is the catalog and the face. Amazon Fulfilled by Merchant is the register — not FBA.

- Live (once Git is linked or CLI deploys): https://below-the-winds.netlify.app
- Source: this repo
- Shop email (interim through 2026-09-17): `beauraywisd@proton.me`
- Amazon store name: `BelowtheWinds`
- Netlify site id: `a5368a05-70f4-41f3-a8c0-4bd238ec02ba`

## Ops

Netlify forms: `contact`, `wants`, and `order` (the order form is registered for the later shop till).

Payment slots in `js/config.js` (`stripePaymentLink`, `paypalMe`, `cashApp`) stay empty until Beau pastes URLs. Amazon Associates stays off until `amazonAssociatesTag` is set. See `affiliates.html`.

Do not invent ISBNs. Do not mark `in_stock` without a real copy. Do not turn on FBA.

Keep the GitHub repo private. Keep the Netlify demo password-protected until Beau says the shop is public. Do not attach a custom domain until then.

## Remaining clicks

1. **Netlify Git link** — site `below-the-winds` (`a5368a05-70f4-41f3-a8c0-4bd238ec02ba`) → Import GitHub `beauwisdom91-ops/below-the-winds`, production branch `main`, publish `.`, build `echo ready`. Form notifications to `beauraywisd@proton.me`.
2. **Amazon** — sell.amazon.com, Individual, FBM, store name `BelowtheWinds`. Media Mail. Not FBA.
3. **Domain (do not buy unless you mean to)** — `thelandbelowthewinds.store` is taken. `belowthewinds.store` and `thelandbelowthewinds.com` were free as of 2026-09-16.

`.netlify` and `.env` are gitignored.

## Local

```bash
python3 -m http.server 8080
```
