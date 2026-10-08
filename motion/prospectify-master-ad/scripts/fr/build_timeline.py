#!/usr/bin/env python3
"""FR ad — frame cues + word-by-word captions from the real ElevenLabs take.

Whisper gives the heard tokens; the captions show the validated French script. The two are aligned
with difflib (every mis-hearing in the take is a homophone: "ils préparent" / "il prépare",
"test" / "teste", "cent cartes" / "sans carte"), so the on-screen word always matches the sound.
→ src/fr/timeline.json
"""
import difflib
import json
import os
import re
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
FPS = 30
W = json.load(open(os.path.join(ROOT, 'src/fr/words.json')))

SCRIPT = """Tu crées des sites avec l'IA ? | Mais trouver quelqu'un à qui les vendre ? | Ça, c'est une autre histoire.
Et si t'en as encore jamais vendu… | écoute bien.
Google Maps. | Les avis. | Les sites. | Instagram. | Les contacts. | Les messages. | Et tu recommences… | pour chaque entreprise. | Tu passes plus de temps | à chercher | qu'à construire.
C'est exactement tout ça | que Prospectify fait à ta place.
Il trouve les entreprises | qui ont besoin d'un site. | Il prépare le message personnalisé, | que tu envoies | directement depuis Prospectify.
Et attends… | il écrit même le prompt IA | ultra détaillé | pour chaque prospect, | prêt à coller dans Lovable.
Moins de recherche. | Plus de prospection. | Plus de création. | Teste Prospectify : | 10 prospects gratuits. | Sans carte bancaire."""

ACCENT = {'ia', 'vendre', 'histoire', 'bien', 'recommences', 'chercher', 'construire', 'prospectify',
          'trouve', 'prépare', 'personnalisé', 'prompt', 'détaillé', 'lovable', 'moins',
          'plus', '10', 'gratuits', 'sans'}


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r"[^a-z0-9]", '', s)


# ── align the validated script to the heard tokens ──
chunks = [c.strip() for line in SCRIPT.split('\n') for c in line.split('|')]
disp = []
for c in chunks:
    ws = []
    for w in c.split(' '):
        if not w:
            continue
        if not norm(w) and ws:  # a lone "?" or ":" rides on the word before it
            ws[-1] += ' ' + w
        else:
            ws.append(w)
    disp.append(ws)
flat = [w for c in disp for w in c]
hw = [w for w in W if norm(w['w'])]
a_, b_ = [norm(w) for w in flat], [norm(w['w']) for w in hw]
times = [None] * len(flat)
for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a_, b=b_, autojunk=False).get_opcodes():
    if op == 'equal':
        for k in range(i2 - i1):
            times[i1 + k] = (hw[j1 + k]['a'], hw[j1 + k]['b'])
    elif j2 > j1:  # replace: spread the heard span over the script words
        s, e = hw[j1]['a'], hw[j2 - 1]['b']
        n = max(1, i2 - i1)
        for k in range(i2 - i1):
            times[i1 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)
assert all(t for t in times), [flat[i] for i, t in enumerate(times) if not t]

CAPS, p = [], 0
for words in disp:
    ws = []
    for w in words:
        a, b = times[p]
        ws.append({'w': w, 'a': round(a * FPS, 1), 'b': round(b * FPS, 1), 'accent': norm(w) in ACCENT})
        p += 1
    CAPS.append({'words': ws, 'a': ws[0]['a'] - 3, 'b': ws[-1]['b'] + 9})
for i in range(len(CAPS) - 1):
    CAPS[i]['b'] = min(CAPS[i]['b'], CAPS[i + 1]['a'] + 2)


def at(word, n=0):
    """Frame of the n-th occurrence of a script word."""
    k = [i for i, w in enumerate(flat) if norm(w) == norm(word)][n]
    return round(times[k][0] * FPS)


VO_DUR = max(w['b'] for w in W)
T = {
    'fps': FPS,
    'durationInFrames': round(VO_DUR * FPS) + 14,
    'VO_AT': 0,
    'HOOK_B': at('Mais'),
    'HOOK_C': at('Ça,'),
    'WH_IN': at('Et'),
    'WH_OUT': round(times[[i for i, w in enumerate(flat) if norm(w) == 'bien'][0]][1] * FPS) + 6,
    'WH_LISTEN': at('écoute'),
    'CHAOS': [at('Google'), at('avis'), at('sites', 1), at('Instagram'), at('contacts'), at('messages')],
    'REPEAT': at('recommences'),
    'BARS': at('passes'),
    'DECLIC': at('exactement'),
    'BRAND': at('Prospectify'),
    'PR_IN': at('trouve'),
    'SCORE': at('besoin'),
    'SEND': at('envoies'),
    'MSG_IN': at('prépare'),
    'ATTENDS': at('attends'),
    'PROMPT_IN': at('prompt'),
    'PASTE': at('coller'),
    'OUT1': at('Moins'),
    'OUT2': at('Plus', 1),
    'OUT3': at('Plus', 2),
    'CTA_IN': at('Teste'),
    'CTA_FREE': at('10'),
    'CTA_CARD': at('Sans'),
    'CAPS': CAPS,
}
json.dump(T, open(os.path.join(ROOT, 'src/fr/timeline.json'), 'w'), ensure_ascii=False, indent=1)
print({k: v for k, v in T.items() if k != 'CAPS'})
print(f'{len(CAPS)} caption chunks · {T["durationInFrames"]} frames @ {FPS} fps = {T["durationInFrames"] / FPS:.2f}s')
