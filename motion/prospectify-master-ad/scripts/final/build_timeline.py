#!/usr/bin/env python3
"""
FINAL FILM — edit decision list.

Lays the real voiceover on the timeline, then derives EVERY visual and audio cue from where the words
land. Output: src/final/timeline.json (frames @ 60 fps). Remotion and build_audio.py read the same file,
so a lock that resolves on frame N gets its transient on frame N.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from voice_script import SEGMENTS, TAIL_SECONDS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
FPS = 60
voice = json.load(open(os.path.join(ROOT, 'src/final/voice.json')))

VO = {}
t = 0.0
for sid, text, gap, _, act in SEGMENTS:
    t += gap
    dur = voice[sid]['seconds']
    VO[sid] = {'start': round(t * FPS), 'end': round((t + dur) * FPS), 'text': text, 'act': act}
    t += dur
END = round((t + TAIL_SECONDS) * FPS)


def S(sid, off=0.0):
    return VO[sid]['start'] + round(off * FPS)


def E(sid, off=0.0):
    return VO[sid]['end'] + round(off * FPS)


def W(sid, word, off=0.0):
    """Approximate onset of `word` inside a segment (character-proportional)."""
    text = VO[sid]['text']
    i = text.lower().find(word.lower())
    frac = max(0, i) / max(1, len(text))
    return VO[sid]['start'] + round(frac * (VO[sid]['end'] - VO[sid]['start']) + off * FPS)


def keys(start, n, step=2.0, accel=0.0):
    out, f, s = [], float(start), step
    for _ in range(n):
        out.append(round(f))
        f += s
        s += accel
    return out


def fit(start, end, n):
    """n key frames evenly spread across [start, end]."""
    if n <= 1:
        return [round(start)]
    return [round(start + (end - start) * i / (n - 1)) for i in range(n)]


C = {}

# ── 1 · HOOK ─────────────────────────────────────────────────────────────────
HOOK_PROMPT = 'Build a website for a local business'
C['HOOK_PROMPT'] = HOOK_PROMPT
C['PROMPT_IN'] = 2
C['HOOK_KEYS'] = fit(12, S('v_build') - 10, len(HOOK_PROMPT))
C['HOOK_SEND'] = S('v_build') - 4
C['HOOK_SITE_STEPS'] = keys(C['HOOK_SEND'] + 8, 7, 9)  # grid, nav, hero, type, images, sections, CTA
C['HOOK_SITE_LOCK'] = max(C['HOOK_SITE_STEPS'][-1] + 10, E('v_build', -0.1))
FIND_PROMPT = 'Find someone worth selling it to'
C['FIND_PROMPT'] = FIND_PROMPT
C['FIND_IN'] = S('v_find', -0.32)
C['FIND_KEYS'] = keys(S('v_find', -0.05), len(FIND_PROMPT), 2.0, 0.11)
C['STALL'] = C['FIND_KEYS'][-1] + 2
C['NIGHT_IN'] = S('v_night', -0.05)
C['NIGHT_END'] = E('v_night', 0.1)

# ── 2 · MANUAL PROSPECTING ───────────────────────────────────────────────────
C['MAN_IN'] = S('v_maps', -0.22)
MAN_LINES = ['v_maps', 'v_reviews', 'v_site', 'v_insta', 'v_owner', 'v_email', 'v_worth']
C['MAN_BEATS'] = [S(s, -0.05) for s in MAN_LINES]
# windows open on the beats; each beat opens more than one as the hunt gets messier: 2,4,5,7,9,11,12+
C['WIN_OPEN'] = [
    C['MAN_BEATS'][0], C['MAN_BEATS'][0] + 9,
    C['MAN_BEATS'][1], C['MAN_BEATS'][1] + 8,
    C['MAN_BEATS'][2],
    C['MAN_BEATS'][3], C['MAN_BEATS'][3] + 7,
    C['MAN_BEATS'][4], C['MAN_BEATS'][4] + 7,
    C['MAN_BEATS'][5], C['MAN_BEATS'][5] + 6,
    C['MAN_BEATS'][6],
]
C['WORTH_FLICKS'] = keys(S('v_worth', 0.15), 12, 9, -0.55)
C['FREEZE_ZERO'] = S('v_zero', -0.30)
C['ZERO_IN'] = S('v_zero', -0.12)
C['ZERO_OUT'] = S('v_thing', -0.10)

# ── 3 · INSIGHT ──────────────────────────────────────────────────────────────
C['CARDS_IN'] = S('v_thing', 0.25)
C['QUESTION_IN'] = E('v_thing', 0.05)
C['INS_CURSOR_IN'] = E('v_thing', 0.30)
C['INS_HOVER_A'] = E('v_thing', 0.62)
C['INS_HOVER_B'] = E('v_thing', 1.05)
C['PICK_B'] = S('v_nowebsite', -0.12)
C['A_DIM'] = W('v_nowebsite', "doesn't")
C['B_CENTER'] = S('v_better', -0.05)
C['DEMAND_IN'] = S('v_demand', -0.04)
C['DEMAND_SIGNALS'] = W('v_demand', 'customers', -0.05)
C['PROBLEM_IN'] = S('v_holding', -0.02)
C['PROBLEM_SIGNALS'] = W('v_holding', 'holding', -0.05)

# ── 4 · SCALE ────────────────────────────────────────────────────────────────
C['GREAT_IN'] = S('v_great', -0.02)
C['FIFTY_IN'] = S('v_fifty', -0.06)
C['FIFTY_FILL'] = keys(S('v_fifty', 0.15), 50, 0.9, 0.0)
C['TIME_IN'] = S('v_time', -0.05)
C['NOISE_PEAK'] = E('v_time', 0.05)
C['FREEZE'] = E('v_time', 0.18)

# ── 5 · REVEAL ───────────────────────────────────────────────────────────────
C['SIGNAL_IN'] = C['FREEZE'] + 16
C['SIGNAL_SWEEP_END'] = C['SIGNAL_IN'] + 46
C['SURVIVOR_PUSH'] = C['SIGNAL_SWEEP_END'] - 6
C['SCAN'] = S('v_built', -0.62)
C['LOCK'] = S('v_built', -0.22)
C['LOGO_RESOLVE'] = S('v_built', -0.05)
C['WORDMARK_IN'] = W('v_built', 'Prospectify', -0.05)
C['LOGO_TO_HEADER'] = E('v_built', 0.20)

# ── 6 · SEARCH + WHY ─────────────────────────────────────────────────────────
C['SEARCH_IN'] = C['LOGO_TO_HEADER'] - 2
CITY = 'Austin, TX'
C['CITY'] = CITY
C['CITY_KEYS'] = keys(C['SEARCH_IN'] + 14, len(CITY), 1.6)
C['NICHE_PICK'] = C['CITY_KEYS'][-1] + 8
C['SEARCH_HOVER'] = S('v_finds', -0.42)
C['SEARCH_CLICK'] = S('v_finds', -0.16)
C['RESULTS_SIGNAL'] = C['SEARCH_CLICK'] + 3
C['RESULT_CARDS'] = keys(C['SEARCH_CLICK'] + 20, 5, 6)
C['RESULTS_SORT'] = C['RESULT_CARDS'][-1] + 14
C['LEAD_HOVER'] = S('v_why', -0.40)
C['LEAD_SELECT'] = S('v_why', -0.12)
C['WHY_IN'] = S('v_why', 0.12)
C['WHY_REASONS'] = keys(S('v_why', 0.30), 3, 9)
C['WHY_READY'] = E('v_why', 0.25)

# ── 7 · DOSSIER: CONTACT / ANGLE / OUTREACH ──────────────────────────────────
C['DOSSIER_IN'] = S('v_contact', -0.62)
C['CONTACT_SIGNAL'] = S('v_contact', -0.18)
C['CONTACT_READY'] = S('v_contact', 0.42)
C['ANGLE_SIGNAL'] = S('v_angle', -0.12)
C['ANGLE_READY'] = S('v_angle', 0.40)
C['OUTREACH_SIGNAL'] = S('v_outreach', -0.12)
C['OUTREACH_ASSEMBLE'] = [S('v_outreach', 0.12), S('v_ready', -0.55)]
C['COPY_HOVER'] = S('v_ready', -0.48)
C['COPY_CLICK'] = S('v_ready', -0.26)
C['COPIED'] = C['COPY_CLICK'] + 4
C['OUTREACH_READY'] = S('v_ready', -0.02)

# ── 8 · BUILD PROMPT ─────────────────────────────────────────────────────────
C['PROMPT_FOCUS'] = E('v_ready', 0.25)
C['PROMPT_HOVER'] = S('v_prompt', -0.42)
C['PROMPT_CLICK'] = S('v_prompt', -0.14)
C['PROMPT_EXPAND'] = C['PROMPT_CLICK'] + 4
C['PROMPT_LABELS'] = fit(S('v_prompt', 0.55), E('v_exact', -0.55), 11)
C['PROMPT_ORGANIZE'] = E('v_exact', -0.40)
C['PROMPT_READY'] = E('v_exact', 0.10)

# ── 9 · BUILDER CHOICE ───────────────────────────────────────────────────────
C['BUILDER_IN'] = S('v_anywhere', -0.62)
C['BUILDER_TILES'] = keys(S('v_anywhere', -0.30), 4, 5)
C['BUILDER_HOVERS'] = [E('v_anywhere', -0.30), E('v_anywhere', 0.05), E('v_anywhere', 0.38)]
C['BUILDER_CLICK'] = S('v_paste', -0.62)

# ── 10 · TRANSFER → WEBSITE → PITCH ──────────────────────────────────────────
C['TRANSFER_START'] = S('v_paste', -0.40)
C['TRANSFER_ARRIVE'] = S('v_paste', 0.05)
C['WEB_STEPS'] = keys(S('v_buildw', -0.22), 8, 10)  # grid, header, hero, CTA, services, imagery, reviews, booking
C['WEB_MOBILE'] = C['WEB_STEPS'][-1] + 14
C['WEB_LOCK'] = S('v_pitch', -0.32)
C['PITCH_IN'] = S('v_pitch', -0.06)
C['PITCH_SENT'] = E('v_pitch', 0.25)

# ── 11 · SELL + TRACK ────────────────────────────────────────────────────────
C['SELL_IN'] = S('v_close', -0.55)
C['SELL_STATUS'] = keys(S('v_close', -0.30), 3, 14)  # Contacted → Interested → Signed
C['MARK_HOVER'] = E('v_close', -0.10)
C['MARK_CLICK'] = E('v_close', 0.12)
C['MODAL_IN'] = C['MARK_CLICK'] + 4
C['AMOUNT_KEYS'] = keys(C['MODAL_IN'] + 14, 3, 4)
C['CONFIRM_CLICK'] = S('v_track', -0.30)
C['SOLD'] = S('v_track', -0.12)
C['TRACK_IN'] = W('v_track', 'actually', -0.15)
C['TRACK_TILES'] = keys(C['TRACK_IN'] + 6, 4, 6)

# ── 12 · LOOP + CTA ──────────────────────────────────────────────────────────
C['LOOP_IN'] = E('v_track', 0.30)
C['LOOP_NODES'] = keys(C['LOOP_IN'] + 8, 6, 12)
C['LOOP_CLOSE'] = C['LOOP_NODES'][-1] + 18
C['LOOP_REPEAT'] = C['LOOP_CLOSE'] + 6
C['LOOP_OUT'] = S('v_youbuild', -0.30)
C['FINAL_LOGO'] = S('v_youbuild', -0.20)
C['LINE1'] = S('v_youbuild', -0.04)
C['LINE2'] = S('v_wefind', -0.04)
C['FINDS_ACCENT'] = W('v_wefind', 'finds', -0.02)
C['CTA'] = S('v_start', -0.06)
C['CTA_SUB'] = C['CTA'] + 14
C['URL'] = C['CTA'] + 24

for k, v in C.items():
    if isinstance(v, int):
        assert 0 <= v <= END, (k, v, END)

out = {'fps': FPS, 'durationInFrames': END, 'width': 1080, 'height': 1920, 'VO': VO, **C}
json.dump(out, open(os.path.join(ROOT, 'src/final/timeline.json'), 'w'), indent=1)
print('duration', END, 'frames =', round(END / FPS, 2), 's')
for sid, v in VO.items():
    print(f"{sid:12s} {v['start']:5d}–{v['end']:5d}  {v['text']}")
