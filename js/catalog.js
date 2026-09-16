async function loadBooks() {
  const res = await fetch("data/books.json");
  return res.json();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
  });
}

function money(n) {
  return "$" + Number(n).toFixed(2);
}

function saleState(book) {
  const status = String(book.status || "in_shop").toLowerCase();
  if (status === "sold") return "sold";
  if (status === "seeking") return "seeking";
  if (status === "held" || status === "reserved") return "held";
  if (status === "in_shop" || status === "available" || status === "listed") return "for_sale";
  return "seeking";
}

function bookCta(book) {
  const state = saleState(book);
  if (state === "sold") return "<span class=\"btn ghost\" aria-disabled=\"true\">Sold</span>";
  if (state === "seeking") return "<a class=\"btn ghost\" href=\"wants.html\">Seeking — ask</a>";
  if (state === "held") return "<span class=\"btn ghost\" aria-disabled=\"true\">Held</span>";
  return "";
}

function renderBooks(books, mount) {
  if (!mount) return;
  if (!books.length) {
    mount.innerHTML = "<p class='note'>No titles on this shelf yet.</p>";
    return;
  }
  mount.innerHTML = books.map(function (b) {
    const href = window.amazonHref(b);
    const state = saleState(b);
    const sku = b.sku || ("BTW-" + b.id);
    return "<article class=\"book\" data-shelf=\"" + escapeHtml(b.shelf) + "\" data-id=\"" + escapeHtml(b.id) + "\" data-status=\"" + escapeHtml(state) + "\">" +
      "<div class=\"meta\">" + escapeHtml(b.shelf) + " · " + escapeHtml(b.condition) + " · " + escapeHtml(sku) + "</div>" +
      "<h3><cite>" + escapeHtml(b.title) + "</cite></h3>" +
      "<p class=\"author\">" + escapeHtml(b.author) + "</p>" +
      "<p class=\"note\">" + escapeHtml(b.note || "") + "</p>" +
      "<div class=\"row\">" +
      "<span class=\"price\">" + money(b.price) + "</span>" +
      "<span class=\"actions-inline\">" +
      bookCta(b) +
      "<a class=\"btn ghost\" href=\"" + escapeHtml(href) + "\" target=\"_blank\" rel=\"noopener\">Amazon</a>" +
      "</span></div></article>";
  }).join("");
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
  apply();
}

function bindFeatured(books) {
  const mount = document.getElementById("featured");
  if (!mount) return;
  const featured = books.filter(function (b) {
    return b.featured && saleState(b) === "for_sale";
  });
  renderBooks(featured, mount);
}

document.addEventListener("DOMContentLoaded", async function () {
  const books = await loadBooks();
  bindFeatured(books);
  bindCatalog(books);
});
