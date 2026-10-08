/* ============================================================================
   CREDO — de werking van het scherm in de wachtzaal

   Bouwt de scènes uit inhoud.js, speelt ze af in een lus en regelt de
   beweging. Elke soort scène heeft een bouwer (de opmaak) en een draaiboek
   (wat er wanneer beweegt). De inhoud zelf staat in inhoud.js; hier hoef je
   niet te komen om een tekst of een tarief te wijzigen.

   De beweging loopt via de Web Animations API. Elk element staat in de CSS
   in zijn eindstand; de animatie houdt het tot zijn beurt in de beginstand.
   Een browser zonder die API toont dus gewoon alles, zonder beweging.
   ========================================================================= */

(function () {
  'use strict';

  var C = window.CREDO_TV;
  if (!C) { document.body.textContent = 'inhoud.js ontbreekt'; return; }

  var IN = C.instellingen || {};
  var P = C.praktijk || {};

  var toneel   = document.getElementById('toneel');
  var scenesEl = document.getElementById('scenes');
  var kader    = document.getElementById('kader');
  var klokEl   = document.getElementById('klok');
  var statusEl = document.getElementById('status');
  var hNr      = document.getElementById('hoofdstuk-nr');
  var hNaam    = document.getElementById('hoofdstuk-naam');
  var hBalk    = document.getElementById('hoofdstuk-balk');
  var meldingEl = document.getElementById('melding');
  var banen    = document.querySelectorAll('#gordijn .baan');

  var KAN = typeof Element !== 'undefined' && !!Element.prototype.animate;

  var UIT   = 'cubic-bezier(.16, 1, .3, 1)';     // snel vertrekken, zacht landen
  var IN_   = 'cubic-bezier(.7, 0, .84, 0)';     // traag vertrekken, hard aankomen
  var INUIT = 'cubic-bezier(.76, 0, .24, 1)';

  /* --------------------------------------------------------------- schalen */

  function schaal() {
    var k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    toneel.style.transform = 'translate(-50%, -50%) scale(' + k + ')';
  }
  window.addEventListener('resize', schaal);
  window.addEventListener('orientationchange', schaal);
  schaal();

  /* ------------------------------------------------------- kleine helpers */

  function el(tag, klas, html) {
    var n = document.createElement(tag);
    if (klas) n.className = klas;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // Een waarde die nog niet gekend is, valt op in plaats van te liegen.
  function tekst(v) {
    if (v === '[TE BEVESTIGEN]') return '<span class="open">nog in te vullen</span>';
    return v == null ? '' : String(v);
  }

  // Een regel achter een masker: de tekst schuift er straks uit omhoog.
  function regel(html, klas) {
    var m = el('span', 'm' + (klas ? ' ' + klas : ''));
    m.appendChild(el('span', 'mi', html));
    return m;
  }

  function foto(bron, klas) {
    var i = el('img', 'foto' + (klas ? ' ' + klas : ''));
    i.src = bron; i.alt = ''; i.decoding = 'async';
    return i;
  }

  function film(basis, poster) {
    var v = el('video', 'film');
    v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.preload = 'auto';
    if (poster) v.poster = poster;
    // mp4 eerst. Op een televisie of een Raspberry Pi wordt H.264 door de
    // chip gedecodeerd en VP9 vaak door de processor, en dat laatste hapert
    // op 1080p. De webm blijft erachter staan voor een browser zonder H.264.
    [['mp4', 'video/mp4'], ['webm', 'video/webm']].forEach(function (s) {
      var b = el('source'); b.src = basis + '.' + s[0]; b.type = s[1]; v.appendChild(b);
    });
    return v;
  }

  // Waar een element staat ten opzichte van een van zijn voorouders, in de
  // maten van het toneel (dus los van hoe groot de televisie is).
  function binnen(n, voorouder) {
    var x = 0, y = 0;
    while (n && n !== voorouder) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x: x, y: y };
  }

  // Zet een regel zo groot mogelijk zonder dat hij breder wordt dan `breed`.
  function pas(n, breed, max, min) {
    var px = max, oud = n.style.width;
    n.style.whiteSpace = 'nowrap';
    n.style.width = 'max-content';
    n.style.fontSize = px + 'px';
    while (n.offsetWidth > breed && px > min) { px -= 4; n.style.fontSize = px + 'px'; }
    n.style.width = oud;
    return px;
  }

  // Krimpt een tekstblok tot het niet hoger is dan `hoog`.
  function krimp(n, hoog, min) {
    var px = parseFloat(getComputedStyle(n).fontSize);
    while (n.scrollHeight > hoog && px > min) { px -= 2; n.style.fontSize = px + 'px'; }
    if (n.scrollHeight > hoog) console.warn('Te veel tekst voor het scherm:', n.textContent.slice(0, 60));
  }

  /* ------------------------------------------------------------ de beweging */

  // Alles wat een scène in gang zet, houdt ze hier bij, zodat het bij het
  // verlaten in één keer stilgelegd en teruggezet kan worden.
  function Spel() { this.t = []; this.a = []; this.uit = false; }
  Spel.prototype.na = function (ms, fn) {
    var self = this;
    this.t.push(setTimeout(function () { if (!self.uit) fn(); }, ms));
  };
  Spel.prototype.anim = function (n, frames, opts) {
    if (!KAN || !n) return null;
    var o = { duration: 1000, easing: UIT, fill: 'both' };
    for (var k in opts) o[k] = opts[k];
    var a = n.animate(frames, o);
    this.a.push(a);
    return a;
  };
  Spel.prototype.elke = function (ms, fn) {
    var self = this;
    (function tik() { if (self.uit) return; fn(); self.na(ms, tik); })();
  };
  Spel.prototype.stop = function () {
    this.uit = true;
    this.t.forEach(clearTimeout);
    this.a.forEach(function (a) { try { a.cancel(); } catch (e) {} });
    this.t = []; this.a = [];
  };

  // Maskerregels omhoog laten komen, een voor een.
  function op(spel, nodes, start, stap, duur) {
    [].concat(nodes).forEach(function (n, k) {
      if (!n) return;
      var mi = n.classList && n.classList.contains('mi') ? n : n.querySelector('.mi');
      spel.anim(mi || n, [{ transform: 'translate3d(0, 120%, 0)' }, { transform: 'translate3d(0, 0, 0)' }],
        { delay: start + k * (stap || 0), duration: duur || 1100 });
    });
  }

  // En weer weg, naar boven.
  function weg(spel, nodes, start, stap) {
    [].concat(nodes).forEach(function (n, k) {
      if (!n) return;
      var mi = n.classList && n.classList.contains('mi') ? n : n.querySelector('.mi');
      spel.anim(mi || n, [{ transform: 'translate3d(0, 0, 0)' }, { transform: 'translate3d(0, -130%, 0)' }],
        { delay: start + k * (stap || 0), duration: 620, easing: IN_, fill: 'forwards' });
    });
  }

  // Zacht binnenkomen, voor blokken tekst die niet achter een masker zitten.
  function in_(spel, nodes, start, stap, afstand) {
    [].concat(nodes).forEach(function (n, k) {
      if (!n) return;
      spel.anim(n, [{ opacity: 0, transform: 'translate3d(0, ' + (afstand || 34) + 'px, 0)' },
                    { opacity: 1, transform: 'translate3d(0, 0, 0)' }],
        { delay: start + k * (stap || 0), duration: 1100 });
    });
  }

  function uit_(spel, nodes, start) {
    [].concat(nodes).forEach(function (n) {
      if (!n) return;
      spel.anim(n, [{ opacity: 1 }, { opacity: 0 }], { delay: start, duration: 500, easing: 'ease-in', fill: 'forwards' });
    });
  }

  // Een getal laten oplopen naar zijn waarde.
  function tel(spel, n, van, tot, start, duur, opmaak) {
    var t0 = null;
    function zet(v) { n.textContent = opmaak ? opmaak(v) : String(v); }
    zet(KAN ? van : tot);
    if (!KAN) return;
    spel.na(start, function () {
      function stap(ts) {
        if (spel.uit) return;
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / duur);
        var e = 1 - Math.pow(2, -10 * p);                   // expo uit
        zet(Math.round(van + (tot - van) * (p >= 1 ? 1 : e)));
        if (p < 1) requestAnimationFrame(stap);
      }
      requestAnimationFrame(stap);
    });
  }

  /* ---------------------------------------------------------- openingsuren */

  var DAGEN = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

  function urenVan(dag) { return (P.uren || [])[dag] || { dag: DAGEN[dag], open: null, dicht: null }; }
  function minuten(hhmm) { var p = String(hhmm).split(':'); return +p[0] * 60 + +p[1]; }

  function volgendeOpening(nu) {
    for (var s = 1; s <= 7; s++) {
      var d = (nu.getDay() + s) % 7, u = urenVan(d);
      if (u.open) return { dag: s === 1 ? 'Morgen' : (u.dag || DAGEN[d]), uur: u.open };
    }
    return null;
  }

  function status(nu) {
    var u = urenVan(nu.getDay());
    var m = nu.getHours() * 60 + nu.getMinutes();
    if (u.open && m >= minuten(u.open) && m < minuten(u.dicht))
      return { open: true, kort: 'Open tot ' + u.dicht, lang: 'Nu open<br>tot <strong>' + u.dicht + '</strong>' };
    if (u.open && m < minuten(u.open))
      return { open: false, kort: 'Open vanaf ' + u.open, lang: 'Vandaag open<br>vanaf <strong>' + u.open + '</strong>' };
    var v = volgendeOpening(nu);
    return { open: false, kort: 'Gesloten',
             lang: 'Gesloten' + (v ? '<br>' + v.dag + ' vanaf <strong>' + v.uur + '</strong>' : '') };
  }

  function twee(n) { return (n < 10 ? '0' : '') + n; }

  /* ===================================================== DE SOORTEN SCÈNES

     Elke bouwer krijgt de gegevens uit inhoud.js en geeft terug:
       node    het element
       films   de video's die moeten spelen zolang de scène in beeld is
       klaar   wat er gemeten moet worden zodra alles in de pagina staat
       speel   het draaiboek, met een Spel om alles op bij te houden
     ===================================================================== */

  function scene(soort) { return el('div', 'scene s-' + soort); }

  var bouwers = {

    /* Het woord vult zich met de film, en het scherm duikt erdoorheen. */
    opening: function (d) {
      var s = scene('opening');
      var v = film(d.video, d.poster);
      s.appendChild(v);

      var uit = el('div', 'uitsparing');
      var woord = el('div', 'woord display');
      var letters = String(d.woord || 'Credo').split('').map(function (ch) {
        var l = el('span', 'letter'); l.appendChild(el('span', null, ch)); woord.appendChild(l); return l;
      });
      uit.appendChild(woord);
      s.appendChild(uit);

      var sluier = el('div', 'sluier sluier-onder');
      s.appendChild(sluier);
      var na = el('div', 'na');
      var kop = regel(d.kop, 'display kop');
      var lijn = regel(d.regel, 'regel');
      na.appendChild(kop); na.appendChild(lijn);
      s.appendChild(na);

      if (!KAN) uit.style.display = 'none';

      return {
        node: s, films: [v],
        klaar: function () { pas(woord, 1700, 640, 300); pas(kop.firstChild, 1696, 168, 90); },
        speel: function (spel) {
          kaal(spel, 6400);
          uit.style.display = KAN ? '' : 'none';
          letters.forEach(function (l, k) {
            spel.anim(l.firstChild, [{ transform: 'translate3d(0, 105%, 0)' }, { transform: 'translate3d(0, 0, 0)' }],
              { delay: 350 + k * 90, duration: 1300 });
          });
          // Het woord ademt niet meer mee. Dat was een tweede beweging op een
          // laag die al met de film gemengd wordt, en op een televisie is
          // elke laag die daar bovenop beweegt een haper erbij.

          // Waar we induiken: midden in de linkse poot van de derde letter.
          // Daar is de letter wit, dus na het inzoomen is het hele scherm film.
          // De duik is iets langer en rondt af in een vervaging die al begint
          // voor het vlak op zijn grootst staat: zo zie je nooit de ruwe rand
          // van een zesendertig keer uitvergrote letter.
          var l = letters[Math.min(2, letters.length - 1)];
          var plek = binnen(l, uit);
          var ox = plek.x + l.offsetWidth * 0.2;
          var oy = plek.y + l.offsetHeight * 0.5;
          uit.style.transformOrigin = ox + 'px ' + oy + 'px';
          spel.anim(uit, [{ transform: 'scale(1)' }, { transform: 'scale(36)' }],
            { delay: 4600, duration: 1500, easing: 'cubic-bezier(.6, 0, .9, .3)' });
          spel.anim(uit, [{ opacity: 1 }, { opacity: 0 }],
            { delay: 5550, duration: 550, easing: 'ease-in' });
          spel.na(6150, function () { uit.style.display = 'none'; });

          spel.anim(sluier, [{ opacity: 0 }, { opacity: 1 }], { delay: 5900, duration: 1200 });
          op(spel, [kop, lijn], 6200, 260, 1200);
        },
      };
    },

    /* Zinnen op ritme, zoals de titels van een film. */
    manifest: function (d) {
      var s = scene('manifest');
      s.appendChild(foto(d.beeld, 'drijf'));
      s.appendChild(el('div', 'sluier sluier-onder'));
      var beats = (d.beats || []).map(function (b) {
        var w = el('div', 'beat');
        var boven = b.boven ? regel(b.boven, 'boven') : null;
        var groot = regel(b.groot, 'display groot' + (b.accent ? ' accent' : ''));
        if (boven) w.appendChild(boven);
        w.appendChild(groot);
        s.appendChild(w);
        return { w: w, boven: boven, groot: groot };
      });
      return {
        node: s,
        klaar: function () {
          beats.forEach(function (b) { pas(b.groot.firstChild, 1696, 260, 120); });
        },
        speel: function (spel, duur) {
          var n = beats.length, start = 300;
          var per = n > 1 ? Math.min(4200, (duur - 4600) / (n - 1)) : duur;
          beats.forEach(function (b, k) {
            var t = start + k * per;
            // Tot zijn beurt staat elke beat buiten beeld onder zijn masker.
            op(spel, [b.boven, b.groot].filter(Boolean), t, 160, 1150);
            if (k < n - 1) weg(spel, [b.boven, b.groot].filter(Boolean), t + per - 700, 60);
          });
        },
      };
    },

    /* Drie woorden, drie beelden, hard op elkaar gesneden. */
    waarden: function (d) {
      var s = scene('waarden');
      var ws = d.woorden || [];
      var lagen = ws.map(function (w, k) {
        var laag = el('div', 'laag');
        var f = foto(w.beeld, 'drijf');
        f.style.setProperty('--drijf-x', (k % 2 ? 1.5 : -1.5) + '%');
        laag.appendChild(f);
        laag.appendChild(el('div', 'sluier sluier-onder'));
        var woord = regel(w.woord, 'display woord');
        var t = regel(w.tekst || '', 'tekst');
        laag.appendChild(woord); laag.appendChild(t);
        s.appendChild(laag);
        return { laag: laag, woord: woord, tekst: t };
      });
      var teller = el('div', 'teller');
      s.appendChild(teller);
      return {
        node: s,
        klaar: function () { lagen.forEach(function (l) { pas(l.woord.firstChild, 1720, 380, 180); }); },
        speel: function (spel, duur) {
          var per = duur / Math.max(1, lagen.length);
          lagen.forEach(function (l, k) {
            var t = k * per;
            if (k > 0) {
              spel.anim(l.laag, [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' }],
                { delay: t, duration: 900, easing: INUIT });
            }
            op(spel, [l.woord], t + (k ? 350 : 250), 0, 1100);
            op(spel, [l.tekst], t + (k ? 600 : 500), 0, 1000);
            spel.na(t, function () {
              teller.innerHTML = '<b>' + twee(k + 1) + '</b> / ' + twee(lagen.length);
            });
            if (k < lagen.length - 1) weg(spel, [l.woord, l.tekst], t + per - 650, 60);
          });
        },
      };
    },

    /* Revalidatie en performance naast elkaar, met de naad van de site. */
    twee: function (d) {
      var s = scene('twee');
      var films = [];
      var kant = { links: d.links || {}, rechts: d.rechts || {} };
      var delen = {};
      ['links', 'rechts'].forEach(function (k) {
        var h = el('div', 'helft ' + k);
        var v = film(kant[k].video, kant[k].poster);
        films.push(v);
        h.appendChild(v);
        h.appendChild(el('div', 'sluier'));
        s.appendChild(h);
        delen[k] = { helft: h };
      });
      var naad = el('div', 'naadlijn');
      s.appendChild(naad);
      ['links', 'rechts'].forEach(function (k) {
        var b = el('div', 'blok ' + k);
        var oog = regel(kant[k].oog || '', 'oog');
        b.appendChild(oog);
        var koppen = (kant[k].kop || []).map(function (r) { var x = regel(r, 'display kop'); b.appendChild(x); return x; });
        var items = el('div', 'items');
        var lijst = (kant[k].items || []).map(function (t) { var x = el('span', 'item', t); items.appendChild(x); return x; });
        b.appendChild(items);
        s.appendChild(b);
        delen[k].oog = oog; delen[k].koppen = koppen; delen[k].items = lijst;
      });
      return {
        node: s, films: films,
        klaar: function () {
          ['links', 'rechts'].forEach(function (k) {
            var px = 116;
            delen[k].koppen.forEach(function (r) { px = Math.min(px, pas(r.firstChild, 720, 116, 64)); });
            delen[k].koppen.forEach(function (r) { r.firstChild.style.fontSize = px + 'px'; });
          });
        },
        speel: function (spel) {
          spel.anim(delen.links.helft,  [{ transform: 'translate3d(0, -100%, 0)' }, { transform: 'translate3d(0, 0, 0)' }], { delay: 100, duration: 1300 });
          spel.anim(delen.rechts.helft, [{ transform: 'translate3d(0, 100%, 0)' },  { transform: 'translate3d(0, 0, 0)' }], { delay: 100, duration: 1300 });
          spel.anim(naad, [{ transform: 'translateX(-50%) rotate(13.97deg) scaleY(0)' }, { transform: 'translateX(-50%) rotate(13.97deg) scaleY(1)' }],
            { delay: 800, duration: 1100, easing: INUIT });
          op(spel, [delen.links.oog].concat(delen.links.koppen), 900, 130);
          in_(spel, delen.links.items, 1500, 90, 20);
          op(spel, [delen.rechts.oog].concat(delen.rechts.koppen), 1250, 130);
          in_(spel, delen.rechts.items, 1850, 90, 20);
        },
      };
    },

    /* Hoe laat het is, of we open zijn, en de week. */
    nu: function (d) {
      var s = scene('nu');
      var klok = el('div', 'klokgroot display');
      var cijfers = [0, 1, 2, 3, 4].map(function (k) {
        var r = regel('', k === 2 ? 'dp' : ''); klok.appendChild(r); return r;
      });
      s.appendChild(klok);
      var zij = el('div', 'zij');
      var dag = regel('', 'display dag');
      var stand = el('div', 'stand');
      zij.appendChild(dag); zij.appendChild(stand);
      s.appendChild(zij);
      var week = el('div', 'week');
      var vakken = [1, 2, 3, 4, 5, 6, 0].map(function (i) {
        var u = urenVan(i);
        var v = el('div', 'dagvak' + (u.open ? '' : ' dicht'));
        v.setAttribute('data-dag', i);
        v.appendChild(el('div', 'd', u.kort || (u.dag || DAGEN[i]).slice(0, 2)));
        v.appendChild(el('div', 'u', u.open ? u.open + ' – ' + u.dicht : 'Gesloten'));
        week.appendChild(v);
        return v;
      });
      s.appendChild(week);

      function zet() {
        var nu = new Date();
        var t = twee(nu.getHours()) + ':' + twee(nu.getMinutes());
        cijfers.forEach(function (c, k) { c.firstChild.textContent = t.charAt(k); });
        dag.firstChild.textContent = DAGEN[nu.getDay()];
        stand.innerHTML = status(nu).lang;
        vakken.forEach(function (v) { v.classList.toggle('vandaag', +v.getAttribute('data-dag') === nu.getDay()); });
      }
      zet();

      return {
        node: s,
        speel: function (spel) {
          zet();
          op(spel, cijfers, 250, 70, 1200);
          spel.anim(cijfers[2].firstChild, [{ opacity: 1 }, { opacity: .25 }, { opacity: 1 }],
            { delay: 1600, duration: 2000, iterations: Infinity, easing: 'steps(1, end)', fill: 'none' });
          op(spel, [dag], 550, 0);
          in_(spel, stand, 800, 0, 20);
          in_(spel, vakken, 1000, 70, 40);
          spel.elke(1000, zet);
        },
      };
    },

    /* Het team in een rij, voor de namen een voor een komen. */
    teamintro: function (d) {
      var s = scene('teamintro');
      var rij = el('div', 'band rij');
      rij.style.setProperty('--band-duur', '70s');
      var bronnen = (C.scenes || []).filter(function (x) { return x.soort === 'persoon'; }).map(function (x) { return x.beeld; });
      bronnen.concat(bronnen).forEach(function (b) { var i = el('img'); i.src = b; i.alt = ''; rij.appendChild(i); });
      s.appendChild(rij);
      s.appendChild(el('div', 'sluier'));
      var koppen = el('div', 'kop display');
      var lijnen = (d.kop || []).map(function (r) { var x = regel(r); koppen.appendChild(x); return x; });
      s.appendChild(koppen);
      var t = el('div', 'tekst', d.tekst || '');
      s.appendChild(t);
      return {
        node: s,
        speel: function (spel) {
          spel.anim(rij, [{ opacity: 0 }, { opacity: 1 }], { delay: 0, duration: 1400 });
          op(spel, lijnen, 300, 160, 1200);
          in_(spel, t, 1000, 0, 24);
        },
      };
    },

    /* Een therapeut: groot, met een paar dingen die je niet op een diploma leest. */
    persoon: function (d) {
      var s = scene('persoon');
      var portret = el('div', 'portret');
      portret.appendChild(foto(d.beeld, 'drijf'));
      portret.appendChild(el('div', 'sluier'));
      s.appendChild(portret);

      var nr = el('div', 'nr display', d.nummer || '');
      s.appendChild(nr);

      var kol = el('div', 'tekstkolom');
      var rol = regel(d.rol || '', 'oog rol');
      var naam = el('div', 'naam display');
      var voor = regel(d.voornaam || '');
      var achter = regel(d.achternaam || '', 'achter');
      naam.appendChild(voor); naam.appendChild(achter);
      kol.appendChild(rol); kol.appendChild(naam);
      s.appendChild(kol);

      var LABEL = { Ploeg: 'Favoriete ploeg', Speler: 'Favoriete speler', Hobby: 'Hobby',
                    Eten: 'Lievelingseten', Artiest: 'Favoriete artiest', Nummer: 'Favoriete nummer',
                    Reisbestemming: 'Favoriete reisbestemming' };
      var kaarten = [], stippen = [], diplomas = [];
      var fav = d.favoriet;
      if (fav) {
        var blok = el('div', 'fav');
        var st = el('div', 'stippen');
        blok.appendChild(st);
        (IN.favorieten || Object.keys(fav)).forEach(function (sleutel) {
          var w = fav[sleutel];
          if (!w) return;
          // Een nummer zonder artiest erbij krijgt de artiest ervoor.
          if (sleutel === 'Nummer' && fav.Artiest && w.indexOf('–') < 0) w = fav.Artiest + ' – ' + w;
          var k = el('div', 'kaart');
          var lab = regel(LABEL[sleutel] || sleutel, 'lab');
          var waarde = regel(w, 'waarde');
          k.appendChild(lab); k.appendChild(waarde);
          blok.appendChild(k);
          kaarten.push({ lab: lab, waarde: waarde });
          stippen.push(st.appendChild(el('i')));
        });
        s.appendChild(blok);
      } else {
        var ul = el('ul', 'diplomas');
        (d.credentials || []).forEach(function (c) { diplomas.push(ul.appendChild(el('li', null, c))); });
        s.appendChild(ul);
      }

      // De diploma's lopen onderaan voorbij, zoals een lopende band bij het nieuws.
      var ticker = el('div', 'ticker');
      var band = el('div', 'band');
      var items = d.credentials || [];
      var reeks = function () {
        items.forEach(function (c) { band.appendChild(el('span', null, c)); band.appendChild(el('span', 'sep', '/')); });
      };
      reeks(); reeks();
      if (items.length) { ticker.appendChild(band); s.appendChild(ticker); }

      return {
        node: s,
        klaar: function () {
          // Beide namen even groot, en samen binnen de donkere kolom naast het portret.
          var px = Math.min(pas(voor.firstChild, 880, 210, 100), pas(achter.firstChild, 880, 210, 100));
          voor.firstChild.style.fontSize = achter.firstChild.style.fontSize = px + 'px';
          kaarten.forEach(function (k) { pas(k.waarde.firstChild, 820, 54, 34); });
          // De band moet minstens het scherm breed zijn, anders loopt hij leeg.
          if (items.length && band.scrollWidth / 2 < 1920) { reeks(); reeks(); }
        },
        speel: function (spel, duur) {
          spel.anim(portret, [{ opacity: 0, transform: 'translate3d(140px, 0, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }],
            { delay: 0, duration: 1400 });
          spel.anim(nr, [{ opacity: 0, transform: 'translate3d(0, 80px, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }],
            { delay: 150, duration: 1600 });
          op(spel, [rol], 300, 0, 1000);
          op(spel, [voor, achter], 420, 140, 1200);
          in_(spel, ticker, 1000, 0, 0);

          if (kaarten.length) {
            var start = 1500, per = Math.min(2600, (duur - start - 400) / kaarten.length);
            kaarten.forEach(function (k, j) {
              var t = start + j * per;
              op(spel, [k.lab, k.waarde], t, 120, 900);
              spel.na(t, function () {
                stippen.forEach(function (i, x) { i.classList.toggle('aan', x === j); });
              });
              if (j < kaarten.length - 1) weg(spel, [k.lab, k.waarde], t + per - 520, 50);
            });
          } else {
            in_(spel, diplomas, 1300, 120, 24);
          }
        },
      };
    },

    /* Een recensie, gezet als een citaat in een tijdschrift: in één keer in
       beeld, en dan rust. Hij kwam eerst woord voor woord op, maar dat
       trekt het oog mee over de regel alsof iemand voorleest. */
    recensie: function (d) {
      var s = scene('recensie');
      var portret = el('div', 'portret');
      portret.appendChild(foto(d.beeld, 'drijf'));
      s.appendChild(portret);
      var aan = el('div', 'aanhaling display', '“');
      s.appendChild(aan);
      var citaat = el('div', 'citaat', d.tekst || '');
      s.appendChild(citaat);
      var wie = el('div', 'wie');
      var naam = regel(d.naam || '', 'display naam');
      var rol = regel(d.rol || '', 'oog');
      wie.appendChild(naam); wie.appendChild(rol);
      s.appendChild(wie);
      return {
        node: s,
        klaar: function () { krimp(citaat, 1080 - 300 - 310, 36); },
        speel: function (spel, duur) {
          spel.anim(portret, [{ opacity: 0, transform: 'translate3d(-140px, 0, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }],
            { delay: 0, duration: 1400 });
          spel.anim(aan, [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1)' }],
            { delay: 250, duration: 1300 });
          in_(spel, citaat, 600, 0, 28);
          op(spel, [naam, rol], 1100, 160, 1100);
        },
      };
    },

    /* Drie cijfers, elk het hele scherm, gevuld met fotografie. */
    cijfers: function (d) {
      var s = scene('cijfers');
      if (d.beeld) s.appendChild(foto(d.beeld, 'drijf'));
      var rijen = (d.rijen || []).map(function (r) {
        var b = el('div', 'beat');
        var g = regel('', 'display getal-m');
        var getal = g.firstChild;
        getal.className = 'mi getal' + (d.vulling || d.beeld ? '' : ' zonder-beeld');
        var vul = d.vulling || d.beeld;
        // Vooral licht, met de foto erdoor als textuur: zo blijft elk cijfer
        // even leesbaar, hoe donker de foto op die plek ook is.
        if (vul) getal.style.backgroundImage =
          'linear-gradient(rgba(244,241,234,.74), rgba(244,241,234,.74)), url("' + vul + '")';
        b.appendChild(g);
        var onder = el('div', 'onder');
        var naam = regel(r.naam || '', 'display naam');
        var sub = regel(r.sub || '', 'sub');
        onder.appendChild(naam); onder.appendChild(sub);
        b.appendChild(onder);
        s.appendChild(b);
        return { r: r, g: g, getal: getal, naam: naam, sub: sub };
      });
      var teller = el('div', 'teller');
      s.appendChild(teller);
      function eind(r) {
        if (r.reeks) return r.reeks[0] + '–' + r.reeks[1];
        return String(r.tot) + (r.achter || '');
      }
      rijen.forEach(function (x) { x.getal.textContent = eind(x.r); });
      return {
        node: s,
        speel: function (spel, duur) {
          var per = duur / Math.max(1, rijen.length);
          rijen.forEach(function (x, k) {
            var t = k * per, r = x.r;
            op(spel, [x.g], t + 150, 0, 1200);
            if (r.reeks) {
              var a = 0, b = 0;
              var zetReeks = function () { x.getal.textContent = a + '–' + b; };
              if (KAN) {
                a = 0; b = 0; zetReeks();
                var t0 = null;
                spel.na(t + 150, function () {
                  (function stap(ts) {
                    if (spel.uit) return;
                    if (t0 === null) t0 = ts;
                    var p = Math.min(1, (ts - t0) / 1600), e = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
                    a = Math.round(r.reeks[0] * e); b = Math.round(r.reeks[1] * e); zetReeks();
                    if (p < 1) requestAnimationFrame(stap);
                  })(performance.now());
                });
              }
            } else {
              tel(spel, x.getal, r.van || 0, r.tot, t + 150, 1600, function (v) { return v + (r.achter || ''); });
            }
            op(spel, [x.naam, x.sub], t + 500, 150, 1000);
            spel.na(t, function () { teller.innerHTML = '<b>' + twee(k + 1) + '</b> / ' + twee(rijen.length); });
            if (k < rijen.length - 1) weg(spel, [x.g, x.naam, x.sub], t + per - 700, 50);
          });
        },
      };
    },

    /* De zaal als filmrol: twee banden beeld die tegen elkaar in lopen. */
    zaal: function (d) {
      var s = scene('zaal');
      var rollen = el('div', 'rollen');
      var b = d.beelden || [];
      var helft = Math.ceil(b.length / 2);
      [b.slice(0, helft), b.slice(helft)].forEach(function (reeks, k) {
        var rol = el('div', 'band rol r' + (k + 1) + (k ? ' terug' : ''));
        reeks.concat(reeks).concat(reeks).concat(reeks).forEach(function (src) {
          var i = el('img'); i.src = src; i.alt = ''; rol.appendChild(i);
        });
        rollen.appendChild(rol);
      });
      s.appendChild(rollen);
      s.appendChild(el('div', 'sluier'));
      // Kop en tekst zijn er alleen als de inhoud ze geeft. Zonder tekst is de
      // zaal zelf het shot, en dan hoeft de sluier geen plaats vrij te houden.
      var kop = null, t = null;
      if (d.kop) { kop = regel(String(d.kop).replace(/m²/, 'm<sup>2</sup>'), 'display kop'); s.appendChild(kop); }
      if (d.tekst) { t = regel(d.tekst, 'tekst'); t.firstChild.style.whiteSpace = 'normal'; s.appendChild(t); }
      if (!kop && !t) s.classList.add('stil');
      return {
        node: s,
        speel: function (spel) {
          spel.anim(rollen, [{ opacity: 0, transform: 'rotate(-8deg) scale(1.15)' }, { opacity: 1, transform: 'rotate(-8deg) scale(1)' }],
            { delay: 0, duration: 2000 });
          if (kop) op(spel, [kop], 300, 0, 1300);
          if (t) op(spel, [t], 700, 0, 1100);
        },
      };
    },

    /* De clubs: hun logo's, stil in een raster, een voor een opkomend. De
       lopende band met de namen in reuzenletters is weg - met de logo's
       eronder en een tekst erbij was dat drie dingen die om aandacht vochten. */
    partners: function (d) {
      var s = scene('partners');
      var raster = el('div', 'raster');
      var logos = (d.logos || []).map(function (l) {
        var v = el('div', 'logo');
        var i = el('img', l.stijl || 'wit'); i.src = l.bron; i.alt = l.naam || '';
        v.appendChild(i); raster.appendChild(v);
        return v;
      });
      s.appendChild(raster);
      var t = d.tekst ? el('div', 'tekst', d.tekst) : null;
      if (t) s.appendChild(t);
      return {
        node: s,
        speel: function (spel) {
          logos.forEach(function (v, k) {
            spel.anim(v, [{ opacity: 0, transform: 'translate3d(0, 30px, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }],
              { delay: 200 + k * 140, duration: 1200 });
          });
          if (t) in_(spel, t, 200 + logos.length * 140 + 300, 0, 20);
        },
      };
    },

    /* De tarieven: een tabel, maar gezet als een prijsbord. */
    honoraria: function (d) {
      var s = scene('honoraria');
      if (d.beeld) s.appendChild(foto(d.beeld, 'drijf'));
      var kop = regel(d.kop || '', 'display kop');
      s.appendChild(kop);
      var tabel = el('div', 'tabel');
      var nadruk = d.nadruk;
      function rij(cellen, hoofd) {
        var r = el('div', 'rij' + (hoofd ? ' hoofd' : ''));
        var cs = cellen.map(function (c, k) {
          var cel = el('div', 'c' + (k === nadruk ? ' nadruk' : ''));
          if (hoofd) cel.innerHTML = tekst(c);
          else cel.appendChild(regel(tekst(c)));
          r.appendChild(cel);
          return cel;
        });
        var lijn = el('div', 'lijn');
        r.appendChild(lijn);
        tabel.appendChild(r);
        return { r: r, cs: cs, lijn: lijn };
      }
      var hoofd = rij(d.kolommen || [], true);
      var rijen = (d.rijen || []).map(function (c) { return rij(c, false); });
      s.appendChild(tabel);
      var voet = el('div', 'voet', d.voet || '');
      s.appendChild(voet);
      return {
        node: s,
        speel: function (spel) {
          op(spel, [kop], 200, 0, 1200);
          in_(spel, hoofd.cs, 650, 50, 14);
          spel.anim(hoofd.lijn, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { delay: 650, duration: 1200, easing: INUIT });
          rijen.forEach(function (x, k) {
            var t = 900 + k * 160;
            spel.anim(x.lijn, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { delay: t, duration: 1200, easing: INUIT });
            op(spel, x.cs, t + 60, 45, 1000);
          });
          in_(spel, voet, 2100, 0, 16);
        },
      };
    },

    /* De annulatieregel, met een 24 die zich langzaam vult als een zandloper. */
    beleid: function (d) {
      var s = scene('beleid');
      var groot = el('div', 'groot display');
      groot.appendChild(el('span', 'hol', d.groot || '24u'));
      var vol = el('span', 'vol', d.groot || '24u');
      groot.appendChild(vol);
      s.appendChild(groot);
      var r = el('div', 'rechts');
      var kop = regel(d.kop || '', 'display kop');
      var nl = el('div', 'nl', d.nl || '');
      var en = el('div', 'en', d.en || '');
      r.appendChild(kop); r.appendChild(nl); r.appendChild(en);
      s.appendChild(r);
      return {
        node: s,
        klaar: function () { pas(groot, 900, 760, 400); pas(kop.firstChild, 1920 - 1080 - 112, 120, 70); },
        speel: function (spel, duur) {
          spel.anim(groot, [{ opacity: 0, transform: 'translate3d(0, 60px, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }],
            { delay: 0, duration: 1500 });
          spel.anim(vol, [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' }],
            { delay: 700, duration: Math.max(3000, duur - 1800), easing: 'cubic-bezier(.4, 0, .6, 1)' });
          op(spel, [kop], 400, 0, 1200);
          in_(spel, [nl, en], 850, 250, 24);
        },
      };
    },

    merch: function (d) {
      var s = scene('merch');
      var paneel = el('div', 'paneel');
      paneel.appendChild(foto(d.beeld, 'drijf'));
      s.appendChild(paneel);
      var l = el('div', 'links');
      var oog = regel(d.oog || '', 'oog');
      var prijs = regel(d.prijs || '', 'display prijs');
      var per = regel(d.per || '', 'display per');
      var t = regel(d.tekst || '', 'tekst');
      [oog, prijs, per, t].forEach(function (x) { l.appendChild(x); });
      s.appendChild(l);
      return {
        node: s,
        speel: function (spel) {
          spel.anim(paneel, [{ opacity: 0, transform: 'translate3d(160px, 0, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }],
            { delay: 0, duration: 1500 });
          op(spel, [oog], 250, 0, 1000);
          op(spel, [prijs], 350, 0, 1400);
          op(spel, [per, t], 700, 180, 1100);
        },
      };
    },

    /* Afsluiten met wat je nu kan doen: boeken. */
    boeken: function (d) {
      var s = scene('boeken');
      if (d.beeld) { var f = foto(d.beeld, 'drijf'); f.style.objectPosition = '50% 35%'; s.appendChild(f); }
      s.appendChild(el('div', 'sluier sluier-links'));
      var l = el('div', 'links');
      var koppen = (d.kop || []).map(function (r) { var x = regel(r, 'display kop'); l.appendChild(x); return x; });
      var t = el('div', 'tekst', d.tekst || '');
      var tel = regel(P.tel || '', 'display tel');
      l.appendChild(t); l.appendChild(tel);
      s.appendChild(l);
      var codes = el('div', 'codes');
      var tegels = (d.qr || []).map(function (q) {
        var c = el('div', 'code');
        var tg = el('div', 'tegel');
        var i = el('img'); i.src = q.bron; i.alt = q.label || '';
        tg.appendChild(i);
        ['lb', 'rb', 'lo', 'ro'].forEach(function (h) { tg.appendChild(el('span', 'hoek ' + h)); });
        c.appendChild(tg);
        c.appendChild(el('div', 'lab', q.label || ''));
        codes.appendChild(c);
        return c;
      });
      s.appendChild(codes);
      return {
        node: s,
        klaar: function () {
          var px = 180;
          koppen.forEach(function (r) { px = Math.min(px, pas(r.firstChild, 980, 180, 100)); });
          koppen.forEach(function (r) { r.firstChild.style.fontSize = px + 'px'; });
        },
        speel: function (spel) {
          op(spel, koppen, 200, 140, 1200);
          in_(spel, t, 750, 0, 20);
          op(spel, [tel], 950, 0, 1100);
          tegels.forEach(function (c, k) {
            spel.anim(c, [{ opacity: 0, transform: 'translate3d(0, 50px, 0) scale(.94)' }, { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }],
              { delay: 1000 + k * 180, duration: 1300 });
            // De hoeken ademen, zodat het oog naar de code gaat.
            c.querySelectorAll('.hoek').forEach(function (h) {
              var dx = h.classList.contains('lb') || h.classList.contains('lo') ? -8 : 8;
              var dy = h.classList.contains('lb') || h.classList.contains('rb') ? -8 : 8;
              spel.anim(h, [{ transform: 'translate(0, 0)' }, { transform: 'translate(' + dx + 'px, ' + dy + 'px)' }, { transform: 'translate(0, 0)' }],
                { delay: 2200 + k * 300, duration: 1800, iterations: Infinity, easing: 'ease-in-out', fill: 'none' });
            });
          });
        },
      };
    },

    /* Een tijdelijke mededeling. */
    bericht: function (d) {
      var s = scene('bericht');
      if (d.beeld) s.appendChild(foto(d.beeld, 'drijf'));
      s.appendChild(el('div', 'sluier sluier-onder'));
      var b = el('div', 'blok');
      var oog = d.oog ? regel(d.oog, 'oog') : null;
      if (oog) b.appendChild(oog);
      var koppen = [].concat(d.kop || []).map(function (r) { var x = regel(r, 'display kop'); b.appendChild(x); return x; });
      var t = el('div', 'tekst', d.tekst || '');
      b.appendChild(t);
      s.appendChild(b);
      return {
        node: s,
        klaar: function () { koppen.forEach(function (r) { pas(r.firstChild, 1696, 190, 100); }); },
        speel: function (spel) {
          op(spel, [oog].concat(koppen).filter(Boolean), 250, 140, 1200);
          in_(spel, t, 900, 0, 20);
        },
      };
    },
  };

  // Het kader even weg, voor een scène die het hele scherm nodig heeft.
  function kaal(spel, ms) {
    kader.classList.add('kaal');
    spel.na(ms, function () { kader.classList.remove('kaal'); });
  }

  /* -------------------------------------------------------- scènes opbouwen */

  function vandaag() {
    var n = new Date();
    return n.getFullYear() + '-' + twee(n.getMonth() + 1) + '-' + twee(n.getDate());
  }

  function binnenPeriode(d) {
    var v = vandaag();
    if (d.van && v < d.van) return false;
    if (d.tot && v > d.tot) return false;
    return true;
  }

  var lijst = [];
  var hoofdstukken = [];

  function opbouwen() {
    lijst.forEach(function (x) { if (x.spel) x.spel.stop(); });
    scenesEl.innerHTML = '';
    lijst = [];
    hoofdstukken = [];
    (C.scenes || []).forEach(function (d) {
      if (!binnenPeriode(d)) return;
      var b = bouwers[d.soort];
      if (!b) { console.warn('onbekende soort scène:', d.soort); return; }
      var x = b(d);
      x.d = d;
      x.duur = Math.max(4, d.duur || 10) * 1000;
      scenesEl.appendChild(x.node);
      var h = d.hoofdstuk || '';
      if (h && hoofdstukken.indexOf(h) < 0) hoofdstukken.push(h);
      lijst.push(x);
    });
    lijst.forEach(function (x) { if (x.klaar) x.klaar(); });
  }

  /* --------------------------------------------------------- de overgang */

  var richting = 1;

  // Een schuine baan veegt over het beeld. Op het moment dat ze het scherm
  // bedekt, wordt er gewisseld. Het eerste stuk versnelt en het tweede remt
  // af, zodat het samen één beweging is en geen heen-en-terug.
  function veeg(wissel) {
    if (!KAN) { wissel(); return; }
    var r = richting; richting = -richting;
    var baan = banen[0];
    var pos = function (p) { return 'translateX(' + p + '%) skewX(-14deg)'; };
    var heen = baan.animate([{ transform: pos(-115 * r) }, { transform: pos(0) }],
      { duration: 460, easing: 'cubic-bezier(.55, 0, .85, .45)', fill: 'both' });
    heen.onfinish = function () {
      wissel();
      var terug = baan.animate([{ transform: pos(0) }, { transform: pos(115 * r) }],
        { duration: 640, easing: 'cubic-bezier(.12, .55, .3, 1)', fill: 'both' });
      // Na afloop opruimen: de baan staat dan toch buiten beeld.
      terug.onfinish = function () { heen.cancel(); terug.cancel(); };
    };
  }

  /* ----------------------------------------------------------- afspelen */

  var i = -1, huidig = null, timer = null, gepauzeerd = false, balkAnim = null;
  var opnieuwOpbouwen = false;

  function stilleggen(x) {
    if (!x) return;
    if (x.spel) x.spel.stop();
    x.node.classList.remove('aan', 'speelt');
    (x.films || []).forEach(function (v) { try { v.pause(); } catch (e) {} });
  }

  function starten(x) {
    x.spel = new Spel();
    x.node.classList.add('aan');
    void x.node.offsetWidth;                 // zodat de CSS-animaties opnieuw beginnen
    x.node.classList.add('speelt');
    (x.films || []).forEach(function (v) {
      try { v.currentTime = 0; } catch (e) {}
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
    x.speel(x.spel, x.duur);

    var h = x.d.hoofdstuk || '';
    hNaam.textContent = h;
    hNr.textContent = h ? twee(hoofdstukken.indexOf(h) + 1) : '';
    if (balkAnim) balkAnim.cancel();
    if (KAN) balkAnim = hBalk.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
                                     { duration: x.duur, easing: 'linear', fill: 'both' });
    huidig = x;
  }

  function toon(n, zonderOvergang) {
    if (opnieuwOpbouwen) {
      opnieuwOpbouwen = false;
      stilleggen(huidig); huidig = null;
      opbouwen();
      n = 0; zonderOvergang = true;
    }
    if (!lijst.length) return;
    n = (n % lijst.length + lijst.length) % lijst.length;
    var volgende = lijst[n], vorige = huidig;
    i = n;
    clearTimeout(timer);
    var wissel = function () {
      kader.classList.remove('kaal');
      stilleggen(vorige);
      starten(volgende);
      if (!gepauzeerd) timer = setTimeout(function () { toon(i + 1); }, volgende.duur);
    };
    if (!vorige || zonderOvergang || volgende.d.overgang === 'snede') wissel();
    else veeg(wissel);
  }

  function pauze() {
    gepauzeerd = !gepauzeerd;
    if (gepauzeerd) {
      clearTimeout(timer);
      if (balkAnim) balkAnim.pause();
      melden('Pauze');
    } else {
      melden('Verder');
      toon(i, true);
    }
  }

  function melden(t) {
    meldingEl.textContent = t;
    meldingEl.classList.add('aan');
    clearTimeout(melden._t);
    melden._t = setTimeout(function () { meldingEl.classList.remove('aan'); }, 1400);
  }

  /* ------------------------------------------------------- klok en status */

  function ververs() {
    var nu = new Date();
    klokEl.textContent = twee(nu.getHours()) + ':' + twee(nu.getMinutes());
    var st = status(nu);
    statusEl.classList.toggle('dicht', !st.open);
    statusEl.lastChild.textContent = st.kort;
  }

  /* -------------------------------------------------------------- inladen */

  // Eerst alle beelden binnen, dan pas beginnen: een foto die halverwege een
  // scène verschijnt, is precies wat dit scherm niet mag doen.
  function inladen(klaar) {
    var bronnen = [];
    toneel.querySelectorAll('img').forEach(function (n) { if (bronnen.indexOf(n.src) < 0) bronnen.push(n.src); });
    var over = bronnen.length, afgerond = false;
    function eentje() { if (--over <= 0 && !afgerond) { afgerond = true; klaar(); } }
    if (!over) { klaar(); return; }
    bronnen.forEach(function (b) {
      var im = new Image();
      im.onload = eentje;
      im.onerror = function () { console.warn('beeld ontbreekt:', b); eentje(); };
      im.src = b;
    });
    setTimeout(function () { if (!afgerond) { afgerond = true; klaar(); } }, 10000);
  }

  // De film van de eerste scène moet in zijn geheel binnen zijn voor hij
  // begint. Hij speelde eerder terwijl hij nog aan het laden was, en de eerste
  // seconden van de opening waren dan precies de seconden waarin hij hokte.
  function filmsKlaar(x, klaar) {
    var films = (x && x.films) || [];
    var over = films.length, afgerond = false;
    function eentje() { if (--over <= 0 && !afgerond) { afgerond = true; klaar(); } }
    if (!over) { klaar(); return; }
    films.forEach(function (v) {
      if (v.readyState >= 4) { eentje(); return; }
      v.addEventListener('canplaythrough', eentje, { once: true });
      v.addEventListener('error', eentje, { once: true });
      try { v.load(); } catch (e) {}
    });
    setTimeout(function () { if (!afgerond) { afgerond = true; klaar(); } }, 8000);
  }

  var startDag = vandaag();

  // Voor het nakijken: ?scene=7 begint bij de achtste scène.
  var vraag = /[?&]scene=(\d+)/.exec(location.search);
  var begin = vraag ? +vraag[1] : 0;

  function start() {
    opbouwen();
    ververs();
    setInterval(ververs, 10000);
    inladen(function () {
      filmsKlaar(lijst[(begin % lijst.length + lijst.length) % lijst.length], function () { toon(begin, true); });
      // Bij de dagwissel opnieuw opbouwen, zodat periodescènes en "vandaag"
      // meegaan. Dat gebeurt bij de volgende overgang, dus onzichtbaar.
      setInterval(function () {
        var d = vandaag();
        if (d !== startDag) { startDag = d; opnieuwOpbouwen = true; }
      }, 60000);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { gepauzeerd = false; toon(i + 1); }
    else if (e.key === 'ArrowLeft') { gepauzeerd = false; toon(i - 1); }
    else if (e.key === ' ') { e.preventDefault(); pauze(); }
    else if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    }
  });

  // Een tik op het scherm gaat ook een scène verder; handig bij een touchtv.
  document.addEventListener('click', function () { gepauzeerd = false; toon(i + 1); });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
