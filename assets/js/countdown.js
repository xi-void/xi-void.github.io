/* Countdown — a local timer that flares and beeps at zero. */
(function () {
  "use strict";

  const display = document.getElementById("display");
  const hh = document.getElementById("hh");
  const mm = document.getElementById("mm");
  const ss = document.getElementById("ss");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  let remaining = 0;     // ms remaining
  let endTime = 0;       // timestamp the countdown ends
  let ticker = null;
  let running = false;

  function clampInputs() {
    const h = Math.min(99, Math.max(0, parseInt(hh.value, 10) || 0));
    const m = Math.min(59, Math.max(0, parseInt(mm.value, 10) || 0));
    const s = Math.min(59, Math.max(0, parseInt(ss.value, 10) || 0));
    hh.value = h; mm.value = m; ss.value = s;
    return (h * 3600 + m * 60 + s) * 1000;
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function render(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    display.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function setInputsEnabled(on) {
    [hh, mm, ss].forEach((el) => { el.disabled = !on; });
  }

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 660;
      gain.gain.value = 0.12;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      let count = 0;
      const pulse = setInterval(() => {
        osc.frequency.value = osc.frequency.value === 660 ? 880 : 660;
        if (++count >= 6) { clearInterval(pulse); osc.stop(); ctx.close(); }
      }, 220);
    } catch (e) { /* audio unavailable */ }
  }

  function finish() {
    stopTicker();
    running = false;
    remaining = 0;
    render(0);
    display.classList.add("done");
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    setInputsEnabled(true);
    beep();
  }

  function stopTicker() {
    if (ticker) { clearInterval(ticker); ticker = null; }
  }

  function tick() {
    remaining = endTime - Date.now();
    if (remaining <= 0) { finish(); return; }
    render(remaining);
  }

  function start() {
    display.classList.remove("done");
    if (remaining <= 0) remaining = clampInputs();
    if (remaining <= 0) return;
    endTime = Date.now() + remaining;
    running = true;
    stopTicker();
    ticker = setInterval(tick, 200);
    render(remaining);
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    setInputsEnabled(false);
  }

  function pause() {
    if (!running) return;
    stopTicker();
    remaining = endTime - Date.now();
    running = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  function reset() {
    stopTicker();
    running = false;
    remaining = 0;
    display.classList.remove("done");
    setInputsEnabled(true);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    render(clampInputs());
  }

  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", pause);
  resetBtn.addEventListener("click", reset);

  [hh, mm, ss].forEach((el) => el.addEventListener("input", () => {
    if (!running) render(clampInputs());
  }));

  document.querySelectorAll(".preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const secs = parseInt(btn.dataset.secs, 10);
      hh.value = Math.floor(secs / 3600);
      mm.value = Math.floor((secs % 3600) / 60);
      ss.value = secs % 60;
      reset();
    });
  });

  render(clampInputs());
})();
