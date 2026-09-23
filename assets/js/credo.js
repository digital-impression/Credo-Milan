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
      heroImg.style.transform = 'translate3d(0,' + (y * 0.06).toFixed(2) + 'px,0)';
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

  /* ---------- De drie lijnen komen uit bij het cijfer een ----------
     Ze liepen naar het midden van de rechterkolom, en dat midden ligt tussen
     het cijfer en de zin eronder: ze kwamen dus nergens aan. Waar het cijfer
     staat hangt af van de letterhoogte, die met de schermbreedte meeschaalt,
     dus het staat niet vast in de opmaak. Hier wordt het gemeten. */
  /* De cijferrijen en het blok met het doel dragen allebei .reveal, en dat
     zet ze tot ze in beeld komen achtentwintig pixels lager. Meet je met
     getBoundingClientRect, dan meet je die verschuiving mee terwijl de kolom
     met de lijnen zelf niet verschuift, en beginnen de lijnen achtentwintig
     pixels naast hun rij. offsetTop kent die verschuiving niet en geeft de
     plaats zoals de indeling hem bedoelt. */
  function topIn(el, wortel) {
    var y = 0;
    while (el && el !== wortel) { y += el.offsetTop; el = el.offsetParent; }
    return y;
  }

  function tekenDoelLijnen() {
    var vak = document.querySelector('.doel-lijnen-vak');
    var svg = vak && vak.querySelector('.doel-lijnen-breed');
    if (!vak || !svg || !vak.offsetHeight) return;   /* verborgen op smal */
    var wortel = document.getElementById('cijfers');
    var rijen  = document.querySelectorAll('#cijfers .cijferrij');
    var cijfer = document.querySelector('#cijfers .doelkop');
    if (!wortel || !rijen.length || !cijfer) return;

    var top = topIn(vak, wortel), hoog = vak.offsetHeight;
    /* Het optische midden van de kop ligt iets boven het midden van haar
       regeldoos: Anton draagt boven de basislijn veel meer inkt dan eronder. */
    var mik = ((topIn(cijfer, wortel) + cijfer.offsetHeight * 0.46) - top) / hoog * 100;

    var paden = '';
    for (var i = 0; i < rijen.length; i++) {
      var y = ((topIn(rijen[i], wortel) + rijen[i].offsetHeight / 2) - top) / hoog * 100;
      paden += '<path d="M0 ' + y.toFixed(2) +
               ' C 58 ' + y.toFixed(2) + ', 42 ' + mik.toFixed(2) +
               ', 100 ' + mik.toFixed(2) + '"></path>';
    }
    svg.innerHTML = paden;
  }
  tekenDoelLijnen();
  /* Anton komt van een server en kan later binnenvallen. Dan staat het cijfer
     opeens ergens anders, dus wordt er opnieuw gemeten. */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(tekenDoelLijnen);
  var doelTimer;
  window.addEventListener('resize', function () {
    clearTimeout(doelTimer);
    doelTimer = setTimeout(tekenDoelLijnen, 150);
  });

  /* ---------- Converging hairlines draw in with the stats ----------
     Er staan er twee: een brede voor naast elkaar, en een staande die alleen
     op een telefoon meedoet. Beide horen te tekenen zodra ze in beeld komen. */
  var converges = document.querySelectorAll('.converge');
  if (converges.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      converges.forEach(function (el) { el.classList.add('is-drawn'); });
    } else {
      var cObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-drawn');
            cObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      converges.forEach(function (el) { cObs.observe(el); });
    }
  }

  /* ---------- De carrousel van de vloer ----------
     De kaart in het midden staat op ware grootte, de twee buren op 78 procent
     opzij en 84 procent groot, en de twee daarachter verder weg en kleiner.
     Wat verder ligt, gaat uit beeld. De verschuiving staat in procenten van
     de kaartbreedte, dus de hele rij schaalt mee met de maat die in de
     stylesheet staat, zonder dat hier getallen in pixels liggen. */
  document.querySelectorAll('[data-gal]').forEach(function (gal) {
    var baan    = gal.querySelector('[data-gal-baan]');
    var kaarten = [].slice.call(gal.querySelectorAll('[data-gal-kaart]'));
    if (!baan || kaarten.length < 3) return;

    var n = kaarten.length, actief = 0;
    var OPZIJ = [0, 78, 140], GROOT = [1, .84, .70], DOOR = [1, .92, .72];

    baan.classList.add('is-gal');     /* pas nu de gestapelde opmaak aan */

    function zet() {
      kaarten.forEach(function (k, i) {
        var d = ((i - actief) % n + n) % n;
        if (d > n / 2) d -= n;                    /* kortste weg, ook rond */
        var a = Math.abs(d), kant = d < 0 ? -1 : 1;
        var ver = a > 2;
        k.style.transform = 'translateX(' + (ver ? kant * 190 : kant * OPZIJ[a]) + '%)' +
                            ' scale(' + (ver ? .62 : GROOT[a]) + ')';
        k.style.opacity   = ver ? 0 : DOOR[a];
        k.style.zIndex    = ver ? 0 : 10 - a;
        k.style.visibility = ver ? 'hidden' : '';
      });
    }

    function stap(richting) { actief = ((actief + richting) % n + n) % n; zet(); }

    var vorige = gal.querySelector('[data-gal-prev]');
    var volgende = gal.querySelector('[data-gal-next]');
    if (vorige)   vorige.addEventListener('click', function () { stap(-1); });
    if (volgende) volgende.addEventListener('click', function () { stap(1); });

    /* Op een kaart naast het midden tikken brengt die naar voren. */
    kaarten.forEach(function (k, i) {
      k.addEventListener('click', function () { if (i !== actief) { actief = i; zet(); } });
    });

    /* Vegen. Vijfendertig pixels is genoeg om een veeg van een tik te
       onderscheiden zonder dat je ver hoeft te halen. */
    var startX = null;
    baan.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    baan.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 35) stap(dx < 0 ? 1 : -1);
    });
    baan.addEventListener('pointercancel', function () { startX = null; });

    zet();
  });

  /* ---------- De drie waarden klappen in op een telefoon ----------
     In de opmaak staan ze alle drie open, zodat zonder JS niets verborgen
     blijft. Past het niet naast elkaar, dan gaan ze alle drie dicht: zo staan
     de drie namen samen in beeld en open je wat je wil lezen. Wie zelf iets
     openklapt, houdt dat; er wordt pas opnieuw gesloten als het formaat echt
     over de grens gaat. */
  var waarden = document.querySelectorAll('[data-waarde]');
  var clubs   = document.querySelectorAll('[data-club]');
  if ((waarden.length || clubs.length) && window.matchMedia) {
    var smal = window.matchMedia('(max-width: 767px)');
    var stelDicht = function () {
      waarden.forEach(function (d) { d.open = !smal.matches; });
      clubs.forEach(function (d) { d.open = !smal.matches; });
    };
    stelDicht();
    if (smal.addEventListener) smal.addEventListener('change', stelDicht);
    else if (smal.addListener) smal.addListener(stelDicht);
  }

  /* ---------- Recensieportretten komen tot leven ----------
     Op een muis keert de kleur terug bij aanwijzen; dat staat in de
     stylesheet. Op een telefoon bestaat aanwijzen niet, dus daar doet het
     beeld het zodra de kaart in de baan voor je staat. */
  var kaarten = document.querySelectorAll('.review-kaart');
  if (kaarten.length && 'IntersectionObserver' in window && !reduce) {
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-levend', entry.intersectionRatio >= 0.55);
      });
    }, { threshold: [0, 0.55, 1] });
    kaarten.forEach(function (el) { rObs.observe(el); });
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
