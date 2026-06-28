/* Fraktur Forge — map Latin text to Unicode Fraktur (blackletter). */
(function () {
  "use strict";

  const map = {
    "A":"𝕬","B":"𝕭","C":"𝕮","D":"𝕯","E":"𝕰","F":"𝕱","G":"𝕲","H":"𝕳","I":"𝕴","J":"𝕵","K":"𝕶","L":"𝕷","M":"𝕸",
    "N":"𝕹","O":"𝕺","P":"𝕻","Q":"𝕼","R":"𝕽","S":"𝕾","T":"𝕿","U":"𝖀","V":"𝖁","W":"𝖂","X":"𝖃","Y":"𝖄","Z":"𝖅",
    "a":"𝖆","b":"𝖇","c":"𝖈","d":"𝖉","e":"𝖊","f":"𝖋","g":"𝖌","h":"𝖍","i":"𝖎","j":"𝖏","k":"𝖐","l":"𝖑","m":"𝖒",
    "n":"𝖓","o":"𝖔","p":"𝖕","q":"𝖖","r":"𝖗","s":"𝖘","t":"𝖙","u":"𝖚","v":"𝖛","w":"𝖜","x":"𝖝","y":"𝖞","z":"𝖟",
    "Ä":"𝕬̈","Ö":"𝕺̈","Ü":"𝖀̈","ä":"𝖆̈","ö":"𝖔̈","ü":"𝖚̈",
    "À":"𝕬̀","Á":"𝕬́","Â":"𝕬̂","È":"𝕰̀","É":"𝕰́","Ê":"𝕰̂","Ì":"𝕴̀","Í":"𝕴́","Î":"𝕴̂",
    "Ò":"𝕺̀","Ó":"𝕺́","Ô":"𝕺̂","Ù":"𝖀̀","Ú":"𝖀́","Û":"𝖀̂",
    "à":"𝖆̀","á":"𝖆́","â":"𝖆̂","è":"𝖊̀","é":"𝖊́","ê":"𝖊̂","ì":"𝖎̀","í":"𝖎́","î":"𝖎̂",
    "ò":"𝖔̀","ó":"𝖔́","ô":"𝖔̂","ù":"𝖚̀","ú":"𝖚́","û":"𝖚̂",
    "ß":"𝖘𝖘","ẞ":"𝕾𝕾"
  };

  const input = document.getElementById("input");
  const output = document.getElementById("output");
  const status = document.getElementById("status");
  const convertBtn = document.getElementById("convertBtn");
  const copyBtn = document.getElementById("copyBtn");
  const clearBtn = document.getElementById("clearBtn");
  const exampleBtn = document.getElementById("exampleBtn");

  function toFraktur(text) {
    // Normalize so decomposed umlauts (a + combining diaeresis) match the map.
    return Array.from(text.normalize("NFC")).map((char) => map[char] || char).join("");
  }

  function convert() {
    output.value = toFraktur(input.value);
    status.textContent = "";
  }

  async function copyOutput() {
    convert();
    if (!output.value) {
      status.textContent = "Nothing to copy.";
      return;
    }
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = "Copied to clipboard.";
    } catch (err) {
      output.focus();
      output.select();
      document.execCommand("copy");
      status.textContent = "Copied using fallback method.";
    }
  }

  input.addEventListener("input", convert);
  convertBtn.addEventListener("click", convert);
  copyBtn.addEventListener("click", copyOutput);

  clearBtn.addEventListener("click", () => {
    input.value = "";
    output.value = "";
    status.textContent = "";
    input.focus();
  });

  exampleBtn.addEventListener("click", () => {
    input.value = "The Ritual of Steel\nThe Anvil Beneath the Mountain\nOf Blood and Black Flame";
    convert();
  });

  convert();
})();
