// Menu for the shared nav bar (markup: tools/site_nav.py, styles: /site-nav.css).
// Loaded right after the bar so the folded menu applies before the first paint.
(function () {
  var nav = document.querySelector('.ygn');
  var btn = nav && nav.querySelector('.ygn-toggle');
  if (!btn) return;
  document.documentElement.classList.add('ygn-js');

  function set(open) {
    nav.classList.toggle('ygn-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
  }
  btn.addEventListener('click', function () { set(!nav.classList.contains('ygn-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('ygn-open')) { set(false); btn.focus(); }
  });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) set(false); });
})();
