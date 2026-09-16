export const SHIPPING_CENTS = 499;

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

export function money(amount) {
  return "$" + Number(amount).toFixed(2);
}

export function amazonHref(book, cfg = {}) {
  if (book.amazonUrl) return book.amazonUrl;
  const seller = cfg.amazonSellerId || "";
  const isbn = book.isbn10 || book.isbn13;
  if (isbn && seller) {
    return "https://www.amazon.com/gp/offer-listing/" + encodeURIComponent(isbn) +
      "?me=" + encodeURIComponent(seller) + "&condition=used";
  }
  if (isbn) {
    return "https://www.amazon.com/s?k=" + encodeURIComponent(isbn) + "&i=stripbooks";
  }
  const q = [book.title, book.author].filter(Boolean).join(" ");
  return "https://www.amazon.com/s?k=" + encodeURIComponent(q) + "&i=stripbooks";
}

export function shippingLabel() {
  return money(SHIPPING_CENTS / 100) + " Media Mail";
}
