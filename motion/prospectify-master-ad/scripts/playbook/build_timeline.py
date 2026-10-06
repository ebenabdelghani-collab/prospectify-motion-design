#!/usr/bin/env python3
"""THE PLAYBOOK (16:9) — every visual / audio cue derived from the real voiceover → src/playbook/timeline.json."""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from voice_script import SEGMENTS, TAIL_SECONDS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
FPS = 60
voice = json.load(open(os.path.join(ROOT, 'src/playbook/voice.json')))
VO = {}
t = 0.0
for sid, text, gap, _, act in SEGMENTS:
    t += gap
    d = voice[sid]['seconds']
    VO[sid] = {'start': round(t * FPS), 'end': round((t + d) * FPS), 'text': text, 'act': act}
    t += d
END = round((t + TAIL_SECONDS) * FPS)


def S(s, o=0.0):
    return VO[s]['start'] + round(o * FPS)


def E(s, o=0.0):
    return VO[s]['end'] + round(o * FPS)


def W(s, word, o=0.0):
    """frame where `word` is spoken (real word timing from build_voice.py; char-ratio fallback)."""
    first = word.split()[0].lower()
    for w in voice[s].get('words', []):
        if w['w'].lower() == first:
            return VO[s]['start'] + round((w['start'] + o) * FPS)
    txt = VO[s]['text']
    i = max(0, txt.lower().find(word.lower()))
    return VO[s]['start'] + round(i / len(txt) * (VO[s]['end'] - VO[s]['start']) + o * FPS)


def fit(a, b, n):
    return [round(a + (b - a) * i / max(1, n - 1)) for i in range(n)]


C = {}
# ── NIGHT ───────────────────────────────────────────────────────────────
C['CLOCK_IN'] = 2
C['CLOCK_GLITCH'] = [S('p_time', -0.05), W('p_time', 'PM', -0.05)]
C['MINUTE_FLIP'] = E('p_time', -0.1)
C['BUILD_IN'] = S('p_built', -0.20)
PROMPT = 'build a website for a local restaurant'
C['PROMPT'] = PROMPT
C['BUILD_KEYS'] = fit(S('p_built', -0.1), W('p_built', 'forty', -0.1), len(PROMPT))
C['BUILD_STEPS'] = fit(W('p_built', 'forty', 0.0), E('p_built', -0.05), 8)
C['BUILD_DONE'] = E('p_built', 0.05)
C['SEARCH_IN'] = S('p_find', -0.25)
QUERY = 'who needs a website near me?'
C['QUERY'] = QUERY
C['SEARCH_KEYS'] = fit(S('p_find', -0.05), E('p_find', -0.05), len(QUERY))
C['SEARCH_BURST'] = E('p_find', 0.20)
C['TABS_IN'] = C['SEARCH_BURST'] + 8
C['TAB_STEPS'] = fit(C['TABS_IN'], S('p_tabs', 0.0), 4)  # 5 → 9 → 13 → 14 TABS.
C['TABS_OUT'] = S('p_here', -0.12)
C['HERE_IN'] = S('p_here', -0.04)
C['THERE_IN'] = S('p_there', -0.04)
C['EVERY_IN'] = S('p_every', -0.04)
C['SPLAT'] = E('p_every', 0.30)
# ── DAY ─────────────────────────────────────────────────────────────────
C['PB_TITLE'] = S('p_playbook', -0.10)
C['PB_STEPS'] = fit(W('p_playbook', 'playbook', 0.1), E('p_playbook', 0.25), 4)
C['STEP1'] = S('p_one', -0.10)
C['ONE_MAP'] = S('p_one', 0.10)
C['ONE_PINS'] = fit(S('p_one', 0.25), W('p_one', 'business', 0.0), 12)
C['ONE_CARD'] = W('p_one', 'business', 0.05)
C['ONE_RANK'] = C['ONE_CARD'] + 10
C['STEP2'] = S('p_two', -0.10)
C['TWO_TYPE'] = [S('p_two', 0.20), E('p_two', 0.25)]
C['TWO_COPY'] = E('p_two', 0.40)
C['STEP3'] = S('p_three', -0.10)
C['THREE_PICK'] = W('p_three', 'site', -0.05)
C['THREE_STEPS'] = fit(W('p_three', 'with', 0.0), E('p_three', 0.40), 8)
C['STEP4'] = S('p_four', -0.10)
C['FOUR_SENT'] = E('p_four', 0.15)
C['KNEW'] = S('p_knew', -0.05)
C['KNEW_CHECKS'] = [W('p_knew', 'three', 0.0), W('p_knew', 'four', 0.0)]
C['NIGHTS'] = S('p_nights', -0.05)
C['NIGHTS_HIT'] = W('p_nights', 'nights', -0.05)
C['DOES'] = S('p_does', -0.20)
C['MERGE'] = W('p_does', 'both', 0.0)
C['LOGO'] = W('p_does', 'In one', -0.25)
C['ONE_SEARCH'] = W('p_does', 'In one', 0.0)
C['TAG1'] = S('p_tag', -0.04)
C['TAG2'] = W('p_tag', 'More', -0.04)
C['CTA'] = S('p_start', -0.10)
C['CTA_SUB'] = C['CTA'] + 14
C['URL'] = C['CTA'] + 26

out = {'fps': FPS, 'durationInFrames': END, 'width': 1920, 'height': 1080, 'VO': VO, **C}
json.dump(out, open(os.path.join(ROOT, 'src/playbook/timeline.json'), 'w'), indent=1)
print('duration', END, 'frames =', round(END / FPS, 2), 's')
for k, v in VO.items():
    print(f"{k:11s} {v['start']:5d}–{v['end']:5d} {v['text']}")
