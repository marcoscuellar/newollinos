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
    // The long run: it crosses the skyline and lands in the gap between two people.
    { d: "M286 54 L1342 292", run: true },
    { d: "M1358 288 L1642 212", run: true },      // on to the next gap
    // The architecture it travels along
    { d: "M430 0 L783 125 L793 128 L1000 207" },  // glass rail top edge
    { d: "M787 128 V262" },                       // rail post
    { d: "M944 184 V262" },                       // rail post
    { d: "M600 236 V40 H686" },                   // glass tower, left skyline
    { d: "M160 352 V134 H246" },                  // tall tower, far left
    // Stepped runs over the towers on the right
    { d: "M1664 196 H1736 V120 H1812" },
    { d: "M1858 258 V190 H1948 V128", run: true },
    // Phones crop to roughly x 826-1645, so they get their own run
    { d: "M900 300 L1340 292", ph: true, prun: true },
    { d: "M1222 250 V4", ph: true },
    { d: "M1540 262 V126", ph: true, prun: true },
  ];
  // Where a signal lands: [cx, cy, r]
  const RINGS = [
    [1350, 290, 14],
    [1648, 210, 8],
    [1286, 288, 11, 1],
  ];
  // Corner brackets: [x, y, w, h]
  const LOCKS = [
    [1548, 128, 116, 92],   // dark tower windows
    [1252, 148, 88, 84],    // glass tower windows, above the table
    [1840, 118, 140, 70],   // terrace building windows
    [168, 142, 76, 104],    // far-left tower
    [1128, 118, 52, 64, 1], // mid glass tower (phone)
    [936, 64, 84, 76, 1],   // old tower crown (phone)
  ];
  // Dashed read-outs down the facades
  const RAILS = [
    { d: "M1578 70 V244" },
    { d: "M1612 98 V244" },
    { d: "M1646 122 V236" },
    { d: "M1958 108 V252" },
    { d: "M1986 142 V252" },
    { d: "M1268 60 V232", ph: true },
    { d: "M1300 92 V232", ph: true },
  ];
  // Lit window panes: the highlights ŌLLIN has picked out. [x, y, w, h]
  const PANES = [
    [1562, 142, 20, 11], [1602, 182, 20, 11], [1582, 222, 20, 11],
    [1262, 166, 34, 9], [1318, 206, 24, 9],
    [1903, 228, 26, 38],
    [612, 70, 28, 10], [646, 110, 28, 10],
    [1136, 140, 14, 8, 1], [950, 122, 16, 10, 1],
  ];
  // Small signal pieces in the brand's forms: [x, y, w, h, opacity]
  const PIECES = [
    [826, 236, 20, 56, .30],  // reflection in the glass panel
    [1930, 286, 9, 9, .9], [1930, 312, 9, 9, .7], [1930, 338, 9, 9, .5],
    [586, 230, 9, 9, .9],
    [1216, 244, 10, 10, .9],
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

  const ph = (n, on) => { if (on) n.classList.add("sig-ph"); return n; };
  const traces = TRACES.map(t => {
    const p = ph(el("path", { d: t.d, pathLength: 1, class: "sig-trace" }), t.ph);
    svg.append(p);
    let comet = null;
    if (t.run || t.prun) { comet = ph(el("path", { d: t.d, pathLength: 1, class: "sig-comet" }), t.ph); svg.append(comet); }
    return { p, comet, run: !!t.run, prun: !!t.prun };
  });
  const isPhone = () => !!(window.matchMedia && matchMedia("(max-width: 600px)").matches);
  const inPhoneView = x => x > 826 && x < 1645;
  const locks = LOCKS.map(([x, y, w, h, only]) => {
    const a = Math.min(18, w / 3, h / 3);
    const d = `M${x} ${y + a}V${y}H${x + a}M${x + w - a} ${y}H${x + w}V${y + a}` +
      `M${x + w} ${y + h - a}V${y + h}H${x + w - a}M${x + a} ${y + h}H${x}V${y + h - a}`;
    const p = ph(el("path", { d, class: "sig-lock" }), only);
    p._ph = inPhoneView(x + w / 2); p._desk = !only;
    svg.append(p);
    return p;
  });
  const panes = PANES.map(([x, y, w, h, only]) => {
    const r = ph(el("rect", { x, y, width: w, height: h, rx: 2, class: "sig-pane" }), only);
    r._ph = inPhoneView(x + w / 2); r._desk = !only;
    svg.append(r);
    return r;
  });
  const pieces = PIECES.map(([x, y, w, h, o]) => {
    const r = el("rect", { x, y, width: w, height: h, rx: Math.min(w, h) * .36, class: "sig-piece" });
    r.style.setProperty("--o", o);
    svg.append(r);
    return r;
  });

  const rails = RAILS.map(t => {
    const p = ph(el("path", { d: t.d, pathLength: 1, class: "sig-rail" }), t.ph);
    p._ph = true; p._desk = !t.ph;
    svg.append(p);
    return p;
  });
  const rings = RINGS.map(([cx, cy, r, only]) => {
    const c = ph(el("circle", { cx, cy, r, class: "sig-ring" }), only);
    c._ph = inPhoneView(cx); c._desk = !only;
    svg.append(c);
    return c;
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
    locks.forEach((p, i) => p.animate([{ opacity: 0, transform: "scale(1.2)" }, { opacity: .82, transform: "scale(1)" }],
      { duration: 600, delay: 500 + i * 140, easing: EASE, fill: "both" }));
    panes.forEach((r, i) => r.animate([{ opacity: 0 }, { opacity: .9 }, { opacity: .68 }],
      { duration: 900, delay: 900 + i * 120, easing: "ease-out", fill: "both" }));
    pieces.forEach((r, i) => r.animate([{ opacity: 0 }, { opacity: getComputedStyle(r).getPropertyValue("--o") }],
      { duration: 500, delay: 700 + i * 90, fill: "both" }));
    rails.forEach((p, i) => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: 900, delay: 600 + i * 90, easing: EASE, fill: "both" }));
    rings.forEach((c, i) => c.animate([{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "scale(1)" }],
      { duration: 620, delay: 1150 + i * 150, easing: EASE, fill: "both" }));
  }

  let timer = 0, running = [], paused = false, onScreen = true, ready = false, n = 0;
  function beat() {
    // Lights run along the architecture; one bracket re-locks; a few windows brighten.
    // Phones see a narrower slice of the photo, so they get the lights that fall inside it.
    running = [];
    const phone = isPhone();
    const vis = a => a.filter(e => phone ? e._ph : e._desk);
    traces.filter(t => t.comet && (phone ? t.prun : t.run)).forEach(({ comet }, j) => {
      running.push(comet.animate(
        [{ strokeDashoffset: .14, opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .85 }, { strokeDashoffset: -1, opacity: 0 }],
        { duration: phone ? 1900 : 2600, delay: j * (phone ? 650 : 500), easing: "cubic-bezier(.45,0,.55,1)" }));
    });
    const vr = vis(rings);
    if (vr.length) running.push(vr[n % vr.length].animate(
      [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(1.6)", opacity: 0, offset: .7 }, { transform: "scale(1.6)", opacity: 0 }],
      { duration: 2200, delay: 300, easing: "cubic-bezier(.3,0,.5,1)" }));
    const vl = vis(locks), lock = vl[n++ % vl.length];
    running.push(lock.animate(
      [{ transform: "scale(1)", opacity: .82 }, { transform: "scale(1.16)", opacity: .25, offset: .3 }, { transform: "scale(1)", opacity: .82 }],
      { duration: 900, delay: 400, easing: EASE }));
    [0, 3, 6].forEach((k, j) => {
      const vp = vis(panes), pane = vp[(n * 2 + k) % vp.length];
      running.push(pane.animate([{ opacity: .68 }, { opacity: 1, offset: .25 }, { opacity: .68 }],
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
