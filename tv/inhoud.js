/* ============================================================================
   DE INHOUD VAN HET SCHERM IN DE WACHTZAAL

   Dit is het enige bestand dat je moet aanraken om iets te wijzigen. De
   opmaak zit in tv.css, de beweging in tv.js; die blijven zoals ze zijn.

   Het scherm is geen reeks dia's maar een film in scènes. Elke scène heeft
   een `soort`, en die bepaalt hoe ze beweegt. De soorten staan onderaan
   opgesomd, met per soort welke velden ze gebruikt. `duur` is in seconden.

   Een scène verplaatsen doe je door ze in de lijst te verplaatsen; weghalen
   door ze te verwijderen of met // uit te commentariëren.

   Een scène kan ook `van` en `tot` krijgen (JJJJ-MM-DD). Ze verschijnt dan
   alleen in die periode - handig voor een sluitingsbericht of een actie.

   Na elke wijziging: verhoog VERSIE bovenaan sw.js.
   ========================================================================= */

window.CREDO_TV = {

  instellingen: {
    // Welke favorieten van een therapeut voorbijkomen, in deze volgorde. Er
    // passen er vier in een scène van elf seconden; alles staat hieronder wel
    // bij elke persoon, zodat je hier gewoon kan wisselen.
    favorieten: ['Ploeg', 'Nummer', 'Eten', 'Reisbestemming'],
  },

  praktijk: {
    naam:   'Credo Rehab & Performance',
    adres:  'Kapelstraat 89 · 3590 Diepenbeek',
    tel:    '+32 480 62 85 45',
    mail:   'info@credokinesitherapie.be',
    site:   'credorehabandperformance.com',
    // 0 = zondag, 1 = maandag ... 6 = zaterdag
    uren: [
      { dag: 'Zondag',    kort: 'Zo', open: null,    dicht: null    },
      { dag: 'Maandag',   kort: 'Ma', open: '08:00', dicht: '21:00' },
      { dag: 'Dinsdag',   kort: 'Di', open: '08:00', dicht: '21:00' },
      { dag: 'Woensdag',  kort: 'Wo', open: '08:00', dicht: '21:00' },
      { dag: 'Donderdag', kort: 'Do', open: '08:00', dicht: '21:00' },
      { dag: 'Vrijdag',   kort: 'Vr', open: '08:00', dicht: '21:00' },
      { dag: 'Zaterdag',  kort: 'Za', open: null,    dicht: null    },
    ],
  },

  scenes: [

    // ---- het merk ---------------------------------------------------------
    { soort: 'opening', duur: 11, hoofdstuk: 'Credo',
      video: '../assets/video/hero-rehab',
      poster: '../assets/img/rehab/hero-still.jpg',
      woord: 'Credo',
      kop: 'Rehab &amp; Performance',
      regel: 'Kinesitherapie · Revalidatie · Performance training' },

    { soort: 'manifest', duur: 14, hoofdstuk: 'Credo',
      beeld: '../assets/img/rehab/aanpak.jpg',
      beats: [
        { boven: 'Credo · [ˈkreː.doː] · Latijn', groot: 'Ik geloof.' },
        { boven: 'Wij geloven dat een blessure', groot: 'geen eindpunt is,' },
        { boven: '', groot: 'maar een startpunt.', accent: true },
      ] },

    { soort: 'waarden', duur: 12, hoofdstuk: 'Waar we voor staan',
      woorden: [
        { woord: 'Motivatie', beeld: '../assets/img/performance/krachttraining.jpg',
          tekst: 'Jouw doel wordt ons doel. Vanaf dag één.' },
        { woord: 'Passie',    beeld: '../assets/img/rehab/manuele-therapie.jpg',
          tekst: 'Een heel betrokken aanpak, voor de job en voor jou.' },
        { woord: 'Empathie',  beeld: '../assets/img/rehab/stap1.jpg',
          tekst: 'Achter elke patiënt schuilt een mens.' },
      ] },

    { soort: 'twee', duur: 13, hoofdstuk: 'Wat we doen',
      links: { video: '../assets/video/hero-rehab', poster: '../assets/img/rehab/hero-still.jpg',
               oog: 'Revalidatie &amp; kinesitherapie',
               kop: ['Herstel.', 'Kom sterker terug.'],
               items: ['Manuele therapie', 'Oefentherapie', 'Dry needling'] },
      rechts: { video: '../assets/video/hero-performance', poster: '../assets/img/hero-performance-poster.jpg',
                oog: 'Personal training &amp; performance',
                kop: ['Voorbij je', 'oude niveau.'],
                items: ['Screening', 'Functioneel trainen', 'Sportvoeding', 'Lifestyle'] } },

    { soort: 'nu', duur: 10, hoofdstuk: 'Openingsuren' },

    // ---- het team ---------------------------------------------------------
    { soort: 'persoon', duur: 11, hoofdstuk: 'Ons team',
      nummer: '01', voornaam: 'Thomas', achternaam: 'Casier', rol: 'Kinesist &amp; zaakvoerder',
      beeld: '../assets/img/team/thomas.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Master manuele therapie', 'Specialisatie sportvoeding',
                    'Kinesitherapeut Torpedo Hasselt'],
      favoriet: { 'Ploeg': 'Club Brugge / Tottenham', 'Speler': 'Kane',
                  'Hobby': 'Lopen / fietsen', 'Eten': 'Worst met appelmoes',
                  'Artiest': 'Elvis Presley', 'Nummer': 'Oasis – Don’t Look Back In Anger',
                  'Reisbestemming': 'Colombia' } },

    { soort: 'persoon', duur: 11, hoofdstuk: 'Ons team',
      nummer: '02', voornaam: 'Milan', achternaam: 'Vandecaetsbeek', rol: 'Kinesist &amp; zaakvoerder',
      beeld: '../assets/img/team/milan.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Specialisatie sportletsels', 'Strength coach Sporting Hasselt (2025–2026)',
                    'Physical coach Genk Ladies (2024–2026)', 'Physical coach Red Flames'],
      favoriet: { 'Ploeg': 'Sporting Hasselt / KRC Genk / FC Barcelona',
                  'Speler': 'Messi / Pedri', 'Hobby': 'Gym &amp; familie / vrienden',
                  'Eten': 'Tonijnsteak', 'Artiest': 'Dave',
                  'Nummer': 'Jul – J’oublie tout', 'Reisbestemming': 'Bali' } },

    { soort: 'persoon', duur: 11, hoofdstuk: 'Ons team',
      nummer: '03', voornaam: 'Tuur', achternaam: 'Vanderstukken', rol: 'Kinesist &amp; zaakvoerder',
      beeld: '../assets/img/team/tuur.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Specialisatie sportletsels', 'Dry needling',
                    'Blood flow restriction training', 'Physical coach OH Leuven (2025–2026)',
                    'Physical coach Lommel SK (2026–heden)'],
      favoriet: { 'Ploeg': 'FC Barcelona', 'Speler': 'Michael Jordan',
                  'Hobby': 'Sporten', 'Eten': 'Risotto', 'Artiest': 'The Cure',
                  'Nummer': 'A Forest', 'Reisbestemming': 'Madeira' } },

    { soort: 'recensie', duur: 14, hoofdstuk: 'Ervaringen',
      beeld: '../assets/img/reviews/michiel.jpg',
      naam: 'Michiel Partoens', rol: 'Profbokser',
      tekst: 'Al vier jaar werk ik samen met Credo en ik voel me er perfect '
           + 'ondersteund. Zowel bij het herstellen van blessures als in het '
           + 'verbeteren van mijn fysieke prestaties. Ik weet dat ik hier omringd '
           + 'ben door mensen die het beste uit mij willen halen.' },

    { soort: 'cijfers', duur: 12, hoofdstuk: 'In cijfers',
      beeld: '../assets/img/performance/bewegen.jpg',
      // Het beeld waarmee de cijfers zelf gevuld zijn. Een rustig beeld met
      // veel licht houdt de cijfers leesbaar; een drukke groepsfoto niet.
      vulling: '../assets/img/rehab/aanpak.jpg',
      rijen: [
        { van: 0, tot: 1469, achter: '+', naam: 'Patiënten', sub: 'Sporters én niet-sporters' },
        { reeks: [5, 91], naam: 'Jaar', sub: 'Van onze jongste tot onze oudste patiënt' },
        { van: 0, tot: 7, naam: 'Therapeuten', sub: 'Voor ieder een fit' },
      ] },

    { soort: 'persoon', duur: 11, hoofdstuk: 'Ons team',
      nummer: '04', voornaam: 'Rimke', achternaam: 'Eurlings', rol: 'Kinesist',
      beeld: '../assets/img/team/rimke.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Specialisatie sportletsels', 'Coach Sporting Hasselt (2021–heden)',
                    'Praktijkassistent UHasselt'],
      favoriet: { 'Ploeg': 'Sporting Hasselt Ladies / Belgian Cats',
                  'Speler': 'Saar Janssen',
                  'Hobby': 'Voetbalcoach / uiteten en drinken met vrienden',
                  'Eten': 'Mexicaans', 'Artiest': 'Ed Sheeran / Macklemore',
                  'Nummer': 'Mattafix – Big City Life', 'Reisbestemming': 'Curaçao' } },

    { soort: 'persoon', duur: 11, hoofdstuk: 'Ons team',
      nummer: '05', voornaam: 'Philippe', achternaam: 'Valvekens', rol: 'Kinesist',
      beeld: '../assets/img/team/philippe.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Specialisatie sportletsels', 'Dry needling'],
      favoriet: { 'Ploeg': 'Sporting Hasselt / KRC Genk / Real Madrid',
                  'Speler': 'Mbappé', 'Hobby': 'Skiën / gym &amp; voetbal',
                  'Eten': 'Sushi', 'Artiest': 'Jul',
                  'Nummer': 'Effe Serieus – Baila de Gasolina', 'Reisbestemming': 'Ibiza' } },

    // Alleen de zaal, zonder woorden erover: de beelden zeggen het zelf.
    // Wil je er toch iets bij, geef dan kop: '500 m²' en een tekst mee.
    { soort: 'zaal', duur: 11, hoofdstuk: 'De praktijk',
      beelden: ['../assets/img/vloer/01.jpg', '../assets/img/vloer/02.jpg',
                '../assets/img/vloer/05.jpg', '../assets/img/vloer/06.jpg',
                '../assets/img/vloer/08.jpg', '../assets/img/vloer/09.jpg',
                '../assets/img/vloer/10.jpg', '../assets/img/vloer/11.jpg',
                '../assets/img/vloer/12.jpg', '../assets/img/vloer/04.jpg',
                '../assets/img/vloer/03.jpg', '../assets/img/zaal4.jpg'] },

    { soort: 'recensie', duur: 13, hoofdstuk: 'Ervaringen',
      beeld: '../assets/img/reviews/luna.jpg',
      naam: 'Luna Vanzeir', rol: 'Red Flames',
      tekst: 'Ik werk ondertussen al enkele jaren samen met Credo en merk echt '
           + 'hoeveel ik fysiek ben vooruitgegaan. Ik ben sterker geworden in de '
           + 'duels en ook mijn topsnelheid is sterk verbeterd.' },

    { soort: 'persoon', duur: 11, hoofdstuk: 'Ons team',
      nummer: '06', voornaam: 'Dries', achternaam: 'Verschueren', rol: 'Kinesist',
      beeld: '../assets/img/team/dries.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Specialisatie sportletsels',
                    'Kinesitherapeut Sporting Hasselt (2025–heden)', 'Dry needling'],
      favoriet: { 'Ploeg': 'Sporting Hasselt / Standard de Liège',
                  'Speler': 'Justin Munezero', 'Hobby': 'Voetbal / fietsen',
                  'Eten': 'Birria taco’s', 'Artiest': 'Funk Tribu',
                  'Nummer': 'Funk Tribu – Azul', 'Reisbestemming': 'Mexico' } },

    { soort: 'persoon', duur: 9, hoofdstuk: 'Ons team',
      nummer: '07', voornaam: 'Bas', achternaam: 'Van Bael', rol: 'Kinesist',
      beeld: '../assets/img/team/bas.jpg',
      credentials: ['Master revalidatiewetenschappen &amp; kinesitherapie',
                    'Specialisatie sportletsels'],
      // Bas stond nog niet in de oude slideshow. Vul hier zijn favorieten
      // aan zoals bij de anderen; zolang het null is, toont hij zijn diploma's.
      favoriet: null },

    { soort: 'partners', duur: 12, hoofdstuk: 'Samenwerkingen',
      tekst: 'Verschillende van onze therapeuten staan wekelijks op het veld, '
           + 'als physical of strength coach.',
      // stijl: 'wit' maakt het logo een witte vorm, 'negatief' keert de kleuren
      // om (voor logo's op een witte achtergrond), 'grijs' houdt het zoals het is.
      logos: [
        { bron: '../assets/img/partners/sporting-hasselt.png',    naam: 'Sporting Hasselt',    stijl: 'grijs' },
        { bron: '../assets/img/partners/genk-ladies.png',         naam: 'KRC Genk Ladies',     stijl: 'negatief' },
        { bron: '../assets/img/partners/rbfa.png',                naam: 'Royal Belgian FA',    stijl: 'negatief' },
        { bron: '../assets/img/partners/oh-leuven.png',           naam: 'OH Leuven',           stijl: 'wit' },
        { bron: '../assets/img/partners/lommel-sk.png',           naam: 'Lommel SK',           stijl: 'negatief' },
        { bron: '../assets/img/partners/torpedo-hasselt.png',     naam: 'Torpedo Hasselt',     stijl: 'negatief' },
        { bron: '../assets/img/partners/6d-sports-nutrition.png', naam: '6d Sports Nutrition', stijl: 'wit' },
        { bron: '../assets/img/partners/vald.png',                naam: 'VALD',                stijl: 'wit' },
      ] },

    // ---- het zakelijke ----------------------------------------------------
    { soort: 'honoraria', duur: 18, hoofdstuk: 'Tarieven',
      beeld: '../assets/img/performance/screening.jpg',
      kop: 'Honoraria',
      kolommen: ['Pathologie', 'Honorarium', 'Bijdrage patiënt',
                 'Eenmalige dossierkost', 'Bijdrage patiënt dossierkost'],
      // De kolom die het zwaarst moet doorkomen: wat de patiënt zelf betaalt.
      nadruk: 2,
      rijen: [
        ['Courant',      '€36,00', '[TE BEVESTIGEN]', '€7,38',  '€1,84'],
        ['F-acuut',      '€36,00', '€16,39', '€33,75', '€8,43'],
        ['F-chronisch',  '€36,00', '€16,39', '€32,86', '€8,21'],
        ['E-pathologie', '€36,00', '€5,74',  '€33,75', '€0,00'],
        ['Huisbezoek',   '€37,16', '€15,73', '€32,86', '€8,21'],
      ],
      voet: 'Wij zijn een niet-geconventioneerde praktijk. Onze tarieven kunnen '
          + 'dus afwijken van de conventietarieven.' },

    { soort: 'beleid', duur: 13, hoofdstuk: 'Je afspraak',
      groot: '24u',
      kop: 'Kan je niet komen?',
      nl: 'Laat het ons tijdig weten als je niet aanwezig kan zijn of je afspraak '
        + 'wil verplaatsen. Annulaties binnen 24 uur kunnen aangerekend worden.',
      en: 'Please let us know in good time if you cannot attend or need to '
        + 'reschedule. Cancellations within 24 hours may be subject to a fee.' },

    { soort: 'recensie', duur: 14, hoofdstuk: 'Ervaringen',
      beeld: '../assets/img/reviews/valerie.jpg',
      naam: 'Valérie Vandecaetsbeek', rol: 'Run&amp;Roast Hasselt',
      tekst: 'Wat ik ook fijn vind, is de sfeer: sport leeft er echt, van '
           + 'professionele sporters tot recreanten. Die omgeving werkt aanstekelijk '
           + 'en motiveert. Een plek waar ik me goed voel en waar ik altijd met veel '
           + 'vertrouwen terechtkan.' },

    { soort: 'merch', duur: 9, hoofdstuk: 'In de praktijk',
      oog: 'Credo merch',
      prijs: '€20',
      per: 'per shirt',
      tekst: 'Vraag ernaar bij je therapeut.',
      beeld: '../assets/img/team/bas.jpg' },

    // Een voorbeeld van een tijdelijk bericht. Haal de // weg, pas de datums
    // en de tekst aan, en het verschijnt alleen in die periode.
    // { soort: 'bericht', duur: 10, hoofdstuk: 'Mededeling',
    //   van: '2026-07-20', tot: '2026-08-02',
    //   oog: 'Bouwverlof', kop: ['Even op adem.', 'Terug op 3 augustus.'],
    //   tekst: 'Van 20 juli tot en met 2 augustus is de praktijk gesloten.' },

  ],
};

