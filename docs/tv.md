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

## Geen dia's maar shots

Het scherm is een montage, geen diavoorstelling. Dat zit in vier keuzes, en wie
eraan werkt doet er goed aan ze niet terug te draaien:

1. **Beeld is de hoofdzaak.** Elk shot is beeld dat beweegt; tekst is een
   lower-third die kort komt en weer gaat. Geen koppen in het midden.
2. **Harde cuts.** Honderd milliseconden, geen overvloeier van een seconde.
3. **Geen meubilair.** Geen voortgangsbalk, geen teller, geen sectiekoppen met
   nummers. Dat is de taal van een presentatie en precies wat verraadt dat het
   er een is.
4. **Ritme.** De shots duren niet allemaal even lang: twee seconden, dan vijf,
   dan anderhalf. Gelijke lengtes voelen meteen als een diareeks.

Het beeld staat in een kader van **2:1** met zwarte balken erboven en eronder.
Niet 2.39:1, al is dat filmischer: de hele fotobibliotheek is vierkant of
staand, en in scope zou een portret tweederde van zijn hoogte kwijt zijn.

## De inhoud wijzigen

Alles staat in **`tv/inhoud.js`**. Dat is het enige bestand dat je aanraakt.
Bovenaan staan de praktijkgegevens en de openingsuren, daaronder de shotlijst
in de volgorde waarin ze voorbijkomen.

Een shot is een van deze drie:

| | |
|---|---|
| `beeld:` | een still die beweegt |
| `video:` | een stuk uit een filmbestand, met `van` als in-punt in seconden |
| `kaart:` | een tussentitel op zwart |

`duur` is in seconden. `beweging` is `in`, `uit`, `links`, `rechts`, `op`,
`neer` of `stil`; de beweging wordt automatisch precies zo lang gemaakt als het
shot, zodat hij uitgespeeld is op de cut.

**Kadreren.** Bij een vierkante of staande foto in een breedbeeldkader bepaalt
`positie` (bijvoorbeeld `'50% 38%'`) of je het onderwerp ziet of zijn
schouders. Voor gezichten is er `portret: true`: de foto staat dan rechts op
zijn eigen hoogte met de naam ernaast, zodat het hoofd heel blijft.

**Tekst.** `reuze`, `groot`, `mid`, `citaat`, `onder`, `regel` en `extra`, van
groot naar klein. `tekstVan` bepaalt wanneer de tekst opkomt, `tekstTot`
wanneer hij weer weggaat — laat dat laatste weg en hij blijft tot de cut. Tekst
die vóór de cut weggaat laat het beeld even alleen, en dat is precies het
verschil met een dia.

De velden staan allemaal opgesomd in de kop van `inhoud.js`.

**Een tijdelijk bericht** — geef een shot `van` en `tot` (JJJJ-MM-DD) mee. Het
verschijnt dan alleen in die periode en verdwijnt daarna vanzelf. Bijvoorbeeld
een sluitingsbericht voor het bouwverlof.

**De video's.** Er is een kleine vijftien seconden echt beeldmateriaal
(`hero-performance` en `hero-rehab`). Door met `van` verschillende in-punten te
kiezen levert één bestand meerdere shots op. Elk videoshot krijgt twee bronnen,
webm eerst en mp4 erachter: niet elke tv-browser heeft H.264, en niet elke
browser kent webm.

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

## Wat er bij een wijziging mee moet

Verander je een kaart, let dan op de hoogte: het kader is 960 pixels hoog en
niet 1080, dus er past minder dan je zou denken. Loopt er iets buiten, dan valt
dat op in de doorloop maar niet per se op de televisie zelf.

Voeg je beeld of video toe, zet het bestand dan ook in de lijst `NODIG` in
`tv/sw.js`, anders is het er offline niet.

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
