#!/usr/bin/env python3
"""
PROSPECTIFY — FINAL FILM · VOICE + SCORE + SOUND SYSTEM (48 kHz)

Reads src/final/timeline.json (built from the real voiceover). Every cue is placed on the same frame as its
visual and logged to motion-source/production/AUDIO_CUE_MAP.json (frame · time · scene · event · sound ·
volume · pan · ducking · notes). Priority: VOICE → MUSIC → SFX, with sidechain ducking under the voice.

Score: 115 BPM, D minor (the world as it is) → F major (Prospectify). It evolves per act:
minimal pulse · drop · growing manual loop · stop · stripped insight · tension · freeze · resolution ·
clean product rhythm · prompt lift · anticipation · build momentum · resolve · minimal CTA.

Outputs: public/final/audio/prospectify-final-mix.wav (24-bit, −14 LUFS integrated, −1 dBTP ceiling)
         public/final/audio/stems/{voice,music,sfx}.wav
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy.ndimage import maximum_filter1d, minimum_filter1d
from scipy.signal import fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from sonic import (  # noqa: E402
    SR, bell_v, click_v, clock_v, db, edges, hat_v, hover_v, hp, hz, kick_v, clap_v, lp, noise, pad, pluck_v,
    pop_v, saw, scan_v, signature, sub_v, sweep_v, tab_v, tick_v, tt, type_v, lock_v,
)

ROOT = os.path.dirname(os.path.dirname(HERE))
REPO = os.path.dirname(os.path.dirname(ROOT))
T = json.load(open(os.path.join(ROOT, 'src/final/timeline.json')))
FPS = T['fps']
DUR = T['durationInFrames']
N = int(round(DUR / FPS * SR)) + SR
BPM = 115
BEAT_F = 60 / BPM * FPS  # frames per beat (31.30)
rng = np.random.default_rng(5)
CUES = []


def fs(fr):
    return int(round(fr / FPS * SR))


class Bus:
    def __init__(self, name):
        self.name = name
        self.buf = np.zeros((2, N))

    def put(self, sig, frame, gain_db, pan=0.0):
        start = fs(frame)
        if sig.ndim == 1:
            th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
            sig = np.vstack([sig * np.cos(th), sig * np.sin(th)]) * np.sqrt(2)
        if start < 0:
            sig, start = sig[:, -start:], 0
        end = min(N, start + sig.shape[1])
        if end > start:
            self.buf[:, start:end] += sig[:, : end - start] * db(gain_db)


voice, music, sfx, verb = Bus('voice'), Bus('music'), Bus('sfx'), Bus('verb')
VO_SPANS = [(v['start'], v['end']) for v in T['VO'].values()]


def under_vo(fr):
    return any(a - 6 <= fr <= b + 6 for a, b in VO_SPANS)


def cue(frame, scene, event, sound, sig, gain, pan=0.0, cat='MEDIUM', notes='', send=None):
    sfx.put(sig, frame, gain, pan)
    if send is not None:
        verb.put(sig, frame, gain + send)
    CUES.append({'frame': int(round(frame)), 'time': round(frame / FPS, 3), 'scene': scene, 'event': event, 'sound': sound, 'category': cat,
                 'volume_db': round(gain, 1), 'pan': round(float(pan), 2), 'ducking': 'sfx −5 dB under VO' if under_vo(frame) else 'none', 'notes': notes})


def sig_cue(frame, scene, event, level, gain):
    s, off = signature(level)
    sfx.put(s, frame - off * FPS, gain)
    verb.put(s, frame - off * FPS, gain - 7)
    CUES.append({'frame': int(frame), 'time': round(frame / FPS, 3), 'scene': scene, 'event': event, 'sound': f'SIGNATURE ({level})', 'category': 'SIGNATURE',
                 'volume_db': gain, 'pan': 0, 'ducking': 'sfx −5 dB under VO' if under_vo(frame) else 'none', 'notes': 'three ascending tones lead in; the lock transient lands exactly on this frame'})


K = lambda k: T[k]  # noqa: E731
VS = lambda k: T['VO'][k]['start']  # noqa: E731

# ─────────────────────────── VOICE (dry, close, consistent) ───────────────────────────
voice_env = np.zeros(N)
for sid, v in T['VO'].items():
    x, sr = sf.read(os.path.join(ROOT, f'public/final/voice/{sid}.wav'))
    x = hp(x, 80)
    x = x + 0.25 * hp(x, 3500)  # presence: consonants survive phone speakers
    rms = np.sqrt(np.mean(x[np.abs(x) > 1e-3] ** 2) + 1e-12)
    x = x / rms * db(-20)
    x = np.tanh(x * 1.5) / 1.5  # gentle glue, no pumping
    voice.put(x, v['start'], 0.0)
    verb.put(x, v['start'], -30)  # barely-there room so it isn't sterile
    s0 = fs(v['start'])
    voice_env[s0:s0 + len(x)] = np.maximum(voice_env[s0:s0 + len(x)], np.abs(x) / np.max(np.abs(x)))

# ─────────────────────────── SFX ───────────────────────────
# 1 · HOOK
cue(K('PROMPT_IN'), 'hook', 'prompt field appears', 'air swell', sweep_v(0.3, 600, 2400, 'bell', 1.2), -34, cat='MACRO')
for k in K('HOOK_KEYS'):
    cue(k, 'hook', 'key', 'type', type_v(), -27 + rng.uniform(-2, 1), rng.uniform(-0.12, 0.12), 'MICRO')
cue(K('HOOK_SEND'), 'hook', 'SEND', 'click', click_v(), -21, cat='MICRO')
cue(K('HOOK_SEND') - 10, 'hook', 'site rises', 'rise sweep', sweep_v(0.2, 400, 4200, 'rise', 1.3), -27, cat='MACRO')
for j, fr in enumerate(K('HOOK_SITE_STEPS')):
    cue(fr, 'hook', f'site region {j + 1}/7', 'construct tick', tick_v([hz(74), hz(77), hz(81), hz(84), hz(86), hz(89), hz(93)][j], 0.016), -27, -0.3 + 0.1 * j, 'MICRO')
cue(K('HOOK_SITE_LOCK'), 'hook', 'site locks', 'short resolve', lock_v([hz(86), hz(93)], 0.18), -24, cat='MEDIUM', notes='very short sonic resolution')
cue(K('FIND_IN') - 6, 'hook', 'site recedes', 'down sweep', sweep_v(0.3, 3000, 300, 'fall', 1.2), -30, cat='MACRO')
for i, k in enumerate(K('FIND_KEYS')):
    cue(k, 'hook', 'key (slowing)', 'type', type_v() * (1 - 0.45 * i / len(K('FIND_KEYS'))), -27, rng.uniform(-0.1, 0.1), 'MICRO')
# STALL: nothing. The caret blinks in silence (deliberate).
for k in range(7):
    cue(K('NIGHT_IN') + 6 + k * 10, 'hook', 'clock advances', 'clock flip', clock_v(), -26 + k * 0.3, 0.1, 'MICRO')

# 2 · MANUAL
for i, o in enumerate(K('WIN_OPEN')):
    cue(o, 'manual', f'window {i + 1} opens', 'tab', tab_v(), -21 + i * 0.25, rng.uniform(-0.5, 0.5), 'MICRO')
    if i in (0, 2, 4, 5, 7, 9, 11):
        cue(o - 8, 'manual', 'window push', 'air', sweep_v(8 / FPS, 500, 5000, 'rise', 1.2), -30, rng.uniform(-0.3, 0.3), 'MACRO')
for i, k in enumerate(K('WORTH_FLICKS')):
    cue(k, 'manual', 'another business flicks past', 'tab', tab_v(), -24 + i * 0.35, rng.uniform(-0.6, 0.6), 'MICRO')
cue(K('WORTH_FLICKS')[0], 'manual', 'acceleration', 'riser', sweep_v((K('FREEZE_ZERO') - K('WORTH_FLICKS')[0]) / FPS, 300, 3200, 'rise', 3), -28, cat='MACRO')
cue(K('FREEZE_ZERO'), 'manual', 'everything stops', 'hard stop thud', sub_v(light=True), -16, cat='MACRO', notes='music cuts to silence on this frame')
cue(K('ZERO_IN'), 'manual', '0 pitches sent', 'low impact', lock_v([hz(38), hz(50)], 0.5), -20, cat='MEDIUM')

# 3 · INSIGHT
cue(K('CARDS_IN'), 'insight', 'cards arrive', 'soft swell', sweep_v(0.3, 500, 2600, 'bell'), -33, cat='MACRO')
cue(K('INS_HOVER_A'), 'insight', 'hover A', 'hover', hover_v(), -34, -0.2, 'MICRO')
cue(K('INS_HOVER_B'), 'insight', 'hover B', 'hover', hover_v(820, 1100), -34, 0.2, 'MICRO')
cue(K('PICK_B'), 'insight', 'pick B', 'deep click', click_v(deep=True), -19, 0.1, 'MICRO')
cue(K('PICK_B') + 2, 'insight', 'B selected', 'white lock', lock_v([hz(81), hz(88)], 0.2), -27, cat='MEDIUM')
cue(K('DEMAND_IN'), 'insight', 'DEMAND FIRST', 'tonal emphasis', bell_v(hz(74), 1.6, 0.5, 0.9), -24, send=-6, notes='the one tonal accent of the insight')
cue(K('DEMAND_SIGNALS'), 'insight', 'demand signals light', 'ticks', tick_v(hz(86), 0.02), -28, cat='MICRO')
cue(K('PROBLEM_IN'), 'insight', 'website problem second', 'tonal answer', bell_v(hz(69), 1.4, 0.45, 0.8), -27, send=-6)
cue(K('PROBLEM_SIGNALS'), 'insight', 'problem signals light', 'ticks', tick_v(hz(81), 0.02), -28, cat='MICRO')

# 4 · SCALE
cue(K('FIFTY_IN'), 'scale', 'B becomes one of fifty', 'pull-back sweep', sweep_v(0.6, 2600, 400, 'bell', 1.0), -28, cat='MACRO')
for i, fr in enumerate(K('FIFTY_FILL')):
    cue(fr, 'scale', f'node {i + 1}', 'data pop', pop_v(rng.uniform(420, 820), rng.uniform(140, 260)), -33 + rng.uniform(-2, 1), rng.uniform(-0.8, 0.8), 'MICRO')
for j in range(int((K('FREEZE') - K('TIME_IN')) / 7)):
    cue(K('TIME_IN') + j * 7 - j * 0.15 * j, 'scale', 'noise: checks everywhere', 'tick', tick_v(rng.uniform(1500, 5000), 0.006, 0.03), -32 + j * 0.25, rng.uniform(-0.9, 0.9), 'MICRO')
cue(K('TIME_IN'), 'scale', 'time disappears', 'riser', sweep_v((K('FREEZE') - K('TIME_IN')) / FPS, 250, 4000, 'rise', 3), -27, cat='MACRO')
cue(K('FREEZE'), 'reveal', 'FREEZE', 'cut + tail', sub_v(light=True), -22, cat='MACRO', notes='all music stops; the frame holds')

# 5 · REVEAL
cue(K('SIGNAL_IN'), 'reveal', 'signal enters', 'scanning texture', scan_v((K('SIGNAL_SWEEP_END') - K('SIGNAL_IN')) / FPS + 0.2), -27, -0.4, 'SIGNATURE', notes='restrained; pans with the line')
cue(K('SCAN'), 'reveal', 'scan on survivor', 'scan', scan_v(20 / FPS, 1500, 5000), -28, cat='SIGNATURE')
sig_cue(K('LOCK'), 'reveal', 'LOCK → Prospectify resolves', 'strong', -14)
cue(K('LOCK'), 'reveal', 'lock body', 'sub bloom', sub_v(), -17, cat='MACRO')
cue(K('LOGO_TO_HEADER'), 'reveal', 'mark to header', 'air', sweep_v(0.3, 2600, 700, 'bell'), -33, -0.3, 'MACRO')

# 6 · SEARCH
cue(K('SEARCH_IN'), 'search', 'finder rises', 'swell', sweep_v(0.25, 700, 3200, 'bell'), -32, cat='MACRO')
for k in K('CITY_KEYS'):
    cue(k, 'search', 'city key', 'type', type_v(), -28, rng.uniform(-0.1, 0.1), 'MICRO')
cue(K('NICHE_PICK'), 'search', 'industry chip', 'tick', tick_v(hz(88), 0.012), -27, 0.2, 'MICRO')
cue(K('SEARCH_HOVER'), 'search', 'hover Search', 'hover', hover_v(), -34, cat='MICRO')
cue(K('SEARCH_CLICK'), 'search', 'SEARCH', 'click', click_v(), -19, cat='MICRO', notes='one short tactile SFX')
cue(K('RESULTS_SIGNAL'), 'search', 'signal through results', 'scan', scan_v(34 / FPS), -29, cat='SIGNATURE')
for j, fr in enumerate(K('RESULT_CARDS')):
    cue(fr, 'search', f'result {j + 1}', 'result tick', tick_v([hz(89), hz(88), hz(86), hz(84), hz(81)][j], 0.014), -26 - j * 0.6, -0.3 + 0.15 * j, 'MICRO')
cue(K('RESULTS_SORT'), 'search', 'rank by score', 'FLIP sweep', sweep_v(0.3, 900, 3000, 'bell', 1.4), -31, cat='MACRO')
cue(K('LEAD_HOVER'), 'search', 'hover lead', 'hover', hover_v(760, 980), -34, cat='MICRO')
cue(K('LEAD_SELECT'), 'why', 'select lead', 'deep click', click_v(deep=True), -18, cat='MICRO')
cue(K('LEAD_SELECT') + 4, 'why', 'others retreat', 'down sweep', sweep_v(0.35, 2400, 400, 'fall', 1.2), -30, cat='MACRO')
for j, fr in enumerate(K('WHY_REASONS')):
    cue(fr, 'why', f'reason {j + 1}', 'tick', tick_v([hz(84), hz(86), hz(89)][j], 0.018), -26, cat='MICRO')

# 7 · READY sequence
for k, scene in (('CONTACT', 'contact'), ('ANGLE', 'angle'), ('OUTREACH', 'outreach')):
    cue(K(f'{k}_SIGNAL'), scene, 'signal travels down the rail', 'short scan', scan_v(16 / FPS, 1200, 3800), -31, -0.3, 'SIGNATURE')
cue(K('DOSSIER_IN'), 'contact', 'dossier forms', 'swell', sweep_v(0.3, 600, 2600, 'bell'), -32, cat='MACRO')
sig_cue(K('CONTACT_READY'), 'contact', 'CONTACT → READY', 'partial', -23)
sig_cue(K('ANGLE_READY'), 'angle', 'ANGLE → READY', 'partial', -22)
oa, ob = K('OUTREACH_ASSEMBLE')
for fr in range(oa, ob, 3):
    cue(fr, 'outreach', 'signal fragments → words', 'data tick', tick_v(rng.uniform(2400, 4200), 0.004, 0.03), -36, rng.uniform(-0.3, 0.3), 'MICRO')
cue(K('COPY_HOVER'), 'outreach', 'hover Copy', 'hover', hover_v(), -34, cat='MICRO')
cue(K('COPY_CLICK'), 'outreach', 'COPY', 'click', click_v(), -19, cat='MICRO')
cue(K('COPIED'), 'outreach', 'copied', 'confirm', tick_v(hz(93), 0.03), -24, cat='MEDIUM')
sig_cue(K('OUTREACH_READY'), 'outreach', 'OUTREACH → READY (“Ready.”)', 'partial', -20)

# 8 · BUILD PROMPT
cue(K('PROMPT_HOVER'), 'prompt', 'hover Generate', 'hover', hover_v(700, 1000), -33, cat='MICRO')
cue(K('PROMPT_CLICK'), 'prompt', 'GENERATE THE AI PROMPT', 'deep click', click_v(deep=True), -17, cat='MICRO')
cue(K('PROMPT_EXPAND'), 'prompt', 'module expands to hero', 'expand', sweep_v(0.5, 400, 3000, 'fall', 1.1), -27, cat='MACRO')
for j, fr in enumerate(K('PROMPT_LABELS')):
    cue(fr, 'prompt', f'business signal {j + 1}/11 flows in', 'label tick', tick_v(hz(77 + [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17][j]), 0.012), -27, -0.4 + 0.08 * j, 'MICRO')
cue(K('PROMPT_ORGANIZE'), 'prompt', 'structure organises', 'fold', sweep_v(0.3, 3000, 600, 'rise', 1.3), -30, cat='MACRO')
sig_cue(K('PROMPT_READY'), 'prompt', 'BUILD PROMPT → READY', 'full', -16)
cue(K('PROMPT_READY'), 'prompt', 'ready bloom', 'sub', sub_v(light=True), -22, cat='MACRO', notes='then a 300 ms pause')

# 9 · BUILDER
cue(K('BUILDER_IN'), 'builder', 'prompt becomes an object', 'compress', sweep_v(0.35, 2600, 700, 'bell'), -30, cat='MACRO')
for j, fr in enumerate(K('BUILDER_TILES')):
    cue(fr, 'builder', f'builder tile {j + 1}', 'tick', tick_v([hz(81), hz(84), hz(86), hz(89)][j], 0.02), -28, -0.4 + 0.27 * j, 'MICRO')
for j, fr in enumerate(K('BUILDER_HOVERS')):
    cue(fr, 'builder', f'hover {j + 1}', 'hover', hover_v(900 - j * 50, 1150 - j * 50), -33, [0.4, -0.4, -0.4][j], 'MICRO')
cue(K('BUILDER_CLICK'), 'builder', 'choose builder', 'exact tactile click', click_v(), -18, -0.3, 'MICRO')
cue(K('BUILDER_CLICK') + 1, 'builder', 'choice locks', 'lock', lock_v([hz(84), hz(89)], 0.16), -27, -0.3)

# 10 · TRANSFER → BUILD → PITCH
cue(K('TRANSFER_START'), 'transfer', 'prompt compresses', 'compress', sweep_v(12 / FPS, 3000, 500, 'rise'), -27, cat='MACRO')
tr = sweep_v((K('TRANSFER_ARRIVE') - K('TRANSFER_START') - 8) / FPS, 500, 5200, 'rise', 1.3)
pp = np.linspace(0.05, -0.5, len(tr))  # directional: follows the path down-left
cue(K('TRANSFER_START') + 8, 'transfer', 'prompt travels along the signal', 'directional sweep', np.vstack([tr * np.cos((pp + 1) * np.pi / 4), tr * np.sin((pp + 1) * np.pi / 4)]) * np.sqrt(2), -22, cat='MACRO')
cue(K('TRANSFER_ARRIVE'), 'transfer', 'enters the builder', 'arrival', sub_v(light=True), -20, -0.3, 'MACRO')
cue(VS('v_paste') - 2, 'build', 'PASTE', 'paste click', click_v(), -21, cat='MICRO')
cue(K('WEB_STEPS')[0] - 8, 'build', 'enter', 'send click', click_v(deep=True), -20, cat='MICRO')
for j, fr in enumerate(K('WEB_STEPS')):
    cue(fr, 'build', f'prompt section → region {j + 1}/8', 'construct', tick_v([hz(74), hz(77), hz(79), hz(81), hz(84), hz(86), hz(89), hz(91)][j], 0.02), -24, -0.35 + 0.1 * j, 'MEDIUM')
    cue(fr, 'build', 'region seats', 'micro click', click_v()[: int(0.03 * SR)], -30, cat='MICRO')
cue(K('WEB_MOBILE'), 'build', 'responsive state', 'slide', sweep_v(0.3, 700, 2800, 'bell', 1.2), -29, 0.5, 'MACRO')
cue(K('WEB_LOCK'), 'build', 'website complete', 'site lock', lock_v([hz(77), hz(84), hz(89)], 0.3), -18, cat='MACRO')
cue(K('PITCH_IN'), 'pitch', 'site → link preview', 'compress', sweep_v(0.4, 2800, 500, 'bell'), -28, cat='MACRO')
cue(K('PITCH_SENT'), 'pitch', 'sent', 'send whoosh tick', tick_v(hz(93), 0.03), -24, 0.4, 'MEDIUM')

# 11 · SELL + 12 · TRACK
cue(K('SELL_IN'), 'sell', 'pipeline', 'swell', sweep_v(0.25, 500, 2600, 'bell'), -32, cat='MACRO')
for j, fr in enumerate(K('SELL_STATUS')):
    cue(fr, 'sell', ['Contacted', 'Interested', 'Signed'][j], 'status tick', tick_v([hz(81), hz(84), hz(86)][j], 0.016), -26, cat='MICRO')
cue(K('MARK_CLICK'), 'sell', 'MARK AS SOLD', 'click', click_v(), -19, cat='MICRO')
cue(K('MODAL_IN'), 'sell', 'Record a sale', 'sheet up', sweep_v(0.22, 700, 2500, 'bell'), -31, cat='MACRO')
for k in K('AMOUNT_KEYS'):
    cue(k, 'sell', 'sale price key', 'type', type_v(), -27, cat='MICRO')
cue(K('CONFIRM_CLICK'), 'sell', 'confirm', 'click', click_v(deep=True), -18, cat='MICRO')
sig_cue(K('SOLD'), 'sell', 'SOLD', 'partial', -19)
for j, n_ in enumerate((hz(65), hz(69), hz(72), hz(77))):
    cue(K('SOLD') + 2 + j * 2, 'sell', 'sold chime', 'bell', bell_v(n_, 1.4, 0.45, 0.8), -25 - j, -0.2 + 0.13 * j, 'MEDIUM', send=-8)
cue(K('TRACK_IN'), 'track', 'analytics', 'swell', sweep_v(0.25, 500, 3000, 'bell'), -31, cat='MACRO')
for j, fr in enumerate(K('TRACK_TILES')):
    for q in range(3):
        cue(fr + q * 3, 'track', f'tile {j + 1} counts', 'data tick', tick_v(2600 + q * 300 + j * 200, 0.004, 0.03), -33, cat='MICRO')

# 13 · LOOP · 14 · CTA
for j, fr in enumerate(K('LOOP_NODES')):
    cue(fr, 'loop', ['FIND', 'UNDERSTAND', 'CONTACT', 'BUILD', 'SELL', 'TRACK'][j], 'node tone', tick_v(hz([77, 81, 84, 86, 89, 93][j]), 0.03), -23, -0.5 + 0.2 * j, 'MEDIUM')
cue(K('LOOP_REPEAT'), 'loop', 'REPEAT', 'wide swell', sweep_v(0.6, 300, 4000, 'bell', 2), -27, cat='MACRO')
cue(K('LOOP_OUT'), 'loop', 'loop contracts', 'inhale', sweep_v(0.37, 3500, 300, 'rise'), -28, cat='MACRO')
sig_cue(K('FINAL_LOGO') + 14, 'cta', 'final mark', 'full', -17)
cue(K('CTA'), 'cta', 'START FREE', 'soft button', click_v(), -24, cat='MICRO')
cue(K('URL'), 'cta', 'url', 'tick', tick_v(hz(89), 0.012), -31, cat='MICRO')

# ─────────────────────────── SCORE ───────────────────────────
# chords (MIDI)
Dm9 = [50, 57, 60, 64, 65]
Bbmaj9 = [46, 53, 57, 60, 62]
Gm9 = [43, 50, 53, 57, 58]
Asus = [45, 52, 57, 59, 62]
Fadd9 = [41, 53, 57, 60, 67]
C_E = [40, 52, 55, 60, 62]
Dm7 = [38, 50, 57, 60, 65]
Bbadd9 = [46, 53, 58, 60, 62]
Csus = [48, 55, 60, 62, 65]
CROOT = {id(Dm9): 38, id(Bbmaj9): 34, id(Gm9): 31, id(Asus): 33, id(Fadd9): 29, id(C_E): 28, id(Dm7): 38, id(Bbadd9): 34, id(Csus): 36}
MU = {'pad': -30, 'kick': -21, 'clap': -28, 'hat': -36, 'bass': -26, 'pluck': -31, 'arp': -31, 'ost': -32, 'riser': -29, 'drone': -27, 'perc': -33}


def grid(fr):
    """snap a frame to the nearest beat of the 115 BPM grid"""
    return round(fr / BEAT_F) * BEAT_F


def beats(a, b, step=1.0):
    fr = grid(a)
    if fr < a - 1:
        fr += BEAT_F * step
    while fr < b - 1:
        yield fr
        fr += BEAT_F * step


def pad_span(a, b, notes, gain, cut=1400, att=0.3, rel=0.5):
    if b <= a:
        return
    p = pad(notes, (b - a) / FPS + rel, cut, att, rel)
    music.put(p, a, gain)
    verb.put(p, a, gain - 8)


def bass(a, b, root, gain=0.0, step=0.5):
    for k, fr in enumerate(beats(a, b, step)):
        music.put(pluck_v(hz(root), 0.26, 0.1, 360) * (1.0 if k % 2 == 0 else 0.7), fr, MU['bass'] + gain)


def drums(a, b, kick=1, hats=0, clap=False, gain=0.0, perc=False):
    for i, fr in enumerate(beats(a, b)):
        if kick == 1 or (kick == 2 and i % 2 == 0):
            music.put(kick_v(), fr, MU['kick'] + gain)
        if clap and i % 2 == 1:
            music.put(clap_v(), fr, MU['clap'] + gain, 0.05)
            verb.put(clap_v(), fr, MU['clap'] - 10)
        if hats >= 1:
            music.put(hat_v(), fr + BEAT_F / 2, MU['hat'] + gain, 0.25)
        if hats >= 2:
            music.put(hat_v(), fr + BEAT_F / 4, MU['hat'] - 5 + gain, -0.2)
            music.put(hat_v(), fr + 3 * BEAT_F / 4, MU['hat'] - 5 + gain, -0.2)
        if perc and i % 4 == 3:
            music.put(tick_v(1200, 0.01, 0.04), fr + 3 * BEAT_F / 4, MU['perc'] + gain, 0.4)


def ostinato(a, b, notes, step=0.25, gain=0.0, rise=0.0):
    n = max(1, int((b - a) / (BEAT_F * step)))
    for k, fr in enumerate(beats(a, b, step)):
        music.put(pluck_v(hz(notes[k % len(notes)]), 0.18, 0.05, 1600 + 2600 * (k / n) * rise), fr, MU['ost'] + gain + rise * 5 * k / n, 0.25 * (-1) ** k)


def progression(a, b, chords, bars=1.0, gain=0.0, cut=1500, with_bass=True, bgain=0.0):
    span = BEAT_F * 4 * bars
    i, fr = 0, a
    while fr < b - 1:
        c = chords[i % len(chords)]
        e = min(b, fr + span)
        pad_span(fr, e, c, MU['pad'] + gain, cut)
        if with_bass:
            bass(fr, e, CROOT[id(c)], bgain)
        fr, i = e, i + 1


# OPENING — minimal pulse, a little momentum while the site builds; drops at FIND
pad_span(0, K('FIND_IN'), Dm9, MU['pad'] - 5, 1000, 0.6)
for k, fr in enumerate(beats(K('PROMPT_IN') + 10, K('FIND_IN') - 4, 0.5)):
    music.put(pluck_v(hz([62, 69, 65, 72, 69, 64][k % 6]), 0.45, 0.16, 2400), fr, MU['pluck'] - 3, 0.3 * (-1) ** k)
for fr in beats(K('HOOK_SEND'), K('FIND_IN') - 4):
    music.put(kick_v(0.6), fr, MU['kick'] - 7)
drums(K('HOOK_SEND'), K('FIND_IN') - 4, kick=0, hats=1, gain=-3)
# FIND → STALL → NIGHT: the music almost disappears (a low, quiet drone only)
dr = (K('MAN_IN') - K('FIND_IN')) / FPS
music.put(lp(saw(hz(26), tt(dr), 6), 160) * np.minimum(1, tt(dr) / 0.8) * np.clip((dr - tt(dr)) / 0.3, 0, 1), K('FIND_IN'), MU['drone'] - 13)

# MANUAL — a repetitive percussive loop that keeps adding layers, then a hard stop
M0, M1 = K('MAN_IN'), K('FREEZE_ZERO')
mid = K('MAN_BEATS')[3]
ostinato(M0, M1, [50, 50, 53, 50, 57, 50, 55, 53], 0.25, -2, rise=1.0)
drums(M0, mid, kick=2, hats=1, gain=-2)
drums(mid, K('WORTH_FLICKS')[0], kick=1, hats=1, gain=-1, perc=True)
drums(K('WORTH_FLICKS')[0], M1, kick=1, hats=2, clap=True, gain=0, perc=True)
bass(M0, M1, 38, -2, 0.5)

# INSIGHT — stripped back; the "demand first" chord brightens slightly
progression(K('CARDS_IN'), K('DEMAND_IN'), [Dm9, Bbmaj9], 2, -3, 900, with_bass=False)
progression(K('DEMAND_IN'), K('GREAT_IN'), [Bbmaj9, Gm9], 2, -1, 1500, with_bass=True, bgain=-7)

# SCALE — tension returns, then the freeze cuts everything
ostinato(K('FIFTY_IN'), K('FREEZE'), [50, 53, 57, 53, 60, 57, 53, 57], 0.25, 0, rise=1.0)
drums(K('FIFTY_IN'), K('FREEZE'), kick=1, hats=2, gain=-1, perc=True)
bass(K('FIFTY_IN'), K('FREEZE'), 38, -1, 0.25)
pad_span(K('FIFTY_IN'), K('FREEZE'), Asus, MU['pad'] - 2, 1200)

# silences are never digital zero: a faint room tone under the held beats
for a_, b_ in ((K('STALL'), K('NIGHT_IN') + 20), (K('ZERO_IN'), K('CARDS_IN') + 10), (K('FREEZE'), K('LOCK'))):
    d_ = (b_ - a_) / FPS
    rt = lp(hp(noise(d_), 120), 1800) * np.minimum(1, tt(d_) / 0.2) * np.clip((d_ - tt(d_)) / 0.3, 0, 1)
    music.put(np.vstack([rt, np.roll(rt, 211)]), a_, -52)

# REVEAL — structural release into F major (from the lock)
pad_span(K('LOCK'), K('SEARCH_IN') + 40, [29, 41, 53, 57, 60, 67, 72], MU['pad'] + 1, 2200, 0.06, 0.8)

# PRODUCT — cleaner rhythm: F – C/E – Dm7 – Bb
P0 = K('SEARCH_IN')
progression(P0, K('PROMPT_FOCUS'), [Fadd9, C_E, Dm7, Bbadd9], 1.0, -1, 1600)
drums(K('SEARCH_CLICK'), K('PROMPT_FOCUS'), kick=1, hats=1, clap=True, gain=-2)
# READY sequence: syncopated accents land on the off-beat before each READY
for k_ in ('CONTACT_READY', 'ANGLE_READY', 'OUTREACH_READY'):
    music.put(pluck_v(hz(77), 0.35, 0.1, 3200), K(k_) - BEAT_F / 2, MU['pluck'] + 1, 0.2)

# BUILD PROMPT — harmonic lift: Bb → C sus, rising arpeggio, riser into READY
pf, pr = K('PROMPT_FOCUS'), K('PROMPT_READY')
half = (pf + pr) / 2
pad_span(pf, half, Bbadd9, MU['pad'] + 1, 2000)
pad_span(half, pr, Csus, MU['pad'] + 2, 2600)
bass(pf, pr, 34, -4, 1.0)
arp = [65, 69, 72, 74, 77, 81, 84, 86]
for k, fr in enumerate(beats(pf + 10, pr - 2, 0.25)):
    music.put(pluck_v(hz(arp[k % 8] + (12 if k >= 24 else 0)), 0.3, 0.07, 3400), fr, MU['arp'] + min(5, k * 0.12), 0.3 * (-1) ** k)
drums(pf, pr, kick=2, hats=0, gain=-5)
music.put(sweep_v((pr - pf) / FPS, 400, 4500, 'rise', 2.5), pf, MU['riser'])
# (READY → BUILDER: breath — only tails)

# BUILDER — slight anticipation
pad_span(K('BUILDER_IN'), K('TRANSFER_START'), Fadd9, MU['pad'] - 2, 1300, 0.4)
for j, fr in enumerate(beats(K('BUILDER_IN') + 10, K('TRANSFER_START'), 0.5)):
    music.put(pluck_v(hz([72, 69, 67, 65][j % 4]), 0.5, 0.18, 2200), fr, MU['pluck'] - 2, 0.2 * (-1) ** j)
music.put(sweep_v((K('TRANSFER_ARRIVE') - K('BUILDER_CLICK')) / FPS, 600, 4000, 'rise', 2), K('BUILDER_CLICK'), MU['riser'] - 1)

# WEBSITE BUILD — strongest momentum
W0, W1 = K('TRANSFER_ARRIVE'), K('PITCH_SENT') + 10
progression(W0, W1, [Fadd9, C_E, Dm7, Bbadd9], 1.0, 1, 1900)
drums(W0, W1, kick=1, hats=2, clap=True, gain=0, perc=True)
for k, fr in enumerate(beats(W0, W1, 0.25)):
    music.put(pluck_v(hz([77, 81, 84, 81][k % 4]), 0.2, 0.05, 3000), fr, MU['arp'] - 2, 0.25 * (-1) ** k)

# SELL / TRACK — resolution
progression(K('SELL_IN'), K('LOOP_IN'), [Bbadd9, Fadd9], 1.0, 0, 1700)
drums(K('SELL_IN'), K('LOOP_IN'), kick=2, hats=1, gain=-3)

# LOOP — a hit on each node, a wide chord on REPEAT
for fr in K('LOOP_NODES'):
    music.put(kick_v(1.1), fr, MU['kick'] - 1)
pad_span(K('LOOP_IN'), K('LOOP_REPEAT'), Dm7, MU['pad'] - 1, 1600)
pad_span(K('LOOP_REPEAT'), K('FINAL_LOGO') + 10, [29, 41, 53, 57, 60, 67], MU['pad'] + 2, 2400, 0.02)

# CTA — minimal, confident, resolved; no drums
pad_span(K('FINAL_LOGO'), DUR + 40, [29, 41, 53, 57, 60, 64, 67], MU['pad'] + 1, 2200, 0.2, 1.0)
for k, fr in enumerate(beats(K('CTA'), DUR - 30, 1.0)):
    music.put(pluck_v(hz([77, 72, 69, 72][k % 4]), 0.6, 0.22, 2000), fr, MU['pluck'] - 5, 0.2 * (-1) ** k)

# ─────────────────────────── ROOM · DUCK · MASTER ───────────────────────────


def make_ir(d=2.0):
    t = tt(d)
    irs = [lp(noise(d) * np.exp(-t / 0.5), 6500) * np.minimum(1, t / 0.01) for _ in range(2)]
    ir = np.vstack(irs)
    return ir / np.sqrt(np.sum(ir ** 2))


ir = make_ir()
music.buf += np.vstack([fftconvolve(verb.buf[c], ir[c])[:N] for c in range(2)]) * db(-10)

env = maximum_filter1d(voice_env, int(0.04 * SR))
a_, r_ = np.exp(-1 / (0.012 * SR)), np.exp(-1 / (0.3 * SR))
sm = np.empty_like(env)
cur = 0.0
for i in range(0, N, 32):
    v = env[i]
    cur = v + (cur - v) * (a_ ** 32 if v > cur else r_ ** 32)
    sm[i:i + 32] = cur
duck = np.clip(sm, 0, 1)
music.buf *= 1 - (1 - db(-13)) * duck
sfx.buf *= 1 - (1 - db(-5)) * duck
# keep the low end out of the voice's way: music low-mids dip under speech
music.buf = music.buf - 0.35 * np.vstack([lp(hp(music.buf[c], 180), 900) for c in range(2)]) * duck


def measure(x):
    tmp = os.path.join(ROOT, 'renders', '_lufs_final.wav')
    sf.write(tmp, x.T.astype(np.float32), SR)
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.remove(tmp)
    j = json.loads(out[out.rfind('{'): out.rfind('}') + 1])
    return float(j['input_i']), float(j['input_tp'])


def limit(x, ceiling_db):
    ceiling = db(ceiling_db)
    g = np.minimum(1.0, ceiling / np.maximum(np.max(np.abs(x), axis=0), 1e-9))
    g = minimum_filter1d(g, int(0.002 * SR) * 2 + 1)
    rel = np.exp(-1 / (0.08 * SR))
    out = np.empty_like(g)
    c = 1.0
    for i in range(len(g)):
        c = g[i] if g[i] < c else g[i] + (c - g[i]) * rel
        out[i] = c
    return x * out


n_out = int(round(DUR / FPS * SR))
stems = {'voice': voice.buf, 'music': music.buf, 'sfx': sfx.buf}
mix = sum(stems.values())
mix = np.vstack([hp(ch, 30) for ch in mix])[:, :n_out]
nf = int(0.2 * SR)
mix[:, -nf:] *= np.linspace(1, 0, nf) ** 2
pre = mix / np.max(np.abs(mix)) * 0.5
I0, _ = measure(pre)
gain = db(-14 - I0) * 0.5 / np.max(np.abs(mix))
out = limit(mix * gain, -1.6)
I1, TP = measure(out)
OUT = os.path.join(ROOT, 'public/final/audio')
os.makedirs(os.path.join(OUT, 'stems'), exist_ok=True)
sf.write(os.path.join(OUT, 'prospectify-final-mix.wav'), out.T.astype(np.float32), SR, subtype='PCM_24')
for name, s in stems.items():
    sf.write(os.path.join(OUT, 'stems', f'{name}.wav'), (s[:, :n_out] * gain).T.astype(np.float32), SR, subtype='PCM_24')
CUES.sort(key=lambda c: c['frame'])
os.makedirs(os.path.join(REPO, 'motion-source/production'), exist_ok=True)
json.dump({'fps': FPS, 'sampleRate': SR, 'bpm': BPM, 'integratedLUFS': round(I1, 2), 'truePeak_dBTP': round(TP, 2), 'mixPriority': ['voice', 'music', 'sfx'],
           'ducking': {'music': '-13 dB under voice (12 ms attack, 300 ms release) + low-mid dip', 'sfx': '-5 dB under voice'}, 'cues': CUES},
          open(os.path.join(REPO, 'motion-source/production/AUDIO_CUE_MAP.json'), 'w'), indent=1, ensure_ascii=False)
print(f'mix {out.shape[1] / SR:.3f}s · {I1:.2f} LUFS · TP {TP:.2f} dBTP · {len(CUES)} cues')