/* ----------------------------------------------------------------------------
   DE SOORTEN SCÈNES

   Elke scène kent ook `duur` (seconden), `hoofdstuk` (de naam linksonder in
   beeld) en eventueel `van` / `tot`.

   opening    video, poster, woord, kop, regel
              Het woord vult zich met de video en het scherm duikt erdoorheen.
   manifest   beeld, beats[{boven, groot, accent}]
              Zinnen die na elkaar binnenkomen, op ritme.
   waarden    woorden[{woord, beeld, tekst}]
   twee       links{...} en rechts{video, poster, oog, kop[], items[]}
              Revalidatie en performance naast elkaar, gescheiden door de naad.
   nu         (geen velden - leest de klok en de openingsuren hierboven)
   teamintro  kop[], tekst (niet in gebruik, maar beschikbaar)
   persoon    nummer, voornaam, achternaam, rol, beeld, credentials[],
              favoriet{} of null
   recensie   beeld, naam, rol, tekst
   cijfers    beeld, vulling, rijen[{van, tot, achter, naam, sub} of {reeks:[a,b], ...}]
   zaal       beelden[], en eventueel kop en tekst
   partners   logos[{bron, naam, stijl}], en eventueel tekst
   honoraria  beeld, kop, kolommen[], nadruk, rijen[[]], voet
   beleid     groot, kop, nl, en
   merch      oog, prijs, per, tekst, beeld
   boeken     beeld, kop[], tekst, qr[{bron, label}] (niet in gebruik, maar beschikbaar)
   bericht    oog, kop[], tekst (bedoeld voor een tijdelijke mededeling)

   Een waarde die letterlijk [TE BEVESTIGEN] is, wordt op het scherm gemarkeerd
   in plaats van als echte inhoud getoond. Zo valt hij op tot hij ingevuld is.
   -------------------------------------------------------------------------- */
