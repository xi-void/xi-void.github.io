/* Glitch Forge — stack Unicode combining marks onto text ("zalgo"). */
(function () {
  "use strict";

  // Combining marks grouped by where they render.
  const UP = [
    0x0300,0x0301,0x0302,0x0303,0x0304,0x0305,0x0306,0x0307,0x0308,0x0309,
    0x030a,0x030b,0x030c,0x030d,0x030e,0x030f,0x0310,0x0311,0x0312,0x0313,
    0x0314,0x0315,0x031a,0x033d,0x033e,0x033f,0x0340,0x0341,0x0342,0x0343,
    0x0344,0x0346,0x034a,0x034b,0x034c,0x0350,0x0351,0x0352,0x0357,0x035b
  ];
  const MID = [
    0x0334,0x0335,0x0336,0x0337,0x0338,0x0316,0x0489,0x0337
  ];
  const DOWN = [
    0x0316,0x0317,0x0318,0x0319,0x031c,0x031d,0x031e,0x031f,0x0320,0x0324,
    0x0325,0x0326,0x0329,0x032a,0x032b,0x032c,0x032d,0x032e,0x032f,0x0330,
    0x0331,0x0332,0x0333,0x0339,0x033a,0x033b,0x033c,0x0345,0x0347,0x0348,
    0x0349,0x034d,0x034e,0x0353,0x0354,0x0355,0x0356,0x0359,0x035a
  ];

  const $ = (id) => document.getElementById(id);
  const input = $("gf-in"), output = $("gf-out"), status = $("gf-status");
  const level = $("gf-level"), zones = $("gf-zones");

  // Max marks per character at each intensity level.
  const MAX = { 1: 3, 2: 7, 3: 14, 4: 28 };

  function rand(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return String.fromCharCode(arr[rand(arr.length)]); }

  function corrupt(text) {
    const max = MAX[level.value] || 7;
    const z = zones.value;
    const useUp = z === "all" || z === "up";
    const useMid = z === "all";
    const useDown = z === "all" || z === "down";
    let out = "";
    for (const ch of text) {
      out += ch;
      if (ch === "\n" || ch === " ") continue;
      if (useUp) for (let i = 0, n = 1 + rand(max); i < n; i++) out += pick(UP);
      if (useMid) for (let i = 0, n = rand(Math.ceil(max / 6) + 1); i < n; i++) out += pick(MID);
      if (useDown) for (let i = 0, n = 1 + rand(max); i < n; i++) out += pick(DOWN);
    }
    return out;
  }

  function run() {
    output.value = corrupt(input.value);
    status.textContent = "";
  }

  async function copy() {
    run();
    if (!output.value) { status.textContent = "Nothing to copy."; return; }
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = "Copied to clipboard.";
    } catch (e) {
      output.focus(); output.select(); document.execCommand("copy");
      status.textContent = "Copied using fallback method.";
    }
  }

  input.addEventListener("input", run);
  level.addEventListener("change", run);
  zones.addEventListener("change", run);
  $("gf-convert").addEventListener("click", run);
  $("gf-copy").addEventListener("click", copy);
  $("gf-clear").addEventListener("click", () => {
    input.value = ""; output.value = ""; status.textContent = ""; input.focus();
  });
  $("gf-example").addEventListener("click", () => {
    input.value = "he comes\nthe centre cannot hold";
    run();
  });
})();
