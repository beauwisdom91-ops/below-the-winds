import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("checkout session shape", () => {
  it("charges the catalog price, not a guessed amount, and never sets payment_method_types", () => {
    const source = readFileSync(new URL("../netlify/functions/_shared/checkout-params.ts", import.meta.url), "utf8");
    assert.match(source, /unit_amount: amount/);
    assert.match(source, /shipping_address_collection/);
    assert.match(source, /integration_identifier/);
    assert.doesNotMatch(source, /payment_method_types/);
    assert.doesNotMatch(source, /automatic_tax/);
  });
});

describe("secrets stay out of the client", () => {
  it("does not put Stripe secret keys in browser JS", () => {
    const config = readFileSync(new URL("../js/config.js", import.meta.url), "utf8");
    const catalog = readFileSync(new URL("../js/catalog.js", import.meta.url), "utf8");
    assert.doesNotMatch(config, /sk_live|sk_test|rk_live|rk_test/);
    assert.doesNotMatch(catalog, /sk_live|sk_test/);
    assert.match(catalog, /\/api\/checkout/);
  });
});
