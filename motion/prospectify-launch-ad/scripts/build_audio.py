#!/usr/bin/env python3
"""
Prospectify launch ad — music + SFX, synthesized from scratch.

Every cue is placed from src/constants/timeline.json (the same frame constants the
Remotion scenes use), so sound and motion are frame-accurate by construction.
Levels come from src/constants/mix.json.

Output: public/audio/mix-organic.wav, public/audio/mix-paid.wav (48 kHz / 24-bit stereo, -14 LUFS)
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile
from scipy.ndimage import minimum_filter1d
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, 'src/constants/timeline.json')))
M = json.load(open(os.path.join(ROOT, 'src/constants/mix.json')))

SR = M['sampleRate']
FPS = T['fps']
N = int(round(T['durationInFrames'] / FPS * SR))
BEAT = 60 / T['bpm']  # seconds
rng = np.random.default_rng(44)


def fs(frame):
    return int(round(frame / FPS * SR))


def db(x):
    return 10 ** (x / 20)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def sos(kind, f, order=2):
    return butter(order, f, kind, fs=SR, output='sos')


def lp(x, f, o=2):
    return sosfilt(sos('lowpass', f, o), x)


def hp(x, f, o=2):
    return sosfilt(sos('highpass', f, o), x)


def bp(x, lo, hi, o=2):
    return sosfilt(sos('bandpass', [lo, hi], o), x)


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def fade_edges(x, a=0.001, r=0.004):
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    x = x.copy()
    x[:na] *= np.linspace(0, 1, na)
    x[-nr:] *= np.linspace(1, 0, nr)
    return x


class Bus:
    def __init__(self):
        self.buf = np.zeros((2, N))

    def place(self, sig, frame, gain_db, pan=0.0, offset=0.0):
        """Mono or stereo signal at an exact frame. pan ∈ [-1, 1] (constant power)."""
        start = fs(frame) + int(round(offset * SR))
        if sig.ndim == 1:
            th = (pan + 1) * np.pi / 4
            sig = np.vstack([sig * np.cos(th), sig * np.sin(th)]) * np.sqrt(2)
        if start < 0:
            sig = sig[:, -start:]
            start = 0
        end = min(N, start + sig.shape[1])
        if end > start:
            self.buf[:, start:end] += sig[:, : end - start] * db(gain_db)


S = M['sfx']
MU = M['music']
sfx = Bus()
music = Bus()

# ───────────────────────────── SFX voices ──────────────────────────────


def key_voice(soft=1.0):
    t = tt(0.035)
    click = hp(noise(0.035), 2600) * np.exp(-t / 0.0035)
    body = np.sin(2 * np.pi * rng.uniform(170, 230) * t) * np.exp(-t / 0.010) * 0.55
    tone = np.sin(2 * np.pi * rng.uniform(2900, 3500) * t) * np.exp(-t / 0.005) * 0.25
    return fade_edges((click * 0.6 + body + tone) * soft)


def click_voice(deep=False):
    t = tt(0.09)
    trans = hp(noise(0.09), 1800) * np.exp(-t / 0.0025)
    snap = np.sin(2 * np.pi * (1500 if deep else 2100) * t) * np.exp(-t / 0.009) * 0.6
    body = np.sin(2 * np.pi * (170 if deep else 300) * t) * np.exp(-t / (0.03 if deep else 0.018)) * 0.9
    sig = trans * 0.7 + snap + body
    # release click, quieter, 45 ms later
    rel = np.zeros_like(sig)
    o = int(0.045 * SR)
    r = hp(noise(0.02), 2500) * np.exp(-tt(0.02) / 0.002) * 0.25
    rel[o : o + len(r)] = r
    return fade_edges(sig + rel)


def hover_voice(f0=880, f1=1180):
    t = tt(0.08)
    fr = np.linspace(f0, f1, len(t))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    return fade_edges(np.sin(ph) * np.sin(np.pi * t / t[-1]) ** 2)


def tick_voice(freq, decay=0.012, dur=0.06):
    t = tt(dur)
    s = np.sin(2 * np.pi * freq * t) * np.exp(-t / decay)
    s += 0.25 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t / (decay * 0.6))
    s += hp(noise(dur), 4500) * np.exp(-t / 0.0015) * 0.3
    return fade_edges(s)


def lock_voice(freqs, decay=0.22, hero=False):
    dur = 1.4 if hero else 0.6
    t = tt(dur)
    s = np.zeros_like(t)
    for i, f in enumerate(freqs):
        s += np.sin(2 * np.pi * f * t) * np.exp(-t / (decay * (1.0 - 0.15 * i))) * (0.8 ** i)
    s *= np.minimum(1, t / 0.0015)
    s += hp(noise(dur), 3000) * np.exp(-t / 0.002) * 0.35  # latch transient
    s += np.sin(2 * np.pi * 240 * t) * np.exp(-t / 0.02) * 0.5  # mechanical body
    if hero:
        s += np.sin(2 * np.pi * 82.4 * t) * np.exp(-t / 0.35) * 0.9  # E2 floor
        s += np.sin(2 * np.pi * freqs[0] * 2 * t) * np.exp(-t / 0.5) * 0.18  # shimmer
    return fade_edges(s, r=0.05)


def svf_bandpass(x, fc, q=1.4):
    """Time-varying state-variable band-pass (fc array in Hz)."""
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


def sweep_voice(dur, f0, f1, shape='rise', q=1.6):
    """Air-movement sweep whose filter travel tracks the visual velocity."""
    t = tt(dur)
    u = t / dur
    fc = f0 * (f1 / f0) ** u
    s = svf_bandpass(noise(dur), fc, q)
    if shape == 'rise':  # accelerating into an arrival
        env = u ** 2.2
    elif shape == 'fall':
        env = (1 - u) ** 1.6
    else:  # bell
        env = np.sin(np.pi * u) ** 1.5
    s = s * env
    return fade_edges(s / (np.max(np.abs(s)) + 1e-9), a=0.003, r=0.006)


def sub_hit_voice(light=False):
    dur = 1.0
    t = tt(dur)
    fr = 42 + 30 * np.exp(-t / 0.05)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.tanh(1.6 * np.sin(ph) * np.exp(-t / (0.35 if light else 0.6)))
    s += lp(noise(dur), 220) * np.exp(-t / 0.03) * 1.2
    s += hp(noise(dur), 3000) * np.exp(-t / 0.003) * 0.2
    return fade_edges(s, r=0.1)


def bell_voice(freq, dur=1.6, decay=0.55, idx=1.6):
    t = tt(dur)
    mod = np.sin(2 * np.pi * freq * 3.5 * t) * idx * np.exp(-t / 0.12)
    s = np.sin(2 * np.pi * freq * t + mod) * np.exp(-t / decay)
    s += 0.3 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t / (decay * 0.5))
    return fade_edges(s * np.minimum(1, t / 0.002), r=0.1)


def tab_voice():
    t = tt(0.05)
    s = bp(noise(0.05), rng.uniform(700, 1100), 4500) * np.exp(-t / 0.006)
    s += np.sin(2 * np.pi * rng.uniform(500, 700) * t) * np.exp(-t / 0.012) * 0.5
    return fade_edges(s)


def pluck_voice(freq, dur=0.5, decay=0.16, bright=2600):
    t = tt(dur)
    s = np.zeros_like(t)
    for h in range(1, 9):
        s += np.sin(2 * np.pi * freq * h * t) / h * np.exp(-t / (decay / (1 + 0.25 * h)))
    return fade_edges(lp(s, bright), r=0.05)


# Notes
def hz(n):
    """MIDI note → Hz."""
    return 440 * 2 ** ((n - 69) / 12)


E5, Fs5, Gs5, A5, B5, Cs6, Ds6, E6, Fs6, Gs6, B6, E7 = (hz(n) for n in (76, 78, 80, 81, 83, 85, 87, 88, 90, 92, 95, 100))

# ───────────────────────────── SFX placement ──────────────────────────

# HOOK — keys, enter, DONE (quick resolved stab), then the client keys hesitate into silence.
room = lp(noise(T['CLIENT_STALL'] / FPS), 900) * 0.02
room[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
sfx.place(room, 0, -24)
for i, k in enumerate(T['BUILD_KEYS']):
    sfx.place(key_voice(), k, S['key'] + rng.uniform(-1.5, 1.5), pan=rng.uniform(-0.15, 0.15))
sfx.place(click_voice(), T['BUILD_ENTER'], S['click'])
sfx.place(lock_voice([E6, B6]), T['BUILD_DONE'], S['lock'])
for n in (E5, Gs5, B5):
    sfx.place(pluck_voice(n, 0.6, 0.2), T['BUILD_DONE'], MU['pluck'] + 2)
sfx.place(sweep_voice(0.12, 1800, 5000, 'bell'), T['HOOK_CLEAR'] - 2, S['sweep'] - 6)
for i, k in enumerate(T['CLIENT_KEYS']):
    # later keys get softer and less certain
    soft = 1.0 - 0.45 * (i / len(T['CLIENT_KEYS']))
    sfx.place(key_voice(soft), k, S['key'] + rng.uniform(-1.5, 1.0), pan=rng.uniform(-0.15, 0.15))
# CLIENT_STALL → CHAOS_START: deliberate near-silence.

# CHAOS — every cut is a tab; a tense filtered riser; it collapses into a suck and true silence.
for i, c in enumerate(T['CHAOS_CUTS']):
    sfx.place(tab_voice(), c, S['tabCut'] + i * 0.4, pan=rng.uniform(-0.5, 0.5))
riser_dur = (T['CHAOS_COLLAPSE'] - T['CHAOS_START']) / FPS
sfx.place(sweep_voice(riser_dur, 300, 2600, 'rise', q=3), T['CHAOS_START'], MU['riser'] + 4)
for k in range(int(riser_dur / (BEAT / 4))):
    sfx.place(tick_voice(1400 + k * 60, 0.006), T['CHAOS_START'] + k * FPS * BEAT / 4, S['tick'] - 4)
collapse_dur = (T['CHAOS_END'] - T['CHAOS_COLLAPSE']) / FPS
suck = sweep_voice(collapse_dur, 4000, 250, 'rise', q=1.2)
suck[-int(0.002 * SR):] = 0  # hard stop into silence
sfx.place(suck, T['CHAOS_COLLAPSE'], S['sweep'])

# REVEAL — sub hit + the Prospectify signature motif (E5 → B5 → E6, a rising, resolved P).
def motif(frame, gain, spread=0.35):
    for j, (n, pan) in enumerate(((E5, -spread), (B5, 0.0), (E6, spread))):
        sfx.place(bell_voice(n), frame + j * 5, gain - j * 1.5, pan=pan)


sfx.place(sub_hit_voice(), T['PROSPECTIFY_REVEAL'], S['subHit'])
motif(T['PROSPECTIFY_REVEAL'], S['motif'])
sfx.place(sweep_voice(0.3, 2500, 600, 'bell'), T['LOGO_TO_HEADER'], S['sweep'] - 6)
sfx.place(sweep_voice(0.2, 800, 3500, 'bell'), T['SEARCH_BAR_IN'], S['sweep'] - 8)

# SEARCH
for k in T['NICHE_KEYS'] + T['CITY_KEYS']:
    sfx.place(key_voice(0.9), k, S['key'] - 1, pan=rng.uniform(-0.1, 0.1))
sfx.place(hover_voice(), T['SEARCH_HOVER'], S['hover'])
sfx.place(click_voice(), T['SEARCH_CLICK'], S['click'])
scan_frames = range(T['SEARCH_CLICK'] + 1, T['SCAN_END'], 1)
for j, fr in enumerate(scan_frames):
    sfx.place(tick_voice(1800 + j * 120, 0.004, 0.03), fr, S['scan'], pan=-0.6 + 1.2 * j / len(scan_frames))
# Results rank in top→bottom: descending pitch follows the eye.
for j, fr in enumerate(T['RESULT_CARDS']):
    sfx.place(tick_voice([B6, Gs6, Fs6, E6, Cs6][j], 0.014), fr, S['resultTick'] - j * 0.8)
sfx.place(hover_voice(760, 980), T['LEAD_HOVER'], S['hover'])
sfx.place(click_voice(deep=True), T['LEAD_SELECTED'], S['clickDeep'])
sfx.place(sweep_voice((T['FILE_EXPAND_END'] - T['LEAD_SELECTED']) / FPS, 500, 2400, 'bell', q=1.2), T['LEAD_SELECTED'] + 1, S['sweep'])

# READY CHAIN — each lock steps up the scale (escalation you can hear).
sfx.place(lock_voice([B5, E6]), T['WHY_READY'], S['lock'])
sfx.place(lock_voice([Cs6, Gs6]), T['CONTACT_READY'], S['lock'] + 0.5)
for fr in range(T['OUTREACH_TYPE_START'], T['OUTREACH_TYPE_END'], 2):
    sfx.place(key_voice(0.7), fr, S['key'] - 3, pan=rng.uniform(-0.2, 0.2))
sfx.place(lock_voice([E6, B6]), T['OUTREACH_READY'], S['lock'] + 1)
sfx.place(hover_voice(), T['COPY_HOVER'], S['hover'])
sfx.place(click_voice(), T['COPY_CLICK'], S['click'])
sfx.place(tick_voice(E6 * 1.333, 0.03), T['COPY_CONFIRM'], S['tick'] + 2)
sfx.place(tick_voice(E6 * 1.78, 0.04), T['COPY_CONFIRM'] + 3, S['tick'] + 1)

# PROMPT — fold (down) / unfold (up), data texture, rising bed, hero lock.
sfx.place(sweep_voice(9 / FPS, 3000, 400, 'rise'), T['PROMPT_FOLD'], S['sweep'] - 2)
sfx.place(sweep_voice(13 / FPS, 400, 3500, 'fall'), T['PROMPT_FOLD'] + 9, S['sweep'] - 2)
for fr in range(T['PROMPT_TOKEN_TICKS_START'], T['PROMPT_TOKEN_TICKS_END'], 2):
    sfx.place(tick_voice(rng.uniform(2600, 4200), 0.004, 0.03), fr, S['dataTexture'] + rng.uniform(-3, 2), pan=rng.uniform(-0.35, 0.35))
for j, fr in enumerate(T['PROMPT_LINES']):
    sfx.place(tick_voice([E6, Fs6, Gs6, B6, Cs6 * 2, Ds6 * 2, E7][j], 0.01), fr, S['tick'] - 2)
sfx.place(lock_voice([E6, B6, E7], decay=0.4, hero=True), T['PROMPT_READY'], S['lockHero'])
sfx.place(sub_hit_voice(light=True), T['PROMPT_READY'], S['subHit'] - 7)

# BUILDER CHOICE — calm. Four logo ticks (soft, pentatonic), hover lifts, one decisive click.
sfx.place(sweep_voice(0.3, 2500, 700, 'bell'), T['PROMPT_COMPRESS'], S['sweep'] - 8)
for j, fr in enumerate(T['BUILDER_LOGOS']):
    sfx.place(tick_voice([B5, Cs6, E6, Fs6][j], 0.02), fr, S['tick'] - 1, pan=-0.45 + 0.3 * j)
for j, fr in enumerate(T['BUILDER_HOVERS']):
    sfx.place(hover_voice(900 - j * 40, 1150 - j * 40), fr, S['hover'], pan=0.45 - 0.3 * j)
sfx.place(click_voice(), T['BUILDER_SELECTED'], S['click'] + 1, pan=-0.45)
sfx.place(lock_voice([B5, E6], decay=0.18), T['BUILDER_SELECTED'] + 1, S['lock'] - 3, pan=-0.3)
# Prompt flies into the builder (screen-left): sweep travels with it.
send = sweep_voice((T['PROMPT_ARRIVE'] - T['PROMPT_SEND']) / FPS, 600, 5000, 'rise', q=1.3)
pan_path = np.linspace(0.0, -0.55, len(send))
sfx.place(np.vstack([send * np.cos((pan_path + 1) * np.pi / 4), send * np.sin((pan_path + 1) * np.pi / 4)]) * np.sqrt(2), T['PROMPT_SEND'], S['sweep'] + 1)
sfx.place(sub_hit_voice(light=True), T['PROMPT_ARRIVE'], S['subHit'] - 10)

# BUILD — abstract construction: structure, type, image, sections, CTA.
for j, k in enumerate(['BUILD_NAV', 'BUILD_HERO', 'BUILD_IMAGE', 'BUILD_SECTIONS', 'BUILD_CTA']):
    fr = T[k]
    sfx.place(tick_voice([hz(79), B5, hz(86), E6, hz(91)][j], 0.018), fr, S['construct'])
    sfx.place(click_voice()[: int(0.03 * SR)], fr, S['construct'] - 6)
sfx.place(lock_voice([E6, Gs6, B6], decay=0.3), T['SITE_READY'], S['lock'] + 2)

# SELL
sfx.place(sweep_voice(0.27, 3000, 500, 'bell'), T['SELL_START'], S['sweep'] - 4)
sfx.place(hover_voice(), T['MARK_SOLD_HOVER'], S['hover'])
sfx.place(click_voice(), T['MARK_SOLD_CLICK'], S['click'])
for j, n in enumerate((E5, Gs5, B5, E6)):
    sfx.place(bell_voice(n, 1.4, 0.5, idx=0.8), T['SOLD'] + j, S['success'] - j * 1.2, pan=-0.2 + 0.13 * j)

# FINAL — collapse, motif returns, CTA impact.
sfx.place(sweep_voice(10 / FPS, 3500, 300, 'rise'), T['FINAL_BRAND'] - 10, S['sweep'] - 2)
sfx.place(sub_hit_voice(), T['FINAL_BRAND'], S['subHit'] - 1)
motif(T['FINAL_BRAND'], S['motif'] - 1, spread=0.5)
sfx.place(sub_hit_voice(light=True), T['FINAL_CTA'], S['ctaImpact'])
sfx.place(click_voice(), T['FINAL_CTA'], S['ctaImpact'] - 2)
sfx.place(bell_voice(E6, 1.0, 0.35, 0.6), T['FINAL_CTA'], S['ctaImpact'] - 8)
sfx.place(tick_voice(B6, 0.01), T['FINAL_URL'], S['tick'] - 4)

# ───────────────────────────── Music ──────────────────────────────────
# 120 BPM, E major. Enters on the reveal. Bars of 2 s (120 frames) from PROSPECTIFY_REVEAL.
R = T['PROSPECTIFY_REVEAL']
BAR = int(4 * BEAT * FPS)
CHORDS = [  # (start frame, midi notes of pad voicing, bass root midi)
    (R, [52, 59, 63, 66, 68], 40),  # Emaj9
    (R + BAR, [49, 56, 59, 63, 64], 37),  # C#m9
    (R + 2 * BAR, [45, 52, 56, 59, 63], 33),  # Amaj9
    (R + 3 * BAR, [47, 54, 59, 61, 64], 35),  # Bsus — tension under the prompt reveal
    (T['BUILDER_SELECTED'], [52, 59, 63, 66, 68], 40),  # resolves on the builder click
    (T['FINAL_BRAND'], [40, 52, 59, 63, 66, 71], 28),  # wide Emaj9 for the end frame
]


def saw(freq, t, harmonics=10, detune=1.0):
    s = np.zeros_like(t)
    for h in range(1, harmonics + 1):
        s += np.sin(2 * np.pi * freq * detune * h * t + h * 0.7) / h
    return s


# Pad
for i, (start, notes, _) in enumerate(CHORDS):
    end = CHORDS[i + 1][0] if i + 1 < len(CHORDS) else T['durationInFrames']
    dur = (end - start) / FPS + 0.25
    t = tt(dur)
    L = np.zeros_like(t)
    Rr = np.zeros_like(t)
    for n in notes:
        L += saw(hz(n), t, 8, 2 ** (-7 / 1200))
        Rr += saw(hz(n), t, 8, 2 ** (7 / 1200))
    cut = 1400 if start < T['FINAL_BRAND'] else 2200
    L, Rr = lp(L, cut), lp(Rr, cut)
    env = np.minimum(1, t / (0.25 if i else 0.6)) * np.minimum(1, (dur - t) / 0.25)
    # Drop the pad for the reveal's first beat so the motif reads clean
    music.place(np.vstack([L * env, Rr * env]) / len(notes), start, MU['pad'])

# Bass pulse — 8ths, plucky, felt more than heard
for i, (start, _, root) in enumerate(CHORDS[:-1]):
    end = CHORDS[i + 1][0]
    fr = start + 30  # enter one beat after the reveal hit
    if i > 0:
        fr = start
    step = FPS * BEAT / 2
    k = 0
    while fr < end - 2:
        accent = 1.0 if k % 2 == 0 else 0.7
        music.place(pluck_voice(hz(root), 0.25, 0.09, 380) * accent, fr, MU['bass'])
        fr += step
        k += 1

# Kick: from the results onward; out for the calm builder choice; back for the build.
def kick_voice():
    t = tt(0.35)
    fr = 48 + 70 * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    return fade_edges(np.sin(ph) * np.exp(-t / 0.14) + hp(noise(0.35), 3000) * np.exp(-t / 0.002) * 0.2, r=0.03)


def hat_voice():
    t = tt(0.06)
    return fade_edges(hp(noise(0.06), 7500) * np.exp(-t / 0.018))


kick_env = np.zeros(N)
beat_frames = np.arange(T['RESULTS_REVEAL'], T['FINAL_BRAND'], FPS * BEAT)
calm = (T['PROMPT_COMPRESS'], T['PROMPT_ARRIVE'])
for bfr in beat_frames:
    if calm[0] <= bfr < calm[1]:
        continue
    music.place(kick_voice(), bfr, MU['pulseKick'])
    s0 = fs(bfr)
    e = np.exp(-tt(0.25) / 0.09)
    kick_env[s0 : s0 + len(e)] = np.maximum(kick_env[s0 : s0 + len(e)], e[: max(0, min(len(e), N - s0))])
    if bfr >= T['WHY_READY']:
        music.place(hat_voice(), bfr + FPS * BEAT / 2, MU['hat'], pan=0.25)

# 16th-note pluck arpeggio rising under the prompt assembly
arp = [64, 66, 71, 73, 76, 78, 83, 85]
step16 = FPS * BEAT / 4
fr = T['PROMPT_LINES'][0]
k = 0
while fr < T['PROMPT_READY']:
    music.place(pluck_voice(hz(arp[k % len(arp)] + 12 * (k // len(arp) > 0)), 0.3, 0.07, 3500), fr, MU['pluck'] + k * 0.12, pan=(-0.3 if k % 2 else 0.3))
    fr += step16
    k += 1
riser = sweep_voice((T['PROMPT_READY'] - T['PROMPT_LINES'][0]) / FPS, 400, 4000, 'rise', q=2.5)
music.place(riser, T['PROMPT_LINES'][0], MU['riser'])

# Soft plucks in the calm builder moment
for j, fr in enumerate(range(T['PROMPT_COMPRESS'] + 15, T['BUILDER_SELECTED'], 15)):
    music.place(pluck_voice(hz([71, 68, 66, 64][j % 4]), 0.5, 0.2, 2200), fr, MU['pluck'] - 3, pan=0.2 * (-1) ** j)

# Sidechain the pad + bass under the kick (gentle pump)
duck = 1 - 0.45 * kick_env
music.buf *= duck

# ───────────────────────────── Master ─────────────────────────────────


def master(paid=False):
    extra = Bus()
    if paid:
        extra.place(tick_voice(Gs6, 0.012), T['FINAL_CTA'] + 6, S['tick'] - 3)
    mix = music.buf + sfx.buf + extra.buf
    mix = np.vstack([hp(ch, 28) for ch in mix])
    # end fade to avoid a click on the last frame
    nf = int(0.12 * SR)
    mix[:, -nf:] *= np.linspace(1, 0, nf) ** 2
    tmp = os.path.join(ROOT, 'renders', '_premaster.wav')
    os.makedirs(os.path.dirname(tmp), exist_ok=True)
    wavfile.write(tmp, SR, (mix / max(1e-9, np.max(np.abs(mix))) * 0.5).T.astype(np.float32))
    # measure integrated loudness with ffmpeg's EBU R128 meter
    out = subprocess.run(
        ['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'],
        capture_output=True, text=True,
    ).stderr
    meas = json.loads(out[out.rfind('{') : out.rfind('}') + 1])
    gain = db(M['masterLufs'] - float(meas['input_i']))
    x = (mix / max(1e-9, np.max(np.abs(mix))) * 0.5) * gain
    # brickwall limiter (2 ms look-ahead, 60 ms release)
    ceiling = db(M['truePeak'] - 0.9)
    peak = np.max(np.abs(x), axis=0)
    g = np.minimum(1.0, ceiling / np.maximum(peak, 1e-9))
    g = minimum_filter1d(g, int(0.002 * SR) * 2 + 1)
    rel = np.exp(-1 / (0.06 * SR))
    sm = np.empty_like(g)
    cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else g[i] + (cur - g[i]) * rel
        sm[i] = cur
    x = x * sm
    os.remove(tmp)
    return x


os.makedirs(os.path.join(ROOT, 'public/audio'), exist_ok=True)
for variant in ('organic', 'paid'):
    x = master(variant == 'paid')
    pcm = (np.clip(x.T, -1, 1) * (2 ** 31 - 1)).astype(np.int32)
    path = os.path.join(ROOT, f'public/audio/mix-{variant}.wav')
    wavfile.write(path, SR, pcm)
    print('wrote', path, f'{x.shape[1] / SR:.3f}s')
sys.exit(0)
