import re, json, sys

SKIP = ('script', 'style')
ATTRS = ('alt', 'aria-label', 'title', 'placeholder', 'data-meer-open', 'data-meer-dicht', 'content')

def spans(html):
    """geeft (start, end, soort) van elk vertaalbaar stuk brontekst"""
    uit = []
    i = 0
    n = len(html)
    while i < n:
        lt = html.find('<', i)
        if lt < 0:
            lt = n
        if lt > i:
            uit.append((i, lt, 'tekst'))
        if lt >= n:
            break
        # commentaar
        if html.startswith('<!--', lt):
            i = html.find('-->', lt)
            i = n if i < 0 else i + 3
            continue
        gt = html.find('>', lt)
        if gt < 0:
            break
        tag = html[lt:gt + 1]
        naam = re.match(r'</?\s*([a-zA-Z0-9-]+)', tag)
        naam = naam.group(1).lower() if naam else ''
        # attributen in deze tag
        for m in re.finditer(r'\b([a-zA-Z-]+)\s*=\s*"([^"]*)"', tag):
            a = m.group(1).lower()
            if a in ATTRS:
                if a == 'content':
                    # alleen de meta's die tekst dragen
                    if not re.search(r'name="(description|twitter:title|twitter:description)"|property="og:(title|description)"', tag):
                        continue
                s = lt + m.start(2)
                uit.append((s, s + len(m.group(2)), 'attr'))
        i = gt + 1
        if naam in SKIP and not tag.startswith('</'):
            eind = re.search(r'</\s*' + naam + r'\s*>', html[i:], re.I)
            i = n if not eind else i + eind.end()
    return uit

def stukken(pad):
    h = open(pad, encoding='utf-8').read()
    uit = []
    for a, b, soort in spans(h):
        s = h[a:b]
        if s.strip() and re.search(r'[a-zA-Z]', s):
            uit.append((a, b, s))
    return h, uit

if __name__ == '__main__':
    alle = {}
    for p in sys.argv[1:]:
        h, st = stukken(p)
        for a, b, s in st:
            k = s.strip()
            alle.setdefault(k, []).append(p)
    sleutels = sorted(alle, key=lambda x: (-len(x), x))
    json.dump(sleutels, open('bronstrings.json', 'w'), ensure_ascii=False, indent=1)
    print(len(sleutels), 'unieke brontekst-stukken;', sum(len(x) for x in sleutels), 'tekens')
