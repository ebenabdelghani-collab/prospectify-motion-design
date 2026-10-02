#!/usr/bin/env python3
"""
Prospectify master ad — VOICE + MUSIC + SFX as one system.

Reads src/constants/timeline.json (generated from the real voiceover), voice.json and mix.json.
Every cue lands on the same frame as its visual. Music evolves per act; it ducks under the voice.

Outputs (48 kHz):
  public/audio/mix-organic.wav, mix-paid.wav       mastered, -14 LUFS / -1 dBTP
  public/audio/stems/{voice,music,sfx}.wav         post-gain stems (swap in licensed music here)
"""
import json
import os
import subprocess

import numpy as np
import soundfile as sf
from scipy.ndimage import maximum_filter1d, minimum_filter1d
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, 'src/constants/timeline.json')))
M = json.load(open(os.path.join(ROOT, 'src/constants/mix.json')))
SR = 48000
FPS = T['fps']
N = int(round(T['durationInFrames'] / FPS * SR)) + SR // 10
BEAT = 60 / M['bpm']
BF = BEAT * FPS  # frames per beat (30)
rng = np.random.default_rng(7)


def fs(fr):
    return int(round(fr / FPS * SR))


def db(x):
    return 10 ** (x / 20)


def tt(d):
    return np.arange(int(d * SR)) / SR


def sos(kind, f, o=2):
    return butter(o, f, kind, fs=SR, output='sos')


def lp(x, f, o=2):
    return sosfilt(sos('lowpass', f, o), x)


def hp(x, f, o=2):
    return sosfilt(sos('highpass', f, o), x)


def bp(x, lo, hi, o=2):
    return sosfilt(sos('bandpass', [lo, hi], o), x)


def noise(d):
    return rng.standard_normal(int(d * SR))


def edges(x, a=0.001, r=0.004):
    x = x.copy()
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    x[..., :na] *= np.linspace(0, 1, na)
    x[..., -nr:] *= np.linspace(1, 0, nr)
    return x


def hz(n):
    return 440 * 2 ** ((n - 69) / 12)


class Bus:
    def __init__(self):
        self.buf = np.zeros((2, N))

    def put(self, sig, frame, gain_db, pan=0.0, offset=0.0):
        start = fs(frame) + int(round(offset * SR))
        if sig.ndim == 1:
            th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
            sig = np.vstack([sig * np.cos(th), sig * np.sin(th)]) * np.sqrt(2)
        if start < 0:
            sig, start = sig[:, -start:], 0
        end = min(N, start + sig.shape[1])
        if end > start:
            self.buf[:, start:end] += sig[:, : end - start] * db(gain_db)


voice, music, sfx, verb_send = Bus(), Bus(), Bus(), Bus()
MU, SX, VO = M['music'], M['sfx'], M['voice']

# ───────────────────────── Voices (synth) ─────────────────────────


def key_v(soft=1.0):
    t = tt(0.035)
    s = hp(noise(0.035), 2600) * np.exp(-t / 0.0035) * 0.6
    s += np.sin(2 * np.pi * rng.uniform(170, 230) * t) * np.exp(-t / 0.010) * 0.55
    s += np.sin(2 * np.pi * rng.uniform(2900, 3500) * t) * np.exp(-t / 0.005) * 0.25
    return edges(s * soft)


def click_v(deep=False):
    t = tt(0.09)
    s = hp(noise(0.09), 1800) * np.exp(-t / 0.0025) * 0.7
    s += np.sin(2 * np.pi * (1500 if deep else 2100) * t) * np.exp(-t / 0.009) * 0.6
    s += np.sin(2 * np.pi * (170 if deep else 300) * t) * np.exp(-t / (0.03 if deep else 0.018)) * 0.9
    o = int(0.045 * SR)
    r = hp(noise(0.02), 2500) * np.exp(-tt(0.02) / 0.002) * 0.25
    s[o : o + len(r)] += r
    return edges(s)


def hover_v(f0=880, f1=1180):
    t = tt(0.08)
    ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, len(t))) / SR
    return edges(np.sin(ph) * np.sin(np.pi * t / t[-1]) ** 2)


def tick_v(freq, decay=0.012, dur=0.06):
    t = tt(dur)
    s = np.sin(2 * np.pi * freq * t) * np.exp(-t / decay)
    s += 0.25 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t / (decay * 0.6))
    s += hp(noise(dur), 4500) * np.exp(-t / 0.0015) * 0.3
    return edges(s)


def lock_v(freqs, decay=0.22, hero=False):
    d = 1.6 if hero else 0.7
    t = tt(d)
    s = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / (decay * (1 - 0.15 * i))) * 0.8 ** i for i, f in enumerate(freqs))
    s = s * np.minimum(1, t / 0.0015)
    s += hp(noise(d), 3000) * np.exp(-t / 0.002) * 0.35
    s += np.sin(2 * np.pi * 240 * t) * np.exp(-t / 0.02) * 0.5
    if hero:
        s += np.sin(2 * np.pi * 82.4 * t) * np.exp(-t / 0.22) * 0.7
        s += np.sin(2 * np.pi * freqs[0] * 2 * t) * np.exp(-t / 0.6) * 0.2
    return edges(s, r=0.05)


