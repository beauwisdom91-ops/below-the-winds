document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");
  const titleEl = document.getElementById("sold-title");
  if (!sessionId || !titleEl) return;
  fetch("/api/order-session?session_id=" + encodeURIComponent(sessionId))
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      if (data && data.title) titleEl.textContent = data.title;
    })
    .catch(function () {});
});
