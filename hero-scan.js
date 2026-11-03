// Home hero: ŌLLIN scanning the city for signals.
// A light beam sweeps the skyline; each yellow signal in the photo gets read
// (a light pass runs down it) and locked (corner brackets snap on), then the
// readout says how many were found. Repeats while the hero is on screen.
// The signals are part of the photo, so each effect is clipped to the signal's
// own pixels with a mask cut from the photo. Pause button for WCAG 2.2.2.
// Reduced motion: nothing runs; the photo stays as it is.
(function () {
  const hero = document.querySelector(".hero");
  const media = hero && hero.querySelector(".hero-media");
  const img = media && media.querySelector("img");
  if (!img || !media.animate) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const IW = 2000, IH = 767; // hero.jpg natural size
  // Signal boxes in photo pixels: [mask x, y, w, h] (mask = signal + 4px)
  const SIGNALS = [
    [1026, 6, 54, 158],
    [1178, 22, 44, 44],
    [1412, 0, 97, 236],
    [1673, 0, 112, 108],
  ];
  const SWEEP = 2600, REST = 3400;

  const pct = (v, of) => (v / of * 100) + "%";
  const stage = document.createElement("div");
  stage.className = "scan-stage";
  const beam = document.createElement("div");
  beam.className = "scan-beam";
  media.append(stage, beam);

  const sigs = SIGNALS.map(([x, y, w, h], i) => {
    const read = document.createElement("div");
    read.className = "scan-read";
    read.style.cssText = `left:${pct(x, IW)};top:${pct(y, IH)};width:${pct(w, IW)};height:${pct(h, IH)};` +
      `-webkit-mask-image:url(/assets/hero-signal-${i + 1}.png);mask-image:url(/assets/hero-signal-${i + 1}.png)`;
    const band = document.createElement("i");
    read.append(band);
    const lock = document.createElement("div");
    lock.className = "scan-lock";
    lock.style.cssText = `left:${pct(x + 4, IW)};top:${pct(y + (y ? 4 : 0), IH)};width:${pct(w - 8, IW)};height:${pct(h - (y ? 8 : 4), IH)}`;
    stage.append(read, lock);
    return { x: x + w / 2, y: y + h / 2, band, lock };
  });

  // Readout + pause button in the hero's bottom line
  const bottom = hero.querySelector(".hero-bottom");
  const ctl = document.createElement("div");
  ctl.className = "scan-ctl";
  ctl.innerHTML = '<span class="scan-status" aria-hidden="true"><b></b><span>SCANNING</span></span>' +
    '<button type="button" class="scan-toggle" aria-pressed="false">Pause</button>';
  if (bottom) bottom.append(ctl);
  const statusText = ctl.querySelector(".scan-status span");
  const toggle = ctl.querySelector(".scan-toggle");

  // Match the stage to the photo as object-fit: cover draws it
  let W = 0, H = 0, ox = 0, oy = 0, s = 1;
  function layout() {
    W = media.clientWidth; H = media.clientHeight;
    s = Math.max(W / IW, H / IH);
    const pos = getComputedStyle(img).objectPosition.split(" ").map(v => parseFloat(v) / 100);
    ox = (W - IW * s) * (isNaN(pos[0]) ? .5 : pos[0]);
    oy = (H - IH * s) * (isNaN(pos[1]) ? .5 : pos[1]);
    stage.style.cssText = `left:${ox}px;top:${oy}px;width:${IW * s}px;height:${IH * s}px`;
    beam.style.height = Math.min(H, oy + IH * s * 0.46) + "px";
  }
  layout();
  if (window.ResizeObserver) new ResizeObserver(layout).observe(media);
  else addEventListener("resize", layout);

  const EASE = "cubic-bezier(.22,1,.36,1)";
  let timer = 0, running = [], paused = false, onScreen = true, ready = false;

  function cycle() {
    layout();
    const visible = sigs.filter(g => {
      const cx = ox + g.x * s, cy = oy + g.y * s;
      return cx > 0 && cx < W && cy < H;
    });
    statusText.textContent = "SCANNING";
    ctl.classList.add("is-scanning");
    running = [beam.animate(
      [{ transform: "translateX(-140px)", opacity: 0 }, { opacity: 1, offset: .06 }, { opacity: 1, offset: .94 }, { transform: `translateX(${W + 20}px)`, opacity: 0 }],
      { duration: SWEEP, easing: "linear" })];
    visible.forEach(g => {
      const delay = Math.max(0, (ox + g.x * s) / W) * SWEEP;
      running.push(
        g.band.animate([{ transform: "translateY(-120%)" }, { transform: "translateY(130%)" }],
          { duration: 750, delay, easing: "cubic-bezier(.4,0,.2,1)" }),
        g.lock.animate([
          { opacity: 0, transform: "scale(1.45)" },
          { opacity: 1, transform: "scale(1)", offset: .16, easing: EASE },
          { opacity: 1, transform: "scale(1)", offset: .72 },
          { opacity: 0, transform: "scale(1)" }],
          { duration: 2400, delay, easing: "ease-out" })
      );
    });
    timer = setTimeout(() => {
      const n = visible.length;
      statusText.textContent = n + (n === 1 ? " SIGNAL FOUND" : " SIGNALS FOUND");
      ctl.classList.remove("is-scanning");
      timer = setTimeout(cycle, REST);
    }, SWEEP);
  }
  function stop() {
    clearTimeout(timer); timer = 0;
    running.forEach(a => a.cancel()); running = [];
    ctl.classList.remove("is-scanning");
  }
  function sync() {
    const go = ready && !paused && onScreen && !document.hidden;
    if (go && !timer) cycle();
    if (!go && timer) stop();
  }

  toggle.addEventListener("click", () => {
    paused = !paused;
    toggle.textContent = paused ? "Play" : "Pause";
    toggle.setAttribute("aria-pressed", String(paused));
    if (paused) statusText.textContent = "PAUSED";
    sync();
  });
  document.addEventListener("visibilitychange", sync);
  if (window.IntersectionObserver) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }).observe(hero);
  }
  // Start once the headline has landed and the photo has settled
  setTimeout(() => { ready = true; media.classList.add("scan-on"); sync(); }, 1900);
})();
