window.BTW = {
  brand: "Below the Winds",
  location: "Johnson / Northwest Arkansas",
  email: "beauraywisd@proton.me",
  amazonStoreName: "BelowtheWinds",
  amazonStoreUrl: "https://www.amazon.com/s?k=BelowtheWinds&i=stripbooks",
  amazonSellerId: "",
  amazonAssociatesTag: "",
  bookshopAffiliate: "",
  shippingFlat: 4.75,
  paypalMe: "",
  stripePaymentLink: "",
  cashApp: ""
};
window.withAffiliate = function (url) {
  const tag = window.BTW.amazonAssociatesTag;
  if (!tag) return url;
  const u = new URL(url, "https://www.amazon.com");
  u.searchParams.set("tag", tag);
  return u.toString();
};
window.amazonSearch = function (title, author) {
  const q = encodeURIComponent([title, author].filter(Boolean).join(" "));
  return window.withAffiliate("https://www.amazon.com/s?k=" + q + "&i=stripbooks");
};
window.amazonIsbn = function (isbn) {
  if (!isbn) return window.withAffiliate(window.BTW.amazonStoreUrl);
  return window.withAffiliate("https://www.amazon.com/s?k=" + encodeURIComponent(isbn) + "&i=stripbooks");
};
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-btw-email]").forEach(function (el) {
    el.textContent = window.BTW.email;
    if (el.tagName === "A") el.href = "mailto:" + window.BTW.email;
  });
  document.querySelectorAll("[data-btw-amazon]").forEach(function (el) {
    el.href = window.withAffiliate(window.BTW.amazonStoreUrl);
  });
  document.querySelectorAll("[data-affiliate-note]").forEach(function (el) {
    el.hidden = !window.BTW.amazonAssociatesTag;
  });
});
