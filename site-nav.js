// Menu for the shared nav bar (markup: tools/site_nav.py, styles: /site-nav.css).
// Loaded right after the bar so the folded menu applies before the first paint.

// A jump link from another page (/streamline#start, /#proof) can start scrolling before
// the scroll sections above its target have their full height, and stop short. Land again
// each time the page height changes, until the reader takes over or the page settles.
(function () {
  var id = location.hash.slice(1);
  var entry = window.performance && performance.getEntriesByType('navigation')[0];
  if (!id || !window.ResizeObserver || (entry && entry.type !== 'navigate')) return; // Back and reload keep their own spot.
  var inputs = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'hashchange'];
  var watch = new ResizeObserver(function () {
    var target = document.getElementById(id);
    // 'instant' on purpose: 'auto' would inherit smooth scrolling and race the page again.
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  function stop() {
    watch.disconnect();
    inputs.forEach(function (name) { removeEventListener(name, stop, true); });
  }
  inputs.forEach(function (name) { addEventListener(name, stop, { capture: true, passive: true }); });
  addEventListener('load', function () { setTimeout(stop, 5000); });
  setTimeout(stop, 10000);
  watch.observe(document.body);
})();

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
