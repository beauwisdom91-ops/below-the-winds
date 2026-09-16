window.BTW = {
  brand: "Below the Winds",
  location: "Johnson / Northwest Arkansas",
  email: "beauraywisd@proton.me",
  amazonStoreName: "BelowtheWinds",
  amazonStoreUrl: "https://www.amazon.com/s?k=BelowtheWinds&i=stripbooks",
  amazonSellerId: "",
  shippingFlat: 4.75,
  stripePaymentLink: "",
  paypalMe: "",
  cashApp: ""
};

window.amazonSearch = function (title, author) {
  const q = encodeURIComponent([title, author].filter(Boolean).join(" "));
  return "https://www.amazon.com/s?k=" + q + "&i=stripbooks";
};

window.amazonIsbn = function (isbn) {
  if (!isbn) return window.BTW.amazonStoreUrl;
  return "https://www.amazon.com/s?k=" + encodeURIComponent(isbn) + "&i=stripbooks";
};

window.amazonHref = function (book) {
  if (!book) return window.BTW.amazonStoreUrl;
  if (book.amazonUrl) return book.amazonUrl;
  const isbn = book.isbn10 || book.isbn13 || book.isbn;
  const seller = window.BTW.amazonSellerId || "";
  if (isbn && seller) {
    return "https://www.amazon.com/gp/offer-listing/" + encodeURIComponent(isbn) +
      "?me=" + encodeURIComponent(seller) + "&condition=used";
  }
  if (isbn) return window.amazonIsbn(isbn);
  return window.amazonSearch(book.title, book.author);
};

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-btw-email]").forEach(function (el) {
    el.textContent = window.BTW.email;
    if (el.tagName === "A") el.href = "mailto:" + window.BTW.email;
  });
  document.querySelectorAll("[data-btw-amazon]").forEach(function (el) {
    el.href = window.BTW.amazonStoreUrl;
  });
  document.querySelectorAll("[data-btw-shipping]").forEach(function (el) {
    el.textContent = "$" + Number(window.BTW.shippingFlat).toFixed(2);
  });
});