def svf_bp(x, fc, q=1.4):
    out = np.empty_like(x)
    low = band = 0.0
    damp = 1 / q
    f = 2 * np.sin(np.pi * np.clip(fc, 20, SR / 6) / SR)
    for i in range(len(x)):
        high = x[i] - low - damp * band
        band += f[i] * high
        low += f[i] * band
        out[i] = band
    return out


def sweep_v(d, f0, f1, shape='rise', q=1.6):
    t = tt(d)
    u = t / d
    s = svf_bp(noise(d), f0 * (f1 / f0) ** u, q)
    env = u ** 2.2 if shape == 'rise' else (1 - u) ** 1.6 if shape == 'fall' else np.sin(np.pi * u) ** 1.5
    s = s * env
    return edges(s / (np.max(np.abs(s)) + 1e-9), 0.003, 0.006)


def sub_v(light=False):
    t = tt(1.1)
    ph = 2 * np.pi * np.cumsum(42 + 30 * np.exp(-t / 0.05)) / SR
    s = np.tanh(1.6 * np.sin(ph) * np.exp(-t / (0.35 if light else 0.65)))
    s += lp(noise(1.1), 220) * np.exp(-t / 0.03) * 1.2
    s += hp(noise(1.1), 3000) * np.exp(-t / 0.003) * 0.2
    return edges(s, r=0.1)


def bell_v(freq, d=1.8, decay=0.6, idx=1.6):
    t = tt(d)
    s = np.sin(2 * np.pi * freq * t + np.sin(2 * np.pi * freq * 3.5 * t) * idx * np.exp(-t / 0.12)) * np.exp(-t / decay)
    s += 0.3 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t / (decay * 0.5))
    return edges(s * np.minimum(1, t / 0.002), r=0.1)


def pluck_v(freq, d=0.5, decay=0.16, bright=2600, h=9):
    t = tt(d)
    s = sum(np.sin(2 * np.pi * freq * k * t) / k * np.exp(-t / (decay / (1 + 0.25 * k))) for k in range(1, h))
    return edges(lp(s, bright), r=0.05)


def glass_v():
    """Shatter: an impact plus a scatter of bright tinkles that decay."""
    d = 1.2
    t = tt(d)
    s = hp(noise(d), 3500) * np.exp(-t / 0.05) * 0.8
    s += lp(noise(d), 400) * np.exp(-t / 0.06) * 0.9
    for k in range(38):
        o = int((rng.uniform(0, 0.55) ** 1.6) * SR)
        f0 = rng.uniform(3200, 9500)
        tk = tt(0.05)
        blip = np.sin(2 * np.pi * f0 * tk) * np.exp(-tk / rng.uniform(0.006, 0.02)) * rng.uniform(0.15, 0.5)
        s[o : o + len(blip)] += blip[: max(0, min(len(blip), len(s) - o))]
    return edges(s, r=0.1)


def pop_v(f0=520, f1=180, d=0.09):
    """Soft glossy pop (bubble / pin landing)."""
    t = tt(d)
    ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, len(t))) / SR
    return edges(np.sin(ph) * np.exp(-t / (d * 0.35)) + hp(noise(d), 3000) * np.exp(-t / 0.002) * 0.15)


def hinge_v():
    t = tt(0.35)
    s = lp(noise(0.35), 900) * np.exp(-t / 0.05) * 0.6 + np.sin(2 * np.pi * 95 * t) * np.exp(-t / 0.09) * 0.8
    s += hp(noise(0.35), 2500) * np.exp(-np.maximum(0, t - 0.12) / 0.004) * (t > 0.12) * 0.3
    return edges(s, r=0.04)


def tab_v():
    t = tt(0.05)
    s = bp(noise(0.05), rng.uniform(700, 1100), 4500) * np.exp(-t / 0.006)
    s += np.sin(2 * np.pi * rng.uniform(500, 700) * t) * np.exp(-t / 0.012) * 0.5
    return edges(s)


def kick_v(punch=1.0):
    t = tt(0.4)
    ph = 2 * np.pi * np.cumsum(46 + 85 * np.exp(-t / 0.028)) / SR
    s = np.tanh(1.3 * np.sin(ph) * np.exp(-t / 0.16)) + hp(noise(0.4), 3500) * np.exp(-t / 0.0018) * 0.25 * punch
    return edges(s, r=0.03)


def clap_v():
    t = tt(0.25)
    env = sum(np.exp(-np.maximum(0, t - o) / 0.006) * (t >= o) for o in (0, 0.011, 0.022)) + np.exp(-t / 0.07) * 0.6
    s = bp(noise(0.25), 900, 6000) * env * 0.5 + np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.03) * 0.3
    return edges(s, r=0.02)


def hat_v(open_=False):
    t = tt(0.12 if open_ else 0.06)
    return edges(hp(noise(len(t) / SR), 7500) * np.exp(-t / (0.06 if open_ else 0.016)))


def clock_v():
    t = tt(0.05)
    return edges(bp(noise(0.05), 1800, 5000) * np.exp(-t / 0.004) + np.sin(2 * np.pi * 1250 * t) * np.exp(-t / 0.008) * 0.4)


def saw(freq, t, h=8, det=1.0):
    return sum(np.sin(2 * np.pi * freq * det * k * t + k * 0.7) / k for k in range(1, h + 1))


