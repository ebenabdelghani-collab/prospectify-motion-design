#!/usr/bin/env python3
"""THE LOOP (16:9) — cues + word-by-word captions from the real voiceover's word timings → src/loop/timeline.json."""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from voice_script import SEGMENTS, TAIL_SECONDS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
FPS = 60
voice = json.load(open(os.path.join(ROOT, 'src/loop/voice.json')))
VO = {}
t = 0.0
for sid, text, gap, act, _ in SEGMENTS:
    t += gap
    d = voice[sid]['seconds']
    VO[sid] = {'start': round(t * FPS), 'end': round((t + d) * FPS), 'text': text, 'act': act}
    t += d
END = round((t + TAIL_SECONDS) * FPS)

NUMW = {'10': 'ten', '44': 'fortyfour', '312': 'threehundredandtwelve', '1': 'one', '2': 'two', '3': 'three'}


def clean(w):
    w = re.sub(r"[^a-z0-9']", '', w.lower())
    return NUMW.get(w, w)


def S(s, o=0.0):
    return VO[s]['start'] + round(o * FPS)


def E(s, o=0.0):
    return VO[s]['end'] + round(o * FPS)


def W(s, word, o=0.0, nth=0):
    hits = [w for w in voice[s]['words'] if clean(w['w']) == clean(word)]
    if len(hits) > nth:
        return VO[s]['start'] + round((hits[nth]['start'] + o) * FPS)
    txt = VO[s]['text']
    i = max(0, txt.lower().find(word.lower()))
    print(f'  ! fallback timing for "{word}" in {s}')
    return VO[s]['start'] + round(i / len(txt) * (VO[s]['end'] - VO[s]['start']) + o * FPS)


def fit(a, b, n):
    return [round(a + (b - a) * i / max(1, n - 1)) for i in range(n)]


C = {}
# HOOK — the proof is the first frame (the lead card is already on screen at frame 0)
C['HK_NOWEB'] = W('h_noweb', 'website', -0.05)
C['HK_SCORE'] = W('h_client', 'client', -0.05)
# PAIN — four flashes inside one line
C['PN_IN'] = S('p_pain', -0.08)
C['PN_FLASH'] = fit(S('p_pain', -0.05), E('p_pain', -0.25), 4)
C['PN_OUT'] = E('p_pain', 0.05)
# REVEAL — the open loop: three numbered slots
C['RV_IN'] = S('r_three', -0.15)
C['RV_THREE'] = W('r_three', 'three', -0.05)
# 1 · FIND
C['N1_IN'] = S('n1', -0.12)
QUERY = 'Austin'
C['F_KEYS'] = fit(S('n1', 0.0), S('n1', 0.35), len(QUERY))
C['F_SCAN'] = C['F_KEYS'][-1] + 3
C['F_ROWS'] = C['F_SCAN'] + 18
C['F_ROWS_EACH'] = [C['F_ROWS'] + i * 4 for i in range(6)]
C['F_SCORE'] = W('n1', 'scores', -0.05)
# 2 · MESSAGE
C['N2_IN'] = S('n2', -0.12)
C['R_WA'] = W('n2', 'WhatsApp', -0.05)
C['R_EMAIL'] = W('n2', 'email', -0.05)
C['R_PHONE'] = W('n2', 'call', -0.05)
C['R_COPY'] = E('n2', 0.0)
# 3 · PROMPT → BUILDER → SITE
C['N3_IN'] = S('n3', -0.12)
C['P_TOOL'] = S('n3', 0.2)
C['P_TYPE0'] = S('n3', 0.3)
C['P_TYPE1'] = E('n3', -0.05)
C['P_READY'] = E('n3', 0.0)
C['TL_IN'] = S('n3b', -0.10)
C['TL_LOGOS'] = [W('n3b', 'Lovable', -0.05), W('n3b', 'Bolt', -0.05), W('n3b', 'Base', -0.05)]
C['TL_PASTE'] = W('n3b', 'Paste', -0.02)
C['SITE_END'] = E('n3b', 0.25)
# CTA
C['CTA_IN'] = S('cta', -0.15)
C['CTA_NOCARD'] = W('cta', 'No', -0.05)
# LOOP — back to frame 0
C['LP_IN'] = S('loop', -0.05)
C['LP_PIZ'] = W('loop', 'this', -0.10)
C['END'] = END

# ── word-by-word captions ────────────────────────────────────────────────────────────────────────
FIX = {'3': 'Three', '1': 'One', '2': 'Two', 'lovable': 'Lovable', 'bolt': 'Bolt', 'prospectify': 'Prospectify', 'whatsapp': 'WhatsApp', 'Whatsapp': 'WhatsApp'}
ACCENT = {'312', 'threehundredandtwelve', 'website', 'client', 'night', 'three', 'one', 'two', 'finds', 'scores', 'message', 'prompt', 'premium', 'ten', 'free', 'pizzeria', 'base44', 'lovable'}
caps = []
for sid, *_ in SEGMENTS:
    ws = voice[sid]['words']
    out = []
    i = 0
    while i < len(ws):
        w = dict(ws[i])
        tok = w['w'].strip()
        if tok.lower().strip('.,!?') == 'base' and i + 1 < len(ws) and re.sub(r'\D', '', ws[i + 1]['w']) == '44':
            tok = 'Base44' + re.sub(r'[\w]', '', ws[i + 1]['w'])
            w['end'] = ws[i + 1]['end']
            i += 1
        core = re.sub(r'[^\w]', '', tok)
        tok = tok.replace(core, FIX.get(core, FIX.get(core.lower(), core)))
        out.append({'w': tok, 'a': VO[sid]['start'] + round(w['start'] * FPS), 'b': VO[sid]['start'] + round(w['end'] * FPS), 'accent': clean(tok) in ACCENT})
        i += 1
    if out:
        out[0]['w'] = out[0]['w'][:1].upper() + out[0]['w'][1:]
    # chunk: split each phrase (up to punctuation) into balanced groups of ≤ 3 words
    phrases, cur = [], []
    for w in out:
        cur.append(w)
        if re.search(r'[.,!?…]$', w['w']):
            phrases.append(cur)
            cur = []
    if cur:
        phrases.append(cur)
    for ph in phrases:
        n = len(ph)
        k = -(-n // 3)
        sizes = [n // k + (1 if i < n % k else 0) for i in range(k)]
        j = 0
        for sz in sizes:
            chunk = ph[j:j + sz]
            j += sz
            caps.append({'words': chunk, 'a': chunk[0]['a'] - 2, 'b': chunk[-1]['b'] + 8})
# a chunk stays until the next one starts (no flicker), but never more than 0.6 s after its last word
for i in range(len(caps) - 1):
    caps[i]['b'] = min(max(caps[i]['b'], caps[i + 1]['a'] - 1), caps[i]['b'] + 36, caps[i + 1]['a'] - 1)

out = {'fps': FPS, 'durationInFrames': END, 'width': 1920, 'height': 1080, 'VO': VO, 'QUERY': QUERY, 'CAPS': caps, **C}
json.dump(out, open(os.path.join(ROOT, 'src/loop/timeline.json'), 'w'), indent=1)
print('duration', END, 'frames =', round(END / FPS, 2), 's ·', len(caps), 'caption chunks')
for k, v in VO.items():
    print(f"{k:11s} {v['start']:5d}–{v['end']:5d} {v['text']}")
