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
    var subEl = document.getElementById("order-subtotal-field");
    var shipEl = document.getElementById("order-shipping-field");
    if (jsonEl) jsonEl.value = JSON.stringify(items);
    if (textEl) textEl.value = lineText(items);
    if (subEl) subEl.value = window.BTWCart.money(window.BTWCart.subtotal());
    if (shipEl) shipEl.value = window.BTWCart.money(window.BTWCart.shipping());
    if (totalEl) totalEl.value = window.BTWCart.money(window.BTWCart.total());
  }

  function renderSummary() {
    var mount = document.getElementById("order-summary-lines");
    var subEl = document.getElementById("order-summary-subtotal");
    var shipEl = document.getElementById("order-summary-shipping");
    var totalEl = document.getElementById("order-summary-total");
    if (!mount) return;
    var items = window.BTWCart.items();
    mount.innerHTML = items.map(function (it) {
      return "<li><span>" + window.BTWCart.escapeHtml(it.title) + "</span><span>" +
        window.BTWCart.money(it.price) + "</span></li>";
    }).join("");
    if (subEl) subEl.textContent = window.BTWCart.money(window.BTWCart.subtotal());
    if (shipEl) shipEl.textContent = window.BTWCart.money(window.BTWCart.shipping());
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

  function paymentHref(value) {
    var v = String(value || "").trim();
    return v || "";
  }

  function paintPaySlots() {
    var mount = document.getElementById("pay-slots");
    if (!mount) return;
    var cfg = window.BTW || {};
    var bits = [];
    var paypal = paymentHref(cfg.paypalMe);
    var cash = paymentHref(cfg.cashApp);
    bits.push("<button class=\"btn solid\" type=\"button\" id=\"pay-card-aside\">Pay with card</button>");
    if (paypal) {
      bits.push("<a class=\"btn ghost\" href=\"" + window.BTWCart.escapeHtml(paypal) + "\" target=\"_blank\" rel=\"noopener\">PayPal</a>");
    }
    if (cash) {
      bits.push("<a class=\"btn ghost\" href=\"" + window.BTWCart.escapeHtml(cash) + "\" target=\"_blank\" rel=\"noopener\">Cash App</a>");
    }
    mount.innerHTML = "<p class=\"kicker\">Pay now</p><div class=\"actions\">" + bits.join("") + "</div>" +
      "<p class=\"note\">Card checkout packs from Johnson. If Stripe is not connected yet, send the hold form and we invoice from the shop email.</p>";
  }

  function startCardCheckout() {
    var items = window.BTWCart.items();
    var errNote = document.getElementById("order-error");
    if (!items.length) {
      showEmpty();
      return;
    }
    if (errNote) errNote.hidden = true;
    var ids = items.map(function (it) { return String(it.id); });
    fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookIds: ids })
    }).then(function (res) {
      return res.json().then(function (data) {
        return { res: res, data: data };
      }).catch(function () {
        return { res: res, data: {} };
      });
    }).then(function (out) {
      if (out.res.ok && out.data.url) {
        window.location.href = out.data.url;
        return;
      }
      if (out.res.status === 503) {
        showError(out.data.message || "Card checkout is not live yet. Send the hold form and we will invoice you.");
        return;
      }
      if (out.res.status === 409) {
        showError("A copy in the bag is already held or sold. Remove it and try again.");
        return;
      }
      showError("Card checkout could not start. Send the hold form, or write the shop email.");
    }).catch(function () {
      showError("Card checkout could not start. Send the hold form.");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("order-form");
    paintPaySlots();
    document.addEventListener("click", function (e) {
      if (e.target.closest("#pay-card") || e.target.closest("#pay-card-aside")) {
        e.preventDefault();
        startCardCheckout();
      }
    });
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
      payload["form-name"] = "order";

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
        var email = (window.BTW && window.BTW.email) || "beauraywisd@proton.me";
        showError("The order could not be sent from this preview. Write " + email + " with the titles, or connect this repo to Netlify so the order form lands.");
      });
    });
  });
})();