def pad(notes, d, cut=1400, att=0.3, rel=0.4):
    t = tt(d)
    L = sum(saw(hz(n), t, 8, 2 ** (-7 / 1200)) for n in notes)
    R = sum(saw(hz(n), t, 8, 2 ** (7 / 1200)) for n in notes)
    env = np.minimum(1, t / att) * np.clip((d - t) / rel, 0, 1)
    return np.vstack([lp(L, cut) * env, lp(R, cut) * env]) / len(notes)


# ─────────────────────────── VOICE ───────────────────────────
voice_env = np.zeros(N)
for sid, v in T['VO'].items():
    x, sr = sf.read(os.path.join(ROOT, f'public/voice/{sid}.wav'))
    x = hp(x, 75)
    rms = np.sqrt(np.mean(x[np.abs(x) > 1e-3] ** 2) + 1e-12)
    x = x / rms * db(-20)  # consistent read level per line
    x = np.tanh(x * 1.6) / 1.6  # gentle glue
    voice.put(x, v['start'], VO['level'])
    verb_send.put(x, v['start'], VO['level'] + VO['room'])
    s0 = fs(v['start'])
    voice_env[s0 : s0 + len(x)] = np.maximum(voice_env[s0 : s0 + len(x)], np.abs(x) / np.max(np.abs(x)))

# ─────────────────────────── SFX ───────────────────────────
K = lambda name: T[name]  # noqa: E731

# ACT 1
for k in T['BUILD_KEYS']:
    sfx.put(key_v(), k, SX['key'] + rng.uniform(-1.5, 1.5), rng.uniform(-0.15, 0.15))
sfx.put(click_v(), K('BUILD_ENTER'), SX['click'])
sfx.put(sweep_v(0.22, 300, 4200, 'rise', 1.3), K('BUILD_ENTER') - 11, SX['sweep'] - 3)
sfx.put(sub_v(light=True), K('BUILD_ENTER') + 2, SX['sub'] - 12)
sfx.put(hinge_v(), K('BUILD_ENTER') + 2, SX['click'] + 1)
sfx.put(hinge_v()[::-1].copy(), K('HOOK_CLEAR') - 14, SX['click'] - 4)
for j, fr in enumerate(T['SITE_STEPS']):
    sfx.put(tick_v([hz(79), hz(83), hz(86), hz(88), hz(91)][j], 0.016), fr, SX['construct'] - 2)
sfx.put(lock_v([hz(88), hz(95)]), K('SITE_DONE'), SX['lock'])
sfx.put(sweep_v(0.14, 2500, 400, 'rise'), K('HOOK_CLEAR') - 8, SX['sweep'] - 6)
for i, k in enumerate(T['FIND_KEYS']):
    sfx.put(key_v(1 - 0.5 * i / len(T['FIND_KEYS'])), k, SX['key'] + rng.uniform(-1.5, 1), rng.uniform(-0.15, 0.15))
# STALL → CLOCK_IN: silence. The clock then ticks — every second is a tick you lose.
for k in range(1, 8):  # odometer: one mechanical flip per jump in time (CLOCK_STEP = 10 frames)
    fr = T['CLOCK_IN'] + 4 + k * 10
    sfx.put(clock_v(), fr, SX['clock'] + 1)
    sfx.put(clock_v(), fr + 3, SX['clock'] - 5)

# ACT 2
sfx.put(sweep_v(0.32, 300, 2600, 'fall', 1.4), K('PAIN_START'), SX['sweep'] - 4)
for i, c in enumerate(T['PAIN_CUTS']):
    if i > 0:  # dive: air accelerates into the detail, then the next screen lands
        sfx.put(sweep_v(11 / FPS, 500, 6000, 'rise', 1.2), c - 11, SX['sweep'] - 1, rng.uniform(-0.3, 0.3))
    sfx.put(tab_v(), c, SX['tab'] + i * 0.4, rng.uniform(-0.4, 0.4))
    sfx.put(sub_v(light=True), c, SX['sub'] - 16)
for j in range(12):  # map pins drop
    sfx.put(tick_v(rng.uniform(1600, 2400), 0.008, 0.03), T['PAIN_START'] + j * 1.2 + 6, SX['data'] + 4, rng.uniform(-0.5, 0.5))
for i, c in enumerate(T['WORTH_FLICKS']):
    sfx.put(tab_v(), c, SX['tab'] - 3 + i * 0.3, rng.uniform(-0.6, 0.6))
sfx.put(sweep_v((T['ZERO_IN'] - T['WORTH_START']) / FPS, 300, 3000, 'rise', q=3), K('WORTH_START'), SX['riser'])
sfx.put(sweep_v(0.6, 4000, 400, 'bell', 1.1), K('WORTH_START'), SX['sweep'] - 2)
sfx.put(sweep_v(9 / FPS, 3500, 200, 'rise', 1.2), K('ZERO_IN') - 15, SX['sweep'])
sfx.put(glass_v(), K('ZERO_IN') - 6, SX['tab'] + 2)
sfx.put(sub_v(light=True), K('ZERO_LOCK'), SX['sub'] - 4)

