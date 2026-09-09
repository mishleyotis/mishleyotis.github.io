/* Behaviour the static export dropped, restored verbatim in intent from the
   design-canvas source (class Component extends DCLogic):
     1. scroll reveal  - adds .in as .rv elements enter the viewport
     2. portrait tilt  - 3D tilt on the hero portrait, fine pointers only
     3. anchor rescue  - re-applies #hash once layout has settled, so arriving
                         from another page (e.g. Portfolio.html#contact) lands
                         on the right section instead of the top
   Plain DOM, no framework, no build step. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function reveal() {
    var els = [].slice.call(document.querySelectorAll('.rv'));
    if (!els.length) return;
    // No observer, or motion is unwelcome: leave every section at its visible
    // resting state and never arm the hidden rule.
    if (reduce || !('IntersectionObserver' in window)) return;

    // Release whatever is already on screen BEFORE arming, so nothing above
    // the fold is ever painted at opacity 0.
    var vh = window.innerHeight || document.documentElement.clientHeight || 0;
    var pending = [];
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.95) el.classList.add('in');
      else pending.push(el);
    });
    var root = document.documentElement;
    root.classList.add('reveal-armed');
    // Enable transitions only after the hidden state has been painted.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('reveal-ready'); });
    });
    if (!pending.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    pending.forEach(function (el) { io.observe(el); });
  }

  function tilt() {
    var stage = document.getElementById('portraitStage');
    var el = document.getElementById('portraitTilt');
    if (!stage || !el) return;
    var rest = 'rotateY(-6deg) rotateX(3deg)';
    if (reduce || !(window.matchMedia && window.matchMedia('(pointer:fine)').matches)) return;
    el.style.transform = rest;
    stage.addEventListener('mousemove', function (ev) {
      var r = stage.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width - 0.5;
      var y = (ev.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'rotateY(' + (x * 12).toFixed(2) + 'deg) rotateX(' + (-y * 10).toFixed(2) + 'deg)';
    });
    stage.addEventListener('mouseleave', function () { el.style.transform = rest; });
  }

  /* The browser tries to jump to #hash before fonts and images have settled the
     layout, which lands short. Re-apply it a few times, then stop. */
  function anchor() {
    var id = (location.hash || '').replace('#', '');
    if (!id) return;
    var tries = 12;
    (function jump() {
      var el = document.getElementById(id);
      if (el) {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 64 });
      } else if (--tries > 0) { setTimeout(jump, 120); }
    })();
  }

  function init() { reveal(); tilt(); setTimeout(anchor, 60); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
