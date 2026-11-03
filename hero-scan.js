// Home hero: signals working around the people, never on them.
// Thin yellow traces draw along the architecture (the glass rail, the rooftop terrace,
// building edges), corner brackets lock onto windows and towers, and a light
// runs along the rail and the terrace edge now and then. Nothing touches a face.
// Drawn in photo coordinates and matched to the photo's object-fit: cover crop.
// Pause button for WCAG 2.2.2. Reduced motion: drawn once, still.
(function () {
  const hero = document.querySelector(".hero");
  const media = hero && hero.querySelector(".hero-media");
  const img = media && media.querySelector("img");
  if (!img) return;
  const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const canAnimate = !reduce && !!document.body.animate;

  const IW = 2000, IH = 767; // hero.jpg natural size
  const NS = "http://www.w3.org/2000/svg";

  // Traces along the architecture (photo pixels). Faces sit roughly in
  // x 1120–2000, y 290–470, and the headline covers x 420–1020, y 300–680, so everything stays in the sky and the architecture.
  const TRACES = [
    { d: "M430 0 L783 125 L793 128 L1000 207", run: true },  // glass rail top edge, traced on the photo
    { d: "M787 128 V262" },                                  // rail post
    { d: "M944 184 V262" },                                  // rail post
    { d: "M600 236 V40 H686" },                              // glass tower, left skyline
    { d: "M160 352 V134 H246" },                             // tall tower, far left
    { d: "M1222 250 V4" },                                   // glass tower edge, above the table
    { d: "M1540 262 V126" },                                 // dark tower edge
    { d: "M1792 282 V157 L2000 78", run: true },             // terrace building pillar + slab edge
  ];
  // Corner brackets: [x, y, w, h]
  const LOCKS = [
    [1548, 128, 116, 92],   // dark tower windows
    [1252, 148, 88, 84],    // glass tower windows, above the table
    [1840, 118, 140, 70],   // terrace building windows
    [168, 142, 76, 104],    // far-left tower
  ];
  // Lit window panes: the highlights ŌLLIN has picked out. [x, y, w, h]
  const PANES = [
    [1562, 142, 20, 11], [1602, 182, 20, 11], [1582, 222, 20, 11], [1642, 162, 18, 11],  // dark tower
    [1262, 166, 34, 9], [1318, 206, 24, 9],                                             // glass tower
    [1903, 228, 34, 52],                                                                // terrace window
    [612, 70, 28, 10], [646, 110, 28, 10],                                              // glass tower, left skyline
  ];
  // Small signal pieces in the brand's forms: [x, y, w, h, opacity]
  const PIECES = [
    [826, 236, 22, 62, .38],  // reflection in the glass panel
    [1872, 206, 14, 40, .42], // reflection in the terrace windows
    [586, 230, 9, 9, 1],      // trace node
    [1216, 244, 12, 12, 1],   // trace node
    [1534, 256, 12, 12, 1],   // trace node
  ];

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${IW} ${IH}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("sig-layer");
  const el = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  const traces = TRACES.map(t => {
    const p = el("path", { d: t.d, pathLength: 1, class: "sig-trace" });
    svg.append(p);
    let comet = null;
    if (t.run) { comet = el("path", { d: t.d, pathLength: 1, class: "sig-comet" }); svg.append(comet); }
    return { p, comet };
  });
  const locks = LOCKS.map(([x, y, w, h]) => {
    const a = Math.min(18, w / 3, h / 3);
    const d = `M${x} ${y + a}V${y}H${x + a}M${x + w - a} ${y}H${x + w}V${y + a}` +
      `M${x + w} ${y + h - a}V${y + h}H${x + w - a}M${x + a} ${y + h}H${x}V${y + h - a}`;
    const p = el("path", { d, class: "sig-lock" });
    svg.append(p);
    return p;
  });
  const panes = PANES.map(([x, y, w, h]) => {
    const r = el("rect", { x, y, width: w, height: h, rx: 2, class: "sig-pane" });
    svg.append(r);
    return r;
  });
  const pieces = PIECES.map(([x, y, w, h, o]) => {
    const r = el("rect", { x, y, width: w, height: h, rx: Math.min(w, h) * .36, class: "sig-piece" });
    r.style.setProperty("--o", o);
    svg.append(r);
    return r;
  });

  const stage = document.createElement("div");
  stage.className = "sig-stage";
  stage.append(svg);
  media.append(stage);

  // Match the stage to the photo as object-fit: cover draws it
  function layout() {
    const W = media.clientWidth, H = media.clientHeight;
    const s = Math.max(W / IW, H / IH);
    const pos = getComputedStyle(img).objectPosition.split(" ").map(v => parseFloat(v) / 100);
    const ox = (W - IW * s) * (isNaN(pos[0]) ? .5 : pos[0]);
    const oy = (H - IH * s) * (isNaN(pos[1]) ? .5 : pos[1]);
    stage.style.cssText = `left:${ox}px;top:${oy}px;width:${IW * s}px;height:${IH * s}px`;
  }
  layout();
  if (window.ResizeObserver) new ResizeObserver(layout).observe(media);
  else addEventListener("resize", layout);

  if (!canAnimate) { media.classList.add("sig-on", "sig-still"); return; }

  // ---- Motion ----
  const EASE = "cubic-bezier(.22,1,.36,1)";
  function drawIn() {
    media.classList.add("sig-on");
    traces.forEach(({ p }, i) => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: 1100, delay: i * 110, easing: EASE, fill: "both" }));
    locks.forEach((p, i) => p.animate([{ opacity: 0, transform: "scale(1.3)" }, { opacity: 1, transform: "scale(1)" }],
      { duration: 600, delay: 500 + i * 140, easing: EASE, fill: "both" }));
    panes.forEach((r, i) => r.animate([{ opacity: 0 }, { opacity: .95 }, { opacity: .55 }],
      { duration: 700, delay: 900 + i * 120, easing: "ease-out", fill: "both" }));
    pieces.forEach((r, i) => r.animate([{ opacity: 0 }, { opacity: getComputedStyle(r).getPropertyValue("--o") }],
      { duration: 500, delay: 700 + i * 90, fill: "both" }));
  }

  let timer = 0, running = [], paused = false, onScreen = true, ready = false, n = 0;
  function beat() {
    // A light runs along the rail and the terrace edge; one bracket re-locks.
    running = [];
    traces.forEach(({ comet }, i) => {
      if (!comet) return;
      running.push(comet.animate(
        [{ strokeDashoffset: .14, opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .85 }, { strokeDashoffset: -1, opacity: 0 }],
        { duration: 2600, delay: i * 500, easing: "cubic-bezier(.45,0,.55,1)" }));
    });
    const lock = locks[n++ % locks.length];
    running.push(lock.animate(
      [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(1.25)", opacity: .2, offset: .3 }, { transform: "scale(1)", opacity: 1 }],
      { duration: 900, delay: 400, easing: EASE }));
    [0, 3, 6].forEach((k, j) => {
      const pane = panes[(n * 2 + k) % panes.length];
      running.push(pane.animate([{ opacity: .55 }, { opacity: 1, offset: .25 }, { opacity: .55 }],
        { duration: 1400, delay: 600 + j * 700, easing: "ease-in-out" }));
    });
    timer = setTimeout(beat, 5200);
  }
  function stop() { clearTimeout(timer); timer = 0; running.forEach(a => a.cancel()); running = []; }
  function sync() {
    const go = ready && !paused && onScreen && !document.hidden;
    if (go && !timer) beat();
    if (!go && timer) stop();
  }

  // Pause button in the hero's bottom line
  const bottom = hero.querySelector(".hero-bottom");
  if (bottom) {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "sig-toggle"; btn.textContent = "Pause";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Pause background motion");
    btn.addEventListener("click", () => {
      paused = !paused;
      btn.textContent = paused ? "Play" : "Pause";
      btn.setAttribute("aria-pressed", String(paused));
      btn.setAttribute("aria-label", paused ? "Play background motion" : "Pause background motion");
      sync();
    });
    bottom.append(btn);
  }
  document.addEventListener("visibilitychange", sync);
  if (window.IntersectionObserver) new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }).observe(hero);

  // Start once the headline has landed and the photo has settled
  setTimeout(() => { drawIn(); setTimeout(() => { ready = true; sync(); }, 1600); }, 1700);
})();
