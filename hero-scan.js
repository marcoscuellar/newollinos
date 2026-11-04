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

  const IW = 2000, IH = 1116; // handshake.jpg natural size
  const NS = "http://www.w3.org/2000/svg";

  // Traces along the architecture (photo pixels). Faces sit roughly in
  // x 1120–2000, y 290–470, and the headline covers x 420–1020, y 300–680, so everything stays in the sky and the architecture.
  const TRACES = [
    { d: "M700 322 V72 H884" },                 // ceiling line into the back wall
    { d: "M1214 262 V44", prun: true },         // glass mullion between the two of them
    { d: "M1662 596 V132" },                    // right facade mullion
    { d: "M1844 520 V196 L1958 150", run: true },// facade edge out to the street
    // Phones crop to roughly x 760-1540, so these live inside that window
    { d: "M880 300 V96", ph: true },
    { d: "M1402 330 V150", ph: true, prun: true },
  ];
  // Corner brackets: [x, y, w, h]
  const LOCKS = [
    [1534, 152, 104, 84],   // glass pane, right of her shoulder
    [762, 96, 88, 74],      // back wall window
    [1872, 236, 76, 92],    // street-side glass
    [1140, 126, 58, 70, 1], // mullion pane (phone)
  ];
  // Lit window panes: the highlights ŌLLIN has picked out. [x, y, w, h]
  const PANES = [
    [1550, 170, 22, 10], [1592, 202, 22, 10], [1566, 212, 16, 9],
    [778, 114, 26, 9], [812, 146, 20, 9],
    [1888, 262, 26, 44],
    [1150, 142, 14, 8, 1], [1172, 176, 16, 8, 1],
  ];
  // Small signal pieces in the brand's forms: [x, y, w, h, opacity]
  const PIECES = [
    [1782, 244, 26, 88, .26],  // soft bar sitting behind the glass
    [1838, 300, 17, 58, .22],  // its smaller partner
    [1716, 286, 12, 34, .20],
    [1214, 288, 10, 10, .55],  // trace node
    [1662, 614, 11, 11, .5],   // trace node
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
    locks.forEach((p, i) => p.animate([{ opacity: 0, transform: "scale(1.18)" }, { opacity: .42, transform: "scale(1)" }],
      { duration: 600, delay: 500 + i * 140, easing: EASE, fill: "both" }));
    panes.forEach((r, i) => r.animate([{ opacity: 0 }, { opacity: .40 }, { opacity: .26 }],
      { duration: 900, delay: 900 + i * 120, easing: "ease-out", fill: "both" }));
    pieces.forEach((r, i) => r.animate([{ opacity: 0 }, { opacity: getComputedStyle(r).getPropertyValue("--o") }],
      { duration: 500, delay: 700 + i * 90, fill: "both" }));
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
        [{ strokeDashoffset: .14, opacity: 0 }, { opacity: .45, offset: .1 }, { opacity: .45, offset: .85 }, { strokeDashoffset: -1, opacity: 0 }],
        { duration: phone ? 1900 : 2600, delay: j * (phone ? 650 : 500), easing: "cubic-bezier(.45,0,.55,1)" }));
    });
    const vl = vis(locks), lock = vl[n++ % vl.length];
    running.push(lock.animate(
      [{ transform: "scale(1)", opacity: .42 }, { transform: "scale(1.12)", opacity: .16, offset: .3 }, { transform: "scale(1)", opacity: .42 }],
      { duration: 900, delay: 400, easing: EASE }));
    [0, 3, 6].forEach((k, j) => {
      const vp = vis(panes), pane = vp[(n * 2 + k) % vp.length];
      running.push(pane.animate([{ opacity: .26 }, { opacity: .40, offset: .25 }, { opacity: .26 }],
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
