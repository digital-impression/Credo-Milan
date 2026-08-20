(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header: transparent → solid ink ---------- */
  var header = document.getElementById('site-header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 40);
  }
  onScrollHeader();

  /* ---------- Mobile menu ---------- */
  var menuBtn   = document.getElementById('menu-btn');
  var menu      = document.getElementById('mobile-menu');
  var iconOpen  = document.getElementById('menu-icon-open');
  var iconClose = document.getElementById('menu-icon-close');

  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    if (iconOpen)  iconOpen.classList.toggle('hidden', open);
    if (iconClose) iconClose.classList.toggle('hidden', !open);
    if (header && open) header.classList.add('is-solid');
    else onScrollHeader();
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(menu.hidden);
    });
  }
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && !menu.hidden) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  // Close the menu if the viewport grows past the lg breakpoint
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && menu && !menu.hidden) setMenu(false);
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Stat count-up ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!('IntersectionObserver' in window)) {
    counters.forEach(function (el) {
      el.textContent = (el.getAttribute('data-count') || '') + (el.getAttribute('data-suffix') || '');
    });
  } else {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Hero video: autoplay loop, pause control, reduced motion ---------- */
  var heroVideo  = document.getElementById('hero-video');
  var vToggle    = document.getElementById('video-toggle');
  var vPause     = document.getElementById('vt-pause');
  var vPlay      = document.getElementById('vt-play');

  function setVideoUI(playing) {
    if (!vToggle) return;
    vToggle.setAttribute('aria-label', playing ? 'Pauzeer de achtergrondvideo' : 'Speel de achtergrondvideo af');
    if (vPause) vPause.classList.toggle('hidden', !playing);
    if (vPlay)  vPlay.classList.toggle('hidden', playing);
  }

  if (heroVideo && vToggle) {
    // The control only appears once we know there is real footage playing —
    // with no video file the poster image shows and the button stays hidden.
    heroVideo.addEventListener('playing', function () {
      vToggle.hidden = false;
      vToggle.classList.add('flex');
      setVideoUI(true);
    }, { once: true });

    if (reduce) {
      heroVideo.autoplay = false;
      heroVideo.pause();
    } else {
      // Some browsers reject autoplay; ignore the rejection and keep the poster.
      var pr = heroVideo.play();
      if (pr && typeof pr.catch === 'function') pr.catch(function () {});
    }

    vToggle.addEventListener('click', function () {
      if (heroVideo.paused) { heroVideo.play().catch(function () {}); setVideoUI(true); }
      else { heroVideo.pause(); setVideoUI(false); }
    });
  }

  /* ---------- Hero parallax (slow, transform only) ---------- */
  var heroImg = heroVideo || document.getElementById('hero-img');
  var ticking = false;
  function parallax() {
    if (!heroImg || reduce) return;
    var y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroImg.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(2) + 'px,0)';
    }
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollHeader();
      parallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  parallax();

  /* ---------- Converging hairlines draw in with the stats ---------- */
  var converge = document.querySelector('.converge');
  if (converge) {
    if (reduce || !('IntersectionObserver' in window)) {
      converge.classList.add('is-drawn');
    } else {
      var cObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-drawn');
            cObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      cObs.observe(converge);
    }
  }

  /* ---------- Photo-filled display type ---------- */
  document.querySelectorAll('[data-fill]').forEach(function (el) {
    var url = el.getAttribute('data-fill');
    if (!url) return;
    // The property is consumed by a background-image in credo.css, and a
    // relative url() there resolves against the stylesheet, not the page —
    // which puts it under /assets/css/. Hand it an absolute URL instead.
    var abs = new URL(url, document.baseURI).href;
    var pre = new Image();
    pre.onload = function () {
      el.style.setProperty('--credo-fill', 'url("' + abs + '")');
      el.classList.add('has-fill');
    };
    pre.src = url;
  });

  /* ---------- Team cards: tap to reveal on touch devices ---------- */
  document.querySelectorAll('.team-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.team-card');
      if (!card) return;
      var open = card.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- Team rail ----------
     The rail scrolls on its own with overflow, so this only adds the arrows
     and the credentials toggle. Nothing here is required to read the roster. */
  document.querySelectorAll('[data-team-rail]').forEach(function (rail) {
    var nav  = rail.parentElement.querySelector('.team-rail-nav');
    var prev = nav && nav.querySelector('[data-rail-prev]');
    var next = nav && nav.querySelector('[data-rail-next]');

    if (prev && next) {
      function step() {
        var card = rail.querySelector('.team-cardx');
        return card ? card.getBoundingClientRect().width + 20 : 300;
      }
      function sync() {
        var max = rail.scrollWidth - rail.clientWidth - 2;
        prev.disabled = rail.scrollLeft <= 2;
        next.disabled = rail.scrollLeft >= max;
      }
      prev.addEventListener('click', function () { rail.scrollBy({ left: -step() * 2, behavior: reduce ? 'auto' : 'smooth' }); });
      next.addEventListener('click', function () { rail.scrollBy({ left:  step() * 2, behavior: reduce ? 'auto' : 'smooth' }); });
      rail.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      sync();
    }

    rail.querySelectorAll('[data-team-toggle]').forEach(function (btn) {
      var card = btn.closest('[data-team-card]');
      btn.addEventListener('click', function () {
        var open = card.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.firstElementChild.textContent = open ? 'sluit' : 'info';
      });
    });
  });

  /* ---------- Clips that only run while pointed at ----------
     The chooser doors hold still until you hover or tab to them, so the page
     opens on two photographs and the movement is the reward for choosing.
     A device without hover never gets that cue, so there the clips just run. */
  var hoverClips = document.querySelectorAll('[data-hover-play]');
  if (hoverClips.length) {
    var canHover = window.matchMedia('(hover: hover)').matches;

    hoverClips.forEach(function (v) {
      if (reduce) return;                      // stays on its poster frame

      if (!canHover) {
        v.autoplay = true;
        var p = v.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
        return;
      }

      var host = v.closest('a') || v.parentElement;
      if (!host) return;

      function start() {
        var pr = v.play();
        if (pr && typeof pr.catch === 'function') pr.catch(function () {});
      }
      function stop() {
        v.pause();
        v.currentTime = 0;                     // next hover starts the clip over
      }

      host.addEventListener('mouseenter', start);
      host.addEventListener('mouseleave', stop);
      host.addEventListener('focus', start);
      host.addEventListener('blur', stop);
    });
  }

  /* ---------- Lead forms ----------------------------------------------
     Set CREDO.formEndpoint in assets/js/credo-config.js and every form here
     posts to it as JSON. While it is empty the form hands the entry to the
     visitor's mail client instead — an aanvraag that goes nowhere is worse
     than no form, so nothing here ever reports a success that did not happen.
     -------------------------------------------------------------------- */
  var MAILTO  = 'info@credokinesitherapie.be';
  var CONFIG  = window.CREDO || {};

  function setStatus(el, msg, ok) {
    el.textContent = msg;
    el.className = el.className.replace(/text-(taupe2|bone\/70)/g, '') + (ok ? ' text-taupe2' : ' text-bone/70');
  }

  function collect(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && el.type !== 'submit') data[el.name] = (el.value || '').trim();
    });
    return data;
  }

  function viaMail(subject, data, status) {
    var body = Object.keys(data).map(function (k) {
      return k.charAt(0).toUpperCase() + k.slice(1) + ': ' + data[k];
    }).join('\n');
    setStatus(status, 'Je mailprogramma opent met je gegevens. Verstuur de mail om de aanvraag af te ronden — of bel ons op +32 480 62 85 45.', true);
    window.location.href = 'mailto:' + MAILTO +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  document.querySelectorAll('[data-lead-form]').forEach(function (form) {
    var status = form.querySelector('[data-lead-status]');
    if (!status) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = collect(form);

      if (!data.naam) {
        setStatus(status, 'Vul je naam in.', false);
        form.querySelector('[name="naam"]').focus();
        return;
      }
      if (!data.telefoon || data.telefoon.replace(/\D/g, '').length < 8) {
        setStatus(status, 'Vul een telefoonnummer in waarop we je kunnen bereiken.', false);
        form.querySelector('[name="telefoon"]').focus();
        return;
      }
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
        setStatus(status, 'Dat e-mailadres klopt niet.', false);
        form.querySelector('[name="email"]').focus();
        return;
      }

      var subject = form.getAttribute('data-subject') || 'Aanvraag via de website';

      if (!CONFIG.formEndpoint) { viaMail(subject, data, status); return; }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; }
      setStatus(status, 'Bezig met versturen…', true);

      fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ subject: subject, page: location.pathname, fields: data })
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        setStatus(status, 'Bedankt — we bellen je binnen twee werkdagen terug.', true);
        form.reset();
      }).catch(function () {
        setStatus(status, 'Versturen lukte niet. Bel ons op +32 480 62 85 45 of mail naar ' + MAILTO + '.', false);
      }).then(function () {
        if (btn) { btn.disabled = false; }
      });
    });
  });

  /* ---------- Newsletter ---------- */
  var form   = document.getElementById('newsletter-form');
  var status = document.getElementById('newsletter-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('newsletter-email');
      var value = (input.value || '').trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      if (!valid) {
        status.textContent = 'Vul een geldig e-mailadres in.';
        status.className = 'mt-3 text-[13px] text-bone/70 min-h-[20px]';
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      // Same rule as the lead forms: without an endpoint nothing is stored, so
      // the visitor is handed to mail rather than told they are subscribed.
      if (!CONFIG.formEndpoint) {
        status.textContent = 'Je mailprogramma opent — verstuur de mail om je inschrijving te bevestigen.';
        status.className = 'mt-3 text-[13px] text-taupe2 min-h-[20px]';
        window.location.href = 'mailto:' + MAILTO + '?subject=' +
          encodeURIComponent('Inschrijving nieuwsbrief') + '&body=' + encodeURIComponent('E-mail: ' + value);
        return;
      }
      fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ subject: 'Inschrijving nieuwsbrief', fields: { email: value } })
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        status.textContent = 'Bedankt — je bent ingeschreven.';
        status.className = 'mt-3 text-[13px] text-taupe2 min-h-[20px]';
        form.reset();
      }).catch(function () {
        status.textContent = 'Inschrijven lukte niet. Mail ons op ' + MAILTO + '.';
        status.className = 'mt-3 text-[13px] text-bone/70 min-h-[20px]';
      });
    });
  }

  /* ---------- Smooth anchor scrolling with header offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      // move keyboard focus along with the view
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

})();
