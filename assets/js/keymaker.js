/* Keymaker — generate passwords and passphrases with Web Crypto randomness. */
(function () {
  "use strict";

  const WORDS = ("able acid acre aero ally amber anchor angle anvil arc arch arrow ash ashen aster atlas atom aura axiom axis azure basalt beacon beam bell binary birch blade bloom bolt bone boreal brass brick brine bronze cable cairn calm canyon carbon cedar chalk chant cipher cinder cipher clay cliff cloud cobalt coil comet copper coral cove crane crater crow crypt cyan cycle dawn delta dial dim diode dome dot dross drift dusk dust ebon echo eddy edge elder ember equinox ether falcon fathom fauna feldspar fern flint flux fog forge frost gale gamma garnet gate ghost glass glint gnomon granite grid grove gulf halo haze heath helix hex hollow hue husk icon idol indigo ingot iris iron isotope ivory jade jet kelp keystone kiln knot krypton lance lantern lattice ledge lens lichen limen lode loom lumen lunar lyre maple marble mark mason mesa metal meteor mica mist moor moss moth nadir nebula needle neon nexus node north oak oath obelisk ochre onyx opal orbit ore osprey oxide pact pale palm panel pewter phase pine pivot plume polar pollen portal pulse pylon pyre quartz quasar quill quiet radian raven realm reef relay resin rhythm ridge rift rime rivet rook rune rust sable salt scarp scree shale shard shore sigil silt slate sleet sloe sluice smoke solace solar soot spark spire spruce stack stark steel stone storm strata stream sulfur summit talon tangent tarn temper terra thorn thrum tidal tide tin tonal totem trace trench trill tundra umber urn vale valve vane vapor vault vector veil vein vellum verge vertex vesper vine vortex warden wax weald wedge welt whorl willow wisp wraith xenon yarrow yield zenith zephyr zinc zircon").split(" ");

  const $ = (id) => document.getElementById(id);
  const out = $("km-out"), meta = $("km-meta"), status = $("km-status");
  const pwOpts = $("km-pw-opts"), ppOpts = $("km-pp-opts");
  const tabPw = $("km-tab-pw"), tabPp = $("km-tab-pp");
  let mode = "password";

  const SETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digit: "0123456789",
    symbol: "!@#$%^&*()-_=+[]{};:,.?/"
  };
  const AMBIG = /[Il1O0o]/g;

  // Uniform random integer in [0, max) without modulo bias.
  function randInt(max) {
    const limit = Math.floor(0xFFFFFFFF / max) * max;
    const buf = new Uint32Array(1);
    let x;
    do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);
    return x % max;
  }
  function choice(str) { return str[randInt(str.length)]; }

  function buildCharset() {
    let set = "";
    if ($("km-lower").checked) set += SETS.lower;
    if ($("km-upper").checked) set += SETS.upper;
    if ($("km-digit").checked) set += SETS.digit;
    if ($("km-symbol").checked) set += SETS.symbol;
    if ($("km-ambig").checked) set = set.replace(AMBIG, "");
    return set;
  }

  function genPassword() {
    const set = buildCharset();
    if (!set) { out.textContent = ""; meta.textContent = "Select at least one character set."; return; }
    const len = parseInt($("km-len").value, 10);
    let pw = "";
    for (let i = 0; i < len; i++) pw += choice(set);
    out.textContent = pw;
    showStrength(len * Math.log2(set.length));
  }

  function genPassphrase() {
    const count = parseInt($("km-words").value, 10);
    const sep = $("km-sep").value;
    const cap = $("km-cap").checked;
    const num = $("km-num").checked;
    const parts = [];
    for (let i = 0; i < count; i++) {
      let w = WORDS[randInt(WORDS.length)];
      if (cap) w = w.charAt(0).toUpperCase() + w.slice(1);
      parts.push(w);
    }
    let phrase = parts.join(sep);
    if (num) phrase += sep + randInt(100);
    out.textContent = phrase;
    let bits = count * Math.log2(WORDS.length);
    if (num) bits += Math.log2(100);
    showStrength(bits);
  }

  function showStrength(bits) {
    bits = Math.round(bits);
    let label = "weak";
    if (bits >= 100) label = "very strong";
    else if (bits >= 75) label = "strong";
    else if (bits >= 50) label = "fair";
    meta.textContent = "≈ " + bits + " bits of entropy · " + label;
  }

  function generate() {
    status.textContent = "";
    if (mode === "password") genPassword(); else genPassphrase();
  }

  function setMode(m) {
    mode = m;
    pwOpts.hidden = m !== "password";
    ppOpts.hidden = m !== "passphrase";
    tabPw.classList.toggle("primary", m === "password");
    tabPp.classList.toggle("primary", m === "passphrase");
    generate();
  }

  $("km-len").addEventListener("input", () => { $("km-len-val").textContent = $("km-len").value; genPassword(); });
  $("km-words").addEventListener("input", () => { $("km-words-val").textContent = $("km-words").value; genPassphrase(); });
  ["km-lower","km-upper","km-digit","km-symbol","km-ambig"].forEach((id) => $(id).addEventListener("change", genPassword));
  ["km-sep","km-cap","km-num"].forEach((id) => $(id).addEventListener("change", genPassphrase));

  tabPw.addEventListener("click", () => setMode("password"));
  tabPp.addEventListener("click", () => setMode("passphrase"));
  $("km-gen").addEventListener("click", generate);

  $("km-copy").addEventListener("click", async () => {
    if (!out.textContent) { status.textContent = "Nothing to copy."; return; }
    try {
      await navigator.clipboard.writeText(out.textContent);
      status.textContent = "Copied to clipboard.";
    } catch (e) {
      status.textContent = "Copy failed — select manually.";
    }
  });

  setMode("password");
})();
