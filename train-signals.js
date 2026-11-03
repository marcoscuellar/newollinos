// Train panel: the signals in the Chicago photo, drawn live in the hero's style.
// The yellow lines draw themselves out from their dots into the city, the
// corner brackets lock on, then now and then a light runs a line, a dot sends
// and a bracket re-locks. Drawn in photo coordinates, matched to the photo's
// object-fit: cover crop. Starts once the panel is well into view, follows the
// hero's Pause button. Reduced motion: everything drawn, nothing moves.
(function () {
  const panel = document.querySelector(".train-panel");
  const img = panel && panel.querySelector("img");
  if (!img) return;
  const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const canAnimate = !reduce && !!document.body.animate;

  const IW = 1679, IH = 937; // train-signals.jpg natural size
  const NS = "http://www.w3.org/2000/svg";
  // Each line starts at its signal dot and ends on something in the city.
  const CURVES = [
    "M688 252 Q740 252 776 296",     // → Willis Tower
    "M1030 140 Q880 200 852 326",    // → glass tower
    "M1320 402 Q1190 410 1120 488",  // → the train's cab
    "M934 713 Q890 625 797 621",     // → the rear car
    "M1275 588 Q1110 600 1036 770",  // → the street
  ];
  const CORNERS = [
    "M777 306 H796 V322",            // Willis Tower
    "M1087 404 V396 H1106",          // cab, top
    "M1101 523 V541 H1121",          // cab, bottom
    "M961 369 V358 H978",            // tower behind the train
    "M1113 249 V232 H1134",          // glass tower
    "M1135 191 V175 H1155",          // glass tower, higher
  ];

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${IW} ${IH}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("sig-layer", "tsig-layer");
  const el = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  // On phones the headline sits over the sky, so the two sky lines and the
  // Willis bracket stay desktop-only.
  const DESK_ONLY_LINES = [0, 1], DESK_ONLY_CORNERS = [0];
  const lines = CURVES.map((d, i) => {
    const p = el("path", { d, pathLength: 1, class: "sig-trace" });
    const comet = el("path", { d, pathLength: 1, class: "sig-comet" });
    const [, x, y] = d.match(/M(\d+) (\d+)/);
    const ring = el("circle", { cx: x, cy: y, r: 7, class: "tsig-ring" });
    const dot = el("circle", { cx: x, cy: y, r: 6, class: "tsig-dot" });
    if (DESK_ONLY_LINES.includes(i)) [p, comet, ring, dot].forEach(e => e.classList.add("tsig-desk"));
    svg.append(p, comet, ring, dot);
    return { p, comet, ring, dot, desk: DESK_ONLY_LINES.includes(i) };
  });
  const corners = CORNERS.map((d, i) => {
    const p = el("path", { d, class: "sig-lock" });
    if (DESK_ONLY_CORNERS.includes(i)) { p.classList.add("tsig-desk"); p._desk = true; }
    svg.append(p); return p;
  });
  const isPhone = () => !!(window.matchMedia && matchMedia("(max-width: 600px)").matches);

  const stage = document.createElement("div");
  stage.className = "sig-stage";
  stage.append(svg);
  panel.append(stage);

  const pos = v => v === "left" || v === "top" ? 0 : v === "right" || v === "bottom" ? 1 : v === "center" ? .5 : parseFloat(v) / 100;
  function layout() {
    const W = panel.clientWidth, H = panel.clientHeight;
    const s = Math.max(W / IW, H / IH);
    const [px, py] = getComputedStyle(img).objectPosition.split(" ").map(pos);
    const ox = (W - IW * s) * (isNaN(px) ? .5 : px);
    const oy = (H - IH * s) * (isNaN(py) ? .5 : py);
    stage.style.cssText = `left:${ox}px;top:${oy}px;width:${IW * s}px;height:${IH * s}px`;
  }
  layout();
  if (window.ResizeObserver) new ResizeObserver(layout).observe(panel);
  else addEventListener("resize", layout);

  if (!canAnimate) { svg.classList.add("tsig-still"); panel.classList.add("sig-on"); return; }

  const EASE = "cubic-bezier(.22,1,.36,1)";
  let drawn = false;
  function drawIn() {
    drawn = true;
    panel.classList.add("sig-on");
    lines.forEach(({ p, dot }, i) => {
      dot.animate([{ opacity: 0, transform: "scale(.2)" }, { opacity: 1, transform: "scale(1)" }],
        { duration: 450, delay: i * 260, easing: EASE, fill: "both" });
      p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
        { duration: 1000, delay: 200 + i * 260, easing: EASE, fill: "both" });
    });
    corners.forEach((c, i) => c.animate([{ opacity: 0, transform: "scale(1.6)" }, { opacity: 1, transform: "scale(1)" }],
      { duration: 550, delay: 900 + i * 140, easing: EASE, fill: "both" }));
  }
  // Hidden until drawn
  lines.forEach(({ p, dot }) => { p.style.strokeDashoffset = 1; dot.style.opacity = 0; });
  corners.forEach(c => { c.style.opacity = 0; });

  let timer = 0, running = [], onScreen = false, n = 0;
  const paused = () => document.documentElement.classList.contains("sig-paused");
  function beat() {
    running = [];
    const ph = isPhone();
    const L = lines.filter(l => !(ph && l.desk)), C = corners.filter(c => !(ph && c._desk));
    const a = L[n % L.length], b = L[(n + 2) % L.length];
    [a, b].forEach(({ comet, ring }, j) => {
      running.push(
        ring.animate([{ transform: "scale(1)", opacity: .9 }, { transform: "scale(3)", opacity: 0 }],
          { duration: 1000, delay: j * 1300, easing: "ease-out" }),
        comet.animate(
          [{ strokeDashoffset: .14, opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .85 }, { strokeDashoffset: -1, opacity: 0 }],
          { duration: 1800, delay: 200 + j * 1300, easing: "cubic-bezier(.45,0,.55,1)" }));
    });
    const c = C[n % C.length];
    running.push(c.animate(
      [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(1.5)", opacity: .2, offset: .3 }, { transform: "scale(1)", opacity: 1 }],
      { duration: 900, delay: 700, easing: EASE }));
    n++;
    timer = setTimeout(beat, 5200);
  }
  function stop() { clearTimeout(timer); timer = 0; running.forEach(x => x.cancel()); running = []; }
  function sync() {
    const go = drawn && onScreen && !paused() && !document.hidden;
    if (go && !timer) timer = setTimeout(beat, 1200);
    if (!go && timer) stop();
  }
  document.addEventListener("visibilitychange", sync);
  document.addEventListener("sigpause", sync);
  // Same trigger rule as the rest of the site: start once the panel is well into view
  if (window.IntersectionObserver) {
    new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen && !drawn) drawIn();
      sync();
    }, { threshold: .55 }).observe(panel);
  } else { onScreen = true; drawIn(); sync(); }
})();
