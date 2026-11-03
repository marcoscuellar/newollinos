// Train panel: the yellow lines already in the Chicago photo come alive.
// A light travels along each curve from its signal dot into the city, and the
// dot pulses as it sends. Drawn in photo coordinates, matched to the photo's
// object-fit: cover crop. Plays while the panel is on screen, a few rounds per
// visit, and follows the hero's Pause button. Reduced motion: nothing runs.
(function () {
  const panel = document.querySelector(".train-panel");
  const img = panel && panel.querySelector("img");
  if (!img || !document.body.animate) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const IW = 1679, IH = 937; // train-signals.jpg natural size
  const NS = "http://www.w3.org/2000/svg";
  // Each curve starts at its signal dot, traced on the photo's own lines.
  const CURVES = [
    "M688 252 Q740 252 776 296",     // dot by the Willis Tower → bracket
    "M1030 140 Q880 200 852 326",    // dot on the glass tower → bracket below
    "M1320 402 Q1190 410 1120 488",  // dot on the train → the cab
    "M934 713 Q890 625 797 621",     // dot under the track → the rear car
    "M1275 588 Q1110 600 1036 770",  // dot on the girder → the street
  ];

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${IW} ${IH}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("tsig-layer");
  const el = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  const lines = CURVES.map(d => {
    const comet = el("path", { d, pathLength: 1, class: "tsig-comet" });
    const [, x, y] = d.match(/M(\d+) (\d+)/);
    const ring = el("circle", { cx: x, cy: y, r: 7, class: "tsig-ring" });
    svg.append(comet, ring);
    return { comet, ring };
  });
  const stage = document.createElement("div");
  stage.className = "tsig-stage";
  stage.append(svg);
  panel.append(stage);

  function layout() {
    const W = panel.clientWidth, H = panel.clientHeight;
    const s = Math.max(W / IW, H / IH);
    const pos = getComputedStyle(img).objectPosition.split(" ").map(v => {
      const n = parseFloat(v); return v === "left" || v === "top" ? 0 : v === "right" || v === "bottom" ? 1 : v === "center" ? .5 : n / 100;
    });
    const ox = (W - IW * s) * (isNaN(pos[0]) ? .5 : pos[0]);
    const oy = (H - IH * s) * (isNaN(pos[1]) ? .5 : pos[1]);
    stage.style.cssText = `left:${ox}px;top:${oy}px;width:${IW * s}px;height:${IH * s}px`;
  }
  layout();
  if (window.ResizeObserver) new ResizeObserver(layout).observe(panel);
  else addEventListener("resize", layout);

  const ROUNDS = 3, GAP = 650, ROUND = CURVES.length * GAP + 2600;
  let timer = 0, running = [], left = 0, onScreen = false;
  const paused = () => document.documentElement.classList.contains("sig-paused");

  function round() {
    running = [];
    lines.forEach(({ comet, ring }, i) => {
      const delay = i * GAP;
      running.push(
        ring.animate([{ transform: "scale(1)", opacity: .95 }, { transform: "scale(3.2)", opacity: 0 }],
          { duration: 900, delay, easing: "ease-out" }),
        comet.animate(
          [{ strokeDashoffset: .18, opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .82 }, { strokeDashoffset: -1, opacity: 0 }],
          { duration: 1500, delay: delay + 150, easing: "cubic-bezier(.45,0,.55,1)" })
      );
    });
    timer = setTimeout(() => { timer = 0; if (--left > 0) sync(); }, ROUND);
  }
  function stop() { clearTimeout(timer); timer = 0; running.forEach(a => a.cancel()); running = []; }
  function sync() {
    const go = onScreen && left > 0 && !paused() && !document.hidden;
    if (go && !timer) round();
    if (!go && timer) stop();
  }
  document.addEventListener("visibilitychange", sync);
  document.addEventListener("sigpause", sync);
  // Same trigger rule as the rest of the site: start once the panel is well into view
  if (window.IntersectionObserver) {
    new IntersectionObserver(([e]) => {
      const was = onScreen; onScreen = e.isIntersecting;
      if (onScreen && !was) left = ROUNDS;
      sync();
    }, { threshold: .55 }).observe(panel);
  }
})();
