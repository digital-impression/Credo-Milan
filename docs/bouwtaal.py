# -*- coding: utf-8 -*-
"""Bouwt de Engelse en Franse versie van de drie pagina's.

De brontekst wordt stuk voor stuk vervangen via de spans uit tok.py, zodat de
opmaak zelf onaangeroerd blijft. Daarna gaan de verwijzingen en de taalkop mee
naar de nieuwe map.
"""
import os, re, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tok import spans
from v1 import V1
from v2 import V2

M = {**V1, **V2}
import pathlib
BRON = str(pathlib.Path(__file__).resolve().parent.parent)

PAGINAS = [
    # (bronpad, doelpad binnen de taalmap, diepte)
    ('index.html',             'index.html',             1),
    ('rehab/index.html',       'rehab/index.html',       2),
    ('performance/index.html', 'performance/index.html', 2),
]

TAAL = {
    'en': {'lang': 'en', 'idx': 0, 'pad': 'en'},
    'fr': {'lang': 'fr', 'idx': 1, 'pad': 'fr'},
}


def vertaal_tekst(html, idx):
    st = [(a, b) for a, b, _ in spans(html)
          if html[a:b].strip() and re.search(r'[a-zA-Z]', html[a:b])]
    uit = []
    vorig = 0
    ongedekt = []
    for a, b in st:
        s = html[a:b]
        k = s.strip()
        v = M.get(k)
        if v is None:
            ongedekt.append(k)
            continue
        voor = s[:len(s) - len(s.lstrip())]
        na = s[len(s.rstrip()):]
        uit.append(html[vorig:a])
        uit.append(voor + v[idx] + na)
        vorig = b
    uit.append(html[vorig:])
    return ''.join(uit), ongedekt


def verwijzingen(html, taal, diepte, sec=''):
    """Zet de relatieve paden goed voor /<taal>/... en /<taal>/<sectie>/..."""
    op = '../' * diepte          # vanaf het bestand terug naar de sitewortel
    if diepte == 1:
        paren = [
            ('href="./en/"',  'href="../en/"'),
            ('href="./fr/"',  'href="../fr/"'),
            ('href="./"',     'href="./"'),          # blijft: de taalwortel zelf
            ('"assets/',      '"' + op + 'assets/'),
        ]
    else:
        # De schakelaar moet naar dezelfde sectie in de andere taal wijzen,
        # niet naar de voorpagina van die taal.
        # De Nederlandse bron wijst al naar dezelfde sectie in de andere taal
        # (../en/rehab/); alleen de diepte moet erbij.
        paren = [
            ('href="../en/', 'href="' + op + 'en/'),
            ('href="../fr/', 'href="' + op + 'fr/'),
            ('href="../privacy/"', 'href="' + op + 'privacy/"'),
            ('href="../cookies/"', 'href="' + op + 'cookies/"'),
            ('"../assets/',   '"' + op + 'assets/'),
        ]
    for a, b in paren:
        html = html.replace(a, b)
    return html


def taalkop(html, taal, diepte, bronpad):
    op = '../' * diepte
    # de schakelaar: het actieve been verhuist
    html = html.replace('<html lang="nl-BE">', '<html lang="%s">' % TAAL[taal]['lang'])
    html = html.replace('<html lang="nl">', '<html lang="%s">' % TAAL[taal]['lang'])

    # NL-been krijgt het pad naar de Nederlandse pagina terug
    nl_doel = op + ('' if diepte == 1 else bronpad.replace('index.html', ''))
    html = re.sub(r'href="(\.\./|\./)"(\s+class="taal-opt)', 'href="%s"\\2' % (nl_doel or './'), html)

    # is-actief verplaatsen
    html = html.replace(' class="taal-opt is-actief" aria-current="page"', ' class="taal-opt"')
    html = re.sub(r'(<a href="[^"]*/%s/[^"]*" class="taal-opt)"' % taal,
                  r'\1 is-actief" aria-current="page"', html)

    # canonical, og:url en hreflang
    basis = 'https://www.credokinesitherapie.be/'
    sec = '' if diepte == 1 else bronpad.replace('index.html', '')
    html = re.sub(r'(<link rel="canonical" href=")[^"]*(")',
                  r'\g<1>%s%s/%s\g<2>' % (basis, taal, sec), html)
    html = re.sub(r'(<meta property="og:url" content=")[^"]*(")',
                  r'\g<1>%s%s/%s\g<2>' % (basis, taal, sec), html)
    html = re.sub(r'(<meta property="og:locale" content=")[^"]*(")',
                  r'\g<1>%s\g<2>' % ('en_GB' if taal == 'en' else 'fr_BE'), html)
    # de Nederlandse pagina's dragen hreflang-verwijzingen naar de wortel; die
    # moeten per sectie wijzen zodat elke taalversie zijn tegenhanger kent
    for code, pad in (('nl-BE', basis + sec), ('en', basis + 'en/' + sec),
                      ('fr', basis + 'fr/' + sec), ('x-default', basis + sec)):
        html = re.sub(r'(<link rel="alternate" hreflang="%s" href=")[^"]*(")' % re.escape(code),
                      r'\g<1>%s\g<2>' % pad, html)
    return html


