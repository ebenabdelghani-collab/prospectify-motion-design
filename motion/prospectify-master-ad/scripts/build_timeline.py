#!/usr/bin/env python3
"""
Edit decision list: lays the real voiceover out on the timeline, then derives EVERY visual and
audio cue from where the words actually land.  Output: src/constants/timeline.json (frames @ 60fps).

Visuals (Remotion) and audio (build_audio.py) both read that file — one timing system.
"""
import json
import os

from voice_script import SEGMENTS, TAIL_SECONDS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 60
voice = json.load(open(os.path.join(ROOT, 'src/constants/voice.json')))

# ── 1. Place the voice ────────────────────────────────────────────────────────
VO = {}
t = 0.0
for sid, text, gap, _ in SEGMENTS:
    t += gap
    dur = voice[sid]['seconds']
    VO[sid] = {'start': round(t * FPS), 'end': round((t + dur) * FPS), 'text': text}
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


def keys(start, n, step=2.0, decel=0.0):
    out, f, s = [], float(start), step
    for _ in range(n):
        out.append(round(f))
        f += s
        s += decel
    return out


C = {}

# ── ACT 1 — HOOK ─────────────────────────────────────────────────────────────
BUILD_TEXT = 'Build a site for a plumber'
C['BUILD_PREFILL'] = 7
C['BUILD_KEYS'] = keys(2, len(BUILD_TEXT) - 7, 1.6)
C['BUILD_ENTER'] = C['BUILD_KEYS'][-1] + 5
C['SITE_STEPS'] = [C['BUILD_ENTER'] + 6 + i * 7 for i in range(5)]
C['SITE_DONE'] = max(C['SITE_STEPS'][-1] + 9, E('v_build', -0.25))
C['HOOK_CLEAR'] = S('v_find', -0.30)
FIND_TEXT = 'Find someone to buy it'
C['FIND_KEYS'] = keys(S('v_find', -0.12), len(FIND_TEXT), 1.6, 0.17)
C['STALL'] = C['FIND_KEYS'][-1]
C['CLOCK_IN'] = S('v_night', -0.10)
C['CLOCK_ROLL_END'] = E('v_night', 0.05)

# ── ACT 2 — PAIN ─────────────────────────────────────────────────────────────
C['PAIN_START'] = S('v_maps', -0.18)
C['PAIN_CUTS'] = [S('v_maps'), S('v_reviews'), S('v_site'), S('v_insta'), S('v_email')]
C['WORTH_START'] = S('v_worth')
C['WORTH_FLICKS'] = keys(S('v_worth', 0.1), 10, 6, -0.25)
C['ZERO_IN'] = S('v_zero', -0.05)
C['ZERO_LOCK'] = W('v_zero', 'single')
C['PAIN_END'] = E('v_zero', 0.35)

# ── ACT 3 — INSIGHT ──────────────────────────────────────────────────────────
C['INSIGHT_Q'] = C['PAIN_END'] + 4
C['CARD_A_IN'] = C['INSIGHT_Q'] + 10
C['CARD_B_IN'] = C['INSIGHT_Q'] + 16
C['PICK_HOVER'] = S('v_nowebsite', -0.50)
C['PICK_B'] = S('v_nowebsite', -0.22)
C['NOWEB_LINE'] = S('v_nowebsite')
C['DEMAND_LINE'] = S('v_demand')
C['DEMAND_SIGNALS'] = W('v_demand', 'real customers')
C['WEBPROBLEM_SIGNALS'] = W('v_demand', 'website holding')
C['INSIGHT_END'] = E('v_demand', 0.30)

# ── ACT 4 — SCALE ────────────────────────────────────────────────────────────
C['FIFTY_IN'] = S('v_fifty', -0.10)
C['FIFTY_FILL'] = [C['FIFTY_IN'] + 6 + round(i * 0.7) for i in range(50)]
C['TIME_LINE'] = S('v_time')
C['TIME_FLICKS'] = keys(S('v_time'), 10, 7, -0.4)
C['SCALE_COLLAPSE'] = E('v_time', 0.05)
C['BLACK'] = C['SCALE_COLLAPSE'] + 12

# ── ACT 5 — REVEAL ───────────────────────────────────────────────────────────
C['REVEAL'] = S('v_built', -0.62)
C['REVEAL_LINE'] = S('v_built', 0.15)
C['LOGO_TO_HEADER'] = E('v_built', 0.10)

# ── ACT 6 — SEARCH → RESULTS → WHY ───────────────────────────────────────────
C['SEARCH_IN'] = C['LOGO_TO_HEADER'] + 6
C['PICK_HEADLINE'] = S('v_pick')
C['CITY_KEYS'] = keys(W('v_pick', 'city', -0.05), len('Austin, TX'), 1.6)
C['NICHE_KEYS'] = keys(W('v_pick', 'niche', -0.05), len('Plumbers'), 1.6)
C['SEARCH_HOVER'] = max(C['NICHE_KEYS'][-1] + 2, E('v_pick', -0.05))
C['SEARCH_CLICK'] = C['SEARCH_HOVER'] + 6
C['RESULTS'] = C['SEARCH_CLICK'] + 14
C['RESULT_CARDS'] = [C['RESULTS'] + i * 5 for i in range(5)]
C['FINDS_HEADLINE'] = S('v_finds')
C['SIGNAL_PULSE'] = W('v_finds', 'worth')
C['LEAD_HOVER'] = E('v_finds', 0.05)
C['LEAD_SELECTED'] = S('v_why', -0.18)
C['FILE_OPEN'] = C['LEAD_SELECTED'] + 26
C['WHY_READY'] = W('v_why', 'why', 0.02)

