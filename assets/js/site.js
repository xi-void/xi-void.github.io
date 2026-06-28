/* Site-wide behaviour: accent theme switch, command palette, SW registration.
   Vanilla JS, no dependencies. */
(function () {
  "use strict";

  /* ---------- accent theme ---------- */
  var THEME_KEY = "xi-void-theme";
  function applyTheme(name) {
    if (name && name !== "green") {
      document.documentElement.setAttribute("data-theme", name);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }
  document.querySelectorAll("[data-theme-set]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-theme-set");
      applyTheme(name);
      try { localStorage.setItem(THEME_KEY, name); } catch (e) {}
    });
  });

  /* ---------- command palette ---------- */
  var palette = document.getElementById("palette");
  var input = document.getElementById("palette-input");
  var results = document.getElementById("palette-results");
  var index = [];
  var active = 0;

  try {
    var raw = document.getElementById("site-index");
    if (raw) index = JSON.parse(raw.textContent);
  } catch (e) { index = []; }

  function openPalette() {
    if (!palette) return;
    palette.classList.add("open");
    palette.setAttribute("aria-hidden", "false");
    input.value = "";
    render(index);
    input.focus();
  }
  function closePalette() {
    if (!palette) return;
    palette.classList.remove("open");
    palette.setAttribute("aria-hidden", "true");
  }
  function isOpen() { return palette && palette.classList.contains("open"); }

  function filter(q) {
    q = q.trim().toLowerCase();
    if (!q) return index;
    return index.filter(function (item) {
      return (item.title + " " + item.kind + " " + (item.blurb || "")).toLowerCase().indexOf(q) !== -1;
    });
  }

  function render(list) {
    if (!results) return;
    active = 0;
    results.innerHTML = "";
    list.forEach(function (item, i) {
      var li = document.createElement("li");
      li.dataset.url = item.url;
      if (i === 0) li.classList.add("active");
      var t = document.createElement("span");
      t.className = "pr-title";
      t.textContent = item.title;
      var k = document.createElement("span");
      k.className = "pr-kind";
      k.textContent = item.kind;
      li.appendChild(t);
      li.appendChild(k);
      li.addEventListener("click", function () { go(item.url); });
      results.appendChild(li);
    });
  }

  function go(url) { if (url) window.location.href = url; }

  function move(delta) {
    var items = results.querySelectorAll("li");
    if (!items.length) return;
    items[active].classList.remove("active");
    active = (active + delta + items.length) % items.length;
    items[active].classList.add("active");
    items[active].scrollIntoView({ block: "nearest" });
  }

  document.querySelectorAll("[data-palette-open]").forEach(function (btn) {
    btn.addEventListener("click", openPalette);
  });

  if (input) {
    input.addEventListener("input", function () { render(filter(input.value)); });
  }

  document.addEventListener("keydown", function (e) {
    // "/" opens the palette unless the user is typing in a field.
    var tag = (e.target.tagName || "").toLowerCase();
    var typing = tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
    if (e.key === "/" && !typing && !isOpen()) {
      e.preventDefault();
      openPalette();
      return;
    }
    if (!isOpen()) return;
    if (e.key === "Escape") { closePalette(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") {
      var sel = results.querySelector("li.active");
      if (sel) go(sel.dataset.url);
    }
  });

  if (palette) {
    palette.addEventListener("click", function (e) {
      if (e.target === palette) closePalette();
    });
  }

  /* ---------- service worker ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }
})();
