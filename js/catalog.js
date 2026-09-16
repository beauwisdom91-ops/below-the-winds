import { amazonHref, esc, money, shippingLabel } from "./shop.mjs";

async function loadBooks() {
  const res = await fetch("data/books.json");
  return res.json();
}

async function loadAvailability() {
  try {
    const res = await fetch("/api/availability");
    if (!res.ok) return { sold: [], reserved: [] };
    return res.json();
  } catch {
    return { sold: [], reserved: [] };
  }
}

function stateOf(book, availability) {
  if (book.status === "sold" || availability.sold.includes(book.id)) return "sold";
  if (availability.reserved.includes(book.id)) return "reserved";
  return "in_shop";
}

function renderBooks(books, mount, availability) {
  if (!books.length) {
    mount.innerHTML = "<p class='note'>No titles on this shelf yet.</p>";
    return;
  }
  const cfg = window.BTW || {};
  mount.innerHTML = books.map(function (b) {
    const href = amazonHref(b, cfg);
    const state = stateOf(b, availability);
    const disabled = state !== "in_shop";
    const label = state === "sold" ? "Sold" : state === "reserved" ? "Held at checkout" : "Buy this copy";
    return "<article class=\"book\" data-shelf=\"" + esc(b.shelf) + "\" data-id=\"" + esc(b.id) + "\">" +
      "<div class=\"meta\">" + esc(b.shelf) + " · " + esc(b.condition) + (state === "sold" ? " · Sold" : "") + "</div>" +
      "<h3><cite>" + esc(b.title) + "</cite></h3>" +
      "<p class=\"author\">" + esc(b.author) + "</p>" +
      "<p class=\"note\">" + esc(b.note || "") + "</p>" +
      "<div class=\"row\">" +
      "<span class=\"price\">" + money(b.price) + "</span>" +
      "<span class=\"actions-inline\">" +
      "<button class=\"btn solid\" type=\"button\" data-buy=\"" + esc(b.id) + "\"" + (disabled ? " disabled" : "") + ">" + label + "</button>" +
      "<a class=\"btn ghost\" href=\"" + esc(href) + "\" target=\"_blank\" rel=\"noopener\">Amazon</a>" +
      "</span></div></article>";
  }).join("");
}

function fillOrderFields(book) {
  const id = document.getElementById("order-book-id");
  const title = document.getElementById("order-title");
  if (id) id.value = book.id;
  if (title) title.value = book.title + " — " + book.author;
}

async function startCheckout(book, noteEl) {
  noteEl.hidden = true;
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookId: book.id }),
    });
    const data = await res.json().catch(function () { return {}; });
    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    if (res.status === 503) {
      noteEl.hidden = false;
      noteEl.textContent = data.message || "Card checkout is not live yet. Send the request form below and the shop will invoice you.";
      return;
    }
    if (res.status === 409) {
      noteEl.hidden = false;
      noteEl.textContent = "That copy is already held or sold. Ask the shop if you still want the title.";
      return;
    }
    noteEl.hidden = false;
    noteEl.textContent = "Checkout could not start. Use the request form and we will email a payment link.";
  } catch {
    noteEl.hidden = false;
    noteEl.textContent = "Checkout could not start. Use the request form below.";
  }
}

function bindDialog(books) {
  const dialog = document.getElementById("buy-dialog");
  if (!dialog) return;
  const heading = document.getElementById("buy-heading");
  const meta = document.getElementById("buy-meta");
  const amazon = document.getElementById("buy-amazon");
  const pay = document.getElementById("buy-pay");
  const note = document.getElementById("buy-note");
  const cfg = window.BTW || {};

  document.addEventListener("click", function (event) {
    const btn = event.target.closest("[data-buy]");
    if (!btn) return;
    const book = books.find(function (b) { return b.id === btn.getAttribute("data-buy"); });
    if (!book) return;
    heading.textContent = book.title;
    meta.textContent = book.author + " · " + book.condition + " · " + money(book.price) + " + " + shippingLabel();
    amazon.href = amazonHref(book, cfg);
    fillOrderFields(book);
    note.hidden = true;
    pay.onclick = function () { startCheckout(book, note); };
    dialog.showModal();
  });
}

function bindCatalog(books, availability) {
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
      const hay = (b.title + " " + b.author + " " + b.shelf + " " + (b.note || "")).toLowerCase();
      return shelfOk && (!q || hay.includes(q));
    });
    renderBooks(filtered, mount, availability);
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
  if (params.get("canceled") === "1") {
    const banner = document.getElementById("canceled");
    if (banner) banner.hidden = false;
  }
}

function bindFeatured(books, availability) {
  const mount = document.getElementById("featured");
  if (!mount) return;
  renderBooks(books.filter(function (b) { return b.featured; }), mount, availability);
}

document.addEventListener("DOMContentLoaded", async function () {
  const books = await loadBooks();
  const availability = await loadAvailability();
  bindFeatured(books, availability);
  bindCatalog(books, availability);
  bindDialog(books);
});
