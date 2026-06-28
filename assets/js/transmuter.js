/* Transmuter — render text in many Unicode styles at once. */
(function () {
  "use strict";

  const A = 65, Z = 90, a = 97, z = 122, n0 = 48, n9 = 57;

  // Build a mapper from contiguous Unicode math blocks, with optional
  // exceptions for reserved code points that fall back to letterlike symbols.
  function offsetStyle(upper, lower, digit, exceptions) {
    exceptions = exceptions || {};
    return function (text) {
      let out = "";
      for (const ch of text) {
        if (exceptions[ch]) { out += exceptions[ch]; continue; }
        const c = ch.codePointAt(0);
        if (c >= A && c <= Z && upper) out += String.fromCodePoint(upper + (c - A));
        else if (c >= a && c <= z && lower) out += String.fromCodePoint(lower + (c - a));
        else if (c >= n0 && c <= n9 && digit) out += String.fromCodePoint(digit + (c - n0));
        else out += ch;
      }
      return out;
    };
  }

  function mapStyle(table) {
    return function (text) {
      let out = "";
      for (const ch of text) out += table[ch] || table[ch.toLowerCase()] || ch;
      return out;
    };
  }

  function combiningStyle(mark) {
    return function (text) {
      let out = "";
      for (const ch of text) out += (ch === "\n" || ch === " ") ? ch : ch + mark;
      return out;
    };
  }

  // Small caps (lowercase -> small capital glyphs).
  const SMALL = {
    a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",
    n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ"
  };

  // Upside-down map (applied then reversed).
  const FLIP = {
    a:"ɐ",b:"q",c:"ɔ",d:"p",e:"ǝ",f:"ɟ",g:"ƃ",h:"ɥ",i:"ᴉ",j:"ɾ",k:"ʞ",l:"l",m:"ɯ",
    n:"u",o:"o",p:"d",q:"b",r:"ɹ",s:"s",t:"ʇ",u:"n",v:"ʌ",w:"ʍ",x:"x",y:"ʎ",z:"z",
    "0":"0","1":"Ɩ","2":"ᄅ","3":"Ɛ","4":"ㄣ","5":"ϛ","6":"9","7":"ㄥ","8":"8","9":"6",
    ".":"˙",",":"'","?":"¿","!":"¡","'":",",'"':",,","(":")",")":"(","[":"]","]":"[",
    "{":"}","}":"{","<":">",">":"<","&":"⅋","_":"‾"
  };
  function flip(text) {
    let out = [];
    for (const ch of text.toLowerCase()) out.push(FLIP[ch] || ch);
    return out.reverse().join("");
  }

  const STYLES = [
    { name: "small caps", fn: mapStyle(SMALL) },
    { name: "upside down", fn: flip },
    { name: "bold", fn: offsetStyle(0x1D400, 0x1D41A, 0x1D7CE) },
    { name: "italic", fn: offsetStyle(0x1D434, 0x1D44E, null, { h: "ℎ" }) },
    { name: "bold italic", fn: offsetStyle(0x1D468, 0x1D482) },
    { name: "script", fn: offsetStyle(0x1D49C, 0x1D4B6, null,
        { B:"ℬ", E:"ℰ", F:"ℱ", H:"ℋ", I:"ℐ", L:"ℒ",
          M:"ℳ", R:"ℛ", e:"ℯ", g:"ℊ", o:"ℴ" }) },
    { name: "monospace", fn: offsetStyle(0x1D670, 0x1D68A, 0x1D7F6) },
    { name: "sans-serif", fn: offsetStyle(0x1D5A0, 0x1D5BA, 0x1D7E2) },
    { name: "double-struck", fn: offsetStyle(0x1D538, 0x1D552, 0x1D7D8,
        { C:"ℂ", H:"ℍ", N:"ℕ", P:"ℙ", Q:"ℚ", R:"ℝ", Z:"ℤ" }) },
    { name: "fullwidth", fn: offsetStyle(0xFF21, 0xFF41, 0xFF10) },
    { name: "circled", fn: offsetStyle(0x24B6, 0x24D0, null, { "0":"⓪" }) },
    { name: "strikethrough", fn: combiningStyle("̶") },
    { name: "underline", fn: combiningStyle("̲") }
  ];

  const $ = (id) => document.getElementById(id);
  const input = $("tx-in"), rows = $("tx-rows"), status = $("tx-status");

  // Build a row per style once; update text on input.
  const outs = {};
  STYLES.forEach((s, i) => {
    const row = document.createElement("div");
    row.className = "tx-row";
    const name = document.createElement("span");
    name.className = "tx-name";
    name.textContent = s.name;
    const out = document.createElement("div");
    out.className = "tx-out";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "copy";
    btn.addEventListener("click", () => copyText(out.textContent));
    row.appendChild(name);
    row.appendChild(out);
    row.appendChild(btn);
    rows.appendChild(row);
    outs[i] = out;
  });

  function render() {
    const text = input.value;
    STYLES.forEach((s, i) => { outs[i].textContent = s.fn(text); });
  }

  async function copyText(text) {
    if (!text) { flash("Nothing to copy."); return; }
    try {
      await navigator.clipboard.writeText(text);
      flash("Copied to clipboard.");
    } catch (e) {
      flash("Copy failed — select manually.");
    }
  }

  function flash(msg) {
    status.textContent = msg;
    clearTimeout(flash._t);
    flash._t = setTimeout(() => { status.textContent = ""; }, 1400);
  }

  input.addEventListener("input", render);
  $("tx-clear").addEventListener("click", () => { input.value = ""; render(); input.focus(); });
  $("tx-example").addEventListener("click", () => { input.value = "Xi-Void Tools"; render(); });

  render();
})();
