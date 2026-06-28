/* Notepad — a scratch buffer that auto-saves to localStorage. */
(function () {
  "use strict";

  const KEY = "xi-void-notepad";
  const pad = document.getElementById("pad");
  const status = document.getElementById("status");
  const count = document.getElementById("count");

  function updateCount() { count.textContent = pad.value.length; }

  function flash(msg) {
    status.textContent = msg;
    clearTimeout(flash._t);
    flash._t = setTimeout(() => { status.textContent = ""; }, 1400);
  }

  // Load saved content.
  try {
    const saved = localStorage.getItem(KEY);
    if (saved !== null) pad.value = saved;
  } catch (e) { /* storage unavailable */ }
  updateCount();

  let saveTimer;
  pad.addEventListener("input", () => {
    updateCount();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, pad.value);
        flash("saved");
      } catch (e) {
        flash("save failed");
      }
    }, 250);
  });

  document.getElementById("download").addEventListener("click", () => {
    const blob = new Blob([pad.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "xi-void-note.txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pad.value);
      flash("copied");
    } catch (e) {
      pad.select();
      flash("select+copy");
    }
  });

  document.getElementById("clear").addEventListener("click", () => {
    if (pad.value && !confirm("Clear the buffer? This cannot be undone.")) return;
    pad.value = "";
    updateCount();
    try { localStorage.removeItem(KEY); } catch (e) {}
    flash("cleared");
    pad.focus();
  });
})();