JSONLD = {
    'Kinesitherapie, manuele therapie, oefentherapie, performance training en sportvoeding in Diepenbeek bij Hasselt.': (
        'Physiotherapy, manual therapy, exercise therapy, performance training and sports nutrition in Diepenbeek near Hasselt.',
        'Kin\u00e9sith\u00e9rapie, th\u00e9rapie manuelle, th\u00e9rapie par l\u2019exercice, entra\u00eenement de performance et nutrition sportive \u00e0 Diepenbeek, pr\u00e8s de Hasselt.'),
    'Manuele therapie & kinesitherapie': ('Manual therapy & physiotherapy', 'Th\u00e9rapie manuelle & kin\u00e9sith\u00e9rapie'),
    'Oefentherapie': ('Exercise therapy', 'Th\u00e9rapie par l\u2019exercice'),
    'Sportvoeding': ('Sports nutrition', 'Nutrition sportive'),
    'Afspraak kinesitherapie': ('Physiotherapy appointment', 'Rendez-vous de kin\u00e9sith\u00e9rapie'),
    'Kinesist en zaakvoerder': ('Physiotherapist and partner', 'Kin\u00e9sith\u00e9rapeute et g\u00e9rant'),
    'Kinesist': ('Physiotherapist', 'Kin\u00e9sith\u00e9rapeute'),
    '"inLanguage": "nl-BE"': ('"inLanguage": "en"', '"inLanguage": "fr-BE"'),
}


def structuur(html, idx):
    """De bedrijfsgegevens dragen ook zinnen; die volgen de paginataal."""
    for nl, v in JSONLD.items():
        html = html.replace('"%s"' % nl, '"%s"' % v[idx]) if not nl.startswith('"') \
               else html.replace(nl, v[idx])
    return html


MERK = {0: ' &middot; Google review', 1: ' &middot; avis Google'}
MERK_UIT = {0: ' &middot; Google review, translated from Dutch',
            1: ' &middot; avis Google, traduit du n\u00e9erlandais'}
NOTITIE = {0: '<p class="eyebrow mt-6 text-ink/40">Quotes translated from Dutch</p>',
           1: '<p class="eyebrow mt-6 text-ink/40">T\u00e9moignages traduits du n\u00e9erlandais</p>'}
ANKER = ('    <div class="mt-10 md:mt-12 pt-8 border-t border-ink/12">\n'
         '      <a href="#aanvraag" class="link-line text-ink">')


def recensies(html, idx):
    """De recensies zijn echte, in het Nederlands geschreven citaten. Op een
    vertaalde pagina moet erbij staan dat het een vertaling is, anders lijkt
    het alsof deze mensen het zo hebben opgeschreven."""
    if MERK[idx] in html:
        html = html.replace(MERK[idx], MERK_UIT[idx])
    elif 'id="reviews"' in html and ANKER in html:
        html = html.replace(ANKER, '    ' + NOTITIE[idx] + '\n\n' + ANKER, 1)
    return html


def bouw(taal):
    idx = TAAL[taal]['idx']
    wortel = os.path.join(BRON, TAAL[taal]['pad'])
    if os.path.isdir(wortel):
        shutil.rmtree(wortel)
    alle_ongedekt = []
    for bronpad, doel, diepte in PAGINAS:
        html = open(os.path.join(BRON, bronpad), encoding='utf-8').read()
        html, ong = vertaal_tekst(html, idx)
        alle_ongedekt += ong
        sec = '' if diepte == 1 else bronpad.replace('index.html', '')
        html = verwijzingen(html, taal, diepte, sec)
        html = taalkop(html, taal, diepte, bronpad)
        html = structuur(html, idx)
        html = recensies(html, idx)
        pad = os.path.join(wortel, doel)
        os.makedirs(os.path.dirname(pad), exist_ok=True)
        open(pad, 'w', encoding='utf-8').write(html)
        print('  ', pad.replace(BRON + '/', ''), len(html))
    return alle_ongedekt


if __name__ == '__main__':
    for taal in ('en', 'fr'):
        print('==', taal)
        ong = bouw(taal)
        if ong:
            print('   NIET VERTAALD:', len(ong))
            for x in dict.fromkeys(ong):
                print('     ', repr(x))
