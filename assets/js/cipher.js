/* Cipher — reversible encodings: ROT13, Caesar, Base64, hex, binary. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const mode = $("cph-mode"), dir = $("cph-dir"), shift = $("cph-shift");
  const input = $("cph-in"), output = $("cph-out"), status = $("cph-status");
  const dirWrap = $("cph-dir-wrap"), shiftWrap = $("cph-shift-wrap");

  function rotate(text, by) {
    by = ((by % 26) + 26) % 26;
    return text.replace(/[a-z]/gi, (ch) => {
      const base = ch <= "Z" ? 65 : 97;
      return String.fromCharCode((ch.charCodeAt(0) - base + by) % 26 + base);
    });
  }

  function utf8Bytes(str) { return new TextEncoder().encode(str); }
  function bytesToStr(bytes) { return new TextDecoder().decode(bytes); }

  function toBase64(str) {
    let bin = "";
    utf8Bytes(str).forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  function fromBase64(str) {
    const bin = atob(str.replace(/\s+/g, ""));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytesToStr(bytes);
  }

  function toHex(str) {
    return Array.from(utf8Bytes(str)).map((b) => b.toString(16).padStart(2, "0")).join(" ");
  }
  function fromHex(str) {
    const clean = str.replace(/0x/gi, "").replace(/[^0-9a-f]/gi, "");
    if (clean.length % 2) throw new Error("hex length must be even");
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
    return bytesToStr(bytes);
  }

  function toBinary(str) {
    return Array.from(utf8Bytes(str)).map((b) => b.toString(2).padStart(8, "0")).join(" ");
  }
  function fromBinary(str) {
    const groups = str.trim().split(/\s+/).filter(Boolean);
    const bytes = new Uint8Array(groups.length);
    groups.forEach((g, i) => {
      if (!/^[01]{1,8}$/.test(g)) throw new Error("invalid binary group");
      bytes[i] = parseInt(g, 2);
    });
    return bytesToStr(bytes);
  }

  function run() {
    const m = mode.value;
    const encode = dir.value === "encode";
    const text = input.value;
    status.textContent = "";
    try {
      let result;
      if (m === "rot13") result = rotate(text, 13);
      else if (m === "caesar") result = rotate(text, (encode ? 1 : -1) * (parseInt(shift.value, 10) || 0));
      else if (m === "base64") result = encode ? toBase64(text) : fromBase64(text);
      else if (m === "hex") result = encode ? toHex(text) : fromHex(text);
      else if (m === "binary") result = encode ? toBinary(text) : fromBinary(text);
      output.value = result;
    } catch (e) {
      output.value = "";
      status.textContent = "Could not decode: " + e.message;
    }
  }

  function syncControls() {
    const m = mode.value;
    // ROT13 is symmetric; Caesar needs a shift; the rest need a direction.
    dirWrap.hidden = m === "rot13";
    shiftWrap.hidden = m !== "caesar";
    run();
  }

  mode.addEventListener("change", syncControls);
  dir.addEventListener("change", run);
  shift.addEventListener("input", run);
  input.addEventListener("input", run);
  $("cph-run").addEventListener("click", run);

  $("cph-copy").addEventListener("click", async () => {
    if (!output.value) { status.textContent = "Nothing to copy."; return; }
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = "Copied to clipboard.";
    } catch (e) {
      output.focus(); output.select(); document.execCommand("copy");
      status.textContent = "Copied using fallback method.";
    }
  });

  $("cph-swap").addEventListener("click", () => {
    if (!output.value) return;
    input.value = output.value;
    // Flip direction so the swap round-trips naturally.
    if (!dirWrap.hidden) dir.value = dir.value === "encode" ? "decode" : "encode";
    run();
  });

  $("cph-clear").addEventListener("click", () => {
    input.value = ""; output.value = ""; status.textContent = ""; input.focus();
  });

  syncControls();
})();
