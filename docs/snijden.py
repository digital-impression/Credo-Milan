# -*- coding: utf-8 -*-
"""Snijden, met de maat zoals het beeld er na het decoderen uitziet.

De vorige versie las de afmetingen uit de stroomregel die ffmpeg afdrukt en
draaide ze om zodra daar het woord rotate of displaymatrix in stond. Dat gaat
mis bij deze foto's: de draaiing zit in de EXIF van de JPEG, ffmpeg noemt hem
niet in die regel maar past hem wel toe bij het decoderen. Zo meldt hij
6192 bij 4128 en levert hij 4128 bij 6192.

Gevolg: het script rekende de uitsnede op een liggend beeld terwijl het
staand was. De crop viel dan buiten het kader, ffmpeg klemde hem dicht op het
midden, en fx en fy deden niets. Het resultaat zag er niet kapot uit, alleen
stond het altijd in het midden in plaats van waar ik het wilde.

Nu decodeert deze versie eerst een beeld en meet daarop. Dat kost een halve
seconde per foto en haalt het giswerk eruit.
"""
import re, subprocess, pathlib, tempfile
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
ROOT = pathlib.Path('/home/user/Credo-Milan')
S = pathlib.Path('/tmp/claude-0/-home-user-Credo-Milan/73c06a14-05e5-5258-914f-fe7878f91928/scratchpad')

IDX = {}
for regel in (S / 'index.txt').read_text().splitlines():
    n, p = regel.split('|', 1)
    IDX[n] = str(S / p)


def echte_maat(src):
    """De maat zoals het beeld na het decoderen is, dus met de draaiing erin."""
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
        tmp = f.name
    subprocess.run([FF, '-nostdin', '-y', '-loglevel', 'error', '-i', src,
                    '-frames:v', '1', '-update', '1', tmp], check=True)
    pr = subprocess.run([FF, '-nostdin', '-i', tmp], capture_output=True, text=True).stderr
    m = re.search(r', (\d{3,5})x(\d{3,5})', pr)
    pathlib.Path(tmp).unlink(missing_ok=True)
    return int(m.group(1)), int(m.group(2))


def cut(idx, out, ratio, ow, oh, fx=.5, fy=.5, z=1.0):
    src = IDX[idx] if idx in IDX else idx
    W, H = echte_maat(src)

    if W / H > ratio:
        ch, cw = H, H * ratio
    else:
        cw, ch = W, W / ratio
    cw *= z; ch *= z

    cx = max(0, min(W - cw, fx * W - cw / 2))
    cy = max(0, min(H - ch, fy * H - ch / 2))
    klem = []
    if abs(cx - (fx * W - cw / 2)) > 1: klem.append('fx geklemd')
    if abs(cy - (fy * H - ch / 2)) > 1: klem.append('fy geklemd')
    if cw < ow or ch < oh: klem.append('onder de doelmaat')

    dst = ROOT / out
    dst.parent.mkdir(parents=True, exist_ok=True)
    r = subprocess.run([FF, '-nostdin', '-y', '-loglevel', 'error', '-i', src, '-vf',
        f'crop={int(cw//2*2)}:{int(ch//2*2)}:{int(cx)}:{int(cy)},'
        f'scale={ow}:{oh}:flags=lanczos',
        '-q:v', '2', '-frames:v', '1', '-update', '1', str(dst)],
        capture_output=True, text=True)

    kb = dst.stat().st_size // 1024 if dst.exists() else 0
    vorm = 'staand' if W < H else 'liggend'
    doel = 'staand' if ratio < 1 else 'liggend'
    print(f'{out:44s} <- {idx} {W}x{H} {vorm}->{doel} z={z}  {kb}kB  '
          f'{"ok" if r.returncode == 0 else r.stderr[:60]}'
          f'{("  LET OP: " + ", ".join(klem)) if klem else ""}')
