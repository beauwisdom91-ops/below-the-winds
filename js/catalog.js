async function loadBooks() {
  const res = await fetch("data/books.json");
  return res.json();
}

function saleState(book) {
  const status = String(book.status || "in_shop").toLowerCase();
  if (status === "sold") return "sold";
  if (status === "seeking") return "seeking";
  if (status === "held" || status === "reserved") return "held";
  if (window.BTWCart && window.BTWCart.has(book.id)) return "in_cart";
  if (window.BTWCart && window.BTWCart.isForSale(book)) return "for_sale";
  return "seeking";
}

function bookCta(book) {
  const esc = window.BTWCart.escapeHtml;
  const state = saleState(book);
  if (state === "sold") return "<span class=\"btn ghost\" aria-disabled=\"true\">Sold</span>";
  if (state === "seeking") return "<a class=\"btn ghost\" href=\"wants.html\">Seeking — ask</a>";
  if (state === "held") return "<span class=\"btn ghost\" aria-disabled=\"true\">Held</span>";
  if (state === "in_cart") return "<a class=\"btn ghost\" href=\"cart.html\">In cart</a>";
  return "<button class=\"btn solid\" type=\"button\" data-add=\"" + esc(book.id) + "\">Add to cart</button>";
}

function renderBooks(books, mount) {
  if (!mount) return;
  if (!books.length) {
    mount.innerHTML = "<p class='note'>No titles on this shelf yet.</p>";
    return;
  }
  const esc = window.BTWCart.escapeHtml;
  mount.innerHTML = books.map(function (b) {
    const href = window.amazonHref(b);
    const state = saleState(b);
    const sku = b.sku || ("BTW-" + b.id);
    return "<article class=\"book\" data-shelf=\"" + esc(b.shelf) + "\" data-id=\"" + esc(b.id) + "\" data-status=\"" + esc(state) + "\">" +
      "<div class=\"meta\">" + esc(b.shelf) + " · " + esc(b.condition) + " · " + esc(sku) + "</div>" +
      "<h3><cite>" + esc(b.title) + "</cite></h3>" +
      "<p class=\"author\">" + esc(b.author) + "</p>" +
      "<p class=\"note\">" + esc(b.note || "") + "</p>" +
      "<div class=\"row\">" +
      "<span class=\"price\">" + window.BTWCart.money(b.price) + "</span>" +
      "<span class=\"actions-inline\">" +
      bookCta(b) +
      "<a class=\"btn ghost\" href=\"" + esc(href) + "\" target=\"_blank\" rel=\"noopener\">Amazon</a>" +
      "</span></div></article>";
  }).join("");
}

function bindAdd(mount, books, redraw) {
  if (!mount) return;
  mount.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = btn.getAttribute("data-add");
    const book = books.find(function (b) { return String(b.id) === String(id); });
    if (book) {
      window.BTWCart.add(book);
      redraw();
    }
  });
}

function bindCatalog(books) {
  const mount = document.getElementById("books");
  if (!mount) return;
  const search = document.getElementById("q");
  const chips = Array.from(document.querySelectorAll("button[data-shelf]"));
  const params = new URLSearchParams(location.search);
  let shelf = params.get("shelf") || "All";
  const apply = function () {
    const q = ((search && search.value) || "").toLowerCase().trim();
    const filtered = books.filter(function (b) {
      const shelfOk = shelf === "All" || b.shelf === shelf;
      const hay = (b.title + " " + b.author + " " + b.shelf + " " + (b.note || "") + " " + (b.sku || "")).toLowerCase();
      return shelfOk && (!q || hay.includes(q));
    });
    renderBooks(filtered, mount);
    const count = document.getElementById("count");
    if (count) count.textContent = filtered.length + (filtered.length === 1 ? " title" : " titles");
  };
  chips.forEach(function (chip) {
    chip.classList.toggle("on", chip.getAttribute("data-shelf") === shelf);
    chip.addEventListener("click", function () {
      shelf = chip.getAttribute("data-shelf");
      const url = new URL(location.href);
      if (shelf === "All") url.searchParams.delete("shelf");
      else url.searchParams.set("shelf", shelf);
      history.replaceState({}, "", url);
      chips.forEach(function (c) { c.classList.toggle("on", c === chip); });
      apply();
    });
  });
  if (search) search.addEventListener("input", apply);
  bindAdd(mount, books, apply);
  apply();
}

function bindFeatured(books) {
  const mount = document.getElementById("featured");
  if (!mount) return;
  const featured = books.filter(function (b) { return b.featured && window.BTWCart.isForSale(b); });
  const redraw = function () {
    renderBooks(featured, mount);
  };
  bindAdd(mount, books, redraw);
  redraw();
}

document.addEventListener("DOMContentLoaded", async function () {
  const books = await loadBooks();
  bindFeatured(books);
  bindCatalog(books);
});
