// Home hero: signals working around the people, never on them.
// Motion.dev (pinned) owns the sequencing: it draws the traces in with a stagger,
// then keeps the loop going itself with repeat + repeatDelay. No hand-rolled timers.
//
// One long trace crosses the frame and lands in a reticle in the gap between the
// two of them, then runs on. Stepped runs cross the glass, dashed read-outs fall
// down the facades, brackets lock onto windows. The dashboard rises out of the
// bottom edge of the hero, cropped by it.
//
// Drawn in photo coordinates and matched to the photo's object-fit: cover crop.
// Pause button for WCAG 2.2.2. Reduced motion: drawn once, still.
import { animate, stagger, inView } from "https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm";

const hero = document.querySelector(".hero");
const media = hero && hero.querySelector(".hero-media");
const img = media && media.querySelector("img");
const card = hero && hero.querySelector(".hero-proof");

if (img) main();

function main() {
  const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const IW = 2000, IH = 1116; // handshake.jpg natural size
  const NS = "http://www.w3.org/2000/svg";
  const EASE = [.22, 1, .36, 1];

  // Faces sit roughly in x 880-1500, y 90-300, and the headline covers the left
  // third, so every line below runs through sky, glass and architecture.
  const TRACES = [
    { d: "M300 86 L1196 232", run: true },         // the long run, into the gap between them
    { d: "M1218 228 L1612 150", run: true },       // on to the glass
    { d: "M700 318 V74 H884" },                    // ceiling line into the back wall
    { d: "M452 268 V40" },                         // column edge, left
    { d: "M1664 196 H1740 V116 H1828" },           // stepped run over the glass
    { d: "M1862 298 V228 H1952 V160", run: true }, // stepped run, street side
    // Phones crop to roughly x 760-1540, so they get their own run
    { d: "M860 300 L1192 236", ph: true, prun: true },
    { d: "M1398 330 V120", ph: true },
  ];
  const RINGS = [            // where a signal lands: [cx, cy, r]
    [1204, 234, 14],
    [1620, 148, 8],
    [1196, 238, 11, 1],
  ];
  const LOCKS = [            // corner brackets: [x, y, w, h]
    [1534, 152, 104, 84],
    [762, 96, 88, 74],
    [1872, 236, 76, 92],
    [1140, 126, 58, 70, 1],
  ];
  const RAILS = [            // dashed read-outs down the facades
    { d: "M1700 70 V292" }, { d: "M1740 96 V292" }, { d: "M1780 120 V284" },
    { d: "M1906 150 V300" }, { d: "M1944 182 V300" },
    { d: "M1268 60 V228", ph: true }, { d: "M1300 92 V228", ph: true },
  ];
  const PANES = [            // lit panes ŌLLIN has picked out: [x, y, w, h]
    [1550, 170, 22, 10], [1592, 202, 22, 10], [1566, 212, 16, 9],
    [778, 114, 26, 9], [812, 146, 20, 9],
    [1888, 262, 24, 36],
    [1150, 142, 14, 8, 1], [1172, 176, 16, 8, 1],
  ];
  const PIECES = [           // brand forms: [x, y, w, h, opacity]
    [1782, 244, 24, 80, .26], [1838, 300, 16, 52, .22],
    [1962, 60, 9, 9, .9], [1962, 86, 9, 9, .7], [1962, 112, 9, 9, .5],
    [640, 300, 9, 9, .9],
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
  // Phones see a narrower slice of the photo, so each piece knows where it shows.
  const PH0 = 760, PH1 = 1540;
  const inPhoneView = x => x >= PH0 && x <= PH1;

  const traces = TRACES.map(t => {
    const p = ph(el("path", { d: t.d, pathLength: 1, class: "sig-trace" }), t.ph);
    svg.append(p);
    let comet = null;
    if (t.run || t.prun) { comet = ph(el("path", { d: t.d, pathLength: 1, class: "sig-comet" }), t.ph); svg.append(comet); }
    return { p, comet, run: !!t.run, prun: !!t.prun, ph: !!t.ph };
  });
  const rails = RAILS.map(t => {
    const p = ph(el("path", { d: t.d, pathLength: 1, class: "sig-rail" }), t.ph);
    p._ph = true; p._desk = !t.ph;
    svg.append(p);
    return p;
  });
  const locks = LOCKS.map(([x, y, w, h, only]) => {
    const i = 22, p = ph(el("path", {
      d: `M${x} ${y + i} V${y} H${x + i} M${x + w - i} ${y} H${x + w} V${y + i}
          M${x + w} ${y + h - i} V${y + h} H${x + w - i} M${x + i} ${y + h} H${x} V${y + h - i}`,
      class: "sig-lock"
    }), only);
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
  const rings = [], echoes = [];
  RINGS.forEach(([cx, cy, r, only]) => {
    const c = ph(el("circle", { cx, cy, r, class: "sig-ring" }), only);
    const e = ph(el("circle", { cx, cy, r, class: "sig-echo" }), only);
    c._ph = e._ph = inPhoneView(cx); c._desk = e._desk = !only;
    svg.append(e, c);
    rings.push(c); echoes.push(e);
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

  const isPhone = () => !!(window.matchMedia && matchMedia("(max-width: 600px)").matches);
  const vis = a => { const p = isPhone(); return a.filter(e => p ? e._ph : e._desk); };

  if (reduce) {
    media.classList.add("sig-on", "sig-still");
    if (card) card.style.transform = "none";
    return;
  }

  // ---- Motion does the work from here ----
  const loops = [];
  let paused = false;

  function drawIn() {
    media.classList.add("sig-on");
    animate(traces.map(t => t.p), { strokeDashoffset: [1, 0] },
      { duration: 1.1, delay: stagger(.11), ease: EASE });
    animate(rails, { strokeDashoffset: [1, 0] },
      { duration: .9, delay: stagger(.09, { startDelay: .6 }), ease: EASE });
    animate(locks, { opacity: [0, .82], scale: [1.2, 1] },
      { duration: .6, delay: stagger(.14, { startDelay: .5 }), ease: EASE });
    animate(panes, { opacity: [0, .9, .68] },
      { duration: .9, delay: stagger(.12, { startDelay: .9 }), ease: "easeOut" });
    pieces.forEach((r, i) => animate(r,
      { opacity: [0, parseFloat(getComputedStyle(r).getPropertyValue("--o")) || 1] },
      { duration: .5, delay: .7 + i * .09 }));
    animate(rings, { opacity: [0, 1], scale: [.4, 1] },
      { duration: .62, delay: stagger(.15, { startDelay: 1.15 }), ease: EASE });

    // The dashboard rises out of the bottom edge once the evidence is on screen
    if (card) animate(card, { y: [78, 0], opacity: [0, 1] },
      { duration: .95, delay: 1.35, ease: EASE });
  }

  function startLoops() {
    const phone = isPhone();
    traces.filter(t => t.comet && (phone ? t.prun : t.run)).forEach(({ comet }, j) => {
      loops.push(animate(comet,
        { strokeDashoffset: [.14, -1], opacity: [0, 1, 1, 0] },
        {
          duration: phone ? 1.9 : 2.6, delay: j * (phone ? .65 : .5),
          ease: [.45, 0, .55, 1], opacity: { times: [0, .1, .85, 1] },
          repeat: Infinity, repeatDelay: 2.6
        }));
    });
    vis(echoes).forEach((e, j) => {
      loops.push(animate(e, { scale: [1, 2.1], opacity: [.9, 0] },
        { duration: 2.2, delay: j * .9, ease: [.3, 0, .5, 1], repeat: Infinity, repeatDelay: 2.8 }));
    });
    const vl = vis(locks);
    if (vl.length) loops.push(animate(vl, { scale: [1, 1.16, 1], opacity: [.82, .25, .82] },
      { duration: .9, delay: stagger(.7), ease: EASE, repeat: Infinity, repeatDelay: 3.6 }));
    const vp = vis(panes);
    if (vp.length) loops.push(animate(vp, { opacity: [.68, 1, .68] },
      { duration: 1.4, delay: stagger(.45), ease: "easeInOut", repeat: Infinity, repeatDelay: 2.2 }));
  }

  function sync() {
    const go = !paused && !document.hidden;
    loops.forEach(a => { try { go ? a.play() : a.pause(); } catch (e) {} });
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

  // The hero has to be read before it animates (trigger rule in CLAUDE.md)
  let started = false;
  inView(hero, () => {
    if (started) return;
    started = true;
    setTimeout(() => { drawIn(); setTimeout(() => { startLoops(); sync(); }, 1700); }, 400);
  }, { amount: .35 });
}
