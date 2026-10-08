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
  var menuTimer = null;

  // De lade schuift open en de regels komen er een voor een achteraan. Dat
  // kan niet vanaf display none, dus het hidden-attribuut gaat er eerst af
  // en pas een frame later komt de klasse erop die de overgang start. Bij
  // het sluiten andersom: eerst de klasse eraf, en pas als de overgang klaar
  // is weer hidden, anders springt de lade dicht.
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    clearTimeout(menuTimer);

    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { menu.classList.add('is-open'); });
      });
    } else {
      menu.classList.remove('is-open');
      var traag = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      menuTimer = setTimeout(function () { menu.hidden = true; }, traag ? 0 : 420);
    }

    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    if (header && open) header.classList.add('is-solid');
    else onScrollHeader();
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'));
    });
  }
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  // Close the menu if the viewport grows past the lg breakpoint
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && menu && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Waar je bent in de pagina ----------
     Deze pagina's zijn lang. Zonder markering in de navigatie weet je niet
     welk stuk je leest. De regel: het laatste stuk waarvan de bovenkant al
     onder de kopbalk door is, is het stuk waar je bent. Dat is met een
     IntersectionObserver lastiger te krijgen dan het lijkt, want twee
     secties kunnen tegelijk in beeld staan; een rechtstreekse meting is
     hier korter en zegt precies wat ze doet. ------------------------- */
  var spyLinks = [];
  document.querySelectorAll('nav[aria-label="Hoofdnavigatie"] .nav-link').forEach(function (a) {
    var h = a.getAttribute('href') || '';
    if (h.charAt(0) !== '#' || h.length < 2) return;
    var sec = document.getElementById(h.slice(1));
    if (sec) spyLinks.push({ a: a, sec: sec });
  });

  function spy() {
    if (!spyLinks.length) return;
    var grens = (header ? header.offsetHeight : 72) + 28;

    // Op volgorde van de pagina, niet op volgorde van het menu. Die twee
    // lopen hier uiteen: in de pagina staat "wat we doen" vóór "team", in
    // het menu erna. Zonder deze sortering wijst "de laatste die voorbij is"
    // het verkeerde stuk aan zodra je in team bent.
    var op = spyLinks.map(function (d) {
      return { a: d.a, top: d.sec.getBoundingClientRect().top };
    }).sort(function (x, y) { return x.top - y.top; });

    var hier = null;
    op.forEach(function (d) { if (d.top <= grens) hier = d; });
    // Helemaal onderaan hoort het laatste stuk aan te staan, ook als de
    // bovenkant ervan nog onder de grens zit omdat de pagina ophoudt.
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      hier = op[op.length - 1];
    }
    spyLinks.forEach(function (d) {
      d.a.classList.toggle('is-hier', !!hier && d.a === hier.a);
    });
  }

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
      spy();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', spy, { passive: true });
  parallax();
  spy();

  /* De drie lijnen bij de cijfers zijn nu een vaste tekening in de opmaak:
     de rijen staan op een vaste hoogte, dus hun midden ligt vast en er valt
     niets meer te meten. Het script dat dat deed is weg. */

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

  /* ---------- Meer tonen ----------
     De lijst staat open in de opmaak, zodat zonder JS niets verborgen blijft;
     dit klapt hem in en zet de knop erbij. De knop verdwijnt als er niets te
     verbergen valt. */
  document.querySelectorAll('[data-meer]').forEach(function (knop) {
    var lijst = document.querySelector(knop.getAttribute('data-meer'));
    if (!lijst) { knop.hidden = true; return; }
    lijst.classList.add('is-ingeklapt');
    knop.addEventListener('click', function () {
      var open = lijst.classList.toggle('is-ingeklapt') === false;
      knop.setAttribute('aria-expanded', open ? 'true' : 'false');
      knop.textContent = open ? knop.getAttribute('data-meer-dicht') : knop.getAttribute('data-meer-open');
    });
  });

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
        k.classList.toggle('is-voor', a === 0);
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

    /* Naast elkaar staat alles open en valt er niets te openen, maar de kop
       blijft een <summary> en dus een schakelaar: een klik op het wapen of de
       naam klapte de kaart dicht. De stylesheet vangt de muis af; dit vangt
       ook het toetsenbord en de klik die een script zelf verstuurt. */
    document.querySelectorAll('.club > summary').forEach(function (kop) {
      kop.addEventListener('click', function (e) {
        if (!smal.matches && !e.target.closest('.club-link')) e.preventDefault();
      });
      kop.addEventListener('keydown', function (e) {
        if (!smal.matches && (e.key === 'Enter' || e.key === ' ')) e.preventDefault();
      });
    });

    /* Eén club draagt een link in haar naam, en die naam zit in de kop die de
       kaart opent. Een tik op de link zou dus allebei doen: de site openen en
       de kaart omklappen. De link wint. */
    document.querySelectorAll('.club-link').forEach(function (a) {
      a.addEventListener('click', function (e) { e.stopPropagation(); });
    });
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

      /* Plat, niet genest: Formspree en de meeste andere diensten zetten elke
         sleutel als een eigen regel in de mail. Een genest object belandt daar
         als een blok JSON. De sleutels met een liggend streepje ervoor zijn
         afspraken van Formspree: het onderwerp van de mail, en het adres waar
         je met Beantwoorden naartoe schrijft. */
      var lading = { _subject: subject, pagina: location.pathname };
      Object.keys(data).forEach(function (k) { lading[k] = data[k]; });
      if (data.email) lading._replyto = data.email;

      fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(lading)
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

  /* ---------- De vaste actiebalk komt pas na de hero ----------
     Tijdens de hero staan dezelfde twee acties al in beeld: boeken staat in
     de hero en in de kopbalk, bellen in de kopbalk. De balk schuift daarom
     pas op zodra de hero voorbij is. ------------------------------------- */
  var actiebalk = document.getElementById('actiebalk');
  if (actiebalk) {
    var heroVlak = document.querySelector('.hero-still');
    if (!heroVlak || !('IntersectionObserver' in window)) {
      // Geen hero of geen observer: dan hoort de balk er gewoon te staan.
      actiebalk.classList.add('aan');
    } else {
      new IntersectionObserver(function (entries) {
        actiebalk.classList.toggle('aan', !entries[0].isIntersecting);
      }, { threshold: 0 }).observe(heroVlak);
    }
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
