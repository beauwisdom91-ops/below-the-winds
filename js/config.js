window.BTW = {
  brand: "Below the Winds",
  location: "Johnson / Northwest Arkansas",
  email: "shop@belowthewinds.com",
  amazonStoreName: "BelowtheWinds",
  amazonStoreUrl: "https://www.amazon.com/s?k=BelowtheWinds&i=stripbooks",
  amazonSellerId: ""
};
/* Amazon fields are reserved for a later listing pass. Do not use them for checkout or primary CTAs. */
window.amazonSearch = function (title, author) {
  const q = encodeURIComponent([title, author].filter(Boolean).join(" "));
  return "https://www.amazon.com/s?k=" + q + "&i=stripbooks";
};
window.amazonIsbn = function (isbn) {
  if (!isbn) return window.BTW.amazonStoreUrl;
  return "https://www.amazon.com/s?k=" + encodeURIComponent(isbn) + "&i=stripbooks";
};
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-btw-email]").forEach(function (el) {
    el.textContent = window.BTW.email;
    if (el.tagName === "A") el.href = "mailto:" + window.BTW.email;
  });
});
