/* ============================================================================
   DE MONTAGE VOOR HET SCHERM IN DE WACHTZAAL

   Dit is het enige bestand dat je aanraakt om iets te wijzigen. De opmaak zit
   in tv.css, de werking in tv.js.

   Het is een shotlijst, geen diareeks. Elk shot heeft een duur in seconden en
   een beweging; de cut ertussen is hard. De duren verschillen bewust: twee
   seconden, dan vijf, dan anderhalf. Allemaal even lang voelt meteen als een
   diavoorstelling, en dat is precies wat het niet mag zijn.

   Een shot is een van deze drie:

     beeld:  '..../foto.jpg'     een still die beweegt
     video:  '..../clip.mp4'     een stuk uit een filmbestand, met `van` als
                                 in-punt in seconden
     kaart:  'woord'             een tussentitel op zwart

   BEWEGINGEN    in · uit · links · rechts · op · neer · stil
   KADREREN      positie: '50% 38%'   waar het breedbeeldkader in het beeld
                                      valt; nodig bij vierkante en staande
                                      foto's, anders zie je de schouders en
                                      niet het onderwerp
                 portret: true        voor gezichten: de foto staat rechts op
                                      zijn eigen hoogte met de naam ernaast,
                                      zodat het hoofd heel blijft
   TEKST         reuze · groot · mid · citaat · onder · regel · extra
                 tekstVan  wanneer de tekst opkomt (standaard 0,55 s)
                 tekstTot  wanneer hij weer weggaat; laat weg om hem te laten
                           staan tot de cut
   OVERGANG      dissolve: 450   een zachte overgang in plaats van een cut;
                                 alleen gebruiken waar een nieuwe reeks begint

   Een shot kan ook `van` en `tot` als datum krijgen (JJJJ-MM-DD) en verschijnt
   dan alleen in die periode - voor een sluitingsbericht bijvoorbeeld.
   ========================================================================= */