# ACT 3
sfx.put(sweep_v(0.25, 600, 2800, 'bell'), K('CARD_A_IN'), SX['sweep'] - 10)
sfx.put(hover_v(), K('PICK_HOVER'), SX['hover'])
sfx.put(click_v(deep=True), K('PICK_B'), SX['click'] + 1)
sfx.put(lock_v([hz(83), hz(88)]), K('PICK_B') + 2, SX['lock'] - 3)
sfx.put(tick_v(hz(88), 0.02), K('DEMAND_SIGNALS'), SX['tick'] + 1)
sfx.put(tick_v(hz(88) * 1.06, 0.02), K('DEMAND_SIGNALS') + 4, SX['tick'])
sfx.put(tick_v(hz(95), 0.02), K('WEBPROBLEM_SIGNALS'), SX['tick'] + 1)
sfx.put(tick_v(hz(95) * 1.06, 0.02), K('WEBPROBLEM_SIGNALS') + 4, SX['tick'])

# ACT 4
sfx.put(sweep_v(16 / FPS, 2500, 500, 'rise'), K('FIFTY_IN'), SX['sweep'] - 3)
sfx.put(sweep_v(0.9, 2800, 300, 'bell', 1.0), K('FIFTY_IN') + 16, SX['sweep'] - 6)
for i, fr in enumerate(T['FIFTY_FILL']):
    sfx.put(pop_v(rng.uniform(420, 760), rng.uniform(140, 220)), fr, SX['data'] + 9 + rng.uniform(-2, 1), rng.uniform(-0.7, 0.7))
crane = (T['TIME_LINE'] - T['FIFTY_IN']) / FPS
sfx.put(sweep_v(crane, 180, 900, 'bell', 0.9), K('FIFTY_IN') + 10, SX['sweep'] - 7)
# implosion: everything is sucked in, merges into one glossy sphere, which contracts to a point of light
sfx.put(sweep_v(0.25, 3000, 300, 'rise', 1.3), K('SCALE_COLLAPSE') - 4, SX['sweep'] - 1)
sfx.put(pop_v(420, 90, 0.45), K('SCALE_COLLAPSE') + 6, SX['sub'] - 6)
sfx.put(sweep_v((T['REVEAL'] - T['SCALE_COLLAPSE'] - 16) / FPS, 600, 7000, 'rise', 3), K('SCALE_COLLAPSE') + 16, SX['riser'] - 2)
for fr in T['TIME_FLICKS']:
    sfx.put(clock_v(), fr, SX['clock'] - 3, rng.uniform(-0.3, 0.3))
sfx.put(sweep_v((T['SCALE_COLLAPSE'] - T['TIME_LINE']) / FPS, 300, 3500, 'rise', q=3), K('TIME_LINE'), SX['riser'])
suck = sweep_v(12 / FPS, 4000, 250, 'rise', 1.2)
suck[-int(0.002 * SR):] = 0
sfx.put(suck, K('SCALE_COLLAPSE'), SX['sweep'])

# ACT 5 — the reveal (silence before it)
E5, Gs5, B5, Cs6, E6, Fs6, Gs6, B6, E7 = (hz(n) for n in (76, 80, 83, 85, 88, 90, 92, 95, 100))


def motif(fr, g, spread=0.35):
    for j, (n, pan) in enumerate(((E5, -spread), (B5, 0), (E6, spread))):
        sfx.put(bell_v(n), fr + j * 5, g - j * 1.5, pan)
        verb_send.put(bell_v(n), fr + j * 5, g - j * 1.5 - 4)


sfx.put(sub_v(), K('REVEAL'), SX['sub'])
motif(K('REVEAL'), SX['motif'])
sfx.put(sweep_v(0.3, 2500, 600, 'bell'), K('LOGO_TO_HEADER'), SX['sweep'] - 8)

# ACT 6
sfx.put(sweep_v(0.2, 800, 3500, 'bell'), K('SEARCH_IN'), SX['sweep'] - 9)
for k in T['CITY_KEYS'] + T['NICHE_KEYS']:
    sfx.put(key_v(0.9), k, SX['key'] - 2, rng.uniform(-0.1, 0.1))
sfx.put(hover_v(), K('SEARCH_HOVER'), SX['hover'])
sfx.put(click_v(), K('SEARCH_CLICK'), SX['click'])
for j, fr in enumerate(range(K('SEARCH_CLICK') + 1, K('RESULTS'))):
    sfx.put(tick_v(1800 + j * 120, 0.004, 0.03), fr, SX['scan'], -0.6 + 1.2 * j / 13)
for j, fr in enumerate(T['RESULT_CARDS']):
    sfx.put(tick_v([B6, Gs6, Fs6, E6, Cs6][j], 0.014), fr, SX['result'] - j * 0.8)
sfx.put(hover_v(760, 980), K('LEAD_HOVER'), SX['hover'])
sfx.put(click_v(deep=True), K('LEAD_SELECTED'), SX['clickDeep'])
sfx.put(sweep_v((K('FILE_OPEN') - K('LEAD_SELECTED')) / FPS, 500, 2400, 'bell', 1.2), K('LEAD_SELECTED') + 1, SX['sweep'] - 2)

