# credokinesitherapie.be aan de site koppelen

De site draait op GitHub Pages. Het domein is geregistreerd bij one.com, maar
de DNS staat op dit moment bij Wix — de nameservers zijn `ns0.wixdns.net` en
`ns1.wixdns.net`, en het domein stuurt bezoekers door naar de oude Wix-site op
credorehabandperformance.com.

Onderstaande stappen halen het domein terug naar one.com en zetten het op deze
site. `www.credokinesitherapie.be` wordt het echte adres; het domein zonder www
stuurt daar vanzelf naartoe.

## Eerst dit, anders ligt de mail plat

De mailboxen draaien op one.com (`mx1` tot `mx4.pub.mailpod10-cph3.one.com`),
maar die MX-records staan nu in de zone **bij Wix**. Zodra de nameservers naar
one.com gaan, gelden alleen nog de records die daar staan.

Kijk dus **voor** je de nameservers wijzigt na of de zone bij one.com de
mailrecords van het eigen mailpakket bevat. Bij een one.com-mailpakket staan
die er standaard in, maar controleer het in het controlepaneel onder DNS. Staat
er niets, zet ze er dan eerst bij.

## 1. Nameservers terug naar one.com

In het domeinbeheer van one.com: haal de Wix-nameservers weg en zet die van
one.com terug. Het controlepaneel toont welke dat zijn.

Reken op een paar uur voordat dit overal doorwerkt; de huidige TTL staat op zes
uur.

## 2. De records bij one.com

| Type | Naam | Waarde |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | digital-impression.github.io |

Laat de MX-records staan. Verwijder wel de oude records die naar Wix wijzen:
het A-record op 185.230.63.x en het CNAME of A-record van www naar de
Wix-servers.

## 3. Op GitHub

Settings → Pages → Custom domain: `www.credokinesitherapie.be` invullen en
bewaren. GitHub controleert de DNS; dat kan even duren. Staat er een groen
vinkje, zet dan **Enforce HTTPS** aan. Het certificaat wordt automatisch
aangevraagd.

Het bestand `CNAME` staat in de wortel van de repo en wordt bij elke publicatie
meegestuurd. Bij een publicatie via GitHub Actions is dat nodig: zonder dat
bestand vergeet Pages het eigen domein bij de volgende publicatie.

## 4. Nog te beslissen

- **De publicerende branch.** De workflow publiceert nu vanaf
  `claude/credo-hero-section-n2blk0`. Voor een live site hoort dat de
  standaardbranch te zijn, anders hangt de site aan een werktak.
- **credorehabandperformance.com** blijft naar de Wix-site wijzen zolang je
  daar niets aan doet. Wil je dat adres behouden, laat het dan doorsturen naar
  het nieuwe domein.
- **De Wix-account** kan pas weg als je zeker bent dat niets er nog aan hangt.
  De beelden die de site er nog van haalde, staan sinds deze week lokaal.
