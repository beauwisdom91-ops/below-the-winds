# Below the Winds

Personal used-book shop in Johnson / Northwest Arkansas. This site **is** the store: browse the catalog, add a used copy to a cart, and send an order.

Packed here. USPS Media Mail. Honest condition notes. One copy per title unless the catalog says otherwise.

## This repo is not live yet

There is no Netlify site connected to this GitHub repository. Do not treat `below-the-winds.netlify.app` as the shop — that URL 404s. The custom domain `belowthewinds.com` is not attached (NXDOMAIN). After you import the repo in Netlify, use the URL Netlify gives you, or a domain you actually configure.

## Connect Netlify

1. In Netlify: **Add new site → Import an existing project** → this GitHub repo (`beauwisdom91-ops/below-the-winds`).
2. Publish directory is `.` (already set in `netlify.toml`). Build command can stay `echo ready`.
3. Forms detected from the HTML: `contact` (contact page) and `orders` (checkout). Set form notification email in Netlify so the shop sees submissions.
4. Point a domain at the site only after DNS is yours to use.

## How orders work

Checkout posts a Netlify form named `orders` with buyer name, email, optional phone, shipping address, a Media Mail note, dollar total, and line items (plain text plus JSON). After the form arrives, email the buyer, take payment, then pack.

Totals include a flat USPS Media Mail estimate (`shippingFlat`, currently $4.75) added once per order. The exact total is confirmed by email before anything ships.

### Payment buttons

The checkout page shows pay buttons that stay disabled until you paste a real handle into `js/config.js`:

```js
stripePaymentLink: "https://buy.stripe.com/…",  // card
paypalMe: "YourHandle",                         // paypal.me/YourHandle
cashApp: "YourCashtag"                          // cash.app/$YourCashtag
```

The Amazon storefront button works today. The card (Stripe), PayPal, and Cash App buttons light up automatically the moment their slot is filled — empty slots stay visibly disabled so no buyer assumes a live charge went through.

Public shop email: **beauraywisd@proton.me**.

## Amazon

Amazon listings, ASINs, and Seller Central are out of scope here. `js/config.js` still has unused Amazon fields for a later pass. Do not wire them to buy buttons until that work is actually done.

## Local

Serve the folder as static files (`npx serve .` or any static server). The cart uses `localStorage`. Form posts only complete on a Netlify deploy.