# ── ACT 7 — EVERYTHING READY ─────────────────────────────────────────────────
C['NEXT_HEADLINE'] = S('v_next')
C['CONTACT_READY'] = S('v_contact')
C['ANGLE_READY'] = S('v_angle')
C['OUTREACH_TYPE'] = [S('v_message'), E('v_message', 0.15)]
C['OUTREACH_READY'] = E('v_message', 0.2)
C['COPY_HOVER'] = C['OUTREACH_READY'] + 6
C['COPY_CLICK'] = C['OUTREACH_READY'] + 13
C['COPY_CONFIRM'] = C['COPY_CLICK'] + 3

# ── ACT 8 — BUILD PROMPT (the big payoff) ────────────────────────────────────
C['PROMPT_HOVER'] = S('v_prompt', -0.42)
C['PROMPT_CLICK'] = S('v_prompt', -0.20)
C['PROMPT_FOLD'] = C['PROMPT_CLICK'] + 4
C['PROMPT_HEADLINE'] = S('v_prompt')
C['EXACT_HEADLINE'] = S('v_exact')
span0, span1 = C['PROMPT_FOLD'] + 22, E('v_exact', -0.10)
C['PROMPT_LINES'] = [round(span0 + i * (span1 - span0) / 7) for i in range(8)]
C['PROMPT_READY'] = E('v_exact', 0.12)

# ── ACT 9 — YOUR PROMPT, YOUR BUILDER ────────────────────────────────────────
C['PROMPT_COMPRESS'] = S('v_paste', -0.38)
C['BUILDER_HEADLINE'] = S('v_paste', -0.30)
C['BUILDER_LOGOS'] = [S('v_paste', -0.20) + i * 5 for i in range(4)]
C['BUILDER_CURSOR'] = W('v_paste', 'whatever', -0.10)
C['BUILDER_HOVERS'] = [C['BUILDER_CURSOR'] + 6, C['BUILDER_CURSOR'] + 13, C['BUILDER_CURSOR'] + 20]
C['BUILDER_SELECTED'] = max(C['BUILDER_HOVERS'][-1] + 9, E('v_paste', 0.05))
C['BUILDER_INDEX'] = 0
C['PROMPT_SEND'] = C['BUILDER_SELECTED'] + 5
C['PROMPT_ARRIVE'] = C['PROMPT_SEND'] + 15

# ── ACT 10 — BUILD / PITCH ───────────────────────────────────────────────────
C['BUILD_START'] = C['PROMPT_ARRIVE']
C['BUILDIT_HEADLINE'] = S('v_buildit')
b0 = max(C['BUILD_START'] + 12, S('v_buildit', -0.15))
C['BUILD_STEPS'] = [b0 + i * 7 for i in range(5)]
C['SITE_READY'] = C['BUILD_STEPS'][-1] + 9
C['PITCH_IN'] = S('v_pitchit', -0.30)
C['PITCHIT_HEADLINE'] = S('v_pitchit')
C['PITCH_COPY'] = E('v_pitchit', 0.15)
C['PITCH_CONFIRM'] = C['PITCH_COPY'] + 3

# ── ACT 11 — SELL ────────────────────────────────────────────────────────────
C['SELL_IN'] = S('v_sells', -0.30)
C['SELL_HEADLINE'] = S('v_sells')
C['MARK_SOLD_CLICK'] = W('v_sells', 'sells', 0.05)
C['SOLD_DIALOG'] = C['MARK_SOLD_CLICK'] + 4
C['AMOUNT_KEYS'] = keys(C['SOLD_DIALOG'] + 10, len('1500'), 2.2)
C['SAVE_CLICK'] = E('v_sells', 0.05)
C['SOLD'] = C['SAVE_CLICK'] + 3

# ── ACT 12 — TRACK ───────────────────────────────────────────────────────────
C['TRACK_IN'] = S('v_working', -0.25)
C['TRACK_HEADLINE'] = S('v_working')
C['TRACK_TILES'] = [S('v_working', 0.05) + i * 6 for i in range(3)]
C['TRACK_ROW'] = C['TRACK_TILES'][-1] + 8
C['TRACK_END'] = E('v_working', 0.40)

# ── ACT 13 — LOOP ────────────────────────────────────────────────────────────
C['LOOP_IN'] = S('v_l_find', -0.12)
C['LOOP_WORDS'] = [S('v_l_find'), S('v_l_pitch'), S('v_l_build'), S('v_l_sell')]
C['LOOP_REPEAT'] = S('v_l_repeat')
C['LOOP_OUT'] = E('v_l_repeat', 0.30)

# ── ACT 14 — FINAL ───────────────────────────────────────────────────────────
C['FINAL_BRAND'] = S('v_youbuild', -0.60)
C['FINAL_LINE_1'] = S('v_youbuild')
C['FINAL_LINE_2'] = S('v_wefind')
C['FINAL_CTA'] = S('v_start', -0.32)
C['FINAL_URL'] = C['FINAL_CTA'] + 10
C['END'] = END

out = {
    '_doc': 'GENERATED by scripts/build_timeline.py from the real voiceover. Frames @ 60fps. Do not edit by hand.',
    'fps': FPS,
    'width': 1080,
    'height': 1920,
    'renderScale': 2,
    'durationInFrames': END,
    'VO': VO,
    **C,
}
json.dump(out, open(os.path.join(ROOT, 'src/constants/timeline.json'), 'w'), indent=1)
print(f'duration {END / FPS:.2f}s ({END} frames)')
for sid, v in VO.items():
    print(f"  {v['start'] / FPS:6.2f}s  {sid:12s} {v['text']}")