# ACT 7 — locks step up the scale
sfx.put(lock_v([B5, E6]), K('WHY_READY'), SX['lock'])
sfx.put(lock_v([Cs6, Gs6]), K('CONTACT_READY'), SX['lock'] + 0.5)
for k_ in ('CONTACT_READY', 'ANGLE_READY'):
    sfx.put(sub_v(light=True), K(k_) - 1, SX['sub'] - 17)
    sfx.put(sweep_v(6 / FPS, 2500, 400, 'rise'), K(k_) - 7, SX['sweep'] - 6)
sfx.put(sweep_v(0.4, 300, 2200, 'bell', 1.1), K('NEXT_HEADLINE') - 8, SX['sweep'] - 4)
sfx.put(lock_v([E6, B6]), K('ANGLE_READY'), SX['lock'] + 1)
for fr in range(T['OUTREACH_TYPE'][0], T['OUTREACH_TYPE'][1], 2):
    sfx.put(key_v(0.65), fr, SX['key'] - 5, rng.uniform(-0.2, 0.2))
sfx.put(lock_v([Fs6, hz(97)]), K('OUTREACH_READY'), SX['lock'] + 1.5)
sfx.put(hover_v(), K('COPY_HOVER'), SX['hover'])
sfx.put(click_v(), K('COPY_CLICK'), SX['click'])
sfx.put(tick_v(E6 * 1.333, 0.03), K('COPY_CONFIRM'), SX['tick'] + 2)
sfx.put(tick_v(E6 * 1.78, 0.04), K('COPY_CONFIRM') + 3, SX['tick'] + 1)

# ACT 8 — BUILD PROMPT (slows; hero lock; then silence)
sfx.put(hover_v(700, 1000), K('PROMPT_HOVER'), SX['hover'] + 2)
sfx.put(click_v(deep=True), K('PROMPT_CLICK'), SX['clickDeep'] + 1)
sfx.put(sweep_v(8 / FPS, 3000, 400, 'rise'), K('PROMPT_FOLD'), SX['sweep'] - 3)
sfx.put(sweep_v(13 / FPS, 400, 3500, 'fall'), K('PROMPT_FOLD') + 8, SX['sweep'] - 3)
L = T['PROMPT_LINES']
for fr in range(L[0], T['PROMPT_READY'] - 4, 2):
    sfx.put(tick_v(rng.uniform(2600, 4200), 0.004, 0.03), fr, SX['data'] + rng.uniform(-3, 1), rng.uniform(-0.35, 0.35))
for j, fr in enumerate(L):
    sfx.put(tick_v([E6, Fs6, Gs6, B6, Cs6 * 2, hz(99), E7, E7 * 1.12][j], 0.01), fr, SX['tick'] - 2)
sfx.put(lock_v([E6, B6, E7], 0.26, hero=True), K('PROMPT_READY'), SX['lockHero'])
sfx.put(sub_v(light=True), K('PROMPT_READY'), SX['sub'] - 11)
verb_send.put(lock_v([E6, B6, E7], 0.26, hero=True), K('PROMPT_READY'), SX['lockHero'] - 8)

# ACT 9
sfx.put(sweep_v(0.3, 2500, 700, 'bell'), K('PROMPT_COMPRESS'), SX['sweep'] - 9)
for j, fr in enumerate(T['BUILDER_LOGOS']):
    sfx.put(tick_v([B5, Cs6, E6, Fs6][j], 0.02), fr, SX['tick'] - 1, -0.45 + 0.3 * j)
for j, fr in enumerate(T['BUILDER_HOVERS']):
    sfx.put(hover_v(900 - j * 40, 1150 - j * 40), fr, SX['hover'], 0.45 - 0.3 * j)
sfx.put(click_v(), K('BUILDER_SELECTED'), SX['click'] + 1, -0.45)
sfx.put(lock_v([B5, E6], 0.18), K('BUILDER_SELECTED') + 1, SX['lock'] - 3, -0.3)
send = sweep_v((K('PROMPT_ARRIVE') - K('PROMPT_SEND')) / FPS, 600, 5000, 'rise', 1.3)
pp = np.linspace(0, -0.55, len(send))
sfx.put(np.vstack([send * np.cos((pp + 1) * np.pi / 4), send * np.sin((pp + 1) * np.pi / 4)]) * np.sqrt(2), K('PROMPT_SEND'), SX['sweep'] + 1)
sfx.put(sub_v(light=True), K('PROMPT_ARRIVE'), SX['sub'] - 7)
sfx.put(sweep_v(0.3, 3000, 500, 'fall', 1.3), K('BUILD_START'), SX['sweep'] - 5)
sfx.put(hinge_v(), K('BUILD_START') + 4, SX['click'])

# ACT 10
for j, fr in enumerate(T['BUILD_STEPS']):
    sfx.put(tick_v([hz(79), B5, hz(86), E6, hz(91)][j], 0.018), fr, SX['construct'])
    sfx.put(click_v()[: int(0.03 * SR)], fr, SX['construct'] - 6)
sfx.put(lock_v([E6, Gs6, B6], 0.3), K('SITE_READY'), SX['lock'] + 2)
sfx.put(sweep_v(0.3, 3000, 500, 'bell'), K('PITCH_IN'), SX['sweep'] - 6)
sfx.put(click_v(), K('PITCH_COPY'), SX['click'])
sfx.put(tick_v(E6 * 1.333, 0.03), K('PITCH_CONFIRM'), SX['tick'] + 2)

