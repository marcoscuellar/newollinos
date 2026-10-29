// ŌLLIN intro motion (Motion.dev, pinned): the first two seconds of every page, plus hover lift.
// - Top bar: logo, then links, then "Let's talk" settle in.
// - Home hero: headline rises word by word, then the yellow period lands (the signal).
// - Feature pages: label → title → copy → button, while the photo settles.
// - Cards lift slightly under the cursor (mouse/trackpad only).
// Rules kept: plays once, settles under ~2s, no loops, no bounce, reduced-motion gets the still page.
// Content is only pre-hidden by the html.mi class, which the <head> snippet removes after 2.5s
// no matter what, so if this file never loads the page still shows everything.
import { animate, stagger, hover } from "https://cdn.jsdelivr.net/npm/motion@13.2.0/+esm";

const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = [0.22, 1, 0.36, 1];
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

// Hold an element at its starting state, then let the class go and play it in.
function rise(els, { y = 18, duration = 0.7, delay = 0, step = 0.08 } = {}) {
  els = els.filter(Boolean);
  if (!els.length) return;
  els.forEach(el => { el.style.opacity = "0"; el.style.transform = `translateY(${y}px)`; });
  animate(els, { opacity: [0, 1], y: [y, 0] }, { duration, delay: stagger(step, { startDelay: delay }), ease: EASE });
}

// Split a headline's text into words (keeps inner elements like the yellow period intact).
function splitWords(h) {
  const words = [];
  [...h.childNodes].forEach(node => {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const s = document.createElement("span");
        s.className = "mi-word";
        s.textContent = part;
        frag.appendChild(s); words.push(s);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === 1 && !node.classList.contains("yellow") && node.tagName !== "BR") {
      words.push(node);
    }
  });
  return words;
}

function intro() {
  if (reduce) { root.classList.remove("mi"); return; }
  // If the 2.5s safety net already showed the page (slow connection), don't hide and replay it.
  if (!root.classList.contains("mi")) { lift(); return; }

  // ---------- Top bar ----------
  const header = document.querySelector("header.sn");
  if (header) {
    rise([header.querySelector(".sn-logo")], { y: -12, duration: 0.6 });
    rise($$(".sn-a", header), { y: -12, duration: 0.5, delay: 0.12, step: 0.05 });
    rise([header.querySelector(".sn-cta"), header.querySelector(".sn-burger")], { y: -12, duration: 0.5, delay: 0.38 });
  }

  // ---------- Home hero ----------
  const hero = document.querySelector(".hero");
  if (hero) {
    const img = hero.querySelector(".hero-media img");
    if (img) animate(img, { scale: [1.08, 1] }, { duration: 1.8, ease: EASE });
    rise([hero.querySelector(".eyebrow")], { y: 10, duration: 0.5, delay: 0.15 });
    const h1 = hero.querySelector("h1");
    if (h1) {
      h1.style.opacity = "1"; h1.style.transform = "none";
      const words = splitWords(h1);
      rise(words, { y: 26, duration: 0.75, delay: 0.25, step: 0.06 });
      const dots = $$(".yellow", h1);
      const after = 0.25 + words.length * 0.06 + 0.35;
      dots.forEach(d => { d.style.display = "inline-block"; d.style.transform = "scale(0)"; });
      animate(dots, { scale: [0, 1] }, { type: "spring", stiffness: 320, damping: 22, delay: stagger(0.15, { startDelay: after }) });
    }
    rise([hero.querySelector(".hero-sub"), hero.querySelector(".hero-bottom")], { y: 18, duration: 0.7, delay: 0.75, step: 0.12 });
  }

  // ---------- Feature page openers ----------
  const fp = document.querySelector(".fp-hero");
  if (fp) {
    rise($$(".fp-hero-text > *", fp), { y: 22, duration: 0.75, delay: 0.15, step: 0.1 });
    const img = fp.querySelector(".fp-hero-img img");
    if (img) {
      img.style.clipPath = "inset(0 0 0 100%)";
      animate(img, { scale: [1.1, 1] }, { duration: 1.6, ease: EASE });
      animate(img, { clipPath: ["inset(0 0 0 100%)", "inset(0 0 0 0%)"] }, { duration: 0.9, ease: EASE });
    }
  }

  root.classList.remove("mi");
  lift();
}

// ---------- Hover lift ----------
function lift() {
  if (reduce) return;
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const spring = { type: "spring", stiffness: 420, damping: 34 };
    // Lift card-sized panels only; full-width sections stay put.
    $$(".panel").forEach(p => {
      if (p.matches(".hero, .fp-hero") || p.closest(".hero, .fp-hero")) return;
      const parentW = p.parentElement ? p.parentElement.getBoundingClientRect().width : 0;
      if (parentW && p.getBoundingClientRect().width > parentW * 0.75) return;
      p.classList.add("mi-lift");
    });
    hover(".mi-lift", el => {
      el.classList.add("is-lifted");
      animate(el, { y: -6 }, spring);
      return () => { el.classList.remove("is-lifted"); animate(el, { y: 0 }, spring); };
    });
  }
}

// nav.js builds the header synchronously at the end of <body>; modules run after parsing, so it exists here.
intro();
