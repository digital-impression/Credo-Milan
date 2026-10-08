/* ============================================================================
   CREDO — de montage achter het scherm in de wachtzaal

   Dit is geen diavoorstelling met een timer eroverheen. Het is een montage:
   een lijst shots die elk hun eigen duur en beweging hebben, met een harde
   cut ertussen. Wat dit bestand doet:

   - het toneel van 1920x1080 schalen naar het scherm dat eraan hangt
   - de shots uit inhoud.js opbouwen: stills met beweging, clips uit de
     videobestanden, en kaarten (tussentitels op zwart)
   - per shot de beweging precies zo lang maken als het shot duurt, zodat ze
     samen uitgespeeld zijn op de cut
   - de tekst laten komen en gaan binnen het shot, niet op de cut
   - alles vooraf inladen, zodat er nooit een leeg kader staat

   Er wordt niets van buiten gehaald tijdens het afspelen. Valt het netwerk
   weg, dan draait de lus door.
   ========================================================================= */

(function () {
  'use strict';

  var C = window.CREDO_TV;
  if (!C) { document.body.textContent = 'inhoud.js ontbreekt'; return; }

  var IN = C.instellingen || {};
  var P = C.praktijk || {};
  var kader = document.getElementById('kader');
  var tijdEl = document.getElementById('tijd');
  var meldingEl = document.getElementById('melding');

  /* --------------------------------------------------------------- schalen */

  function schaal() {
    var k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.getElementById('toneel').style.transform = 'scale(' + k + ')';
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

  function tekst(v) {
    if (v == null) return '';
    return String(v).replace(/\[TE BEVESTIGEN\]/g,
      '<span class="tebevestigen">nog in te vullen</span>');
  }

  /* ---------------------------------------------------------- openingsuren */

  function minuten(hhmm) {
    var p = String(hhmm).split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function status(nu) {
    var u = (P.uren || [])[nu.getDay()] || {};
    if (!u.open) return { open: false, zin: 'Vandaag gesloten' };
    var m = nu.getHours() * 60 + nu.getMinutes();
    if (m < minuten(u.open))
      return { open: false, zin: 'Vandaag open vanaf <strong>' + u.open + '</strong>' };
    if (m >= minuten(u.dicht))
      return { open: false, zin: 'Voor vandaag gesloten' };
    return { open: true, zin: 'Nu open, tot <strong>' + u.dicht + '</strong>' };
  }

  /* --------------------------------------------------------- de lower-third */

  // Tekst onder in het kader. Wat er staat bepaalt de maat: een naam is
  // groot, een zin eronder klein. Niets gecentreerd, niets groot in het
  // midden - dat is wat een shot in een dia verandert.
  function onderregel(shot, d) {
    if (!d.reuze && !d.groot && !d.mid && !d.citaat && !d.regel
        && !d.onder && !d.extra) return false;
    shot.appendChild(el('div', 'scrim'));
    var o = el('div', 'onderregel');
    o.appendChild(el('div', 'balkje'));
    if (d.citaat) o.appendChild(el('p', 'citaat', '\u201c' + tekst(d.citaat) + '\u201d'));
    if (d.reuze) o.appendChild(el('div', 'display reuze', tekst(d.reuze)));
    if (d.groot) o.appendChild(el('div', 'display groot', tekst(d.groot)));
    if (d.mid) o.appendChild(el('div', 'display mid', tekst(d.mid)));
    if (d.onder) o.appendChild(el('div', 'onder', tekst(d.onder)));
    if (d.regel) o.appendChild(el('p', 'regel', tekst(d.regel)));
    if (d.extra) o.appendChild(el('div', 'extra', tekst(d.extra)));
    shot.appendChild(o);

    // De regels komen na elkaar op, niet samen.
    var i = 0;
    o.querySelectorAll(':scope > *').forEach(function (n) {
      n.style.transitionDelay = (i * 0.1).toFixed(2) + 's';
      i++;
    });
    return true;
  }

  /* ------------------------------------------------------------- de kaarten */

  var kaarten = {

    woord: function (v, d) {
      v.classList.add('kaart-woord');
      v.appendChild(el('div', 'display woord', tekst(d.woord)));
      if (d.spreek) v.appendChild(el('div', 'spreek', tekst(d.spreek)));
      if (d.uitleg) v.appendChild(el('p', 'uitleg', tekst(d.uitleg)));
    },

    zin: function (v, d) {
      if (d.oog) v.appendChild(el('div', 'oog', tekst(d.oog)));
      if (d.kop) v.appendChild(el('div', 'display kop', tekst(d.kop)));
      if (d.nl) v.appendChild(el('p', 'zin', tekst(d.nl)));
      if (d.en) v.appendChild(el('p', 'zin', tekst(d.en)));
    },

    tarieven: function (v, d) {
      v.classList.add('kaart-tarieven');
      if (d.oog) v.appendChild(el('div', 'oog', tekst(d.oog)));
      if (d.kop) v.appendChild(el('div', 'display kop', tekst(d.kop)));
      var t = el('table');
      var kop = el('tr');
      (d.kolommen || []).forEach(function (k) { kop.appendChild(el('th', null, tekst(k))); });
      var th = el('thead'); th.appendChild(kop); t.appendChild(th);
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

    uren: function (v, d) {
      v.classList.add('kaart-uren');
      if (d.oog) v.appendChild(el('div', 'oog', tekst(d.oog)));
      if (d.kop) v.appendChild(el('div', 'display kop', tekst(d.kop)));
      var r = el('div', 'rijen');
      [1, 2, 3, 4, 5, 6, 0].forEach(function (i) {
        var u = (P.uren || [])[i] || {};
        var rij = el('div', 'rij');
        rij.setAttribute('data-dag', i);
        rij.appendChild(el('span', 'dag', u.dag || ''));
        rij.appendChild(el('span', 'tijd', u.open ? u.open + ' – ' + u.dicht : 'Gesloten'));
        r.appendChild(rij);
      });
      v.appendChild(r);
      var nu = el('div', 'nu');
      nu.setAttribute('data-nu', '1');
      v.appendChild(nu);
    },

    prijs: function (v, d) {
      v.classList.add('kaart-prijs');
      if (d.oog) v.appendChild(el('div', 'oog', tekst(d.oog)));
      if (d.kop) v.appendChild(el('div', 'display kop', tekst(d.kop)));
      v.appendChild(el('div', 'display prijs', tekst(d.prijs)));
      if (d.per) v.appendChild(el('div', 'per', tekst(d.per)));
      if (d.nl) v.appendChild(el('p', 'zin', tekst(d.nl)));
    },

    boeken: function (v, d) {
      v.classList.add('kaart-boeken');
      var links = el('div', 'links');
      if (d.oog) links.appendChild(el('div', 'oog', tekst(d.oog)));
      if (d.kop) links.appendChild(el('div', 'display kop', tekst(d.kop)));
      if (d.nl) links.appendChild(el('p', 'zin', tekst(d.nl)));
      links.appendChild(el('div', 'contact',
        '<strong>' + tekst(P.tel) + '</strong><br>' + tekst(P.site)));
      v.appendChild(links);

      var codes = el('div', 'codes');
      (d.codes || []).forEach(function (c) {
        var vak = el('div', 'code');
        var b = el('div', 'vak');
        var img = el('img');
        img.src = c.qr; img.alt = c.label || '';
        b.appendChild(img);
        vak.appendChild(b);
        if (c.label) vak.appendChild(el('div', 'cap', tekst(c.label)));
        codes.appendChild(vak);
      });
      v.appendChild(codes);
    },
  };

  /* ------------------------------------------------------- shots opbouwen */

  function binnenPeriode(d, nu) {
    var vandaag = nu.toISOString().slice(0, 10);
    if (d.van && vandaag < d.van) return false;
    if (d.tot && vandaag > d.tot) return false;
    return true;
  }

  var shots = [];

  function opbouwen() {
    kader.querySelectorAll('.shot').forEach(function (n) { n.remove(); });
    shots = [];
    var nu = new Date();

    (C.montage || []).forEach(function (d) {
      if (!binnenPeriode(d, nu)) return;

      var s = el('section', 'shot');
      var duur = (d.duur || 3) * 1000;
      var media = null;

      if (d.kaart) {
        s.classList.add('kaart');
        var v = el('div', 'kaartvlak');
        var bouwer = kaarten[d.kaart];
        if (!bouwer) { console.warn('onbekende kaart:', d.kaart); return; }
        bouwer(v, d);
        s.appendChild(v);

      } else if (d.video) {
        // Een clip uit een van de videobestanden. Het in-punt staat in `van`;
        // zo levert een bestand van elf seconden vijf verschillende shots.
        media = el('video', 'beeld');
        // Twee bronnen, webm eerst: niet elke tv-browser heeft H.264, en niet
        // elke browser kent webm. Samen dekken ze alles wat er in een
        // wachtzaal kan hangen. Dezelfde aanpak als de hero's op de site.
        var webm = el('source');
        webm.src = d.video.replace(/\.mp4$/, '.webm');
        webm.type = 'video/webm';
        media.appendChild(webm);
        var mp4 = el('source');
        mp4.src = d.video;
        mp4.type = 'video/mp4';
        media.appendChild(mp4);
        media.muted = true;
        media.defaultMuted = true;
        media.playsInline = true;
        media.setAttribute('playsinline', '');
        media.setAttribute('muted', '');
        media.preload = 'auto';
        media.loop = true;
        s.appendChild(media);
        onderregel(s, d);

      } else if (d.beeld) {
        media = el('img', 'beeld');
        media.src = d.beeld;
        media.alt = '';
        s.appendChild(media);
        if (d.portret) {
          s.classList.add('portret');
          s.appendChild(el('div', 'wig'));
        }
        onderregel(s, d);
      }

      // Waar in het beeld het kader valt. Bij een staande of vierkante foto
      // in een breedbeeldkader bepaalt dit of je het onderwerp ziet of zijn
      // schouders.
      if (media && d.positie) media.style.objectPosition = d.positie;

      kader.appendChild(s);
      shots.push({
        node: s, media: media, duur: duur, d: d,
        beweging: d.beweging || 'stil',
        // Een stil beeld hoeft geen beweging als het een kaart is.
        isKaart: !!d.kaart,
      });
    });
  }

  /* ------------------------------------------------------------- inladen */

  function inladen(klaar) {
    var bronnen = [];
    kader.querySelectorAll('img.beeld, .code img').forEach(function (i) {
      if (i.src && bronnen.indexOf(i.src) < 0) bronnen.push(i.src);
    });
    var videos = [];
    kader.querySelectorAll('video.beeld').forEach(function (v) {
      if (videos.indexOf(v) < 0) videos.push(v);
    });

    var over = bronnen.length + videos.length;
    if (!over) return klaar();
    var afgerond = false;
    function tel() { if (--over <= 0 && !afgerond) { afgerond = true; klaar(); } }

    bronnen.forEach(function (b) {
      var i = new Image();
      i.onload = tel;
      i.onerror = function () { console.warn('beeld ontbreekt:', b); tel(); };
      i.src = b;
    });
    videos.forEach(function (v) {
      if (v.readyState >= 3) return tel();
      var af = function () { v.removeEventListener('canplay', af); tel(); };
      v.addEventListener('canplay', af);
      v.addEventListener('error', function () {
        console.warn('video ontbreekt:', v.src); tel();
      });
      v.load();
    });
    setTimeout(function () { if (!afgerond) { afgerond = true; klaar(); } }, 12000);
  }

  /* ----------------------------------------------------------- de montage */

  var i = -1, timer = null, tekstTimers = [], gepauzeerd = false;

  function speel(n) {
    if (!shots.length) return;

    if (i >= 0) {
      var vorig = shots[i];
      vorig.node.classList.remove('aan', 'tekst-aan', 'tekst-uit');
      if (vorig.media && vorig.media.tagName === 'VIDEO') vorig.media.pause();
      if (vorig.media) vorig.media.style.animation = 'none';
    }
    tekstTimers.forEach(clearTimeout);
    tekstTimers = [];

    i = ((n % shots.length) + shots.length) % shots.length;
    var s = shots[i];
    var d = s.d;

    // De overgang: standaard een harde cut. Een shot dat een nieuwe reeks
    // opent mag een korte dissolve krijgen; dat staat in inhoud.js.
    s.node.style.transitionDuration = (d.dissolve || 100) + 'ms';

    if (s.media) {
      if (s.media.tagName === 'VIDEO') {
        try { s.media.currentTime = d.van || 0; } catch (e) {}
        var p = s.media.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        // De beweging duurt precies zolang als het shot, zodat hij niet
        // halverwege wordt afgekapt en niet blijft hangen.
        s.media.style.animation = 'none';
        void s.media.offsetWidth;                  // de browser laten herstarten
        s.media.style.animation = 'tv-' + s.beweging + ' ' + (s.duur / 1000)
                                + 's linear forwards';
      }
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { s.node.classList.add('aan'); });
    });

    // Tekst komt niet op de cut maar even erna, en gaat waar gevraagd weg
    // voordat het volgende shot begint. Dat laat het beeld even alleen.
    var heeftTekst = s.isKaart || s.node.querySelector('.onderregel');
    if (heeftTekst) {
      var vanaf = (d.tekstVan != null ? d.tekstVan : (s.isKaart ? 0.25 : 0.55)) * 1000;
      tekstTimers.push(setTimeout(function () {
        s.node.classList.add('tekst-aan');
      }, vanaf));
      if (d.tekstTot != null) {
        tekstTimers.push(setTimeout(function () {
          s.node.classList.remove('tekst-aan');
          s.node.classList.add('tekst-uit');
        }, d.tekstTot * 1000));
      }
    }

    ververs();
    clearTimeout(timer);
    if (!gepauzeerd) timer = setTimeout(function () { speel(i + 1); }, s.duur);
  }

  function pauze() {
    gepauzeerd = !gepauzeerd;
    if (gepauzeerd) {
      clearTimeout(timer);
      var s = shots[i];
      if (s && s.media) {
        if (s.media.tagName === 'VIDEO') s.media.pause();
        else s.media.style.animationPlayState = 'paused';
      }
      melden('Pauze');
    } else {
      melden('Verder');
      speel(i);
    }
  }

  function melden(t) {
    meldingEl.textContent = t;
    meldingEl.classList.add('aan');
    clearTimeout(melden._t);
    melden._t = setTimeout(function () { meldingEl.classList.remove('aan'); }, 1300);
  }

  /* ------------------------------------------------------------- de tijd */

  function ververs() {
    var nu = new Date();
    if (IN.tijd !== false && tijdEl) {
      tijdEl.textContent = String(nu.getHours()).padStart(2, '0') + ':'
                         + String(nu.getMinutes()).padStart(2, '0');
    }
    var st = status(nu);
    kader.querySelectorAll('[data-nu]').forEach(function (n) {
      n.innerHTML = '<span class="stip' + (st.open ? '' : ' dicht') + '"></span>' + st.zin;
    });
    kader.querySelectorAll('.kaart-uren .rij').forEach(function (r) {
      r.classList.toggle('vandaag', Number(r.getAttribute('data-dag')) === nu.getDay());
    });
  }

  /* ------------------------------------------------------------- starten */

  var startDag = new Date().getDate();

  function start() {
    opbouwen();
    inladen(function () {
      speel(0);
      setInterval(ververs, 20000);
      setInterval(function () {
        var dag = new Date().getDate();
        if (dag !== startDag) { startDag = dag; opbouwen(); i = -1; speel(0); }
      }, 60000);
    });
  }

  document.addEventListener('keydown', function (e) {
    // Stappen laat de pauze staan: wie met een afstandsbediening door de
    // montage gaat, wil niet dat hij bij de eerste tik weer begint te lopen.
    if (e.key === 'ArrowRight') { speel(i + 1); }
    else if (e.key === 'ArrowLeft') { speel(i - 1); }
    else if (e.key === ' ') { e.preventDefault(); pauze(); }
    else if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    }
  });
  document.addEventListener('click', function () { speel(i + 1); });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
