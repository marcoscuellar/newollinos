// ŌLLIN site nav: one flat row of pages, built the same on every page.
(function () {
  var here = document.body.getAttribute('data-page') || 'home';
  var home = here === 'home';
  var L = {
    home: '/',
    map: '/client-mapping',
    camp: '/campaigns',
    redeploy: '/redeploy',
    trust: '/how-we-work',
    talk: home ? '#contact' : '/#contact'
  };
  var items = [
    ['mushroom', 'Client mapping', L.map],
    ['sending', 'Campaigns', L.camp],
    ['redeploy', 'Redeploy', L.redeploy],
    ['trust', 'How we work', L.trust]
  ];
  var logo = document.getElementById('sn-logo-src');
  var logoSvg = logo ? logo.innerHTML : 'ŌLLIN';
  function link(it, cls) {
    var cur = it[0] === here ? ' aria-current="page"' : '';
    return '<a class="' + cls + '" href="' + it[2] + '"' + cur + '>' + it[1] + '</a>';
  }
  var header = document.querySelector('header.sn');
  header.innerHTML =
    '<div class="sn-bar">' +
      '<a class="sn-logo" href="' + L.home + '" aria-label="ŌLLIN home">' + logoSvg + '</a>' +
      '<nav class="sn-links" aria-label="Main">' + items.map(function (it) { return link(it, 'sn-a'); }).join('') + '</nav>' +
      '<button type="button" class="sn-burger" aria-expanded="false" aria-controls="sn-panel">Menu</button>' +
      '<a class="sn-cta" href="' + L.talk + '">Let’s talk</a>' +
    '</div>' +
    '<div id="sn-panel" class="sn-panel sn-list" hidden>' + items.map(function (it) { return link(it, 'sn-row'); }).join('') + '</div>';

  var panel = header.querySelector('#sn-panel');
  var burger = header.querySelector('.sn-burger');
  function setOpen(open) { panel.hidden = !open; burger.setAttribute('aria-expanded', String(open)); }
  burger.addEventListener('click', function () { setOpen(panel.hidden); });
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); burger.focus(); } });
  document.addEventListener('click', function (e) { if (!panel.hidden && !header.contains(e.target)) setOpen(false); });
  // Frosted glass once the page has scrolled
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
