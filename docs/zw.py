"""Maakt de zwart-witbeelden voor het wachtzaalscherm (tv/img/zw/).

Het scherm toonde de foto's in kleur met een CSS-filter erover (grayscale,
contrast, brightness). Op een televisie of Chromecast wordt die filter bij elk
beeldje opnieuw uitgerekend zolang de foto beweegt, en dat hapert. Dit script
bakt hetzelfde effect in een kopie van de foto, zodat het scherm niets meer
hoeft te rekenen.

Opnieuw draaien na elke nieuwe of gewijzigde foto in tv/inhoud.js:

    python3 docs/zw.py

Nodig: Python 3 met Pillow en numpy, en Node (om inhoud.js te lezen).
Daarna VERSIE in tv/sw.js verhogen.
"""
import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TV = os.path.join(ROOT, 'tv')
UIT = os.path.join(TV, 'img', 'zw')

# Dezelfde waarden als de filters in tv.css.
#   soort: (contrast, brightness, langste zijde of None)
SOORTEN = {
    'foto':  (1.1, 0.92, None),   # .foto
    'team':  (1.1, 0.75, None),   # .s-teamintro .rij img
    'zaal':  (1.1, 0.85, 640),    # .s-zaal .rol img (op het scherm 520px)
    'grijs': (1.0, 1.00, None),   # .s-cijfers .getal (alleen grayscale)
}


def inhoud():
    code = ("global.window = global; require(process.argv[1]);"
            "process.stdout.write(JSON.stringify(window.CREDO_TV));")
    uit = subprocess.check_output(['node', '-e', code, os.path.join(TV, 'inhoud.js')])
    return json.loads(uit)


def nodig(c):
    """Welke beelden in welke soort nodig zijn, zoals tv.js ze gebruikt."""
    paren = set()

    def zoek(v, sleutel, scene):
        if isinstance(v, dict):
            for k, w in v.items():
                zoek(w, k, scene)
        elif isinstance(v, list):
            for w in v:
                zoek(w, sleutel, scene)
        elif isinstance(v, str) and v.startswith('../assets/img/'):
            if sleutel == 'beeld':
                paren.add((v, 'foto'))
                if scene.get('soort') == 'persoon':
                    paren.add((v, 'team'))
                if scene.get('soort') == 'cijfers' and not scene.get('vulling'):
                    paren.add((v, 'grijs'))
            elif sleutel == 'beelden':
                paren.add((v, 'zaal'))
            elif sleutel == 'vulling':
                paren.add((v, 'grijs'))

    for scene in c.get('scenes', []):
        zoek(scene, '', scene)
    return sorted(paren)


def bak(bron, soort):
    contrast, helder, maat = SOORTEN[soort]
    im = Image.open(bron)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        achter = Image.new('RGBA', im.size, (13, 13, 13, 255))
        im = Image.alpha_composite(achter, im)
    im = im.convert('RGB')
    if maat and max(im.size) > maat:
        im.thumbnail((maat, maat), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255.0
    # grayscale(1): de luminantiematrix van de CSS-filter
    g = a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722
    g = np.clip(g, 0, 1)
    g = np.clip((g - 0.5) * contrast + 0.5, 0, 1)
    g = np.clip(g * helder, 0, 1)
    return Image.fromarray((g * 255 + 0.5).astype(np.uint8), 'L')


def main():
    paren = nodig(inhoud())
    lijst = []
    for pad, soort in paren:
        rel = pad[len('../assets/img/'):]
        bron = os.path.join(ROOT, 'assets', 'img', rel)
        if not os.path.exists(bron):
            print('ontbreekt:', pad, file=sys.stderr)
            continue
        naam = os.path.splitext(rel)[0] + '.jpg'
        doel = os.path.join(UIT, soort, naam)
        os.makedirs(os.path.dirname(doel), exist_ok=True)
        bak(bron, soort).save(doel, 'JPEG', quality=86, optimize=True)
        lijst.append('img/zw/' + soort + '/' + naam)
    # De service worker leest deze lijst, zodat ook deze beelden offline staan.
    with open(os.path.join(TV, 'zw-lijst.js'), 'w') as f:
        f.write('// Gemaakt door docs/zw.py. Niet met de hand aanpassen.\n')
        f.write('self.ZW_LIJST = ' + json.dumps(lijst, indent=0) + ';\n')
    print(len(lijst), 'beelden gemaakt in tv/img/zw/')


if __name__ == '__main__':
    main()
