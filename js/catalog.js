async function loadBooks() {
  const res = await fetch("data/books.json");
  return res.json();
}
function bookHref(b) {
  if (b.isbn) return window.amazonIsbn(b.isbn);
  return window.amazonSearch(b.title, b.author);
}
function renderBooks(books, mount) {
  if (!books.length) {
    mount.innerHTML = "<p class='note'>No titles on this shelf yet.</p>";
    return;
  }
  mount.innerHTML = books.map(function (b) {
    const href = bookHref(b);
    return "<article class=\"book\" data-shelf=\"" + b.shelf + "\">" +
      "<div class=\"meta\">" + b.shelf + " · " + b.condition + "</div>" +
      "<h3>" + b.title + "</h3>" +
      "<p class=\"author\">" + b.author + "</p>" +
      "<p class=\"note\">" + (b.note || "") + "</p>" +
      "<div class=\"row\">" +
      "<span class=\"price\">$" + Number(b.price).toFixed(2) + "</span>" +
      "<a class=\"btn\" href=\"" + href + "\" target=\"_blank\" rel=\"noopener\">Buy on Amazon</a>" +
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
  apply();
}
document.addEventListener("DOMContentLoaded", async function () {
  if (!document.getElementById("books")) return;
  const books = await loadBooks();
  bindCatalog(books);
});
