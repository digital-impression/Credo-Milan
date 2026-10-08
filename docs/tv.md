# Het scherm in de wachtzaal

De slideshow draait op `credorehabandperformance.com/tv/`. Het is een gewone
webpagina: de televisie opent dat adres en speelt vanzelf af, in een lus, zonder
geluid en zonder dat er iemand aan te pas komt.

Het adres staat niet in Google (`noindex` op de pagina, `Disallow: /tv/` in
robots.txt) en er verwijst geen enkele link naartoe. Wie het adres niet kent,
komt er niet.

## Op de televisie zetten

Welke van de drie het wordt, hangt af van wat er hangt.

**Heeft de tv een browser** (Samsung Tizen, LG webOS, Android TV) — open
`credorehabandperformance.com/tv/` en zet hem op volledig scherm. Werkt, maar de
meeste tv-browsers vergeten de pagina na een herstart; dan moet iemand hem
elke ochtend opnieuw openen.

**Android TV of een Fire Stick** — installeer *Fully Kiosk Browser*, zet het
adres als startpagina en "start bij het opstarten" aan. Daarmee komt het scherm
na een stroomonderbreking vanzelf terug.

**Een Raspberry Pi** (de betrouwbaarste, ongeveer zeventig euro) — Chromium in
kioskmodus, ingesteld om bij het opstarten te beginnen:

```
chromium-browser --kiosk --noerrdialogs --disable-infobars \
  --check-for-update-interval=31536000 \
  https://www.credorehabandperformance.com/tv/
```

Zet in alle gevallen de slaapstand en de screensaver van het toestel uit. De
pagina vraagt zelf om het scherm wakker te houden, maar niet elke speler
luistert daarnaar.

## Geen dia's maar een film

Het scherm is een film in scènes, geen diavoorstelling. Dat zit in een paar
keuzes, en wie eraan werkt doet er goed aan ze niet terug te draaien:

1. **Eén idee per scène, groot.** Geen kop met een opsomming eronder.
2. **Typografie als beeld.** Woorden die uit een naad omhoog komen, cijfers
   gevuld met fotografie, een naam die de breedte van het scherm pakt.
3. **Montage in plaats van overvloeiers.** Een schuine baan veegt over het
   beeld, met dezelfde helling als de naad op de site.
4. **Alles beweegt, ook als er niets gebeurt.** De foto's drijven, de korrel
   leeft, de banden lopen.
5. **Geen meubilair.** Geen voortgangsbalk, geen teller, geen genummerde
   koppen. Dat is de taal van een presentatie.

Alles wordt getekend op een vast toneel van 1920 bij 1080 en in zijn geheel
geschaald, zodat de verhoudingen op elke televisie kloppen. De kleinste tekst
is 24 pixels op die 1080: gezet voor kijkafstand, niet voor een laptop.

## De letters

Drie lettertypes, alle drie in `tv/fonts/` en niet bij Google, want een bestand
van een andere server kan niet mee bewaard worden voor als het netwerk wegvalt.

- **Anton** voor alles wat groot is: koppen, namen, cijfers, de klok.
- **Newsreader** voor de lopende tekst en de citaten. Een serif met een
  optische as; op deze maten tekent hij als een krantenkop. De citaten staan
  in zijn cursief.
- **Inter** alleen nog voor wat in kapitalen met spatiëring staat: de labels,
  het hoofdstuk, de tabel met de tarieven.

## De inhoud wijzigen

Alles staat in **`tv/inhoud.js`**. Dat is het enige bestand dat je aanraakt.
Bovenaan staan de praktijkgegevens en de openingsuren, daaronder de scènes in
de volgorde waarin ze voorbijkomen.

Elke scène heeft een `soort`, en die bepaalt hoe ze beweegt: `opening`,
`manifest`, `waarden`, `twee`, `nu`, `persoon`, `recensie`, `cijfers`, `zaal`,
`partners`, `honoraria`, `beleid`, `merch`, `bericht`. Welke velden elke soort
gebruikt, staat opgesomd onderaan `inhoud.js`. `duur` is in seconden;
`hoofdstuk` is de naam die linksonder in het kader staat.

