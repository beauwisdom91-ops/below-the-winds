(function () {
  function encode(data) {
    return new URLSearchParams(data).toString();
  }

  function lineText(items) {
    return items.map(function (it) {
      return (it.qty || 1) + " × " + it.title + " — " + it.author + " (" + window.BTWCart.money(it.price) + ")";
    }).join("\n");
  }

  function fillOrderFields() {
    var items = window.BTWCart.items();
    var jsonEl = document.getElementById("items-json");
    var textEl = document.getElementById("items-text");
    var totalEl = document.getElementById("order-total-field");
    if (jsonEl) jsonEl.value = JSON.stringify(items);
    if (textEl) textEl.value = lineText(items);
    if (totalEl) totalEl.value = window.BTWCart.money(window.BTWCart.total());
  }

  function renderSummary() {
    var mount = document.getElementById("order-summary-lines");
    var totalEl = document.getElementById("order-summary-total");
    if (!mount) return;
    var items = window.BTWCart.items();
    mount.innerHTML = items.map(function (it) {
      return "<li><span>" + window.BTWCart.escapeHtml(it.title) + "</span><span>" +
        window.BTWCart.money(it.price) + "</span></li>";
    }).join("");
    if (totalEl) totalEl.textContent = window.BTWCart.money(window.BTWCart.total());
  }

  function showEmpty() {
    var emptyEl = document.getElementById("checkout-empty");
    var wrap = document.getElementById("checkout-form-wrap");
    if (emptyEl) emptyEl.hidden = false;
    if (wrap) wrap.hidden = true;
  }

  function showForm() {
    var emptyEl = document.getElementById("checkout-empty");
    var wrap = document.getElementById("checkout-form-wrap");
    if (emptyEl) emptyEl.hidden = true;
    if (wrap) wrap.hidden = false;
  }

  function showConfirm() {
    var emptyEl = document.getElementById("checkout-empty");
    var wrap = document.getElementById("checkout-form-wrap");
    var confirmEl = document.getElementById("order-confirm");
    if (emptyEl) emptyEl.hidden = true;
    if (wrap) wrap.hidden = true;
    if (confirmEl) confirmEl.hidden = false;
  }

  function showError(msg) {
    var err = document.getElementById("order-error");
    if (!err) return;
    err.hidden = false;
    err.textContent = msg;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("order-form");
    if (!form) return;

    if (!window.BTWCart.items().length) {
      showEmpty();
      fillOrderFields();
      return;
    }

    showForm();
    renderSummary();
    fillOrderFields();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!window.BTWCart.items().length) {
        showEmpty();
        return;
      }
      fillOrderFields();
      var err = document.getElementById("order-error");
      if (err) err.hidden = true;

      var fd = new FormData(form);
      var payload = {};
      fd.forEach(function (value, key) {
        payload[key] = value;
      });
      payload["form-name"] = "orders";

      var submitBtn = form.querySelector("[type=submit]");
      if (submitBtn) submitBtn.disabled = true;

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error("The shop did not receive the order.");
        window.BTWCart.clear();
        window.BTWCart.paintCount();
        showConfirm();
      }).catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        showError("The order could not be sent from this preview. Write shop@belowthewinds.com with the titles, or connect this repo to Netlify so the orders form can be submitted.");
      });
    });
  });
})();
