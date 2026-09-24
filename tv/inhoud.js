/* ============================================================================
   DE INHOUD VAN HET SCHERM IN DE WACHTZAAL

   Dit is het enige bestand dat je moet aanraken om iets te wijzigen. De
   opmaak zit in tv.css, de werking in tv.js; die blijven zoals ze zijn.

   Elke slide heeft een `soort`. Die bepaalt hoe hij eruitziet. De soorten
   staan onderaan opgesomd. `duur` is in seconden; laat je hem weg, dan geldt
   de standaardduur hieronder.

   Een slide kan ook `van` en `tot` krijgen (JJJJ-MM-DD). Hij verschijnt dan
   alleen in die periode - handig voor een sluitingsbericht of een actie.
   ========================================================================= */

window.CREDO_TV = {

  instellingen: {
    standaardDuur: 10,        // seconden per slide als er niets anders staat
    overgang: 900,            // duur van de overvloeier in milliseconden
    voortgangsbalk: true,     // het dunne streepje onderaan
    klok: true,               // de tijd rechtsboven
  },

  praktijk: {
    naam:   'Credo Rehab & Performance',
    adres:  'Kapelstraat 89 · 3590 Diepenbeek',
    tel:    '+32 480 62 85 45',
    mail:   'info@credokinesitherapie.be',
    site:   'credokinesitherapie.be',
    btw:    'BTW BE 0756.834.184',
    // 0 = zondag, 1 = maandag ... 6 = zaterdag
    uren: [
      { dag: 'Zondag',    open: null,  dicht: null  },
      { dag: 'Maandag',   open: '08:00', dicht: '21:00' },
      { dag: 'Dinsdag',   open: '08:00', dicht: '21:00' },
      { dag: 'Woensdag',  open: '08:00', dicht: '21:00' },
      { dag: 'Donderdag', open: '08:00', dicht: '21:00' },
      { dag: 'Vrijdag',   open: '08:00', dicht: '21:00' },
      { dag: 'Zaterdag',  open: null,  dicht: null  },
    ],
  },

  slides: [

    { soort: 'merk', duur: 8,
      beeld: '../assets/img/keuze-performance.jpg',
      titel: 'Credo',
      onder: 'Rehab &amp; Performance',
      regel: 'Kinesitherapie · Revalidatie · Performance training' },

    { soort: 'woord', duur: 11, oog: 'De naam',
      woord: 'Credo',
      uitspraak: '[ˈkre-do] (kray-do)',
      betekenis: 'Een plechtige of persoonlijke verklaring van geloof of '
               + 'overtuiging. Letterlijk: <em>ik geloof</em>.',
      beeld: '../assets/img/rehab/hero-still.jpg' },

    { soort: 'uren', duur: 10, oog: 'Openingsuren',
      kop: 'Wanneer<br>we open zijn',
      beeld: '../assets/img/zaal1.jpg' },

    { soort: 'cijfers', duur: 10, oog: 'In cijfers',
      beeld: '../assets/img/performance/bewegen.jpg',
      kop: 'Drie cijfers.',
      accent: 'Eén doel.',
      rijen: [
        { cijfer: '1469+', naam: 'Patiënten',   sub: 'sporters &amp; niet-sporters' },
        { cijfer: '5–91',  naam: 'Jaar',        sub: 'jongste tot oudste patiënt' },
        { cijfer: '7',     naam: 'Therapeuten', sub: 'voor ieder een fit' },
      ] },

    { soort: 'aanbod', duur: 12, oog: 'Ons aanbod',
      beeld: '../assets/img/rehab/manuele-therapie.jpg',
      kop: 'Wat we doen',
      items: [
        { titel: 'Manuele therapie &amp; kinesitherapie',
          tekst: 'Gericht onderzoek, handen aan het werk, en een plan met een eindpunt.' },
        { titel: 'Oefentherapie',
          tekst: 'Opbouw in de zaal, met elke week een stap die je voelt.' },
        { titel: 'Performance training',
          tekst: 'Kracht, snelheid en belastbaarheid, gemeten in plaats van geschat.' },
        { titel: 'Sportvoeding',
          tekst: 'Wat je eet als onderdeel van het herstel, niet als bijzaak.' },
      ] },

    // ---- het team ---------------------------------------------------------
    { soort: 'persoon', duur: 11,
      nummer: '01', naam: 'Thomas Casier', rol: 'Kinesist &amp; zaakvoerder',
      beeld: '../assets/img/team/thomas.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Master manuele therapie', 'Specialisatie sportvoeding',
                    'Kinesitherapeut Torpedo Hasselt'],
      favoriet: { 'Ploeg': 'Club Brugge / Tottenham', 'Speler': 'Kane',
                  'Hobby': 'Lopen / fietsen', 'Eten': 'Worst met appelmoes',
                  'Artiest': 'Elvis Presley', 'Nummer': 'Oasis – Don’t Look Back In Anger',
                  'Reisbestemming': 'Colombia' } },

    { soort: 'persoon', duur: 11,
      nummer: '02', naam: 'Milan Vandecaetsbeek', rol: 'Kinesist &amp; zaakvoerder',
      beeld: '../assets/img/team/milan.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Specialisatie sportletsels', 'Strength coach Sporting Hasselt (2025–2026)',
                    'Physical coach Genk Ladies (2024–2026)', 'Physical coach Red Flames'],
      favoriet: { 'Ploeg': 'Sporting Hasselt / KRC Genk / FC Barcelona',
                  'Speler': 'Messi / Pedri', 'Hobby': 'Gym &amp; familie / vrienden',
                  'Eten': 'Tonijnsteak', 'Artiest': 'Dave',
                  'Nummer': 'Jul – J’oublie tout', 'Reisbestemming': 'Bali' } },

    { soort: 'persoon', duur: 11,
      nummer: '03', naam: 'Tuur Vanderstukken', rol: 'Kinesist &amp; zaakvoerder',
      beeld: '../assets/img/team/tuur.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Specialisatie sportletsels', 'Dry needling',
                    'Blood flow restriction training', 'Physical coach OH Leuven (2025–2026)',
                    'Physical coach Lommel SK (2026–heden)'],
      favoriet: { 'Ploeg': 'FC Barcelona', 'Speler': 'Michael Jordan',
                  'Hobby': 'Sporten', 'Eten': 'Risotto', 'Artiest': 'The Cure',
                  'Nummer': 'A Forest', 'Reisbestemming': 'Madeira' } },

    { soort: 'persoon', duur: 11,
      nummer: '04', naam: 'Rimke Eurlings', rol: 'Kinesist',
      beeld: '../assets/img/team/rimke.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Specialisatie sportletsels', 'Coach Sporting Hasselt (2021–heden)',
                    'Praktijkassistent UHasselt'],
      favoriet: { 'Ploeg': 'Sporting Hasselt Ladies / Belgian Cats',
                  'Speler': 'Saar Janssen',
                  'Hobby': 'Voetbalcoach / uiteten en drinken met vrienden',
                  'Eten': 'Mexicaans', 'Artiest': 'Ed Sheeran / Macklemore',
                  'Nummer': 'Mattafix – Big City Life', 'Reisbestemming': 'Curaçao' } },

    { soort: 'persoon', duur: 11,
      nummer: '05', naam: 'Philippe Valvekens', rol: 'Kinesist',
      beeld: '../assets/img/team/philippe.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Specialisatie sportletsels', 'Dry needling'],
      favoriet: { 'Ploeg': 'Sporting Hasselt / KRC Genk / Real Madrid',
                  'Speler': 'Mbappé', 'Hobby': 'Skiën / gym &amp; voetbal',
                  'Eten': 'Sushi', 'Artiest': 'Jul',
                  'Nummer': 'Effe Serieus – Baila de Gasolina', 'Reisbestemming': 'Ibiza' } },

    { soort: 'persoon', duur: 11,
      nummer: '06', naam: 'Dries Verschueren', rol: 'Kinesist',
      beeld: '../assets/img/team/dries.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Specialisatie sportletsels',
                    'Kinesitherapeut Sporting Hasselt (2025–heden)', 'Dry needling'],
      favoriet: { 'Ploeg': 'Sporting Hasselt / Standard de Liège',
                  'Speler': 'Justin Munezero', 'Hobby': 'Voetbal / fietsen',
                  'Eten': 'Birria taco’s', 'Artiest': 'Funk Tribu',
                  'Nummer': 'Funk Tribu – Azul', 'Reisbestemming': 'Mexico' } },

    { soort: 'persoon', duur: 11,
      nummer: '07', naam: 'Bas Van Bael', rol: 'Kinesist',
      beeld: '../assets/img/team/bas.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Specialisatie sportletsels'],
      // Bas stond nog niet in de oude slideshow; dit vult de praktijk zelf aan.
      favoriet: null },

    // ---- de zaal ----------------------------------------------------------
    { soort: 'beeld', duur: 8, oog: 'De praktijk',
      beeld: '../assets/img/studio-oefenzaal.jpg',
      label: 'De zaal', tekst: 'Vijfhonderd vierkante meter, en alles staat er om gebruikt te worden.' },

    { soort: 'partners', duur: 11, oog: 'Samenwerkingen',
      beeld: '../assets/img/vloer/07.jpg',
      kop: 'Waar we mee samenwerken',
      logos: [
        { bron: '../assets/img/partners/sporting-hasselt.png',    naam: 'Sporting Hasselt' },
        { bron: '../assets/img/partners/genk-ladies.png',         naam: 'KRC Genk Ladies' },
        { bron: '../assets/img/partners/rbfa.png',                naam: 'Royal Belgian FA' },
        { bron: '../assets/img/partners/oh-leuven.png',           naam: 'OH Leuven' },
        { bron: '../assets/img/partners/lommel-sk.png',           naam: 'Lommel SK' },
        { bron: '../assets/img/partners/torpedo-hasselt.png',     naam: 'Torpedo Hasselt' },
        { bron: '../assets/img/partners/6d-sports-nutrition.png', naam: '6d Sports Nutrition' },
        { bron: '../assets/img/partners/vald.png',                naam: 'VALD' },
      ] },

    // ---- wat mensen zeggen ------------------------------------------------
    { soort: 'recensie', duur: 13,
      beeld: '../assets/img/reviews/michiel.jpg',
      naam: 'Michiel Partoens', rol: 'Profbokser',
      tekst: 'Al vier jaar werk ik samen met Credo en ik voel me er perfect '
           + 'ondersteund. Zowel bij het herstellen van blessures als in het '
           + 'verbeteren van mijn fysieke prestaties. Ik weet dat ik hier omringd '
           + 'ben door mensen die het beste uit mij willen halen.' },

    { soort: 'recensie', duur: 13,
      beeld: '../assets/img/reviews/luna.jpg',
      naam: 'Luna Vanzeir', rol: 'Red Flames',
      tekst: 'Ik werk ondertussen al enkele jaren samen met Credo en merk echt '
           + 'hoeveel ik fysiek ben vooruitgegaan. Ik ben sterker geworden in de '
           + 'duels en ook mijn topsnelheid is sterk verbeterd.' },

    { soort: 'recensie', duur: 13,
      beeld: '../assets/img/reviews/valerie.jpg',
      naam: 'Valérie Vandecaetsbeek', rol: 'Run&amp;Roast Hasselt',
      tekst: 'Wat ik ook fijn vind, is de sfeer: sport leeft er echt, van '
           + 'professionele sporters tot recreanten. Die omgeving werkt aanstekelijk '
           + 'en motiveert. Een plek waar ik me goed voel en waar ik altijd met veel '
           + 'vertrouwen terechtkan.' },

    // ---- het zakelijke ----------------------------------------------------
    { soort: 'honoraria', duur: 18, oog: 'Tarieven',
      beeld: '../assets/img/performance/screening.jpg',
      kop: 'Honoraria',
      kolommen: ['Pathologie', 'Honorarium', 'Bijdrage patiënt',
                 'Eenmalige dossierkost', 'Bijdrage patiënt dossierkost'],
      rijen: [
        ['Courant',      '€36,00', '[TE BEVESTIGEN]', '€7,38',  '€1,84'],
        ['F-acuut',      '€36,00', '€16,39', '€33,75', '€8,43'],
        ['F-chronisch',  '€36,00', '€16,39', '€32,86', '€8,21'],
        ['E-pathologie', '€36,00', '€5,74',  '€33,75', '€0,00'],
        ['Huisbezoek',   '€37,16', '€15,73', '€32,86', '€8,21'],
      ],
      voet: 'Wij zijn een niet-geconventioneerde praktijk. Onze tarieven kunnen '
          + 'dus afwijken van de conventietarieven.' },

    { soort: 'beleid', duur: 14, oog: 'Je afspraak',
      beeld: '../assets/img/vloer/09.jpg',
      kop: 'Een afspraak<br>verzetten',
      nl: 'Laat het ons tijdig weten als je niet aanwezig kan zijn of je afspraak '
        + 'wil verplaatsen. Annulaties binnen 24 uur kunnen aangerekend worden.',
      en: 'Please let us know in good time if you cannot attend or need to '
        + 'reschedule. Cancellations within 24 hours may be subject to a fee.' },

    { soort: 'merch', duur: 9, oog: 'In de praktijk',
      kop: 'Credo merch',
      prijs: '€20',
      per: 'per shirt',
      tekst: 'Vraag het aan een van onze therapeuten.',
      beeld: '../assets/img/vloer/04.jpg' },

    { soort: 'boeken', duur: 14, oog: 'Afspraak',
      beeld: '../assets/img/studio-inkom.jpg',
      kop: 'Boek je<br>afspraak',
      tekst: 'Scan de code, of bel ons. Online boeken kan dag en nacht.',
      qr: 'img/qr-boeken.svg',
      qrLabel: 'Afspraak maken',
      qr2: 'img/qr-site.svg',
      qr2Label: 'Onze website' },

  ],
};

/* ----------------------------------------------------------------------------
   DE SOORTEN SLIDES

   merk       beeld, titel, onder, regel
   woord      woord, uitspraak, betekenis, beeld
   uren       (geen velden - leest de openingsuren hierboven)
   cijfers    kop, accent, rijen[{cijfer, naam, sub}]
   aanbod     kop, items[{titel, tekst}]
   persoon    nummer, naam, rol, beeld, credentials[], favoriet{} of null
   beeld      beeld, label, tekst
   partners   kop, logos[{bron, naam}]
   recensie   beeld, naam, rol, tekst
   honoraria  kop, kolommen[], rijen[[]], voet
   beleid     kop, nl, en
   merch      kop, prijs, per, tekst, beeld
   boeken     kop, tekst, qr, qrLabel, qr2, qr2Label

   Een waarde die letterlijk [TE BEVESTIGEN] is, wordt op het scherm gemarkeerd
   in plaats van als echte inhoud getoond. Zo valt hij op tot hij ingevuld is.
   -------------------------------------------------------------------------- */
