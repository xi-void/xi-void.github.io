/* Digest — compute SHA hashes of text with the Web Crypto API. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const input = $("dg-in"), out = $("dg-out"), bytes = $("dg-bytes");
  const algo = $("dg-algo"), casing = $("dg-case"), status = $("dg-status");

  const subtle = (window.crypto && window.crypto.subtle) ? window.crypto.subtle : null;
  if (!subtle) {
    out.textContent = "";
    status.textContent = "Web Crypto is unavailable (needs https or localhost).";
  }

  function hex(buffer) {
    const view = new Uint8Array(buffer);
    let s = "";
    for (let i = 0; i < view.length; i++) s += view[i].toString(16).padStart(2, "0");
    return casing.value === "upper" ? s.toUpperCase() : s;
  }

  let seq = 0;
  async function compute() {
    if (!subtle) return;
    const my = ++seq;
    const data = new TextEncoder().encode(input.value);
    try {
      const digest = await subtle.digest(algo.value, data);
      if (my !== seq) return; // a newer request superseded this one
      out.textContent = hex(digest);
      bytes.textContent = (digest.byteLength) + " bytes · " + data.length + " input bytes";
      status.textContent = "";
    } catch (e) {
      out.textContent = "";
      status.textContent = "Hashing failed: " + e.message;
    }
  }

  input.addEventListener("input", compute);
  algo.addEventListener("change", compute);
  casing.addEventListener("change", compute);

  $("dg-copy").addEventListener("click", async () => {
    if (!out.textContent) { status.textContent = "Nothing to copy."; return; }
    try {
      await navigator.clipboard.writeText(out.textContent);
      status.textContent = "Copied to clipboard.";
    } catch (e) {
      status.textContent = "Copy failed — select manually.";
    }
  });

  $("dg-clear").addEventListener("click", () => {
    input.value = ""; bytes.textContent = ""; compute(); input.focus();
  });

  compute();
})();
