# -*- coding: utf-8 -*-
"""De twee foto's van de keuzepagina opnieuw snijden, uit het bronmateriaal.

De oude bestanden waren staande uitsneden van duizend bij dertienhonderd.
Op een laptop van negentienhonderd breed wordt zo'n beeld bijna twee keer
uitvergroot - dat is waarom ze er zacht en goedkoop uitzagen. Hier komen
per helft twee vierkante uitsneden uit de originelen: een grote voor het
scherm en een kleine voor de telefoon.

Waarom vierkant: elke helft krijgt in index.html een eigen kolom van
tweeenzestig procent van de breedte, en die kolom is vierkant tot staand.
Een liggend beeld door zo'n kolom bekeken zet het onderwerp veel te groot
in beeld - dat was de klacht.
"""
import pathlib
from PIL import Image, ImageOps

# De originelen staan in de branch media-source; zet die ergens neer en
# wijs S daarheen. index.txt is een lijst 'nummer|pad', gesorteerd zoals
# docs/beeldcatalogus.md telt: eerst 'Nieuwe map (2)', dan 'Nieuwe map',
# alfabetisch, zonder de twee filmpjes.
S = pathlib.Path('bron')
ROOT = pathlib.Path(__file__).resolve().parent.parent
IDX = {n: str(S / p) for n, p in
       (r.split('|', 1) for r in (S / 'index.txt').read_text().splitlines())}


def snij(nr, uit, bw, bh, fx, fy, grijs=True, kwal=80):
    """fx/fy = waar in het origineel het midden van de uitsnede ligt (0-1)."""
    im = ImageOps.exif_transpose(Image.open(IDX[nr])).convert('RGB')
    W, H = im.size
    ratio = bw / bh
    if W / H > ratio:
        ch = H; cw = H * ratio
    else:
        cw = W; ch = W / ratio
    cx = max(0, min(W - cw, fx * W - cw / 2))
    cy = max(0, min(H - ch, fy * H - ch / 2))
    im = im.crop((int(cx), int(cy), int(cx + cw), int(cy + ch)))
    im = im.resize((bw, bh), Image.LANCZOS)
    # Beide originelen zijn in de camera al zwart-wit. Dan is een jpeg met
    # een kanaal kleiner dan een met drie, en hij ziet er hetzelfde uit.
    if grijs:
        im = ImageOps.grayscale(im)
    dst = ROOT / uit
    im.save(dst, quality=kwal, optimize=True, progressive=True)
    print('%-44s %dx%d  %d kB' % (uit, bw, bh, dst.stat().st_size // 1024))


# De helften krijgen elk een eigen kolom van ongeveer zestig procent van de
# breedte, en die kolom is vierkant tot staand. Daarom zijn de uitsneden dat
# ook: een liggend beeld door zo'n kolom bekeken zet het onderwerp veel te
# groot in beeld.
#
# 035 - de knie met het operatielitteken, op ruim een derde van boven.
snij('035', 'assets/img/keuze-rehab.jpg',      1600, 1600, .50, .43)
snij('035', 'assets/img/keuze-rehab-smal.jpg',  900,  900, .50, .43)

# 064 - de sledepush. Het hoofd staat op dertig procent, het lichaam loopt
# daaronder door tot de onderrand.
snij('064', 'assets/img/keuze-performance.jpg',      1600, 1600, .50, .40)
snij('064', 'assets/img/keuze-performance-smal.jpg',  900,  900, .50, .40)
