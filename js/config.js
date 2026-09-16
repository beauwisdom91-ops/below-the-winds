window.BTW = {
  brand: "Below the Winds",
  location: "Johnson / Northwest Arkansas",
  email: "beau.wisdom91+shop@gmail.com",
  amazonStoreName: "BelowtheWinds",
  amazonStoreUrl: "https://www.amazon.com/s?k=BelowtheWinds&i=stripbooks",
  amazonSellerId: "",
  shippingCents: 499
};
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-btw-email]").forEach(function (el) {
    el.textContent = window.BTW.email;
    if (el.tagName === "A") el.href = "mailto:" + window.BTW.email;
  });
  document.querySelectorAll("[data-btw-amazon]").forEach(function (el) {
    el.href = window.BTW.amazonStoreUrl;
  });
});
