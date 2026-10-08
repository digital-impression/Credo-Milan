/* ============================================================================
   Houdt het scherm draaiend als het netwerk wegvalt.

   Alles wat het scherm nodig heeft wordt bij de eerste keer opgeslagen. Daarna
   komt het uit de cache en gaat het netwerk alleen nog op zoek naar een
   nieuwere versie. Valt de wifi in de praktijk weg, dan merkt de wachtzaal
   daar niets van.

   Wijzig je iets aan de inhoud, verhoog dan VERSIE. De oude cache wordt dan
   opgeruimd en het scherm haalt alles opnieuw op.
   ========================================================================= */

var VERSIE = 'credo-tv-5';

var NODIG = [
  './',
  'index.html',
  'tv.css',
  'tv.js',
  'inhoud.js',
  'img/qr-boeken.svg',
  'img/qr-site.svg',

  'fonts/fonts.css',
  'fonts/anton-400-latin.woff2',
  'fonts/anton-400-latin-ext.woff2',
  'fonts/inter-400-latin.woff2',
  'fonts/inter-400-latin-ext.woff2',

  '../assets/img/keuze-performance.jpg',
  '../assets/img/keuze-rehab.jpg',
  '../assets/img/performance/bewegen.jpg',
  '../assets/img/performance/krachttraining.jpg',
  '../assets/img/performance/screening.jpg',
  '../assets/img/performance/sportvoeding.jpg',
  '../assets/img/rehab/manuele-therapie.jpg',
  '../assets/img/rehab/oefentherapie.jpg',
  '../assets/img/reviews/luna.jpg',
  '../assets/img/reviews/michiel.jpg',
  '../assets/img/reviews/valerie.jpg',
  '../assets/img/studio-ijsbad.jpg',
  '../assets/img/studio-inkom.jpg',
  '../assets/img/studio-oefenzaal.jpg',
  '../assets/img/studio-piste.jpg',
  '../assets/img/team/bas.jpg',
  '../assets/img/team/dries.jpg',
  '../assets/img/team/milan.jpg',
  '../assets/img/team/philippe.jpg',
  '../assets/img/team/rimke.jpg',
  '../assets/img/team/thomas.jpg',
  '../assets/img/team/tuur.jpg',
  '../assets/img/vloer/01.jpg',
  '../assets/img/vloer/02.jpg',
  '../assets/img/vloer/05.jpg',
  '../assets/img/vloer/07.jpg',
  '../assets/img/vloer/09.jpg',
  '../assets/img/zaal1.jpg',
  '../assets/img/zaal4.jpg',
  '../assets/video/hero-performance.webm',
  '../assets/video/hero-performance.mp4',
  '../assets/video/hero-rehab.webm',
  '../assets/video/hero-rehab.mp4',
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSIE).then(function (c) {
      // Eén ontbrekend bestand mag de hele installatie niet tegenhouden.
      return Promise.all(NODIG.map(function (u) {
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

  // Een videospeler vraagt geen heel bestand op maar stukken ervan, met een
  // Range-kop. Zo'n verzoek komt niet overeen met het volledige antwoord in
  // de cache, dus zonder dit valt het terug op het netwerk - en offline blijft
  // het beeld dan zwart. Hier wordt het gevraagde stuk uit het gecachete
  // bestand gesneden en als 206 teruggegeven, zoals een server zou doen.
  var bereik = e.request.headers.get('range');
  if (bereik) {
    e.respondWith(uitBereik(e.request, bereik));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function (hit) {
      // Uit de cache serveren en ondertussen op de achtergrond verversen.
      var net = fetch(e.request).then(function (r) {
        if (r && r.status === 200 && r.type === 'basic') {
          var kopie = r.clone();
          caches.open(VERSIE).then(function (c) { c.put(e.request, kopie); });
        }
        return r;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});

function uitBereik(verzoek, bereik) {
  // "bytes=12345-" of "bytes=12345-23456"
  var m = /bytes=(\d*)-(\d*)/.exec(bereik);
  return caches.open(VERSIE).then(function (c) {
    return c.match(verzoek.url).then(function (hit) {
      if (!hit) return fetch(verzoek);
      return hit.arrayBuffer().then(function (buf) {
        var totaal = buf.byteLength;
        var start = m && m[1] ? parseInt(m[1], 10) : 0;
        var eind = m && m[2] ? parseInt(m[2], 10) : totaal - 1;
        if (eind >= totaal) eind = totaal - 1;
        if (start > eind) {
          return new Response(null, { status: 416,
            headers: { 'Content-Range': 'bytes */' + totaal } });
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
    });
  }).catch(function () { return fetch(verzoek); });
}
