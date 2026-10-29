// ŌLLIN site motion: one file for every page.
// Rules: content is never hidden by CSS (if this script fails, the page still shows everything);
// every effect plays once and settles in under 2s, so nothing needs a pause button;
// reduced-motion visitors get the finished page with no movement at all.
(function () {
  if (!('animate' in Element.prototype) || !('IntersectionObserver' in window)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var EASE = 'cubic-bezier(.22,1,.36,1)';
  function play(el, frames, ms, delay, extra) {
    var o = { duration: ms, delay: delay || 0, easing: EASE, fill: 'backwards' };
    if (extra) for (var k in extra) o[k] = extra[k];
    try { return el.animate(frames, o); } catch (e) { return null; }
  }
  var pseudoOK = typeof KeyframeEffect !== 'undefined' && 'pseudoElement' in KeyframeEffect.prototype;

  // The top bar, home hero and feature-page openers are animated by motion-intro.js (Motion.dev).

  // ---------- Pick what reveals on scroll ----------
  // Big blocks (cards, photos) move as one piece; loose text outside cards moves line by line.
  var BLOCK = '.panel, .section-heading > *, h1, h2, h3, p, .lbl, .eyebrow, img, li, footer > *';
  var kept = [];
  [].slice.call(document.querySelectorAll(BLOCK)).forEach(function (el) {
    if (el.closest('header.sn, .hero, .fp-hero, template, [role="img"]')) return;
    for (var i = 0; i < kept.length; i++) if (kept[i].contains(el)) return;
    kept.push(el);
  });

  function countUp(el) {
    var end = parseInt(el.textContent, 10);
    if (!end) return;
    var t0 = null, dur = 1200;
    el.textContent = '0';
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function settleImages(root, delay) {
    var imgs = root.tagName === 'IMG' ? [root] : [].slice.call(root.querySelectorAll('img'));
    imgs.forEach(function (img) {
      if (img.getBoundingClientRect().width < 200) return; // skip icons and badges
      play(img, [{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }], 1600, delay);
    });
  }

  function reveal(el, delay) {
    var isCard = el.classList.contains('panel') || el.tagName === 'ARTICLE';
    var isPhoto = el.tagName === 'IMG';
    if (isPhoto) {
      play(el, [{ opacity: 0 }, { opacity: 1 }], 900, delay);
    } else {
      play(el, [
        { opacity: 0, transform: isCard ? 'translateY(36px) scale(.985)' : 'translateY(22px)' },
        { opacity: 1, transform: 'none' }
      ], isCard ? 950 : 750, delay);
    }
    settleImages(el, delay);

    // Section header line draws in from the left
    var rules = el.matches('.sec-rule') ? [el] : [].slice.call(el.querySelectorAll('.sec-rule'));
    if (pseudoOK) rules.forEach(function (r) {
      play(r, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 1100, delay, { pseudoElement: '::before' });
    });

    // Stats count up to their number
    [].slice.call(el.querySelectorAll('.work-stat > span:first-child, .evidence-stat > span:first-child')).forEach(function (n) {
      setTimeout(function () { countUp(n); }, delay + 200);
    });
  }

  var seen = new WeakSet();
  var io = new IntersectionObserver(function (entries) {
    var batch = entries.filter(function (e) { return e.isIntersecting && !seen.has(e.target); })
      .map(function (e) { return e.target; })
      .sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
    batch.forEach(function (el, i) {
      seen.add(el); io.unobserve(el);
      reveal(el, Math.min(i, 5) * 90);
    });
  }, { threshold: 0 });
  kept.forEach(function (el) { io.observe(el); });

  // ---------- Client mapping: the org chart draws itself ----------
  [].slice.call(document.querySelectorAll('[role="img"]')).forEach(function (map) {
    if (!map.querySelector('.node')) return;
    var mo = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      mo.disconnect();
      var kids = [].slice.call(map.children);
      var lines = kids.filter(function (k) { return !k.classList.contains('node'); });
      var nodes = kids.filter(function (k) { return k.classList.contains('node'); });
      nodes.forEach(function (n, i) {
        play(n, [{ opacity: 0, transform: 'translateY(14px) scale(.96)' }, { opacity: 1, transform: 'none' }], 700, 250 + i * 110);
      });
      lines.forEach(function (l, i) {
        var wide = l.offsetWidth >= l.offsetHeight;
        l.style.transformOrigin = wide ? 'left center' : 'center top';
        play(l, [{ transform: wide ? 'scaleX(0)' : 'scaleY(0)' }, { transform: 'none' }], 600, 750 + i * 70);
      });
    }, { threshold: 0.25 });
    mo.observe(map);
  });
})();
