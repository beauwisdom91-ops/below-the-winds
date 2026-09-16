import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("checkout session shape", () => {
  it("charges catalog prices, collects US shipping, and never sets payment_method_types", () => {
    const source = readFileSync(new URL("../netlify/functions/_shared/checkout-params.ts", import.meta.url), "utf8");
    assert.match(source, /unit_amount: bookAmountCents/);
    assert.match(source, /shipping_address_collection/);
    assert.match(source, /integration_identifier/);
    assert.match(source, /books\.map/);
    assert.doesNotMatch(source, /payment_method_types/);
    assert.doesNotMatch(source, /automatic_tax/);
  });
});

describe("card checkout wiring", () => {
  it("posts the bag to /api/checkout", () => {
    const checkoutJs = readFileSync(new URL("../js/checkout.js", import.meta.url), "utf8");
    const checkoutHtml = readFileSync(new URL("../checkout.html", import.meta.url), "utf8");
    assert.match(checkoutJs, /\/api\/checkout/);
    assert.match(checkoutJs, /bookIds/);
    assert.match(checkoutHtml, /id="pay-card"/);
  });

  it("does not put Stripe secret keys in browser JS", () => {
    const config = readFileSync(new URL("../js/config.js", import.meta.url), "utf8");
    const checkout = readFileSync(new URL("../js/checkout.js", import.meta.url), "utf8");
    assert.doesNotMatch(config, /sk_live|sk_test|rk_live|rk_test/);
    assert.doesNotMatch(checkout, /sk_live|sk_test/);
  });
});
