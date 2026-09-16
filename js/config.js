window.BTW = {
  brand: "Below the Winds",
  location: "Johnson / Northwest Arkansas",
  email: "shop@belowthewinds.com",
  amazonStoreName: "BelowtheWinds",
  amazonStoreUrl: "https://www.amazon.com/s?k=Below+the+Winds+Books",
  amazonSellerId: ""
};
window.amazonSearch = function (title, author) {
  const q = encodeURIComponent([title, author].filter(Boolean).join(" "));
  return "https://www.amazon.com/s?k=" + q + "&i=stripbooks";
};
window.amazonIsbn = function (isbn) {
  if (!isbn) return window.BTW.amazonStoreUrl;
  return "https://www.amazon.com/s?k=" + encodeURIComponent(isbn) + "&i=stripbooks";
};
