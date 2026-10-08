# Het scherm in de wachtzaal

Het scherm draait op `credorehabandperformance.com/tv/`. Het is een gewone
webpagina: de televisie opent dat adres en speelt vanzelf af, in een lus, zonder
geluid en zonder dat er iemand aan te pas komt.

Het is geen reeks dia's maar een film van ongeveer vierenhalve minuut, in de
huisstijl van de site. Wat het anders maakt dan een presentatie:

- **Eén idee per scène, groot.** Geen kop met een opsomming eronder.
- **Typografie als beeld.** Het woord CREDO vult zich met de sprintvideo en het
  scherm duikt erdoorheen; de cijfers zijn gevuld met fotografie; een naam pakt
  de breedte van het scherm.
- **Montage in plaats van overvloeiers.** Een schuine baan met dezelfde helling
  als de naad op de site veegt over het beeld, of er wordt hard gesneden.
- **Alles beweegt.** Foto's drijven, de korrel leeft, de clubs en de diploma's
  lopen als een band voorbij, een citaat licht woord voor woord op.
- **Een vast kader zoals bij een sportzender.** Het merk linksboven, rechtsboven
  de klok en of de praktijk nu open is, linksonder het hoofdstuk.

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

## De inhoud wijzigen

Alles staat in **`tv/inhoud.js`**. Dat is het enige bestand dat je aanraakt.
Bovenaan staan de instellingen, de praktijkgegevens en de openingsuren,
daaronder de scènes, in de volgorde waarin ze voorbijkomen.

Elke scène heeft een `soort` die bepaalt hoe ze beweegt. De soorten staan
onderaan dat bestand opgesomd, met per soort welke velden ze gebruikt. Een
scène verplaatsen doe je door ze in de lijst te verplaatsen; weghalen door ze
te verwijderen of met `//` uit te commentariëren.

`duur` is in seconden. `hoofdstuk` is de naam die linksonder in beeld staat;
scènes met dezelfde naam krijgen hetzelfde nummer.

**Een tijdelijk bericht**: geef een scène `van` en `tot` (JJJJ-MM-DD) mee. Ze
verschijnt dan alleen in die periode en verdwijnt daarna vanzelf. Onderaan de
lijst staat een uitgeschakeld voorbeeld voor het bouwverlof (soort `bericht`);
haal de `//` weg en pas de datums aan.

**De favorieten van een therapeut**: bij elke persoon staan ze allemaal, maar er
komen er vier voorbij. Welke, staat bovenaan in `instellingen.favorieten`.

**Na een wijziging:** verhoog `VERSIE` bovenaan `tv/sw.js` (`credo-tv-6` wordt
`credo-tv-7`). Anders blijft het scherm de oude versie uit zijn eigen geheugen
tonen.

## Wat het scherm zelf bijhoudt

- De klok rechtsboven en de dag van de week.
- "Open tot 21:00" of "Gesloten", berekend uit de openingsuren.
- Een scène met de grote klok, de status en de week, met vandaag uitgelicht.
- Bij de dagwissel bouwt het scherm zichzelf opnieuw op, zodat periodescènes en
  de gemarkeerde dag meegaan. Dat gebeurt tijdens een overgang, dus onzichtbaar.

## Als het netwerk wegvalt

Alles wat het scherm nodig heeft (de pagina, de foto's, de twee video's, de
lettertypes en de QR-codes) wordt bij de eerste keer lokaal bewaard. Welke foto's
en video's dat zijn, leest `sw.js` zelf uit `inhoud.js`: een nieuwe foto in de
inhoud komt dus vanzelf mee. Valt de wifi weg, dan blijft de lus gewoon
doordraaien. Komt het netwerk terug, dan haalt het op de achtergrond de nieuwste
versie op.

Daarom staan de lettertypes ook in `tv/fonts/` en niet bij Google: een bestand
van een andere server kan niet mee bewaard worden.

## Bediening

Er is geen zichtbare bediening (de muisaanwijzer is verborgen), maar met een
toetsenbord of afstandsbediening kan het wel:

| | |
|---|---|
| Pijl links / rechts | een scène terug of verder |
| Spatie | pauzeren en hervatten |
| F | volledig scherm aan of uit |
| Klik of tik | een scène verder |

Om één scène na te kijken zonder de hele film af te wachten, zet je
`?scene=` achter het adres, met het nummer van de scène (de eerste is 0):
`/tv/?scene=7` begint bij de achtste.

## Tekst die te lang wordt

Koppen en namen meten zichzelf: een lange naam als Vandecaetsbeek wordt net zo
veel kleiner als nodig om naast het portret te passen. Een citaat dat te lang
is, krimpt tot het boven de naam past. Moet het kleiner dan leesbaar, dan
schrijft het scherm een waarschuwing in de console van de browser. Dat is het
teken dat er echt te veel tekst staat.

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

- **Bas Van Bael** heeft nog geen favorieten; zijn scène toont nu zijn
  diploma's op de plaats waar bij de anderen de favorieten wisselen. Vul
  `favoriet` in zijn blok aan zoals bij de anderen.
- De oude slideshow had de teamfoto's in kleur met het Credo-logo op de
  achtergrond. Hier staan de zwart-witportretten van de website, zodat het
  scherm en de site één geheel zijn.
