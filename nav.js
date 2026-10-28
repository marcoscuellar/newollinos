// ŌLLIN site nav: builds the header on every page so links stay in one place.
(function () {
  var here = document.body.getAttribute('data-page') || 'home';
  // One home per link. Product = what it is; For staffing = what you use it for; Our approach = how and who.
  var M = {
    product: { label: 'Product', cols: [
      { lbl: 'Platform', links: [
        ['/#how', 'ŌLLIN OS', 'Finds the signal and the people behind it.'],
        ['/#platform', 'ŌLLIN GO', 'Where the work runs. Nothing sends without your yes.'] ] },
      { lbl: 'Features', links: [
        ['/client-mapping', 'Client mapping', 'Map the whole account, not one contact.', 'mushroom'],
        ['/campaigns', 'Campaigns', 'Approve tonight. It goes out in the morning.', 'sending'] ] } ] },
    staffing: { label: 'For staffing', cols: [
      { lbl: 'For staffing teams', links: [
        ['/redeploy', 'Redeploy', 'Line up the next seat before the last one ends. Consultants stay anonymous.', 'redeploy'],
        ['/client-mapping', 'Account expansion', 'One placement. The whole department.'],
        ['/client-mapping', 'Quiet hiring managers', 'Know who’s next when one contact goes quiet.'] ] } ] },
    approach: { label: 'Our approach', cols: [
      { lbl: 'Our approach', links: [
        ['/#trust', 'How we work', 'Every claim has a source. Verified, inferred or withheld. Never guessed.'],
        ['/#founder', 'Who built it', 'People who’ve worked the desk. Real workflows, real careers.'] ] } ] }
  };
  var logo = document.getElementById('sn-logo-src');
  var logoSvg = logo ? logo.innerHTML : 'ŌLLIN';
  var caret = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 3.5 3 3 3-3"/></svg>';
  var talk = here === 'home' ? '#contact' : '/#contact';

  var html = '<div class="sn-bar"><a class="sn-logo" href="/" aria-label="ŌLLIN home">' + logoSvg + '</a>' +
    '<div class="sn-menus"><span class="sn-pill" aria-hidden="true"></span>';
  Object.keys(M).forEach(function (id) {
    html += '<button type="button" class="sn-btn" data-menu="' + id + '" aria-expanded="false" aria-controls="sn-panel">' + M[id].label + caret + '</button>';
  });
  html += '<button type="button" class="sn-burger" aria-expanded="false" aria-controls="sn-panel">Menu</button></div>' +
    '<a class="sn-cta" href="' + talk + '">Let’s talk</a></div><div id="sn-panel" class="sn-panel" hidden></div>';

  var header = document.querySelector('header.sn');
  header.innerHTML = html;
  var panel = header.querySelector('#sn-panel');
  var pill = header.querySelector('.sn-pill');
  var btns = [].slice.call(header.querySelectorAll('.sn-btn'));
  var burger = header.querySelector('.sn-burger');
  var open = null;
  var phone = window.matchMedia('(max-width: 860px)');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  function col(c) {
    return '<div class="sn-col"><div class="sn-lbl">' + c.lbl + '</div>' + c.links.map(function (l) {
      var mark = l[3] && l[3] === here ? '<span class="sn-here" aria-hidden="true"></span>' : '';
      return '<a class="sn-link" href="' + l[0] + '"><span class="sn-t">' + mark + l[1] + '</span><span class="sn-d">' + l[2] + '</span></a>';
    }).join('') + '</div>';
  }
  // Put the panel under the button that opened it, kept inside the screen.
  function place(btn) {
    if (phone.matches || !btn) { panel.style.left = ''; return; }
    var h = header.getBoundingClientRect(), b = btn.getBoundingClientRect();
    var left = b.left - h.left - 4;
    var maxLeft = h.width - panel.offsetWidth - 24;
    panel.style.left = Math.max(24, Math.min(left, maxLeft)) + 'px';
  }
  function render(ids, btn) {
    var wasOpen = !panel.hidden;
    var oldH = wasOpen ? panel.offsetHeight : 0;
    var cols = [];
    ids.forEach(function (id) { cols = cols.concat(M[id].cols); });
    panel.style.setProperty('--cols', cols.length);
    panel.classList.toggle('switching', wasOpen);
    panel.innerHTML = cols.map(col).join('');
    panel.hidden = false;
    if (!wasOpen) {
      panel.classList.add('no-slide'); place(btn); void panel.offsetWidth; panel.classList.remove('no-slide');
      // restart the drop animation only when opening from closed
      panel.style.animation = 'none'; void panel.offsetWidth; panel.style.animation = '';
    } else {
      place(btn);
      if (!calm.matches && panel.animate) {
        panel.animate([{ height: oldH + 'px' }, { height: panel.offsetHeight + 'px' }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
        [].slice.call(panel.children).forEach(function (c) { c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' }); });
      }
    }
  }
  function movePill(btn) {
    if (!btn) { pill.style.opacity = 0; return; }
    pill.style.width = btn.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
    pill.style.opacity = 1;
  }
  function show(id) {
    clearTimeout(timer);
    if (open === id) return;
    open = id;
    btns.forEach(function (b) { b.setAttribute('aria-expanded', String(b.dataset.menu === id)); });
    burger.setAttribute('aria-expanded', String(id === 'all'));
    if (id === 'all') { render(Object.keys(M), null); movePill(null); return; }
    var btn = btns.filter(function (b) { return b.dataset.menu === id; })[0];
    render([id], btn);
    movePill(btn);
  }
  function close() {
    clearTimeout(timer);
    open = null; panel.hidden = true; movePill(null);
    btns.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    burger.setAttribute('aria-expanded', 'false');
  }
  // Hover intent: a short pause before switching or closing, so sliding the mouse past a button doesn't flip the menu.
  var timer = null;
  function later(fn, ms) { clearTimeout(timer); timer = setTimeout(fn, ms); }
  var hoverOK = window.matchMedia('(hover: hover)').matches;
  btns.forEach(function (b) {
    if (hoverOK) {
      b.addEventListener('mouseenter', function () { open && open !== b.dataset.menu ? later(function () { show(b.dataset.menu); }, 140) : show(b.dataset.menu); });
    }
    b.addEventListener('click', function () { open === b.dataset.menu ? close() : show(b.dataset.menu); });
  });
  if (hoverOK) {
    panel.addEventListener('mouseenter', function () { clearTimeout(timer); });
    header.addEventListener('mouseleave', function () { if (open && open !== 'all') later(close, 260); });
    header.addEventListener('mouseenter', function () { if (open && open !== 'all') clearTimeout(timer); });
  }
  burger.addEventListener('click', function () { open === 'all' ? close() : show('all'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) { close(); } });
  document.addEventListener('click', function (e) { if (open && !header.contains(e.target)) close(); });
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  window.addEventListener('resize', function () { if (open && open !== 'all') place(btns.filter(function (b) { return b.dataset.menu === open; })[0]); });
  // Frosted glass once the page has scrolled
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
