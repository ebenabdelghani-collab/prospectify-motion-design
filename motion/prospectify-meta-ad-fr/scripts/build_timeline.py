#!/usr/bin/env python3
"""Repères d'images, titres graphiques et sous-titres, tous dérivés de la prise ElevenLabs réelle.

Whisper (words.json) donne ce qui est entendu ; l'écran affiche le script validé. Les deux sont
alignés avec difflib, donc chaque animation part du mot qui la déclenche (« ville », « score »…).
→ src/data/timeline.json
"""
import difflib
import json
import os
import re
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
VO_AT = 4            # la voix démarre à l'image 4 : l'image 0 montre déjà le visuel
TAIL = 52            # tenue du CTA après le dernier mot (~1,7 s)
W = json.load(open(os.path.join(ROOT, 'src/data/words.json')))

# Sous-titres : un bloc = deux lignes max. Les mots-clés passent en couleur d'accent.
SCRIPT = [
    "Tu sais créer des sites avec l'IA…", "mais t'as zéro client ?",
    "Le problème, c'est pas le site.", "C'est de trouver des clients.",
    "Regarde.", "Avec Prospectify, je choisis", "une ville et un commerce.",
    "Je lance la recherche…",
    "Et là, je repère des commerces sans site web,", "avec un score pour savoir",
    "lesquels prospecter en priorité.",
    "Je peux ensuite leur proposer", "une démo de site créée avec l'IA.",
    "Arrête de créer des sites pour personne.", "Trouve à qui les proposer.",
    "Tes 10 premiers prospects", "sont gratuits sur Prospectify.",
]
ACCENT = {'ia', 'lia', 'zero', 'client', 'clients', 'trouver', 'prospectify', 'ville', 'commerce',
          'sans', 'site', 'web', 'score', 'priorite', 'demo', 'personne', 'trouve', '10', 'gratuits'}
ACCENT_ONLY_IN = {'site': {8}, 'web': {8}}  # « site » n'est accentué que dans « sans site web »


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)


disp = []
for c in SCRIPT:
    ws = []
    for w in c.split(' '):
        if not norm(w) and ws:
            ws[-1] += ' ' + w
        elif w:
            ws.append(w)
    disp.append(ws)
flat = [w for c in disp for w in c]
hw = [w for w in W if norm(w['w'])]
times = [None] * len(flat)
for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=[norm(w) for w in flat], b=[norm(w['w']) for w in hw], autojunk=False).get_opcodes():
    if op == 'equal':
        for k in range(i2 - i1):
            times[i1 + k] = (hw[j1 + k]['a'], hw[j1 + k]['b'])
    elif j2 > j1:
        s, e = hw[j1]['a'], hw[j2 - 1]['b']
        n = max(1, i2 - i1)
        for k in range(i2 - i1):
            times[i1 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)
assert all(times), [flat[i] for i, t in enumerate(times) if not t]

fr = lambda sec: round(sec * FPS) + VO_AT  # noqa: E731
CAPS, p = [], 0
for ci, words in enumerate(disp):
    ws = []
    for w in words:
        a, b = times[p]
        n = norm(w)
        acc = n in ACCENT and (n not in ACCENT_ONLY_IN or ci in ACCENT_ONLY_IN[n])
        ws.append({'w': w, 'accent': acc})
        p += 1
    a0, b0 = times[p - len(words)][0], times[p - 1][1]
    CAPS.append({'text': ' '.join(words), 'words': ws, 'a': fr(a0) - 2, 'b': fr(b0) + 8, 'sa': a0, 'sb': b0})
for i in range(len(CAPS) - 1):
    CAPS[i]['b'] = min(CAPS[i]['b'], CAPS[i + 1]['a'])


def at(word, n=0):
    k = [i for i, w in enumerate(flat) if norm(w) == norm(word)][n]
    return fr(times[k][0])


def end(word, n=0):
    k = [i for i, w in enumerate(flat) if norm(w) == norm(word)][n]
    return fr(times[k][1])


C = {
    'MAIS': at('mais'), 'ZERO': at('zéro'),
    'PROB': at('Le'), 'TROUVER': at('trouver'),
    'REGARDE': at('Regarde.'), 'BRAND_VO': at('Prospectify,'), 'VILLE': at('ville'), 'COMMERCE': at('commerce.'),
    'LANCE': at('lance'), 'RECHERCHE': at('recherche…'),
    'ETLA': at('Et', 1), 'SANS': at('sans'), 'SCORE': at('score'), 'PRIORITE': at('priorité.'),
    'JEPEUX': at('peux'), 'PROPOSER': at('proposer'), 'DEMO': at('démo'),
    'ARRETE': at('Arrête'), 'TROUVE': at('Trouve'), 'DIX': at('10'), 'GRATUITS': at('gratuits'),
    'LAST': end('Prospectify.', -1),
}
C['RESULTS'] = C['RECHERCHE'] + 18   # 0,4 s de chargement puis les résultats
DUR = C['LAST'] + TAIL

# Titres graphiques (la pub doit fonctionner sans le son)
HEAD = [
    {'a': 3, 'b': C['MAIS'] - 1, 'lines': ['TU SAIS CRÉER', 'DES SITES IA.'], 'accent': ['IA.']},
    {'a': C['MAIS'], 'b': C['PROB'] - 1, 'lines': ['MAIS 0 CLIENT ?'], 'accent': ['0', 'CLIENT']},
    {'a': C['PROB'], 'b': C['TROUVER'] - 1, 'lines': ['LE SITE ?', "C'EST FAIT."], 'accent': []},
    {'a': C['TROUVER'], 'b': C['REGARDE'] - 1, 'lines': ['LES CLIENTS ?'], 'accent': ['CLIENTS']},
    {'a': C['REGARDE'], 'b': C['LANCE'] - 1, 'lines': ['TROUVE DES COMMERCES', 'SANS SITE.'], 'accent': ['SANS', 'SITE.']},
    {'a': C['LANCE'], 'b': C['SANS'] - 1, 'lines': ['MONTPELLIER', '+ BARBIERS'], 'accent': ['+']},
    {'a': C['SANS'], 'b': C['SCORE'] - 1, 'lines': ['DES COMMERCES', 'SANS SITE WEB.'], 'accent': ['SANS', 'SITE', 'WEB.']},
    {'a': C['SCORE'], 'b': C['JEPEUX'] - 1, 'lines': ['UN SCORE POUR', 'LES PRIORISER.'], 'accent': ['SCORE']},
    {'a': C['JEPEUX'], 'b': C['DEMO'] - 1, 'lines': ['TROUVE UN PROSPECT.'], 'accent': ['PROSPECT.']},
    {'a': C['DEMO'], 'b': C['ARRETE'] - 1, 'lines': ['PROPOSE TON SITE.'], 'accent': ['SITE.']},
    {'a': C['ARRETE'], 'b': C['TROUVE'] - 1, 'lines': ['ARRÊTE DE CRÉER', 'POUR PERSONNE.'], 'accent': ['PERSONNE.']},
    {'a': C['TROUVE'], 'b': C['DIX'] - 1, 'lines': ['TROUVE TES PROSPECTS.'], 'accent': ['PROSPECTS.']},
]

T = {'fps': FPS, 'durationInFrames': DUR, 'VO_AT': VO_AT, **C, 'HEAD': HEAD, 'CAPS': CAPS}
json.dump(T, open(os.path.join(ROOT, 'src/data/timeline.json'), 'w'), ensure_ascii=False, indent=1)
print({k: v for k, v in C.items()})
print(f'{len(CAPS)} sous-titres · {DUR} images = {DUR / FPS:.2f} s')
