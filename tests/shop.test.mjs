import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { amazonHref, esc, money, SHIPPING_CENTS } from "../js/shop.mjs";

const books = JSON.parse(readFileSync(new URL("../data/books.json", import.meta.url), "utf8"));

describe("catalog data", () => {
  it("has unique ids, prices, and ISBNs on every copy", () => {
    const ids = new Set();
    for (const book of books) {
      assert.ok(book.id, "id");
      assert.equal(ids.has(book.id), false, "duplicate " + book.id);
      ids.add(book.id);
      assert.equal(typeof book.price, "number");
      assert.ok(book.price > 0);
      assert.match(book.isbn10, /^[0-9]{9}[0-9X]$/);
      assert.match(book.isbn13, /^978[0-9]{10}$/);
      assert.equal(book.status, "in_shop");
    }
    assert.equal(books.length, 38);
    assert.ok(books.filter((b) => b.featured).length >= 4);
  });
});

describe("amazonHref", () => {
  const reid = books.find((b) => b.id === "299");

  it("uses ISBN search when no seller id is set", () => {
    const href = amazonHref(reid, { amazonSellerId: "" });
    assert.equal(href, "https://www.amazon.com/s?k=0300046402&i=stripbooks");
  });

  it("prefers this shop's offer listing when seller id exists", () => {
    const href = amazonHref(reid, { amazonSellerId: "AEXAMPLE" });
    assert.equal(
      href,
      "https://www.amazon.com/gp/offer-listing/0300046402?me=AEXAMPLE&condition=used",
    );
  });

  it("falls back to title search without ISBN", () => {
    const href = amazonHref({ title: "Siam Mapped", author: "Thongchai" }, {});
    assert.ok(href.includes("Siam"));
    assert.ok(href.includes("stripbooks"));
  });
});

describe("display helpers", () => {
  it("escapes HTML", () => {
    assert.equal(esc("<cite>"), "&lt;cite&gt;");
  });
  it("formats money and keeps Media Mail at $4.99", () => {
    assert.equal(money(30), "$30.00");
    assert.equal(SHIPPING_CENTS, 499);
  });
});
