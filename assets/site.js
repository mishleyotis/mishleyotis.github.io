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

  /* Prototype apps: attach the iframe only as its card approaches the
     viewport. These bundles are 2.4-4.7MB each and two sit on one page, so
     they must not ride on the initial page load - and the native
     loading="lazy" threshold fetched them anyway. */
  function liveframes() {
    var cards = [].slice.call(document.querySelectorAll('.liveframe[data-app]'));
    if (!cards.length) return;
    function attach(card) {
      if (card.dataset.attached) return;
      card.dataset.attached = '1';
      var f = document.createElement('iframe');
      f.src = card.getAttribute('data-app');
      f.title = card.getAttribute('data-app-title') || 'Prototype';
      f.setAttribute('loading', 'eager');
      card.appendChild(f);
    }
    if (!('IntersectionObserver' in window)) { cards.forEach(attach); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { attach(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '300px 0px' });
    cards.forEach(function (c) { io.observe(c); });
  }

  /* 4. phone menu - one consistent Menu button and panel below 720px.
     Pages, the six projects, this page's own sections (case studies) and
     Contact, built from a fixed list so every page offers the same routes. */
  function mobilemenu() {
    var header = document.querySelector('header');
    var bar = header && header.firstElementChild;
    if (!bar || !bar.querySelector('nav')) return;
    var here = (location.pathname.split('/').pop() || 'index.html');
    var pages = [['index.html', 'Home'], ['my-story.html', 'My story'], ['projects.html', 'Projects'],
                 ['volunteer-work.html', 'Volunteer work'], ['tech-stack.html', 'Tech stack']];
    var projects = [['dma-insights.html', 'DMA Insights'], ['dma-plugin.html', 'The 47-agent assessment plugin'],
                    ['capability-intelligence.html', 'Capability Intelligence Agent'],
                    ['pmo-knowledge-agent.html', 'Project management office knowledge agent'],
                    ['automation-fabric.html', 'Scheduling bot and automation'], ['float-desserts.html', 'Brand launch strategy']];
    function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
    function link(href, label, num) {
      var cur = href === here ? ' aria-current="page"' : '';
      return '<a class="mm-l" href="' + href + '"' + cur + '><span>' + (num ? '<span class="num">' + num + '</span>' : '') + esc(label) + '</span></a>';
    }
    var html = '';
    var own = [].slice.call(bar.querySelectorAll('nav a[href^="#"]')).filter(function (a) { return a.getAttribute('href') !== '#contact'; });
    if (own.length) {
      html += '<div class="mm-h">On this page</div>';
      own.forEach(function (a) { html += link(a.getAttribute('href'), a.textContent.trim()); });
      html += '<div class="mm-h">Pages</div>';
    }
    var onProject = false; // start collapsed everywhere so Contact stays in view
    pages.forEach(function (p) {
      if (p[0] !== 'projects.html') { html += link(p[0], p[1]); return; }
      html += '<button type="button" class="mm-l mm-drop" aria-expanded="' + onProject + '" aria-controls="mm-projects">' +
              '<span>Projects</span><span class="chev" aria-hidden="true"></span></button>' +
              '<div class="mm-sub" id="mm-projects"' + (onProject ? '' : ' hidden') + '>' +
              link('projects.html', 'All six projects');
      projects.forEach(function (q, i) { html += link(q[0], q[1], '0' + (i + 1)); });
      html += '</div>';
    });
    var contact = document.getElementById('contact') ? '#contact' : 'index.html#contact';
    html += '<a class="mm-l mm-contact" href="' + contact + '"><span>Contact</span><span class="hint">Email · phone · LinkedIn</span></a>';

    var panel = document.createElement('div');
    panel.className = 'mmenu'; panel.id = 'mmenu'; panel.innerHTML = html;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'mmenu-btn';
    btn.setAttribute('aria-controls', 'mmenu'); btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="bars" aria-hidden="true"></span><span>Menu</span>';
    bar.appendChild(btn);
    header.appendChild(panel);
    document.documentElement.classList.add('has-mmenu');

    function set(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.lastChild.textContent = open ? 'Close' : 'Menu';
      panel.classList.toggle('open', open);
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    var drop = panel.querySelector('.mm-drop'), sub = panel.querySelector('.mm-sub');
    if (drop) drop.addEventListener('click', function () {
      var open = drop.getAttribute('aria-expanded') !== 'true';
      drop.setAttribute('aria-expanded', open ? 'true' : 'false');
      sub.hidden = !open;
    });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    document.addEventListener('click', function (e) { if (!header.contains(e.target)) set(false); });
  }

  function init() { mobilemenu(); reveal(); tilt(); liveframes(); setTimeout(anchor, 60); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
