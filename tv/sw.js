/* ============================================================================
   Houdt het scherm draaiend als het netwerk wegvalt.

   Alles wat het scherm nodig heeft wordt bij de eerste keer opgeslagen. Daarna
   komt het uit de cache en gaat het netwerk alleen nog op zoek naar een
   nieuwere versie. Valt de wifi in de praktijk weg, dan merkt de wachtzaal
   daar niets van.

   Wijzig je iets aan de inhoud, verhoog dan VERSIE. De oude cache wordt dan
   opgeruimd en het scherm haalt alles opnieuw op.
   ========================================================================= */

var VERSIE = 'credo-tv-1';

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
  '../assets/img/rehab/hero-still.jpg',
  '../assets/img/studio-oefenzaal.jpg',
  '../assets/img/vloer/04.jpg',
  '../assets/img/studio-inkom.jpg',

  '../assets/img/team/thomas.jpg',
  '../assets/img/team/milan.jpg',
  '../assets/img/team/tuur.jpg',
  '../assets/img/team/rimke.jpg',
  '../assets/img/team/philippe.jpg',
  '../assets/img/team/dries.jpg',
  '../assets/img/team/bas.jpg',

  '../assets/img/reviews/michiel.jpg',
  '../assets/img/reviews/luna.jpg',
  '../assets/img/reviews/valerie.jpg',

  '../assets/img/partners/sporting-hasselt.png',
  '../assets/img/partners/genk-ladies.png',
  '../assets/img/partners/rbfa.png',
  '../assets/img/partners/oh-leuven.png',
  '../assets/img/partners/lommel-sk.png',
  '../assets/img/partners/torpedo-hasselt.png',
  '../assets/img/partners/6d-sports-nutrition.png',
  '../assets/img/partners/vald.png',
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
