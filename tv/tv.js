/* ============================================================================
   CREDO — de motor achter het scherm in de wachtzaal

   Wat dit doet:
   - het toneel van 1920x1080 schalen naar het scherm dat eraan hangt
   - de slides uit inhoud.js opbouwen en in een lus afspelen
   - de klok en de status "nu open / nu gesloten" bijhouden
   - de beelden vooraf inladen, zodat er nooit een leeg vlak verschijnt

   Er wordt niets van buiten gehaald tijdens het afspelen. Valt het netwerk
   weg, dan blijft de lus gewoon doordraaien.
   ========================================================================= */

(function () {
  'use strict';

  var C = window.CREDO_TV;
  if (!C) { document.body.textContent = 'inhoud.js ontbreekt'; return; }

  var IN = C.instellingen || {};
  var P = C.praktijk || {};
  var toneel = document.getElementById('toneel');
  var balk = document.getElementById('balk');
  var klokEl = document.getElementById('klok');
  var meldingEl = document.getElementById('melding');

  /* --------------------------------------------------------------- schalen */

  function schaal() {
    var k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    toneel.style.transform = 'scale(' + k + ')';
  }
  window.addEventListener('resize', schaal);
  window.addEventListener('orientationchange', schaal);
  schaal();

  /* ------------------------------------------------------- kleine helpers */

  function el(tag, klas, html) {
    var e = document.createElement(tag);
    if (klas) e.className = klas;
    if (html != null) e.innerHTML = html;
    return e;
  }

  // Een waarde die nog ingevuld moet worden, markeren in plaats van tonen.
  function tekst(v) {
    if (v == null) return '';
    return String(v).replace(/\[TE BEVESTIGEN\]/g,
      '<span class="tebevestigen">nog in te vullen</span>');
  }

  function vlak(slide, extra) {
    var v = el('div', 'vlak' + (extra ? ' ' + extra : ''));
    slide.appendChild(v);
    return v;
  }

  // Een blok dat zichzelf kleiner maakt als het niet past. De inhoud komt uit
  // inhoud.js en kan dus groeien - een therapeut met acht diploma's, een
  // langere recensie. In plaats van dat zoiets onderaan van het scherm valt,
  // krimpt het blok net genoeg. Zie passen() onderaan.
  function krimpvak(ouder) {
    var k = el('div', 'krimp');
    ouder.appendChild(k);
    return k;
  }

  function achtergrond(slide, bron) {
    if (!bron) return;
    var img = el('img', 'vulbeeld');
    img.src = bron;
    img.alt = '';
    slide.appendChild(img);
    slide.appendChild(el('div', 'sluier'));
  }

  /* ---------------------------------------------------------- openingsuren */

  function urenVan(d) {
    var u = (P.uren || [])[d.getDay()];
    return u || { dag: '', open: null, dicht: null };
  }

  function minuten(hhmm) {
    var p = String(hhmm).split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  // Geeft terug hoe de praktijk er nu voor staat. Gebruikt door de urenslide
  // en door niets anders, maar staat apart zodat het ook elders kan.
  function status(nu) {
    var u = urenVan(nu);
    if (!u.open) return { open: false, zin: 'Vandaag gesloten' };
    var m = nu.getHours() * 60 + nu.getMinutes();
    if (m < minuten(u.open))
      return { open: false, zin: 'Vandaag open vanaf <strong>' + u.open + '</strong>' };
    if (m >= minuten(u.dicht))
      return { open: false, zin: 'Voor vandaag gesloten' };
    return { open: true, zin: 'Nu open, tot <strong>' + u.dicht + '</strong>' };
  }

  /* ------------------------------------------------------ de soorten slides */

  var bouwers = {

    merk: function (s, d) {
      achtergrond(s, d.beeld);
      var v = vlak(s);
      v.appendChild(el('div', 'streep'));
      v.appendChild(el('h1', 'display titel', tekst(d.titel)));
      v.appendChild(el('div', 'display onder', tekst(d.onder)));
      if (d.regel) v.appendChild(el('div', 'regel', tekst(d.regel)));
    },

    woord: function (s, d) {
      achtergrond(s, d.beeld);
      var v = vlak(s);
      v.appendChild(el('div', 'display woord', tekst(d.woord)));
      if (d.uitspraak) v.appendChild(el('div', 'uitspraak', tekst(d.uitspraak)));
      if (d.betekenis) v.appendChild(el('p', 'betekenis', tekst(d.betekenis)));
    },

    uren: function (s) {
      var v = vlak(s);
      var links = el('div');
      links.appendChild(el('div', 'streep'));
      links.appendChild(el('h2', 'display', 'Wanneer<br>we open zijn'));
      var nu = el('div', 'nu');
      nu.setAttribute('data-nu', '1');
      links.appendChild(nu);
      v.appendChild(links);

      var lijst = el('ul');
      // Maandag eerst, zondag achteraan - zoals mensen een week lezen.
      var volgorde = [1, 2, 3, 4, 5, 6, 0];
      volgorde.forEach(function (i) {
        var u = (P.uren || [])[i] || {};
        var li = el('li');
        li.setAttribute('data-dag', i);
        li.appendChild(el('span', 'dag', u.dag || ''));
        li.appendChild(el('span', 'tijd',
          u.open ? u.open + ' – ' + u.dicht : 'Gesloten'));
        lijst.appendChild(li);
      });
      v.appendChild(lijst);
    },

    cijfers: function (s, d) {
      var v = vlak(s);
      var links = el('div');
      links.appendChild(el('div', 'streep'));
      links.appendChild(el('h2', 'display',
        tekst(d.kop) + '<br><span class="accent">' + tekst(d.accent) + '</span>'));
      v.appendChild(links);

      var rechts = el('div');
      (d.rijen || []).forEach(function (r) {
        var rij = el('div', 'rij');
        rij.appendChild(el('div', 'display cijfer', tekst(r.cijfer)));
        var n = el('div');
        n.appendChild(el('div', 'display naam', tekst(r.naam)));
        n.appendChild(el('div', 'sub', tekst(r.sub)));
        rij.appendChild(n);
        rechts.appendChild(rij);
      });
      v.appendChild(rechts);
    },

    aanbod: function (s, d) {
      var v = krimpvak(vlak(s));
      v.appendChild(el('div', 'streep'));
      v.appendChild(el('h2', 'display', tekst(d.kop)));
      var r = el('div', 'raster');
      (d.items || []).forEach(function (i) {
        var vak = el('div', 'item');
        vak.appendChild(el('div', 'display t', tekst(i.titel)));
        vak.appendChild(el('div', 'b', tekst(i.tekst)));
        r.appendChild(vak);
      });
      v.appendChild(r);
    },

    persoon: function (s, d) {
      var p = el('div', 'portret');
      var img = el('img');
      img.src = d.beeld; img.alt = '';
      p.appendChild(img);
      s.appendChild(p);

      var z = el('div', 'zij');
      var k = krimpvak(z);
      k.appendChild(el('div', 'nr', tekst(d.nummer)));
      k.appendChild(el('div', 'display naam', tekst(d.naam)));
      k.appendChild(el('div', 'rol', tekst(d.rol)));

      if (d.credentials && d.credentials.length) {
        var ul = el('ul', 'creds');
        d.credentials.forEach(function (c) { ul.appendChild(el('li', null, tekst(c))); });
        k.appendChild(ul);
      }

      if (d.favoriet) {
        var f = el('div', 'fav');
        f.appendChild(el('div', 'kop', 'Favorieten'));
        var dl = el('dl');
        Object.keys(d.favoriet).forEach(function (n) {
          dl.appendChild(el('dt', null, tekst(n)));
          dl.appendChild(el('dd', null, tekst(d.favoriet[n])));
        });
        f.appendChild(dl);
        k.appendChild(f);
      }
      s.appendChild(z);
    },

    beeld: function (s, d) {
      achtergrond(s, d.beeld);
      var v = vlak(s);
      v.appendChild(el('div', 'streep'));
      if (d.label) v.appendChild(el('div', 'display t', tekst(d.label)));
      if (d.tekst) v.appendChild(el('p', 'b', tekst(d.tekst)));
    },

    partners: function (s, d) {
      var v = vlak(s);
      v.appendChild(el('div', 'streep'));
      v.appendChild(el('h2', 'display', tekst(d.kop)));
      var r = el('div', 'raster');
      (d.logos || []).forEach(function (l) {
        var vak = el('div', 'vak');
        var img = el('img');
        img.src = l.bron; img.alt = l.naam || '';
        vak.appendChild(img);
        r.appendChild(vak);
      });
      v.appendChild(r);
    },

    recensie: function (s, d) {
      var p = el('div', 'portret');
      var img = el('img');
      img.src = d.beeld; img.alt = '';
      p.appendChild(img);
      s.appendChild(p);

      var z = el('div', 'zij');
      var k = krimpvak(z);
      k.appendChild(el('div', 'sterren', '★★★★★'));
      k.appendChild(el('blockquote', null, '“' + tekst(d.tekst) + '”'));
      k.appendChild(el('div', 'display wie', tekst(d.naam)));
      k.appendChild(el('div', 'rol', tekst(d.rol)));
      s.appendChild(z);
    },

    honoraria: function (s, d) {
      var w = vlak(s);
      var v = krimpvak(w);
      v.appendChild(el('h2', 'display', tekst(d.kop)));
      var t = el('table');
      var thead = el('thead');
      var tr = el('tr');
      (d.kolommen || []).forEach(function (k) { tr.appendChild(el('th', null, tekst(k))); });
      thead.appendChild(tr); t.appendChild(thead);
      var tb = el('tbody');
      (d.rijen || []).forEach(function (r) {
        var rij = el('tr');
        r.forEach(function (c) { rij.appendChild(el('td', null, tekst(c))); });
        tb.appendChild(rij);
      });
      t.appendChild(tb);
      v.appendChild(t);
      if (d.voet) v.appendChild(el('p', 'voet', tekst(d.voet)));
    },

    beleid: function (s, d) {
      achtergrond(s, d.beeld);
      var v = vlak(s);
      v.appendChild(el('div', 'streep'));
      v.appendChild(el('h2', 'display', tekst(d.kop)));
      v.appendChild(el('p', 'nl', tekst(d.nl)));
      if (d.en) v.appendChild(el('p', 'en', tekst(d.en)));
    },

    merch: function (s, d) {
      achtergrond(s, d.beeld);
      var v = vlak(s);
      v.appendChild(el('div', 'streep'));
      v.appendChild(el('h2', 'display', tekst(d.kop)));
      v.appendChild(el('div', 'display prijs', tekst(d.prijs)));
      if (d.per) v.appendChild(el('div', 'per', tekst(d.per)));
      if (d.tekst) v.appendChild(el('p', 'b', tekst(d.tekst)));
    },

    boeken: function (s, d) {
      achtergrond(s, d.beeld);
      var v = vlak(s);
      var links = el('div');
      links.appendChild(el('div', 'streep'));
      links.appendChild(el('h2', 'display', tekst(d.kop)));
      links.appendChild(el('p', 'b', tekst(d.tekst)));
      links.appendChild(el('div', 'contact',
        '<strong>' + tekst(P.tel) + '</strong><br>' + tekst(P.site)));
      v.appendChild(links);

      var codes = el('div', 'codes');
      [[d.qr, d.qrLabel], [d.qr2, d.qr2Label]].forEach(function (paar) {
        if (!paar[0]) return;
        var c = el('div', 'code');
        var vak = el('div', 'vak');
        var img = el('img');
        img.src = paar[0]; img.alt = paar[1] || '';
        vak.appendChild(img);
        c.appendChild(vak);
        if (paar[1]) c.appendChild(el('div', 'cap', tekst(paar[1])));
        codes.appendChild(c);
      });
      v.appendChild(codes);
    },
  };

  /* --------------------------------------------------------- slides opbouwen */

  // Slides met een periode vallen buiten die periode weg.
  function binnenPeriode(d, nu) {
    var vandaag = nu.toISOString().slice(0, 10);
    if (d.van && vandaag < d.van) return false;
    if (d.tot && vandaag > d.tot) return false;
    return true;
  }

  var slides = [];

  function opbouwen() {
    toneel.querySelectorAll('.slide').forEach(function (n) { n.remove(); });
    slides = [];
    var nu = new Date();

    (C.slides || []).forEach(function (d) {
      if (!binnenPeriode(d, nu)) return;
      var bouwer = bouwers[d.soort];
      if (!bouwer) { console.warn('onbekende slidesoort:', d.soort); return; }
      var s = el('section', 'slide s-' + d.soort);
      bouwer(s, d);
      toneel.insertBefore(s, toneel.firstChild);
      slides.push({ node: s, soort: d.soort,
                    duur: (d.duur || IN.standaardDuur || 10) * 1000 });
    });
  }

  /* ----------------------------------------------------------- passend maken */

  // De inhoud komt uit een bestand dat later nog wordt bijgewerkt. Groeit een
  // blok buiten zijn vak - een extra diploma, een langere recensie - dan
  // krimpt het net genoeg in plaats van onderaan weg te vallen. Wordt het
  // kleiner dan drie kwart, dan is er echt te veel tekst en zeggen we dat in
  // de console, zodat het bij het nakijken opvalt.
  function passen() {
    toneel.querySelectorAll('.krimp').forEach(function (k) {
      k.style.transform = '';
      var ouder = k.parentNode;
      var st = getComputedStyle(ouder);
      var ruimte = ouder.clientHeight
                 - parseFloat(st.paddingTop) - parseFloat(st.paddingBottom);
      var hoog = k.scrollHeight;
      if (hoog <= ruimte || !ruimte) return;
      var f = Math.max(ruimte / hoog, .6);
      k.style.transform = 'scale(' + f + ')';
      if (f < .75) {
        console.warn('te veel inhoud op deze slide (' + Math.round(f * 100) + '%):',
                     ouder.parentNode.className);
      }
    });
  }

  /* ------------------------------------------------------------- de beelden */

  // Alles eerst inladen. Pas als het klaar is (of na acht seconden, wat er ook
  // misging) begint de lus. Zo komt er nooit een half beeld voorbij.
  function beeldenInladen(klaar) {
    var bronnen = [];
    toneel.querySelectorAll('img').forEach(function (i) {
      if (i.src && bronnen.indexOf(i.src) < 0) bronnen.push(i.src);
    });
    if (!bronnen.length) return klaar();

    var over = bronnen.length;
    var afgerond = false;
    function tel() {
      if (--over <= 0 && !afgerond) { afgerond = true; klaar(); }
    }
    bronnen.forEach(function (b) {
      var i = new Image();
      i.onload = tel;
      i.onerror = function () { console.warn('beeld ontbreekt:', b); tel(); };
      i.src = b;
    });
    setTimeout(function () { if (!afgerond) { afgerond = true; klaar(); } }, 8000);
  }

  /* ----------------------------------------------------------------- de lus */

  var i = -1, timer = null, gepauzeerd = false, balkStart = 0;

  function toon(n) {
    if (!slides.length) return;
    if (i >= 0) slides[i].node.classList.remove('aan');
    i = ((n % slides.length) + slides.length) % slides.length;
    var s = slides[i];
    s.node.classList.add('aan');
    // De adresregel onderaan hoort niet op elke slide: waar de inhoud de
    // volle hoogte gebruikt, valt hij er bovenop.
    toneel.setAttribute('data-soort', s.soort);
    ververs();

    if (IN.voortgangsbalk !== false) {
      balk.style.transition = 'none';
      balk.style.width = '0';
      balkStart = Date.now();
      // een tel wachten zodat de browser de nulstand oppikt
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          balk.style.transition = 'width ' + s.duur + 'ms linear';
          balk.style.width = '100%';
        });
      });
    }

    clearTimeout(timer);
    if (!gepauzeerd) timer = setTimeout(function () { toon(i + 1); }, s.duur);
  }

  function pauze() {
    gepauzeerd = !gepauzeerd;
    if (gepauzeerd) {
      clearTimeout(timer);
      var w = getComputedStyle(balk).width;
      balk.style.transition = 'none';
      balk.style.width = w;
      melden('Pauze');
    } else {
      melden('Verder');
      toon(i);
    }
  }

  function melden(t) {
    meldingEl.textContent = t;
    meldingEl.classList.add('aan');
    clearTimeout(melden._t);
    melden._t = setTimeout(function () { meldingEl.classList.remove('aan'); }, 1400);
  }

  /* ------------------------------------------------------- klok en de status */

  var DAGEN = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag',
               'Vrijdag', 'Zaterdag'];

  function ververs() {
    var nu = new Date();

    if (IN.klok !== false && klokEl) {
      var hh = String(nu.getHours()).padStart(2, '0');
      var mm = String(nu.getMinutes()).padStart(2, '0');
      klokEl.innerHTML = '<span class="dag">' + DAGEN[nu.getDay()] + '</span>' + hh + ':' + mm;
    }

    var st = status(nu);
    toneel.querySelectorAll('[data-nu]').forEach(function (n) {
      n.innerHTML = '<span class="stip' + (st.open ? '' : ' dicht') + '"></span>' + st.zin;
    });
    toneel.querySelectorAll('.s-uren li').forEach(function (li) {
      li.classList.toggle('vandaag', Number(li.getAttribute('data-dag')) === nu.getDay());
    });
  }

  /* ------------------------------------------------------------------ starten */

  var startDag = new Date().getDate();

  function start() {
    opbouwen();
    beeldenInladen(function () {
      passen();
      toon(0);
      setInterval(ververs, 20000);
      // Bij de dagwissel opnieuw opbouwen: periodeslides en "vandaag"
      // moeten dan mee. Gebeurt tijdens de overgang, dus onzichtbaar.
      setInterval(function () {
        var d = new Date().getDate();
        if (d !== startDag) { startDag = d; opbouwen(); passen(); i = -1; toon(0); }
      }, 60000);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { gepauzeerd = false; toon(i + 1); }
    else if (e.key === 'ArrowLeft') { gepauzeerd = false; toon(i - 1); }
    else if (e.key === ' ') { e.preventDefault(); pauze(); }
    else if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    }
  });

  // Een tik op het scherm gaat ook een slide verder; handig bij een touchtv.
  document.addEventListener('click', function () { gepauzeerd = false; toon(i + 1); });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
