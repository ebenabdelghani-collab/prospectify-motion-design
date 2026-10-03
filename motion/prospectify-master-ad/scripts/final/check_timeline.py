#!/usr/bin/env python3
"""Sanity check: every cue in the edit happens in story order (no overlapping beats)."""
import json, os
T = json.load(open(os.path.join(os.path.dirname(__file__), '../../src/final/timeline.json')))
L = lambda k: T[k][-1] if isinstance(T[k], list) else T[k]  # noqa: E731
F = lambda k: T[k][0] if isinstance(T[k], list) else T[k]  # noqa: E731
CHAIN = ['PROMPT_IN','HOOK_SEND','HOOK_SITE_STEPS','HOOK_SITE_LOCK','FIND_IN','FIND_KEYS','STALL','NIGHT_IN','MAN_IN','WIN_OPEN','WORTH_FLICKS','FREEZE_ZERO','ZERO_IN','ZERO_OUT','CARDS_IN','QUESTION_IN','INS_HOVER_A','INS_HOVER_B','PICK_B','A_DIM','B_CENTER','DEMAND_IN','PROBLEM_IN','GREAT_IN','FIFTY_IN','FIFTY_FILL','TIME_IN','NOISE_PEAK','FREEZE','SIGNAL_IN','SIGNAL_SWEEP_END','SCAN','LOCK','LOGO_RESOLVE','WORDMARK_IN','LOGO_TO_HEADER','CITY_KEYS','NICHE_PICK','SEARCH_HOVER','SEARCH_CLICK','RESULT_CARDS','RESULTS_SORT','LEAD_HOVER','LEAD_SELECT','WHY_IN','WHY_REASONS','WHY_READY','DOSSIER_IN','CONTACT_SIGNAL','CONTACT_READY','ANGLE_SIGNAL','ANGLE_READY','OUTREACH_SIGNAL','OUTREACH_ASSEMBLE','COPY_HOVER','COPY_CLICK','OUTREACH_READY','PROMPT_FOCUS','PROMPT_HOVER','PROMPT_CLICK','PROMPT_LABELS','PROMPT_ORGANIZE','PROMPT_READY','BUILDER_IN','BUILDER_TILES','BUILDER_HOVERS','BUILDER_CLICK','TRANSFER_START','TRANSFER_ARRIVE','WEB_STEPS','WEB_MOBILE','WEB_LOCK','PITCH_IN','PITCH_SENT','SELL_IN','SELL_STATUS','MARK_HOVER','MARK_CLICK','MODAL_IN','AMOUNT_KEYS','CONFIRM_CLICK','SOLD','TRACK_IN','TRACK_TILES','LOOP_IN','LOOP_NODES','LOOP_CLOSE','LOOP_REPEAT','LOOP_OUT','FINAL_LOGO','LINE1','LINE2','CTA','URL']
bad = [(a, L(a), b, F(b)) for a, b in zip(CHAIN, CHAIN[1:]) if F(b) < L(a)]
for x in bad:
    print('CONFLICT %s %d > %s %d' % x)
print('ok' if not bad else f'{len(bad)} conflicts', '· duration', T['durationInFrames'])
