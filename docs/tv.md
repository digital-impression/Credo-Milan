# Het scherm in de wachtzaal

De slideshow draait op `credokinesitherapie.be/tv/`. Het is een gewone
webpagina: de televisie opent dat adres en speelt vanzelf af, in een lus, zonder
geluid en zonder dat er iemand aan te pas komt.

Het adres staat niet in Google (`noindex` op de pagina, `Disallow: /tv/` in
robots.txt) en er verwijst geen enkele link naartoe. Wie het adres niet kent,
komt er niet.

## Op de televisie zetten

Welke van de drie het wordt, hangt af van wat er hangt.

**Heeft de tv een browser** (Samsung Tizen, LG webOS, Android TV) — open
`credokinesitherapie.be/tv/` en zet hem op volledig scherm. Werkt, maar de
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
  https://www.credokinesitherapie.be/tv/
```

Zet in alle gevallen de slaapstand en de screensaver van het toestel uit. De
pagina vraagt zelf om het scherm wakker te houden, maar niet elke speler
luistert daarnaar.

## De inhoud wijzigen

Alles staat in **`tv/inhoud.js`**. Dat is het enige bestand dat je aanraakt.
Bovenaan staan de praktijkgegevens en de openingsuren, daaronder de slides, in
de volgorde waarin ze voorbijkomen.

Elke slide heeft een `soort` die bepaalt hoe hij eruitziet. De soorten staan
onderaan dat bestand opgesomd, met per soort welke velden hij gebruikt. Een
slide verplaatsen doe je door hem in de lijst te verplaatsen; weghalen door hem
te verwijderen of met `//` uit te commentariëren.

`duur` is in seconden. Laat je hem weg, dan geldt de standaardduur bovenaan.

**Een tijdelijk bericht** — geef een slide `van` en `tot` (JJJJ-MM-DD) mee. Hij
verschijnt dan alleen in die periode en verdwijnt daarna vanzelf. Bijvoorbeeld
een sluitingsbericht voor het bouwverlof.

**Na een wijziging:** verhoog `VERSIE` bovenaan `tv/sw.js` (`credo-tv-1` wordt
`credo-tv-2`). Anders blijft het scherm de oude versie uit zijn eigen geheugen
tonen.

## Wat het scherm zelf bijhoudt

- De klok rechtsboven en de dag van de week.
- "Nu open, tot 21:00" of "Vandaag gesloten", berekend uit de openingsuren.
- De dag van vandaag staat gemarkeerd in het urenoverzicht.
- Bij de dagwissel bouwt het scherm zichzelf opnieuw op, zodat periodeslides en
  de gemarkeerde dag meegaan. Dat gebeurt tijdens een overgang, dus onzichtbaar.

## Als het netwerk wegvalt

Alles wat het scherm nodig heeft — de pagina, de foto's, de lettertypes, de
QR-codes — wordt bij de eerste keer lokaal bewaard. Valt de wifi weg, dan blijft
de lus gewoon doordraaien. Komt het netwerk terug, dan haalt het op de
achtergrond de nieuwste versie op.

Daarom staan de lettertypes ook in `tv/fonts/` en niet bij Google: een bestand
van een andere server kan niet mee bewaard worden.

## Bediening

Er is geen zichtbare bediening (de muisaanwijzer is verborgen), maar met een
toetsenbord of afstandsbediening kan het wel:

| | |
|---|---|
| Pijl links / rechts | een slide terug of verder |
| Spatie | pauzeren en hervatten |
| F | volledig scherm aan of uit |
| Klik of tik | een slide verder |

## Blokken die te vol raken

De slides met veel tekst — een therapeut, een recensie, de tarieven — meten
zichzelf. Past de inhoud niet, dan krimpt het blok net genoeg in plaats van
onderaan van het scherm te vallen. Moet er meer dan een kwart af, dan schrijft
het scherm een waarschuwing in de console van de browser. Dat is het teken dat
er echt te veel tekst staat.

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

- **Bas Van Bael** heeft nog geen favorieten; zijn slide toont nu alleen zijn
  naam en diploma's. Vul `favoriet` in zijn blok aan zoals bij de anderen.
- De oude slideshow had de teamfoto's in kleur met het Credo-logo op de
  achtergrond. Hier staan de zwart-witportretten van de website, zodat het
  scherm en de site één geheel zijn.
