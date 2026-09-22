/* ══════════════════════════════════════════════
   CultureShare — interactions
   ══════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* CSS hides the handsets only once this lands, so a script that never runs
     leaves them on screen rather than blank */
  document.documentElement.classList.add('js');
  var px = function (id, w) {
    return 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id +
           '.jpeg?auto=compress&cs=tinysrgb&w=' + (w || 400);
  };

  /* ─────────── hero capsules ─────────── */
  /* Each capsule cycles through its own set of photos, so the headline itself
     becomes a slow-moving collage of the cultures the product is about. */
  var POOLS = {
    a: [35034055, 30518545, 12716001],
    b: [34735511, 34329972, 39068198],
    c: [30803489, 28530092, 34734122],
    d: [8655023, 38487458, 36773397],
    e: [35273638, 29077024, 18330807],
    f: [13033125, 31656026, 37042724]
  };

  var caps = $$('.hero__h .cap');

  caps.forEach(function (cap) {
    var ids = POOLS[cap.dataset.pool] || [];
    ids.forEach(function (id, i) {
      var img = new Image();
      img.src = px(id, 420);
      img.alt = '';
      img.loading = 'eager';
      img.decoding = 'async';
      if (i === 0) img.className = 'show';
      cap.appendChild(img);
    });
    cap._i = 0;
  });

  function cycleCaps() {
    caps.forEach(function (cap, k) {
      var imgs = $$('img', cap);
      if (imgs.length < 2) return;
      setTimeout(function () {
        imgs[cap._i].classList.remove('show');
        cap._i = (cap._i + 1) % imgs.length;
        imgs[cap._i].classList.add('show');
      }, k * 260);
    });
  }
  if (!REDUCED) setInterval(cycleCaps, 4200);

  /* subtle depth: capsules drift with the pointer */
  if (!REDUCED && window.matchMedia('(hover:hover)').matches) {
    var heroEl = $('#hero');
    if (heroEl) {
      heroEl.addEventListener('pointermove', function (e) {
        var r = heroEl.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        caps.forEach(function (cap, i) {
          var d = (i % 3 + 1) * 5;
          cap.style.translate = (nx * d).toFixed(1) + 'px ' + (ny * d * 0.6).toFixed(1) + 'px';
        });
      });
      heroEl.addEventListener('pointerleave', function () {
        caps.forEach(function (cap) { cap.style.translate = ''; });
      });
    }
  }

  /* ─────────── preloader ─────────── */
  var loader = $('#loader');
  function startHero() {
    var h = $('#hero');
    if (h) h.classList.add('in');
  }
  function finishLoad() {
    if (loader && !loader.classList.contains('done')) {
      loader.classList.add('done');
      startHero();
    }
  }
  window.addEventListener('load', function () {
    setTimeout(finishLoad, REDUCED ? 60 : 850);
  });
  setTimeout(finishLoad, 3500);

  /* ─────────── year ─────────── */
  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ─────────── header / progress ─────────── */
  var head = $('#head'), prog = $('#progress'), lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (head) {
      head.classList.toggle('stuck', y > 60);
      if (!document.body.classList.contains('menu')) {
        head.classList.toggle('hide', y > 460 && y > lastY);
      }
    }
    if (prog) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─────────── smooth anchors ─────────── */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      closeMenu();
      closeOk();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 84);
      window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });

  /* ─────────── mobile menu ─────────── */
  var burger = $('#burger');
  function closeMenu() {
    document.body.classList.remove('menu', 'lock');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    var m = $('#mmenu');
    if (m) m.setAttribute('aria-hidden', 'true');
  }
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu');
      document.body.classList.toggle('lock', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      var m = $('#mmenu');
      if (m) m.setAttribute('aria-hidden', String(!open));
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenu(); closeOk(); }
  });

  /* ─────────── reveal on scroll ─────────── */
  var rvIO = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, d = parseInt(el.dataset.d || '0', 10);
      setTimeout(function () { el.classList.add('in'); }, REDUCED ? 0 : d);
      rvIO.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(function (el) { rvIO.observe(el); });

  /* the oversized headline unrolls word by word once the section arrives */
  var why = $('#pillars');
  if (why) {
    var whyIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        why.classList.add('in');
        whyIO.unobserve(why);
      });
    }, { threshold: 0.2 });
    whyIO.observe(why);
  }

  /* the arc of photographs swings up into its dome as the section enters */
  var dome = $('#dome');
  if (dome) {
    var domeIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        dome.classList.add('in');
        var stage = dome.closest('.prob__stage');
        if (stage) stage.classList.add('in');
        domeIO.unobserve(dome);
      });
    }, { threshold: 0.12 });
    domeIO.observe(dome);
  }

  /* the handsets rise off the arch, the side pair last */
  var appStage = $('.app__stage');
  if (appStage) {
    var appIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        appIO.unobserve(en.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    appIO.observe(appStage);
  }

  /* the manifesto cards drop onto their pins, one after the next */
  var mgrid = $('.mgrid');
  if (mgrid) {
    var manIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        manIO.unobserve(en.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
    manIO.observe(mgrid);
  }

  /* ─────────── counters ─────────── */
  var cIO = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      cIO.unobserve(el);
      var end = parseFloat(el.dataset.count), sfx = el.dataset.suffix || '';
      if (REDUCED) { el.textContent = end.toLocaleString() + sfx; return; }
      var dur = 1500, t0 = performance.now();
      (function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        var v = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * v).toLocaleString() + sfx;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(function (el) { cIO.observe(el); });

  /* ─────────── magnetic buttons ─────────── */
  if (!REDUCED && window.matchMedia('(hover:hover)').matches) {
    $$('.mag').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.2;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ─────────── parallax ─────────── */
  if (!REDUCED) {
    var heroBg = $('#heroBg'), heroIn = $('#heroIn');
    var pcards = $$('.pcard'), PDEPTH = [-54, -18, -68, -26, -44];
    var ticking = false;
    var run = function () {
      var y = window.scrollY, vh = window.innerHeight;

      if (heroBg && y < vh * 1.3) {
        heroBg.style.transform = 'translate3d(0,' + (y * 0.24).toFixed(1) + 'px,0)';
      }
      /* headline drifts up and dissolves as you leave the hero */
      if (heroIn && y < vh) {
        var p = y / vh;
        heroIn.style.transform = 'translate3d(0,' + (-y * 0.16).toFixed(1) + 'px,0)';
        heroIn.style.opacity = String(Math.max(0, 1 - p * 1.35));
      }
      /* the pillar cards drift at slightly different rates, so the row
         breathes as it passes rather than moving as one slab */
      if (pcards.length) {
        var pr = pcards[0].getBoundingClientRect();
        if (pr.top < vh && pr.bottom > -200) {
          var t = (vh - pr.top) / (vh + pr.height) - 0.5;
          for (var i = 0; i < pcards.length; i++) {
            pcards[i].style.setProperty('--py', (t * PDEPTH[i]).toFixed(1) + 'px');
          }
        }
      }

      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(run); }
    }, { passive: true });
    run();
  }

  /* ─────────── community collage ─────────── */
  /* Cards drift toward the pointer at their own depth. The float keyframes own
     `transform`, so this writes `translate` instead and the two compose. */
  var stage = $('#pplStage');
  if (stage && !REDUCED && window.matchMedia('(hover:hover)').matches) {
    /* depths are read once — reading computed style per pointermove would
       force a style recalc on every frame */
    var cards = $$('.cc', stage).map(function (el) {
      return { el: el, d: parseFloat(getComputedStyle(el).getPropertyValue('--dep')) || 1 };
    });
    var pending = false, px = 0, py = 0;
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        for (var i = 0; i < cards.length; i++) {
          cards[i].el.style.setProperty('--tx', (px * cards[i].d * -9).toFixed(1) + 'px');
          cards[i].el.style.setProperty('--ty', (py * cards[i].d * -7).toFixed(1) + 'px');
        }
      });
    });
    stage.addEventListener('pointerleave', function () {
      cards.forEach(function (c) {
        c.el.style.setProperty('--tx', '0px');
        c.el.style.setProperty('--ty', '0px');
      });
    });
  }

  /* ─────────── explore strip ─────────── */
  var slides = $$('.sl');
  slides.forEach(function (sl) {
    var open = function () {
      slides.forEach(function (s) { s.classList.remove('on'); });
      sl.classList.add('on');
    };
    sl.addEventListener('mouseenter', open);
    sl.addEventListener('focus', open);
    sl.addEventListener('click', open);
  });

  /* ─────────── closing carousel ─────────── */
  /* A looping row of panels, each leaned toward the centre so the strip reads
     as a convex arc. Positions are computed arithmetically rather than with
     getBoundingClientRect, so no layout is forced per frame. */
  var ring = $('#ring'), ringStage = $('#ringStage');
  if (ring && ringStage) {
    var panels = $$('figure', ring);
    var n = panels.length / 2;                 /* second half is the clone */
    var step = 0, span = 0, offset = 0;
    var DRIFT = 0.55, vel = 0, dragging = false, lastX = 0, hovering = false;
    var raf = null;

    var measure = function () {
      var cs = getComputedStyle(ringStage);
      var w = parseFloat(cs.getPropertyValue('--w'));
      var gap = parseFloat(cs.getPropertyValue('--gap'));
      if (!w) { var r = panels[0].getBoundingClientRect(); w = r.width; gap = 16; }
      step = w + gap;
      span = step * n;
      return w;
    };
    var W = measure();
    window.addEventListener('resize', function () { W = measure(); }, { passive: true });

    var LEAN = 42, DEPTH = 150;
    var draw = function () {
      var halfStage = ringStage.clientWidth / 2;
      ring.style.transform = 'translateY(-50%) translateX(' + (-offset).toFixed(2) + 'px)';
      for (var i = 0; i < panels.length; i++) {
        var centre = i * step + W / 2 - offset;
        var norm = (centre - halfStage) / halfStage;      /* -1 … 1 across the frame */
        if (norm < -2.2 || norm > 2.2) { panels[i].style.visibility = 'hidden'; continue; }
        panels[i].style.visibility = 'visible';
        var t = Math.max(-1.4, Math.min(1.4, norm));
        panels[i].style.transform =
          'rotateY(' + (-t * LEAN).toFixed(2) + 'deg) translateZ(' + (-Math.abs(t) * DEPTH).toFixed(1) + 'px)';
      }
    };

    var tick = function () {
      if (!dragging) {
        if (!hovering) offset += DRIFT;
        if (Math.abs(vel) > 0.05) { offset += vel; vel *= 0.93; }
      }
      if (offset >= span) offset -= span;
      if (offset < 0) offset += span;
      draw();
      raf = requestAnimationFrame(tick);
    };
    var start = function () { if (!raf && !REDUCED) raf = requestAnimationFrame(tick); };
    var stop = function () { if (raf) { cancelAnimationFrame(raf); raf = null; } };

    var ringIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.isIntersecting ? start() : stop(); });
    }, { threshold: 0.02 });
    ringIO.observe(ringStage);
    draw();

    if (!REDUCED) {
      ringStage.addEventListener('pointerenter', function () { hovering = true; });
      ringStage.addEventListener('pointerleave', function () { hovering = false; });
      ringStage.addEventListener('pointerdown', function (e) {
        dragging = true; lastX = e.clientX; vel = 0;
        ringStage.setPointerCapture(e.pointerId);
      });
      ringStage.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - lastX; lastX = e.clientX;
        offset -= dx;
        vel = -dx;
        if (offset >= span) offset -= span;
        if (offset < 0) offset += span;
        draw();
      });
      var release = function () { dragging = false; };
      ringStage.addEventListener('pointerup', release);
      ringStage.addEventListener('pointercancel', release);
    }
  }

  /* ─────────── waitlist ─────────── */
  var form = $('#wlForm'), email = $('#wlEmail'), row = $('#wlRow'),
      note = $('#wlNote'), ok = $('#ok');
  var KEY = 'cultureshare_waitlist';
  var DEFAULT_NOTE = note ? note.textContent : '';

  function getList() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (e) { return []; }
  }
  function save(v) {
    try {
      var l = getList(); l.push(v);
      localStorage.setItem(KEY, JSON.stringify(l));
    } catch (e) { /* storage blocked — the flow still completes */ }
  }
  function setNote(txt, bad) {
    if (!note) return;
    note.textContent = txt;
    note.classList.toggle('bad', !!bad);
  }
  function openOk() {
    if (!ok) return;
    ok.classList.add('open');
    ok.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
    var b = $('.btn', ok); if (b) b.focus();
  }
  function closeOk() {
    if (!ok || !ok.classList.contains('open')) return;
    ok.classList.remove('open');
    ok.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
  }

  if (email) {
    email.addEventListener('input', function () {
      if (row) row.classList.remove('bad');
      setNote(DEFAULT_NOTE, false);
    });
  }
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (email.value || '').trim().toLowerCase();
      var valid = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);

      if (!valid) {
        if (row) row.classList.add('bad');
        setNote('Please enter a valid email address.', true);
        email.focus();
        return;
      }
      if (getList().indexOf(v) !== -1) {
        setNote("You're already on the CultureShare waitlist. We'll keep you posted.", false);
        return;
      }
      save(v);
      email.value = '';
      setNote(DEFAULT_NOTE, false);
      openOk();
    });
  }
  var okX = $('#okX'), okBack = $('#okBack');
  if (okX) okX.addEventListener('click', closeOk);
  if (okBack) okBack.addEventListener('click', closeOk);
  if (ok) ok.addEventListener('click', function (e) { if (e.target === ok) closeOk(); });
})();
