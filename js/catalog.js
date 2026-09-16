async function loadBooks() {
  const res = await fetch("data/books.json");
  return res.json();
}
function renderBooks(books, mount) {
  mount.innerHTML = books.map((b) => {
    const href = window.amazonSearch(b.title, b.author);
    return `<article class="book" data-shelf="${b.shelf}">
      <div class="meta">${b.shelf} · ${b.condition}</div>
      <h3>${b.title}</h3>
      <p class="author">${b.author}</p>
      <p class="note">${b.note}</p>
      <div class="row">
        <span class="price">$${Number(b.price).toFixed(2)}</span>
        <a class="btn" href="${href}" target="_blank" rel="noopener">Buy on Amazon</a>
      </div>
    </article>`;
  }).join("");
}
function bindCatalog(books) {
  const mount = document.getElementById("books");
  const search = document.getElementById("q");
  const chips = [...document.querySelectorAll("[data-shelf]")];
  let shelf = "All";
  const apply = () => {
    const q = (search.value || "").toLowerCase().trim();
    const filtered = books.filter((b) => {
      const shelfOk = shelf === "All" || b.shelf === shelf;
      const hay = (b.title + " " + b.author + " " + b.shelf).toLowerCase();
      return shelfOk && (!q || hay.includes(q));
    });
    renderBooks(filtered, mount);
    const count = document.getElementById("count");
    if (count) count.textContent = filtered.length + " titles";
  };
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      shelf = chip.getAttribute("data-shelf");
      chips.forEach((c) => c.classList.toggle("on", c === chip));
      apply();
    });
  });
  search.addEventListener("input", apply);
  apply();
}
document.addEventListener("DOMContentLoaded", async () => {
  if (!document.getElementById("books")) return;
  const books = await loadBooks();
  bindCatalog(books);
});