Twee soorten staan klaar maar zijn niet in gebruik: `teamintro` (een rij
portretten met een kop erover) en `boeken` (QR-codes om een afspraak te maken).
Ze zijn op vraag van de praktijk uit de lus gehaald; wie ze terug wil, zet een
scène van die soort in de lijst.

Een scène verplaatsen doe je door ze in de lijst te verplaatsen; weghalen
door ze te verwijderen of met `//` uit te commentariëren.

**Een tijdelijk bericht** — geef een scène `van` en `tot` (JJJJ-MM-DD) mee.
Ze verschijnt dan alleen in die periode en verdwijnt daarna vanzelf. Onderaan
de lijst staat een voorbeeld voor het bouwverlof, uitgecommentarieerd.

**De video's.** Er is een kleine vijftien seconden echt beeldmateriaal
(`hero-rehab` en `hero-performance`). Een video staat zonder extensie in de
inhoud; het scherm zet er zelf twee bronnen achter, **mp4 eerst** en webm
erachter. Dat is bewust: op een televisie of een Raspberry Pi wordt H.264 door
de chip gedecodeerd en VP9 vaak door de processor, en dat laatste hapert op
1080p. De webm blijft staan voor een browser zonder H.264.

**Na een wijziging:** verhoog `VERSIE` bovenaan `tv/sw.js` (`credo-tv-7` wordt
`credo-tv-8`). Anders blijft het scherm de oude versie uit zijn eigen geheugen
tonen. Een nieuwe foto of video in `inhoud.js` komt vanzelf mee in dat
geheugen; een nieuw lettertype of een nieuw bestand buiten de inhoud zet je
ook in de lijst `VAST` in `sw.js`.

## Wat het scherm zelf bijhoudt

- De klok rechtsboven en de dag van de week.
- "Open tot 21:00" of "Gesloten", berekend uit de openingsuren.
- De dag van vandaag staat gemarkeerd in het urenoverzicht.
- Bij de dagwissel bouwt het scherm zichzelf opnieuw op, zodat periodescènes en
  de gemarkeerde dag meegaan. Dat gebeurt tijdens een overgang, dus onzichtbaar.

## Als het netwerk wegvalt

Alles wat het scherm nodig heeft — de pagina, de foto's, de video's, de
lettertypes — wordt bij de eerste keer lokaal bewaard. Valt de wifi weg, dan
blijft de lus gewoon doordraaien. Komt het netwerk terug, dan haalt het op de
achtergrond de nieuwste versie op.

## Vloeiend houden

Het scherm begint pas als de film van de opening helemaal binnen is; eerder
speelde hij terwijl hij nog laadde, en dat waren precies de seconden waarin hij
hokte. Verder staat er bewust niets op de film dat de televisie elk beeldje
opnieuw moet rekenen: geen mengmodus op de korrel, geen filter op de twee
films (die zijn al zwart-wit), en in de opening beweegt alleen wat moet
bewegen. Komt er ooit een scène bij met video, hou dat zo.

## Bediening

Er is geen zichtbare bediening (de muisaanwijzer is verborgen), maar met een
toetsenbord of afstandsbediening kan het wel:

| | |
|---|---|
| Pijl links / rechts | een scène terug of verder |
| Spatie | pauzeren en hervatten |
| F | volledig scherm aan of uit |
| Klik of tik | een scène verder |

Voor het nakijken: `/tv/?scene=7` begint bij de achtste scène.

## Nog in te vullen

Eén waarde staat in `inhoud.js` als `[TE BEVESTIGEN]` en verschijnt op het
scherm als **nog in te vullen**, in het geel:

- **Honoraria, rij "Courant", kolom "Bijdrage patiënt".** In de oude slideshow
  stond op die plek een gewichtsschijf uit de achtergrondfoto precies over het
  bedrag. Het was dus ook daar niet leesbaar. Het bedrag begon met `€16,` en
  eindigde op `5`.

Zodra het bedrag bekend is, vervang je de tekst `[TE BEVESTIGEN]` door de
waarde en verhoog je `VERSIE` in `sw.js`.

## Wat er nog bij kan

- **Bas Van Bael** heeft nog geen favorieten; zijn scène toont nu alleen zijn
  naam en diploma's. Vul `favoriet` in zijn blok aan zoals bij de anderen.
