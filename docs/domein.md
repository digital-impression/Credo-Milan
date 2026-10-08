# Het domein en de hosting

De site draait op **GitHub Pages** en staat op **www.credorehabandperformance.com**.
Het domein is geregistreerd bij **Wix** (tot 20 oktober 2029) en de DNS staat daar
ook; Wix bedient de zone via `ns0.wixdns.net` en `ns1.wixdns.net`.

## Hoe het nu gekoppeld is

| Type | Naam | Waarde |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | digital-impression.github.io |

Die records staan in het Wix-controlepaneel onder **Domeinen → ⋯ → DNS-records
beheren**. De NS-records kun je daar niet wijzigen, en dat hoeft ook niet.

`www` is het echte adres; het adres zonder www stuurt daar vanzelf naartoe.

## Het CNAME-bestand zet het domein niet in

Dit kostte bij de verhuizing een extra ronde, dus het staat hier expliciet.

Deze site publiceert via **GitHub Actions**, niet via de oude manier waarbij
Pages rechtstreeks van een branch leest. Dat verschil is belangrijk:

- Bij publicatie **van een branch** stelt een `CNAME`-bestand in de repo het
  eigen domein in. Zet je er een ander domein in, dan volgt Pages.
- Bij publicatie **via Actions** doet het dat niet. Het bestand *houdt vast*
  wat er al ingesteld staat — zonder dat bestand vergeet Pages het domein bij
  de volgende publicatie — maar het **wijzigt** de instelling niet.

Een domein wijzigen gaat dus in twee stappen, en ze moeten beide gebeuren:

1. Het `CNAME`-bestand in de wortel van de repo aanpassen en pushen.
2. In **Settings → Pages → Custom domain** het nieuwe adres invullen en bewaren.

Daarna doet GitHub een DNS-controle en vraagt een certificaat aan bij Let's
Encrypt. **Enforce HTTPS wordt bij een domeinwijziging uitgezet** en is pas weer
aanklikbaar als het certificaat er is; vergeet niet het opnieuw aan te zetten,
anders blijft de site ook over onversleuteld http bereikbaar.

## Een domein wisselen

De site noemt zijn eigen adres op ongeveer honderdvijfenzestig plaatsen. Die
moeten alle tegelijk mee: een canonical die naar een ander domein wijst dan
waar de pagina staat, vertelt Google dat deze pagina niet de echte is.

```
python3 docs/domeinwissel.py --nieuw <nieuw-domein>          # alleen rekenen
python3 docs/domeinwissel.py --nieuw <nieuw-domein> --doen   # schrijven
```

Dat raakt het `CNAME`-bestand, de canonicals, `og:url`, de hreflang-verwijzingen,
de bedrijfsgegevens in de JSON-LD, `sitemap.xml`, `robots.txt`, de voetregel van
het wachtzaalscherm, en het hertekent de QR-code die daar naar de website wijst.
Daarna bouwt het de Engelse en Franse pagina's opnieuw.

**Het e-mailadres blijft staan.** `info@credokinesitherapie.be` hangt aan de
mailboxen bij one.com en verhuist niet mee met de website. Ruim zestig van de
voorkomens in de HTML zijn dat adres; het script sluit ze uit met een
lookbehind op de `@`. Een gewone zoek-en-vervang maakt daar zestig kapotte
mailadressen van.

Het script vereist `segno` voor de QR-code (`pip install segno`). Ontbreekt dat,
dan zegt het dat en blijft de oude code staan — die wijst dan nog naar het oude
adres.

## credokinesitherapie.be

Dat domein staat bij **one.com** en draagt **de mail**: vier MX-records naar
`mx1` tot `mx4.pub.mailpod10-cph3.one.com` en een SPF-record
`v=spf1 include:_custspf.one.com ~all`. Daar mag niets aan veranderen.

De website stond er tot oktober 2026 op. Sinds de verhuizing is het geen eigen
domein van Pages meer en geeft het een 404, want Pages bedient maar één
hostnaam. Het hoort dus door te sturen naar het nieuwe adres: haal bij one.com
de A- en AAAA-records weg die naar GitHub wijzen en zet er een doorsturing naar
`https://www.credorehabandperformance.com/` in de plaats.

## Nog te beslissen

- **De publicerende branch.** De workflow publiceert vanaf
  `claude/credo-hero-section-n2blk0`. Voor een live site hoort dat de
  standaardbranch te zijn, anders hangt de site aan een werktak.
- **Het Wix-abonnement.** De oude Wix-site is niet meer bereikbaar op dit
  domein. Het Premium-abonnement kan weg; de domeinregistratie staat daar los
  van en loopt tot 2029. Zeg niets op voor alles draait.
- **Mail op het nieuwe domein.** De site staat op `.com` en het mailadres op
  `.be`. Wil je dat gelijktrekken, dan is er een mailpakket nodig op
  credorehabandperformance.com. Wix biedt dat aan onder *Zakelijke e-mail
  aanvragen*; one.com kan het ook.