window.CREDO_TV = {

  instellingen: {
    tijd: true,            // de tijd klein in de onderste zwarte balk
  },

  praktijk: {
    naam:  'Credo Rehab & Performance',
    adres: 'Kapelstraat 89 · 3590 Diepenbeek',
    tel:   '+32 480 62 85 45',
    mail:  'info@credokinesitherapie.be',
    site:  'credorehabandperformance.com',
    btw:   'BTW BE 0756.834.184',
    // 0 = zondag, 1 = maandag ... 6 = zaterdag
    uren: [
      { dag: 'Zondag',    open: null,    dicht: null    },
      { dag: 'Maandag',   open: '08:00', dicht: '21:00' },
      { dag: 'Dinsdag',   open: '08:00', dicht: '21:00' },
      { dag: 'Woensdag',  open: '08:00', dicht: '21:00' },
      { dag: 'Donderdag', open: '08:00', dicht: '21:00' },
      { dag: 'Vrijdag',   open: '08:00', dicht: '21:00' },
      { dag: 'Zaterdag',  open: null,    dicht: null    },
    ],
  },

  montage: [

    /* ---- koud openen. Geen tekst: eerst drie shots beeld. -------------- */

    { video: '../assets/video/hero-performance.mp4', van: 0,   duur: 2.8 },
    { beeld: '../assets/img/vloer/05.jpg', positie: '50% 42%',           duur: 1.9, beweging: 'in' },
    { video: '../assets/video/hero-performance.mp4', van: 7.0, duur: 2.6 },

    /* ---- de titel, over beeld ----------------------------------------- */

    { beeld: '../assets/img/keuze-performance.jpg', positie: '50% 30%', duur: 4.8, beweging: 'uit',
      dissolve: 500, tekstVan: 0.8,
      reuze: 'Credo', onder: 'Rehab &amp; Performance' },

    { beeld: '../assets/img/studio-oefenzaal.jpg', positie: '50% 46%', duur: 3.4, beweging: 'links',
      onder: 'Kapelstraat 89 &middot; 3590 Diepenbeek' },

    /* ---- wat de naam betekent ------------------------------------------ */

    { kaart: 'woord', duur: 6.5, dissolve: 500,
      woord: 'Credo',
      spreek: '[ˈkre-do]',
      uitleg: 'Een persoonlijke verklaring van overtuiging. Letterlijk: <em>ik geloof</em>.' },

    /* ---- de plek ------------------------------------------------------- */

    { beeld: '../assets/img/studio-inkom.jpg', positie: '50% 38%',   duur: 2.2, beweging: 'in' },
    { beeld: '../assets/img/zaal1.jpg', positie: '50% 44%',          duur: 2.9, beweging: 'rechts',
      tekstVan: 0.6, tekstTot: 2.4, mid: 'Vijfhonderd<br>vierkante meter' },
    { beeld: '../assets/img/studio-piste.jpg', positie: '50% 42%',   duur: 2.0, beweging: 'op' },
    { beeld: '../assets/img/vloer/02.jpg', positie: '50% 40%',       duur: 2.3, beweging: 'in' },
    { beeld: '../assets/img/studio-ijsbad.jpg', positie: '50% 50%',  duur: 1.9, beweging: 'uit' },

    /* ---- de cijfers. Drie keer één getal, hard achter elkaar. ---------- */

    { beeld: '../assets/img/performance/bewegen.jpg', positie: '50% 42%', duur: 2.7, beweging: 'in',
      tekstVan: 0.3, reuze: '1469+', onder: 'Pati&euml;nten' },
    { beeld: '../assets/img/rehab/oefentherapie.jpg', positie: '50% 40%', duur: 2.5, beweging: 'links',
      tekstVan: 0.3, reuze: '5&ndash;91', onder: 'Jaar &middot; jongste tot oudste' },
    { beeld: '../assets/img/zaal4.jpg', positie: '50% 36%',               duur: 2.5, beweging: 'in',
      tekstVan: 0.3, reuze: '7', onder: 'Therapeuten' },

    /* ---- wat we doen --------------------------------------------------- */

    { video: '../assets/video/hero-rehab.mp4', van: 0, duur: 2.9, dissolve: 400,
      tekstVan: 0.5, tekstTot: 2.4, mid: 'Manuele therapie' },
    { beeld: '../assets/img/rehab/manuele-therapie.jpg', positie: '50% 44%',      duur: 2.6, beweging: 'in' },
    { beeld: '../assets/img/rehab/oefentherapie.jpg', positie: '50% 40%',         duur: 2.6, beweging: 'rechts',
      tekstVan: 0.5, tekstTot: 2.2, mid: 'Oefentherapie' },
    { beeld: '../assets/img/performance/krachttraining.jpg', positie: '50% 38%',  duur: 2.9, beweging: 'uit',
      tekstVan: 0.5, tekstTot: 2.5, mid: 'Performance training' },
    { beeld: '../assets/img/performance/sportvoeding.jpg', positie: '50% 42%',    duur: 2.4, beweging: 'in',
      tekstVan: 0.4, tekstTot: 2.1, mid: 'Sportvoeding' },
    { beeld: '../assets/img/performance/screening.jpg', positie: '50% 36%',       duur: 2.7, beweging: 'links',
      tekstVan: 0.4, tekstTot: 2.4, mid: 'Screening &amp; opvolging' },

    /* ---- het team. Portret, naam, één regel, één persoonlijk detail. --- */

    { beeld: '../assets/img/team/thomas.jpg', portret: true, duur: 3.7, beweging: 'in', dissolve: 400,
      groot: 'Thomas Casier', onder: 'Kinesist &amp; zaakvoerder',
      regel: 'Manuele therapie &middot; sportvoeding &middot; Torpedo Hasselt',
      extra: 'Favoriet nummer &mdash; Oasis, Don&rsquo;t Look Back In Anger' },

    { beeld: '../assets/img/team/milan.jpg', portret: true, duur: 3.7, beweging: 'op',
      groot: 'Milan Vandecaetsbeek', onder: 'Kinesist &amp; zaakvoerder',
      regel: 'Sportletsels &middot; Red Flames &middot; Genk Ladies',
      extra: 'Favoriete speler &mdash; Messi en Pedri' },

    { beeld: '../assets/img/team/tuur.jpg', portret: true, duur: 3.7, beweging: 'in',
      groot: 'Tuur Vanderstukken', onder: 'Kinesist &amp; zaakvoerder',
      regel: 'Dry needling &middot; OH Leuven &middot; Lommel SK',
      extra: 'Favoriete speler &mdash; Michael Jordan' },

    { beeld: '../assets/img/team/rimke.jpg', portret: true, duur: 3.7, beweging: 'neer',
      groot: 'Rimke Eurlings', onder: 'Kinesist',
      regel: 'Sportletsels &middot; Sporting Hasselt &middot; UHasselt',
      extra: 'Favoriete ploeg &mdash; de Belgian Cats' },

    { beeld: '../assets/img/team/philippe.jpg', portret: true, duur: 3.7, beweging: 'in',
      groot: 'Philippe Valvekens', onder: 'Kinesist',
      regel: 'Sportletsels &middot; dry needling',
      extra: 'Favoriete speler &mdash; Mbapp&eacute;' },

    { beeld: '../assets/img/team/dries.jpg', portret: true, duur: 3.7, beweging: 'op',
      groot: 'Dries Verschueren', onder: 'Kinesist',
      regel: 'Sportletsels &middot; dry needling &middot; Sporting Hasselt',
      extra: 'Favoriet eten &mdash; birria taco&rsquo;s' },

    { beeld: '../assets/img/team/bas.jpg', portret: true, duur: 3.7, beweging: 'in',
      groot: 'Bas Van Bael', onder: 'Kinesist',
      regel: 'Sportletsels' },

    /* ---- waar we mee werken. De truien aan het rek zeggen het al. ------ */

    { beeld: '../assets/img/vloer/07.jpg', positie: '50% 46%', duur: 4.4, beweging: 'in', dissolve: 400,
      tekstVan: 0.5, mid: 'Waar we mee werken',
      regel: 'Sporting Hasselt &middot; KRC Genk Ladies &middot; Red Flames &middot; '
           + 'OH Leuven &middot; Lommel SK &middot; Torpedo Hasselt' },
    { beeld: '../assets/img/vloer/09.jpg', positie: '50% 44%', duur: 2.2, beweging: 'links' },

    /* ---- wat mensen zeggen --------------------------------------------- */

    { beeld: '../assets/img/reviews/michiel.jpg', portret: true, duur: 6.6, beweging: 'stil',
      dissolve: 450, tekstVan: 0.6,
      citaat: 'Ik weet dat ik hier omringd ben door mensen die het beste uit mij willen halen.',
      onder: 'Michiel Partoens &middot; profbokser' },

    { beeld: '../assets/img/reviews/luna.jpg', portret: true, duur: 6.2, beweging: 'stil',
      tekstVan: 0.6,
      citaat: 'Ik ben sterker geworden in de duels en ook mijn topsnelheid is sterk verbeterd.',
      onder: 'Luna Vanzeir &middot; Red Flames' },

    { beeld: '../assets/img/reviews/valerie.jpg', portret: true, duur: 6.6, beweging: 'stil',
      tekstVan: 0.6,
      citaat: 'Sport leeft er echt, van professionele sporters tot recreanten. Die omgeving werkt aanstekelijk.',
      onder: 'Val&eacute;rie Vandecaetsbeek &middot; Run&amp;Roast Hasselt' },

    /* ---- de kaarten. Wat je moet kunnen lezen, staat op zwart. --------- */

    { kaart: 'uren', duur: 9, dissolve: 500,
      oog: 'Openingsuren', kop: 'Wanneer we<br>open zijn' },

    { kaart: 'tarieven', duur: 17,
      oog: 'Tarieven', kop: 'Honoraria',
      kolommen: ['Pathologie', 'Honorarium', 'Bijdrage pati&euml;nt',
                 'Eenmalige dossierkost', 'Bijdrage pati&euml;nt dossierkost'],
      rijen: [
        ['Courant',      '&euro;36,00', '[TE BEVESTIGEN]', '&euro;7,38',  '&euro;1,84'],
        ['F-acuut',      '&euro;36,00', '&euro;16,39', '&euro;33,75', '&euro;8,43'],
        ['F-chronisch',  '&euro;36,00', '&euro;16,39', '&euro;32,86', '&euro;8,21'],
        ['E-pathologie', '&euro;36,00', '&euro;5,74',  '&euro;33,75', '&euro;0,00'],
        ['Huisbezoek',   '&euro;37,16', '&euro;15,73', '&euro;32,86', '&euro;8,21'],
      ],
      voet: 'Wij zijn een niet-geconventioneerde praktijk. Onze tarieven kunnen '
          + 'dus afwijken van de conventietarieven.' },

    { kaart: 'zin', duur: 11,
      oog: 'Je afspraak', kop: 'Een afspraak<br>verzetten',
      nl: 'Laat het ons tijdig weten als je niet aanwezig kan zijn. Annulaties '
        + 'binnen 24 uur kunnen aangerekend worden.',
      en: 'Please let us know in good time if you cannot attend. Cancellations '
        + 'within 24 hours may be subject to a fee.' },

    { kaart: 'prijs', duur: 7.5,
      oog: 'In de praktijk', kop: 'Credo merch',
      prijs: '&euro;20', per: 'per shirt',
      nl: 'Vraag het aan een van onze therapeuten.' },

    /* ---- afsluiten ----------------------------------------------------- */

    { kaart: 'boeken', duur: 12, dissolve: 500,
      oog: 'Afspraak', kop: 'Boek je<br>afspraak',
      nl: 'Scan de code, of bel ons. Online boeken kan dag en nacht.',
      codes: [
        { qr: 'img/qr-boeken.svg', label: 'Afspraak maken' },
        { qr: 'img/qr-site.svg',   label: 'Onze website' },
      ] },

    { video: '../assets/video/hero-performance.mp4', van: 3.6, duur: 3.0,
      dissolve: 450 },
    { beeld: '../assets/img/keuze-rehab.jpg', positie: '50% 34%', duur: 2.4, beweging: 'uit' },
    { beeld: '../assets/img/vloer/01.jpg', positie: '50% 44%',    duur: 3.0, beweging: 'in',
      tekstVan: 0.7, groot: 'Credo', onder: 'credorehabandperformance.com' },

  ],
};