# ACT 11–12
sfx.put(sweep_v(0.22, 500, 2600, 'bell'), K('SELL_IN'), SX['sweep'] - 8)
sfx.put(click_v(), K('MARK_SOLD_CLICK'), SX['click'])
sfx.put(sweep_v(0.2, 700, 2500, 'bell'), K('SOLD_DIALOG'), SX['sweep'] - 10)
for k in T['AMOUNT_KEYS']:
    sfx.put(key_v(0.9), k, SX['key'] - 2)
sfx.put(click_v(), K('SAVE_CLICK'), SX['click'])
sfx.put(sub_v(), K('SOLD'), SX['sub'] - 5)
for j in range(16):
    sfx.put(pop_v(rng.uniform(700, 1500), rng.uniform(250, 500), 0.06), K('SOLD') + 2 + rng.uniform(0, 22), SX['data'] + 8, rng.uniform(-0.7, 0.7))
sfx.put(click_v(deep=True), K('SOLD'), SX['clickDeep'] + 2)
for j, n in enumerate((E5, Gs5, B5, E6)):
    sfx.put(bell_v(n, 1.5, 0.5, 0.8), K('SOLD') + j, SX['success'] - j * 1.2, -0.2 + 0.13 * j)
    verb_send.put(bell_v(n, 1.5, 0.5, 0.8), K('SOLD') + j, SX['success'] - 6)
sfx.put(sweep_v(0.25, 500, 3000, 'bell'), K('TRACK_IN'), SX['sweep'] - 8)
for j, fr in enumerate(T['TRACK_TILES']):
    for q in range(4):
        sfx.put(tick_v(2600 + q * 300 + j * 200, 0.004, 0.03), fr + q * 2, SX['data'] + 2)
sfx.put(tick_v(B6, 0.014), K('TRACK_ROW'), SX['tick'])

# ACT 13 — loop words hit
for j, fr in enumerate(T['LOOP_WORDS']):
    sfx.put(tick_v([E6, Fs6, Gs6, B6][j], 0.02), fr, SX['tick'] + 2)
sfx.put(sweep_v(0.6, 300, 4000, 'bell', 2), K('LOOP_REPEAT'), SX['sweep'] - 4)
sfx.put(sweep_v(8 / FPS, 3500, 300, 'rise'), K('LOOP_OUT') - 8, SX['sweep'] - 3)

# ACT 14
sfx.put(sub_v(), K('FINAL_BRAND'), SX['sub'] - 1)
motif(K('FINAL_BRAND'), SX['motif'] - 3, 0.5)
sfx.put(sub_v(light=True), K('FINAL_CTA'), SX['cta'])
sfx.put(click_v(), K('FINAL_CTA'), SX['cta'] - 3)

sfx.put(tick_v(B6, 0.01), K('FINAL_URL'), SX['tick'] - 4)
# VF: light streaks converge on the logo (glassy shimmer), CTA burst (pops), letter flips (ticks)
for j in range(24):
    sfx.put(tick_v(rng.uniform(3000, 8000), 0.02, 0.06), K('FINAL_BRAND') - 18 + rng.uniform(0, 22), SX['tick'] - 6, rng.uniform(-0.8, 0.8))
for j in range(18):
    sfx.put(pop_v(rng.uniform(700, 1500), rng.uniform(250, 500), 0.06), K('FINAL_CTA') + rng.uniform(0, 8), SX['data'] + 8, rng.uniform(-0.8, 0.8))
for i in range(14):
    sfx.put(tick_v(2400 + i * 120, 0.006, 0.03), K('FINAL_LINE_2') + i * 1.2, SX['tick'] - 5, -0.3 + 0.05 * i)
for j in range(3):
    sfx.put(tick_v(rng.uniform(2600, 5200), 0.02, 0.05), K('PROMPT_SEND') + j * 2, SX['tick'] - 4, -0.4)

# ─────────────────────────── MUSIC ───────────────────────────
# Chords (MIDI) — E major family
EMAJ9 = [52, 59, 63, 66, 68]
CSM9 = [49, 56, 59, 63, 64]
AMAJ9 = [45, 52, 56, 59, 63]
BSUS = [47, 54, 59, 61, 64]
ROOT_OF = {id(EMAJ9): 40, id(CSM9): 37, id(AMAJ9): 33, id(BSUS): 35}


def pad_span(a, b, notes, gain, cut=1400, att=0.3):
    if b <= a:
        return
    d = (b - a) / FPS + 0.35
    p = pad(notes, d, cut, att)
    music.put(p, a, gain)
    verb_send.put(p, a, gain - 6)


def beats(a, b, step=1.0):
    fr = a
    while fr < b - 1:
        yield fr
        fr += BF * step


def drums(a, b, kick=True, hats=0, clap=False, gain=0.0):
    for i, fr in enumerate(beats(a, b)):
        if kick:
            music.put(kick_v(), fr, MU['kick'] + gain)
        if clap and i % 2 == 1:
            music.put(clap_v(), fr, MU['clap'] + gain, 0.05)
            verb_send.put(clap_v(), fr, MU['clap'] - 8)
        if hats >= 1:
            music.put(hat_v(), fr + BF / 2, MU['hat'] + gain, 0.25)
        if hats >= 2:
            music.put(hat_v(), fr + BF / 4, MU['hat'] - 5 + gain, -0.2)
            music.put(hat_v(), fr + 3 * BF / 4, MU['hat'] - 5 + gain, -0.2)


