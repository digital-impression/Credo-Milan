/* ============================================================================
   Houdt het scherm draaiend als het netwerk wegvalt.

   Alles wat het scherm nodig heeft wordt bij de eerste keer opgeslagen. Daarna
   komt het uit de cache en gaat het netwerk alleen nog op zoek naar een
   nieuwere versie. Valt de wifi in de praktijk weg, dan merkt de wachtzaal
   daar niets van.

   Welke foto's en video's er nodig zijn, leest dit bestand zelf uit
   inhoud.js. Een nieuwe foto in de inhoud komt dus vanzelf mee in de cache.

   Wijzig je iets aan de inhoud, verhoog dan VERSIE. De oude cache wordt dan
   opgeruimd en het scherm haalt alles opnieuw op.
   ========================================================================= */

var VERSIE = 'credo-tv-7';

var VAST = [
  './',
  'index.html',
  'tv.css',
  'tv.js',
  'inhoud.js',
  'fonts/fonts.css',
  'fonts/anton-400-latin.woff2',
  'fonts/anton-400-latin-ext.woff2',
  'fonts/inter-400-latin.woff2',
  'fonts/inter-400-latin-ext.woff2',
  'fonts/newsreader-latin.woff2',
  'fonts/newsreader-latin-ext.woff2',
  'fonts/newsreader-italic-latin.woff2',
  'fonts/newsreader-italic-latin-ext.woff2',
];

// inhoud.js schrijft naar window.CREDO_TV; in een service worker heet dat self.
self.window = self;
try { importScripts('inhoud.js'); } catch (e) { console.warn('inhoud.js niet gelezen', e); }

function bestandenUitInhoud() {
  var uit = [];
  (function zoek(v, sleutel) {
    if (typeof v === 'string') {
      if (/\.(jpe?g|png|svg|webp)$/i.test(v)) uit.push(v);
      // Een video staat zonder extensie in de inhoud; het scherm kiest zelf.
      else if (sleutel === 'video') { uit.push(v + '.webm'); uit.push(v + '.mp4'); }
    } else if (v && typeof v === 'object') {
      for (var k in v) zoek(v[k], Array.isArray(v) ? sleutel : k);
    }
  })(self.CREDO_TV || {}, '');
  return uit.filter(function (u, i) { return uit.indexOf(u) === i; });
}

self.addEventListener('install', function (e) {
  var nodig = VAST.concat(bestandenUitInhoud());
  e.waitUntil(
    caches.open(VERSIE).then(function (c) {
      // Eén ontbrekend bestand mag de hele installatie niet tegenhouden.
      return Promise.all(nodig.map(function (u) {
        return c.add(u).catch(function () { console.warn('niet gecachet:', u); });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(namen.filter(function (n) { return n !== VERSIE; })
                              .map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url.split('#')[0];

  // Een videospeler vraagt geen heel bestand op maar stukken ervan, met een
  // Range-kop, en verwacht een 206 terug. Hier wordt het gevraagde stuk uit
  // het gecachete bestand gesneden, zoals een server zou doen; anders blijft
  // de video offline zwart.
  var bereik = e.request.headers.get('range');
  if (bereik) { e.respondWith(uitBereik(e.request, url, bereik)); return; }

  e.respondWith(
    caches.match(url, { ignoreSearch: true }).then(function (hit) {
      // Uit de cache serveren en ondertussen op de achtergrond verversen.
      var net = fetch(e.request).then(function (r) {
        if (r && r.status === 200 && r.type === 'basic') {
          var kopie = r.clone();
          caches.open(VERSIE).then(function (c) { c.put(url, kopie); });
        }
        return r;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});

function uitBereik(verzoek, url, bereik) {
  // "bytes=12345-", "bytes=12345-23456" of "bytes=-500" (de laatste 500)
  var m = /bytes=(\d*)-(\d*)/.exec(bereik);
  return caches.match(url, { ignoreSearch: true }).then(function (hit) {
    if (!hit || !m) return fetch(verzoek);
    return hit.arrayBuffer().then(function (buf) {
      var totaal = buf.byteLength, start, eind;
      if (m[1] === '' && m[2] !== '') { start = Math.max(0, totaal - parseInt(m[2], 10)); eind = totaal - 1; }
      else { start = parseInt(m[1] || '0', 10); eind = m[2] ? Math.min(parseInt(m[2], 10), totaal - 1) : totaal - 1; }
      if (start > eind) {
        return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + totaal } });
      }
      return new Response(buf.slice(start, eind + 1), {
        status: 206,
        statusText: 'Partial Content',
        headers: {
          'Content-Type': hit.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Length': String(eind - start + 1),
          'Content-Range': 'bytes ' + start + '-' + eind + '/' + totaal,
          'Accept-Ranges': 'bytes',
        },
      });
    });
  }).catch(function () { return fetch(verzoek); });
}
