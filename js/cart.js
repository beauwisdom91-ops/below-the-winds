(function () {
  var KEY = "btw-cart";

  function empty() {
    return { items: [] };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.items)) return empty();
      return data;
    } catch (err) {
      return empty();
    }
  }

  function save(cart) {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch (err) {
      /* private mode or quota */
    }
    window.dispatchEvent(new Event("btw-cart-change"));
    paintCount();
  }

  function items() {
    return load().items;
  }

  function count() {
    return items().reduce(function (n, it) {
      return n + Number(it.qty || 1);
    }, 0);
  }

  function has(id) {
    var sid = String(id);
    return items().some(function (it) {
      return String(it.id) === sid;
    });
  }

  function add(book) {
    if (!book || book.id == null) return load();
    if (!isForSale(book)) return load();
    var cart = load();
    if (cart.items.some(function (it) { return String(it.id) === String(book.id); })) {
      return cart;
    }
    cart.items.push({
      id: String(book.id),
      sku: book.sku || ("BTW-" + book.id),
      title: book.title,
      author: book.author,
      price: Number(book.price),
      condition: book.condition || "",
      qty: 1
    });
    save(cart);
    return cart;
  }

  function remove(id) {
    var sid = String(id);
    var cart = load();
    cart.items = cart.items.filter(function (it) {
      return String(it.id) !== sid;
    });
    save(cart);
    return cart;
  }

  function setQty(id, qty) {
    var n = Number(qty);
    if (!(n > 0)) return remove(id);
    n = Math.min(1, Math.floor(n));
    var sid = String(id);
    var cart = load();
    cart.items.forEach(function (it) {
      if (String(it.id) === sid) it.qty = n;
    });
    save(cart);
    return cart;
  }

  function subtotal() {
    return items().reduce(function (sum, it) {
      return sum + Number(it.price) * Number(it.qty || 1);
    }, 0);
  }

  function shipping() {
    if (!items().length) return 0;
    return Number((window.BTW && window.BTW.shippingFlat) || 4.75);
  }

  function total() {
    return subtotal() + shipping();
  }

  function clear() {
    save(empty());
  }

  function money(n) {
    return "$" + Number(n).toFixed(2);
  }

  function isForSale(book) {
    var status = String((book && book.status) || "in_shop").toLowerCase();
    if (status === "sold" || status === "seeking" || status === "held" || status === "reserved") return false;
    return status === "in_shop" || status === "available" || status === "listed";
  }

  function paintCount() {
    var n = count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = String(n);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function renderCartPage() {
    var mount = document.getElementById("cart-lines");
    if (!mount) return;
    var emptyEl = document.getElementById("cart-empty");
    var fullEl = document.getElementById("cart-full");
    var subEl = document.getElementById("cart-subtotal");
    var shipEl = document.getElementById("cart-shipping");
    var totalEl = document.getElementById("cart-total");
    var list = items();

    if (!list.length) {
      if (emptyEl) emptyEl.hidden = false;
      if (fullEl) fullEl.hidden = true;
      mount.innerHTML = "";
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    if (fullEl) fullEl.hidden = false;
    mount.innerHTML = list.map(function (it) {
      return "<article class=\"cart-line\">" +
        "<div>" +
        "<h3>" + escapeHtml(it.title) + "</h3>" +
        "<p class=\"author\">" + escapeHtml(it.author) + "</p>" +
        "<p class=\"meta\">" + escapeHtml(it.condition || "Used") + " · " + escapeHtml(it.sku || ("BTW-" + it.id)) + " · one copy</p>" +
        "</div>" +
        "<div class=\"cart-line-side\">" +
        "<div class=\"qty\" aria-label=\"Quantity\">" +
        "<button type=\"button\" class=\"qty-btn\" data-qty-dec=\"" + escapeHtml(it.id) + "\" aria-label=\"Remove copy\">−</button>" +
        "<span class=\"qty-n\">" + Number(it.qty || 1) + "</span>" +
        "<button type=\"button\" class=\"qty-btn\" data-qty-inc=\"" + escapeHtml(it.id) + "\" disabled aria-label=\"One used copy per title\">+</button>" +
        "</div>" +
        "<span class=\"price\">" + money(it.price) + "</span>" +
        "<button type=\"button\" class=\"btn ghost\" data-remove=\"" + escapeHtml(it.id) + "\">Remove</button>" +
        "</div></article>";
    }).join("");
    if (subEl) subEl.textContent = money(subtotal());
    if (shipEl) shipEl.textContent = money(shipping());
    if (totalEl) totalEl.textContent = money(total());
  }

  window.BTWCart = {
    load: load,
    items: items,
    count: count,
    has: has,
    add: add,
    remove: remove,
    setQty: setQty,
    subtotal: subtotal,
    shipping: shipping,
    total: total,
    clear: clear,
    money: money,
    isForSale: isForSale,
    escapeHtml: escapeHtml,
    paintCount: paintCount,
    renderCartPage: renderCartPage
  };

  document.addEventListener("DOMContentLoaded", function () {
    paintCount();
    renderCartPage();
    var mount = document.getElementById("cart-lines");
    if (!mount) return;
    mount.addEventListener("click", function (e) {
      var removeBtn = e.target.closest("[data-remove]");
      var decBtn = e.target.closest("[data-qty-dec]");
      if (removeBtn) {
        remove(removeBtn.getAttribute("data-remove"));
        renderCartPage();
      } else if (decBtn) {
        setQty(decBtn.getAttribute("data-qty-dec"), 0);
        renderCartPage();
      }
    });
  });

  window.addEventListener("storage", function (e) {
    if (e.key === KEY) {
      paintCount();
      renderCartPage();
    }
  });
  window.addEventListener("btw-cart-change", function () {
    paintCount();
  });
})();
