import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const books = JSON.parse(readFileSync(new URL("../data/books.json", import.meta.url), "utf8"));
const config = readFileSync(new URL("../js/config.js", import.meta.url), "utf8");
const checkout = readFileSync(new URL("../checkout.html", import.meta.url), "utf8");
const wants = readFileSync(new URL("../wants.html", import.meta.url), "utf8");
const contact = readFileSync(new URL("../contact.html", import.meta.url), "utf8");
const forms = readFileSync(new URL("../__forms.html", import.meta.url), "utf8");
const gitignore = readFileSync(new URL("../.gitignore", import.meta.url), "utf8");

describe("catalog data", () => {
  it("keeps the GitHub 38 copies, SKUs, and in_shop — no invented ISBNs or in_stock", () => {
    const ids = new Set();
    for (const book of books) {
      assert.ok(book.id, "id");
      assert.equal(ids.has(book.id), false, "duplicate " + book.id);
      ids.add(book.id);
      assert.equal(typeof book.price, "number");
      assert.ok(book.price > 0);
      assert.equal(book.sku, "BTW-" + book.id);
      assert.equal(book.status, "in_shop");
      assert.equal(book.isbn10, undefined);
      assert.equal(book.isbn13, undefined);
      assert.notEqual(book.status, "in_stock");
    }
    assert.equal(books.length, 38);
    assert.ok(books.filter((b) => b.featured).length >= 1);
  });
});

describe("config slots", () => {
  it("keeps proton email, BelowtheWinds, $4.75 shipping, empty payment URLs", () => {
    assert.match(config, /email:\s*"beauraywisd@proton\.me"/);
    assert.match(config, /amazonStoreName:\s*"BelowtheWinds"/);
    assert.match(config, /shippingFlat:\s*4\.75/);
    assert.match(config, /stripePaymentLink:\s*""/);
    assert.match(config, /paypalMe:\s*""/);
    assert.match(config, /cashApp:\s*""/);
    assert.doesNotMatch(config, /beau\.wisdom91\+shop@gmail\.com/);
  });
});

describe("netlify forms", () => {
  it("registers contact, wants, and order", () => {
    assert.match(contact, /name="contact"/);
    assert.match(wants, /name="wants"/);
    assert.match(checkout, /name="order"/);
    assert.match(checkout, /id="pay-card"/);
    assert.match(forms, /name="contact"/);
    assert.match(forms, /name="wants"/);
    assert.match(forms, /name="order"/);
    assert.doesNotMatch(checkout, /name="orders"/);
  });

  it("ignores the .netlify directory", () => {
    assert.match(gitignore, /\.netlify/);
  });
});
