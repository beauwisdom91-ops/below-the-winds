async function loadBooks() {
  const res = await fetch("data/books.json");
  return res.json();
}

function renderBooks(books, mount) {
  if (!books.length) {
    mount.innerHTML = "<p class='note'>No titles on this shelf yet.</p>";
    return;
  }
  const esc = window.BTWCart.escapeHtml;
  mount.innerHTML = books.map(function (b) {
    const inCart = window.BTWCart.has(b.id);
    const cta = inCart
      ? "<a class=\"btn ghost\" href=\"cart.html\">In cart</a>"
      : "<button class=\"btn solid\" type=\"button\" data-add=\"" + esc(b.id) + "\">Add to cart</button>";
    return "<article class=\"book\" data-shelf=\"" + esc(b.shelf) + "\">" +
      "<div class=\"meta\">" + esc(b.shelf) + " · " + esc(b.condition) + "</div>" +
      "<h3>" + esc(b.title) + "</h3>" +
      "<p class=\"author\">" + esc(b.author) + "</p>" +
      "<p class=\"note\">" + esc(b.note || "") + "</p>" +
      "<div class=\"row\">" +
      "<span class=\"price\">" + window.BTWCart.money(b.price) + "</span>" +
      cta +
      "</div></article>";
  }).join("");
}

function bindCatalog(books) {
  const mount = document.getElementById("books");
  const search = document.getElementById("q");
  const chips = Array.from(document.querySelectorAll("button[data-shelf]"));
  const params = new URLSearchParams(location.search);
  let shelf = params.get("shelf") || "All";
  const apply = function () {
    const q = ((search && search.value) || "").toLowerCase().trim();
    const filtered = books.filter(function (b) {
      const shelfOk = shelf === "All" || b.shelf === shelf;
      const hay = (b.title + " " + b.author + " " + b.shelf + " " + (b.note || "")).toLowerCase();
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
  mount.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = btn.getAttribute("data-add");
    const book = books.find(function (b) { return String(b.id) === String(id); });
    if (book) {
      window.BTWCart.add(book);
      apply();
    }
  });
  apply();
}

document.addEventListener("DOMContentLoaded", async function () {
  if (!document.getElementById("books")) return;
  const books = await loadBooks();
  bindCatalog(books);
});