def bass(a, b, root, gain=0.0, step=0.5):
    for k, fr in enumerate(beats(a, b, step)):
        music.put(pluck_v(hz(root), 0.25, 0.09, 380) * (1.0 if k % 2 == 0 else 0.7), fr, MU['bass'] + gain)


def ostinato(a, b, note, step=0.25, gain=0.0, rise=0.0):
    n = int((b - a) / (BF * step))
    for k, fr in enumerate(beats(a, b, step)):
        music.put(pluck_v(hz(note), 0.18, 0.05, 1800 + 2500 * (k / max(1, n)) * rise), fr, MU['ostinato'] + gain + rise * 6 * k / max(1, n), 0.25 * (-1) ** k)


def progression(a, b, chords, bars=1.0, gain=0.0, cut=1400, with_bass=True, bass_gain=0.0):
    span = BF * 4 * bars
    i, fr = 0, a
    while fr < b - 1:
        c = chords[i % len(chords)]
        e = min(b, fr + span)
        pad_span(fr, e, c, MU['pad'] + gain, cut)
        if with_bass:
            bass(fr, e, ROOT_OF[id(c)], bass_gain)
        fr, i = e, i + 1


# ACT 1 — minimal / curious: sparse plucks over a quiet pad, gone at the stall
pad_span(0, T['STALL'], EMAJ9, MU['pad'] - 6, 1000, 0.5)
for k, fr in enumerate(beats(T['BUILD_KEYS'][0], T['STALL'] - 6, 0.5)):
    music.put(pluck_v(hz([64, 71, 68, 75, 73, 71][k % 6]), 0.5, 0.18, 2400), fr, MU['pluck'] - 2, 0.3 * (-1) ** k)
# CLOCK: low drone under the night
music.put(lp(saw(hz(28), tt((T['PAIN_START'] - T['CLOCK_IN']) / FPS + 0.3), 6), 180) * np.minimum(1, tt((T['PAIN_START'] - T['CLOCK_IN']) / FPS + 0.3) / 0.3), T['CLOCK_IN'], MU['drone'])

# ACT 2 — repetitive pressure, tightening into "0"
P0, P1 = T['PAIN_START'], T['ZERO_IN']
ostinato(P0, P1, 52, 0.25, 0, rise=1.0)
drums(P0, P1, kick=True, hats=1)
drums(T['WORTH_START'], P1, kick=False, hats=2, gain=-2)
bass(P0, P1, 40, -2)
# hard stop at ZERO — silence except the thud

# ACT 3 — reduction / insight
progression(T['INSIGHT_Q'], T['DEMAND_LINE'], [CSM9], 2, -2, 1000, with_bass=False)
progression(T['DEMAND_LINE'], T['FIFTY_IN'], [AMAJ9], 2, 0, 1600, with_bass=True, bass_gain=-6)

# ACT 4 — pressure again, then a hard cut into silence
ostinato(T['FIFTY_IN'], T['SCALE_COLLAPSE'], 52, 0.25, 1, rise=1.0)
drums(T['FIFTY_IN'], T['SCALE_COLLAPSE'], kick=True, hats=2, gain=-1)
bass(T['FIFTY_IN'], T['SCALE_COLLAPSE'], 40, -1, 0.25)

# ACT 5 — release
R = T['REVEAL']
pad_span(R, T['SEARCH_IN'] + 30, [40, 52, 59, 63, 66, 71], MU['pad'] - 1, 2000, 0.08)

# PRODUCT — structured rhythm
progression(T['SEARCH_IN'], T['PROMPT_FOLD'], [EMAJ9, CSM9, AMAJ9, BSUS], 1.0, 0, 1500)
drums(T['RESULTS'], T['PROMPT_FOLD'], kick=True, hats=1)

# BUILD PROMPT — harmonic lift: A → B, rising 16th arpeggio, drums halftime; silence at READY
mid = (T['PROMPT_FOLD'] + T['PROMPT_READY']) // 2
pad_span(T['PROMPT_FOLD'], mid, AMAJ9, MU['pad'] + 1, 2000)
pad_span(mid, T['PROMPT_READY'], BSUS, MU['pad'] + 2, 2600)
bass(T['PROMPT_FOLD'], T['PROMPT_READY'], 33, -3, 1.0)
arp = [64, 66, 71, 73, 76, 78, 83, 85]
for k, fr in enumerate(beats(T['PROMPT_FOLD'] + 8, T['PROMPT_READY'] - 2, 0.25)):
    music.put(pluck_v(hz(arp[k % 8] + (12 if k >= 16 else 0)), 0.3, 0.07, 3500), fr, MU['arp'] + min(6, k * 0.15), 0.3 * (-1) ** k)
drums(T['PROMPT_FOLD'], T['PROMPT_READY'], kick=True, hats=0, gain=-3)
music.put(sweep_v((T['PROMPT_READY'] - T['PROMPT_FOLD']) / FPS, 400, 4500, 'rise', 2.5), T['PROMPT_FOLD'], MU['riser'])
# (PROMPT_READY → PROMPT_COMPRESS: the music breathes out — only reverb tails)

