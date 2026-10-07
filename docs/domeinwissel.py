# -*- coding: utf-8 -*-
"""Het webadres van de site omzetten naar een ander domein.

De site noemt zijn eigen adres op honderd plaatsen: de canonicals, og:url, de
hreflang-verwijzingen, de bedrijfsgegevens in de JSON-LD, de sitemap, robots,
de voetregel van het wachtzaalscherm en de QR-code die daar naar de website
wijst. Die moeten alle mee, en in één keer: een canonical die naar een ander
domein wijst dan waar de pagina staat, vertelt Google dat deze pagina niet de
echte is.

Eén ding mag juist niet mee. Het e-mailadres staat op hetzelfde domein maar
hangt aan een heel ander pakket - de mailboxen bij one.com. Dat blijft
info@credokinesitherapie.be, ook als de site verhuist. Zestig van de honderdzeventig
voorkomens in de HTML zijn dat adres, dus een gewone zoek-en-vervang maakt
zestig kapotte mailadressen. Daarom de lookbehind hieronder.

Standaard rekent het script alleen uit wat er zou gebeuren. Pas met --doen
schrijft het.

    python3 docs/domeinwissel.py --nieuw credorehabandperformance.com
    python3 docs/domeinwissel.py --nieuw credorehabandperformance.com --doen
"""
import argparse
import os
import re
import subprocess
import sys

WORTEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Waar gezocht wordt. en/ en fr/ worden normaal uit de Nederlandse pagina's
# gebouwd, maar ze worden hier meegenomen zodat het resultaat meteen klopt
# zonder dat er eerst een vertaalronde over moet.
UITBREIDINGEN = ('.html', '.xml', '.txt', '.js', '.py', '.md')
OOK = ('CNAME',)

# Deze blijven met de hand: het is proza over de vorige verhuizing, geen adres
# dat je kan vervangen zonder de tekst onwaar te maken.
OVERSLAAN = {
    'docs/domein.md',
    'docs/domeinwissel.py',
}


def bestanden():
    for pad, mappen, namen in os.walk(WORTEL):
        mappen[:] = [m for m in mappen
                     if m not in ('.git', '__pycache__', 'node_modules')]
        for naam in namen:
            vol = os.path.join(pad, naam)
            rel = os.path.relpath(vol, WORTEL)
            if rel in OVERSLAAN:
                continue
            if naam in OOK or naam.endswith(UITBREIDINGEN):
                yield vol, rel


def qr_opnieuw(nieuw, doen):
    """De QR-code naar de website zit in een SVG en verandert niet mee met een
    zoek-en-vervang; die moet opnieuw getekend worden."""
    doel = os.path.join(WORTEL, 'tv', 'img', 'qr-site.svg')
    url = 'https://www.%s/' % nieuw
    if not doen:
        return 'zou %s opnieuw tekenen naar %s' % (os.path.relpath(doel, WORTEL), url)
    try:
        import segno
    except ImportError:
        return 'KAN NIET: segno ontbreekt (pip install segno)'
    segno.make(url, error='h').save(doel, scale=1, border=2,
                                    dark='#0D0D0D', light=None)
    return '%s opnieuw getekend naar %s' % (os.path.relpath(doel, WORTEL), url)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--oud', default='credokinesitherapie.be')
    p.add_argument('--nieuw', required=True)
    p.add_argument('--doen', action='store_true',
                   help='schrijf de wijzigingen weg (zonder dit alleen rekenen)')
    a = p.parse_args()

    # Niet vervangen wanneer er een @ voor staat: dat is het mailadres, en dat
    # blijft op het oude domein staan.
    patroon = re.compile(r'(?<!@)' + re.escape(a.oud))

    totaal = 0
    mail_gespaard = 0
    geraakt = []

    for vol, rel in bestanden():
        try:
            tekst = open(vol, encoding='utf-8').read()
        except (UnicodeDecodeError, IsADirectoryError):
            continue
        n = len(patroon.findall(tekst))
        gespaard = len(re.findall(r'@' + re.escape(a.oud), tekst))
        if not n:
            if gespaard:
                mail_gespaard += gespaard
            continue
        totaal += n
        mail_gespaard += gespaard
        geraakt.append((rel, n, gespaard))
        if a.doen:
            open(vol, 'w', encoding='utf-8').write(patroon.sub(a.nieuw, tekst))

    breedte = max((len(r) for r, _, _ in geraakt), default=10)
    print('%s  ->  %s' % (a.oud, a.nieuw))
    print()
    print('%-*s %7s %9s' % (breedte, 'bestand', 'adres', 'mail blijft'))
    print('-' * (breedte + 18))
    for rel, n, g in sorted(geraakt):
        print('%-*s %7d %9s' % (breedte, rel, n, g or ''))
    print('-' * (breedte + 18))
    print('%-*s %7d %9d' % (breedte, '%d bestanden' % len(geraakt), totaal, mail_gespaard))
    print()
    print(qr_opnieuw(a.nieuw, a.doen))
    print()

    if not a.doen:
        print('Dit was alleen een berekening. Voeg --doen toe om te schrijven.')
        return

    # De vertaalde pagina's worden uit de Nederlandse gebouwd; opnieuw bouwen
    # zodat ze niet uit elkaar lopen bij de volgende ronde.
    print('de vertaalde pagina\'s opnieuw bouwen...')
    r = subprocess.run([sys.executable, os.path.join(WORTEL, 'docs', 'bouwtaal.py')],
                       capture_output=True, text=True)
    print(r.stdout.strip() or r.stderr.strip())

    rest = subprocess.run(
        ['grep', '-rno', r'[^@]' + a.oud, '--include=*.html', '--include=*.xml',
         '--include=*.txt', '--include=*.js', WORTEL],
        capture_output=True, text=True).stdout.strip()
    print()
    print('nog over (hoort leeg te zijn):')
    print(rest or '  niets')


if __name__ == '__main__':
    main()
