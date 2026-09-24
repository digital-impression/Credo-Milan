# De Engelse en Franse versie

`/en/` en `/fr/` zijn geen losse pagina's die je apart onderhoudt. Ze worden
gebouwd uit de Nederlandse pagina's, zodat een wijziging aan de opmaak maar
op één plek hoeft.

## Hoe het werkt

`bouwtaal.py` leest `index.html`, `rehab/index.html` en
`performance/index.html`, knipt er elk stuk zichtbare tekst uit, vervangt dat
door de vertaling, en zet het resultaat in `en/` en `fr/`. De opmaak zelf
wordt nooit aangeraakt: alleen de tekst tussen de tags en een handvol
attributen (`alt`, `aria-label`, `title`, `placeholder`, de meta's).

Daarna gaan de relatieve paden een niveau dieper, verhuist de taalschakelaar
naar de juiste sectie in de andere taal, en volgen `lang`, `canonical`,
`hreflang` en de bedrijfsgegevens de paginataal.

- `tok.py` — vindt de vertaalbare stukken in de bron-HTML
- `v1.py` — de lopende teksten
- `v2.py` — koppen, labels, knoppen en alt-teksten
- `bouwtaal.py` — bouwt de zes pagina's

## Na een wijziging aan de Nederlandse tekst

```
python3 docs/bouwtaal.py
```

Staat er nieuwe Nederlandse tekst in die nog niet vertaald is, dan noemt het
script die op onder `NIET VERTAALD`. Zet ze in `v2.py` en draai opnieuw.
Vertaalde pagina's overschrijven zichzelf volledig, dus bewerk niets
rechtstreeks in `en/` of `fr/` — dat gaat bij de volgende bouw verloren.

## Wat bewust anders is dan een letterlijke vertaling

- De navigatielabels zijn korter dan de volledige vertaling. `Ce que nous
  faisons` past niet in de kopbalk tussen 1024 en 1500 pixels; daar staat
  `Soins`.
- Bij de recensies staat erbij dat ze uit het Nederlands vertaald zijn. Het
  zijn echte citaten van mensen met naam; zonder die vermelding lijkt het
  alsof ze het zo hebben opgeschreven.
- `kinesitherapie` wordt `physiotherapy` in het Engels en `kinésithérapie`
  in het Frans; `revalidatie` wordt `rehabilitation` en `revalidation` — dat
  laatste is de Belgische term, niet `rééducation`.
