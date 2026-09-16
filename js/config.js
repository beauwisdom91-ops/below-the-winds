window.BTW = {
  brand: "Below the Winds",
  location: "Johnson / Northwest Arkansas",
  email: "beauraywisd@proton.me",
  amazonStoreName: "BelowtheWinds",
  amazonStoreUrl: "https://www.amazon.com/s?k=BelowtheWinds&i=stripbooks",
  amazonSellerId: "",

  // Flat USPS Media Mail estimate added to every order.
  shippingFlat: 4.75,

  // Payment slots. Paste a real value and the matching checkout button turns on.
  // Leave empty and the button stays disabled so no one thinks a charge went through.
  stripePaymentLink: "",   // e.g. "https://buy.stripe.com/xxxx…"
  paypalMe: "",            // e.g. "YourHandle" (paypal.me/YourHandle)
  cashApp: ""              // e.g. "YourCashtag" (without the leading $)
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

// Build the payment links from config. Returns null when a slot is empty
// (so the caller keeps that button disabled). amount is optional and only
// used by the handles that accept an inline amount.
window.btwPayLinks = function (amount) {
  var btw = window.BTW || {};
  var amt = Number(amount);
  var hasAmt = isFinite(amt) && amt > 0;
  var fixed = hasAmt ? amt.toFixed(2) : "";

  var paypal = null;
  if (btw.paypalMe) {
    var handle = String(btw.paypalMe).replace(/^@/, "");
    paypal = "https://www.paypal.com/paypalme/" + encodeURIComponent(handle) + (hasAmt ? "/" + fixed : "");
  }

  var cash = null;
  if (btw.cashApp) {
    var tag = String(btw.cashApp).replace(/^\$/, "");
    cash = "https://cash.app/$" + encodeURIComponent(tag) + (hasAmt ? "/" + fixed : "");
  }

  return {
    stripe: btw.stripePaymentLink || null,
    paypal: paypal,
    cashApp: cash,
    amazon: btw.amazonStoreUrl || null
  };
};
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-btw-email]").forEach(function (el) {
    el.textContent = window.BTW.email;
    if (el.tagName === "A") el.href = "mailto:" + window.BTW.email;
  });
});