# BUILDER — calm, then momentum on the click
pad_span(T['PROMPT_COMPRESS'], T['BUILDER_SELECTED'], EMAJ9, MU['pad'] - 2, 1200, 0.4)
for j, fr in enumerate(beats(T['PROMPT_COMPRESS'] + 10, T['BUILDER_SELECTED'], 0.5)):
    music.put(pluck_v(hz([71, 68, 66, 64][j % 4]), 0.5, 0.2, 2200), fr, MU['pluck'] - 3, 0.2 * (-1) ** j)
M0 = T['BUILDER_SELECTED']
progression(M0, T['LOOP_IN'], [EMAJ9, CSM9, AMAJ9, BSUS], 1.0, 1, 1700)
drums(M0, T['LOOP_IN'], kick=True, hats=2, clap=True)

# LOOP — a hit on every word, then a wide chord on Repeat
for fr in T['LOOP_WORDS']:
    music.put(kick_v(1.2), fr, MU['kick'] + 1)
    music.put(pad([40, 52, 59, 64], 0.5, 1800, 0.005, 0.3), fr, MU['pad'] + 3)
pad_span(T['LOOP_REPEAT'], T['FINAL_BRAND'], [40, 52, 59, 63, 66, 71], MU['pad'] + 3, 2400, 0.02)
music.put(clap_v(), T['LOOP_REPEAT'], MU['clap'] + 2)

# FINAL — resolved, wide, no drums
pad_span(T['FINAL_BRAND'], T['durationInFrames'] + 30, [28, 40, 52, 59, 63, 66, 71], MU['pad'] + 2, 2600, 0.15)

# ─────────────────────────── REVERB + DUCK + MASTER ───────────────────────────


def make_ir(d=2.2):
    t = tt(d)
    irs = []
    for _ in range(2):
        n = noise(d) * np.exp(-t / 0.55)
        irs.append(lp(n, 6500) * np.minimum(1, t / 0.008))
    ir = np.vstack(irs)
    return ir / np.sqrt(np.sum(ir ** 2))


ir = make_ir()
wet = np.vstack([fftconvolve(verb_send.buf[c], ir[c])[:N] for c in range(2)])
music.buf += wet * db(M['reverbReturn'])

# Sidechain: music ducks under the voice (fast attack, smooth release)
env = maximum_filter1d(voice_env, int(0.04 * SR))
a, r = np.exp(-1 / (0.01 * SR)), np.exp(-1 / (0.28 * SR))
sm = np.empty_like(env)
cur = 0.0
for i in range(0, N, 32):  # control-rate smoothing (decimated for speed)
    v = env[i]
    cur = v + (cur - v) * (a ** 32 if v > cur else r ** 32)
    sm[i : i + 32] = cur
music.buf *= 1 - (1 - db(M['duckMusic'])) * np.clip(sm, 0, 1)
sfx.buf *= 1 - (1 - db(M['duckSfx'])) * np.clip(sm, 0, 1)


def measure_lufs(x):
    tmp = os.path.join(ROOT, 'renders', '_lufs.wav')
    sf.write(tmp, x.T.astype(np.float32), SR)
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.remove(tmp)
    return float(json.loads(out[out.rfind('{') : out.rfind('}') + 1])['input_i'])


def limit(x, ceiling_db):
    ceiling = db(ceiling_db)
    g = np.minimum(1.0, ceiling / np.maximum(np.max(np.abs(x), axis=0), 1e-9))
    g = minimum_filter1d(g, int(0.002 * SR) * 2 + 1)
    rel = np.exp(-1 / (0.06 * SR))
    out = np.empty_like(g)
    cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else g[i] + (cur - g[i]) * rel
        out[i] = cur
    return x * out


dur_n = int(round(T['durationInFrames'] / FPS * SR))
os.makedirs(os.path.join(ROOT, 'public/audio/stems'), exist_ok=True)
for variant in ('organic', 'paid'):
    extra = Bus()
    if variant == 'paid':
        extra.put(tick_v(Gs6, 0.012), T['FINAL_CTA'] + 8, SX['tick'] - 3)
    stems = {'voice': voice.buf, 'music': music.buf, 'sfx': sfx.buf + extra.buf}
    mix = sum(stems.values())
    mix = np.vstack([hp(ch, 28) for ch in mix])[:, :dur_n]
    nf = int(0.15 * SR)
    mix[:, -nf:] *= np.linspace(1, 0, nf) ** 2
    pre = mix / np.max(np.abs(mix)) * 0.5
    gain = db(M['masterLufs'] - measure_lufs(pre)) * 0.5 / np.max(np.abs(mix))
    out = limit(mix * gain, M['truePeak'] - 0.9)
    sf.write(os.path.join(ROOT, f'public/audio/mix-{variant}.wav'), out.T.astype(np.float32), SR, subtype='PCM_24')
    if variant == 'organic':
        for name, s in stems.items():
            sf.write(os.path.join(ROOT, f'public/audio/stems/{name}.wav'), (s[:, :dur_n] * gain).T.astype(np.float32), SR, subtype='PCM_24')
    print('wrote', variant, f'{out.shape[1] / SR:.3f}s')
