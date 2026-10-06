#!/usr/bin/env python3
"""SAME NIGHT (16:9) — every visual / audio cue from the real voiceover's word timings → src/versus/timeline.json."""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from voice_script import SEGMENTS, TAIL_SECONDS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
FPS = 60
voice = json.load(open(os.path.join(ROOT, 'src/versus/voice.json')))
VO = {}
t = 0.0
for sid, text, gap, act, _ in SEGMENTS:
    t += gap
    d = voice[sid]['seconds']
    VO[sid] = {'start': round(t * FPS), 'end': round((t + d) * FPS), 'text': text, 'act': act}
    t += d
END = round((t + TAIL_SECONDS) * FPS)


def S(s, o=0.0):
    return VO[s]['start'] + round(o * FPS)


def E(s, o=0.0):
    return VO[s]['end'] + round(o * FPS)


NUMW = {'40': 'forty', '14': 'fourteen', '2': 'two', '3': 'three', '0': 'zero'}


def clean(w):
    w = re.sub(r"[^a-z0-9']", '', w.lower())
    return NUMW.get(w, w)


def W(s, word, o=0.0, nth=0):
    """frame where `word` starts being spoken (whisper word timestamps; char-ratio fallback)."""
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
# HOOK
C['H_BUILD'] = 4
C['H_FORTY'] = W('v_hook1', 'forty')
C['H_ZERO'] = W('v_hook2', 'single', -0.04)
# WITHOUT
C['W_IN'] = S('v_without', -0.12)
C['W_MAPS'] = S('v_maps', -0.08)
C['W_TABS'] = S('v_tabs', -0.04)
C['W_GUESS'] = S('v_guess', -0.06)
C['W_COLD'] = S('v_cold', -0.06)
C['W_SEEN'] = S('v_seen', -0.08)
C['W_SEEN_TYPING'] = C['W_SEEN'] + 14
C['W_SEEN_STOP'] = W('v_seen', 'No', -0.12)
C['W_NOREPLY'] = W('v_seen', 'No', -0.03)
C['W_GENERIC'] = S('v_generic', -0.10)
C['W_GSITE'] = W('v_generic', 'Generic', -0.05, nth=1)
C['W_LATE'] = S('v_late', -0.06)
C['W_ZERO'] = W('v_late', 'zero', -0.04)
# TURN
C['T_IN'] = S('v_turn', -0.45)
C['T_SAME'] = W('v_turn', 'Same', -0.03)
C['T_WITH'] = W('v_turn', 'With', -0.05)
# WITH — app
C['F_IN'] = S('v_find', -0.30)
QUERY = 'Restaurants · Austin, TX'
C['F_KEYS'] = fit(S('v_find', -0.15), W('v_find', 'local', 0.0), len(QUERY))
C['F_SCAN'] = C['F_KEYS'][-1] + 3
C['F_ROWS'] = C['F_SCAN'] + 22
C['F_ROWS_EACH'] = [C['F_ROWS'] + i * 5 for i in range(5)]
C['F_SCORE'] = W('v_find', 'scores', -0.02)
C['R_IN'] = S('v_reach', -0.12)
C['R_WA'] = W('v_reach', 'WhatsApp', -0.05)
C['R_EMAIL'] = W('v_reach', 'email', -0.05)
C['R_PHONE'] = W('v_reach', 'phone', -0.05)
C['R_COPY'] = E('v_reach', 0.05)
C['P_IN'] = S('v_prompt', -0.12)
C['P_TOOL'] = S('v_prompt', 0.15)
C['P_TYPE0'] = S('v_prompt', 0.25)
C['P_TYPE1'] = E('v_prompt', -0.10)
C['P_READY'] = E('v_prompt', 0.0)
C['TL_IN'] = S('v_tools', -0.15)
C['TL_LOGOS'] = [W('v_tools', 'Lovable', -0.05), W('v_tools', 'Bolt', -0.05), W('v_tools', 'Base44', -0.05) if any(clean(w['w']) == 'base44' for w in voice['v_tools']['words']) else E('v_tools', -0.45)]
C['TL_PASTE'] = W('v_tools', 'Paste', -0.02)
C['D_IN'] = S('v_done', -0.08)
C['D_FOUND'] = W('v_done', 'Client', -0.03)
C['D_READY'] = W('v_done', 'Message', -0.03)
C['D_BUILT'] = W('v_done', 'Site', -0.03)
C['D_SEND'] = C['D_READY'] + 4
# RECAP
C['RC_IN'] = S('v_recap', -0.15)
C['RC_ALL'] = W('v_recap', 'all', -0.03)
C['RC_WITH'] = W('v_recap', 'With', -0.05)
C['RC_ONE'] = W('v_recap', 'one', -0.03)
# CTA
C['CTA_IN'] = S('v_first', -0.15)
C['CTA_START'] = S('v_start', -0.06)
C['CTA_FREE'] = W('v_start', 'Three', -0.04)
C['CTA_CLICK'] = E('v_start', 0.45)

out = {'fps': FPS, 'durationInFrames': END, 'width': 1920, 'height': 1080, 'VO': VO, 'QUERY': QUERY, **C}
json.dump(out, open(os.path.join(ROOT, 'src/versus/timeline.json'), 'w'), indent=1)
print('duration', END, 'frames =', round(END / FPS, 2), 's')
for k, v in VO.items():
    print(f"{k:10s} {v['start']:5d}–{v['end']:5d} {v['text']}")
