#!/usr/bin/env python3
"""MORPH ad — music + SFX (no voice), every cue on a frame from src/morph/beats.json.

Reuses the synth voices of build_audio.py (everything above its VOICE section).
Output: public/audio/morph-organic.wav, morph-paid.wav (48 kHz, -14 LUFS, -1 dBTP).
"""
import json
import os

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
src = open(os.path.join(HERE, 'build_audio.py')).read()
ns: dict = {'__file__': os.path.join(HERE, 'build_audio.py'), '__name__': 'synth'}
exec(src[: src.index('# ─────────────────────────── VOICE')], ns)
for k in ('lp', 'hp', 'bp', 'noise', 'edges', 'hz', 'tt', 'db', 'key_v', 'click_v', 'hover_v', 'tick_v', 'lock_v', 'sweep_v', 'sub_v', 'bell_v', 'pluck_v', 'kick_v', 'clap_v', 'hat_v', 'pad', 'saw'):
    globals()[k] = ns[k]

B = json.load(open(os.path.join(ROOT, 'src/morph/beats.json')))
SR = 48000
FPS = B['fps']
N = int(round(B['durationInFrames'] / FPS * SR))
BF = 60 / B['bpm'] * FPS  # frames per beat
ns['N'] = N + SR  # buses inside the synth namespace size from N
rng = np.random.default_rng(11)


class Bus:
    def __init__(self):
        self.buf = np.zeros((2, N + SR))

    def put(self, sig, frame, g, pan=0.0):
        s0 = int(round(frame / FPS * SR))
        if sig.ndim == 1:
            th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
            sig = np.vstack([sig * np.cos(th), sig * np.sin(th)]) * np.sqrt(2)
        if s0 < 0:
            sig, s0 = sig[:, -s0:], 0
        e = min(self.buf.shape[1], s0 + sig.shape[1])
        if e > s0:
            self.buf[:, s0:e] += sig[:, : e - s0] * db(g)


mus, fx = Bus(), Bus()


def pop_v(f0=520, f1=180, d=0.09):
    t = tt(d)
    ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, len(t))) / SR
    return edges(np.sin(ph) * np.exp(-t / (d * 0.35)) + hp(noise(d), 3000) * np.exp(-t / 0.002) * 0.15)


def shimmer_v(d=0.8, f0=2000, f1=9000):
    t = tt(d)
    s = np.zeros_like(t)
    for _ in range(30):
        o = rng.uniform(0, d * 0.7)
        f = rng.uniform(f0, f1)
        s += np.sin(2 * np.pi * f * t) * np.exp(-np.maximum(0, t - o) / 0.03) * (t >= o) * rng.uniform(0.1, 0.4)
    return edges(s * np.sin(np.pi * t / d), r=0.05)


hz_ = hz
E5, Fs5, Gs5, B5, Cs6, E6, Fs6, Gs6, B6, E7 = (hz_(n) for n in (76, 78, 80, 83, 85, 88, 90, 92, 95, 100))

# ─────────────────────────── SFX ───────────────────────────
fx.put(sweep_v(0.5, 300, 2500, 'fall', 1.2), B['BAR_IN'], -24)
fx.put(sub_v(light=True), B['BAR_IN'] + 4, -24)
nkeys = len(B['TYPE_TEXT'])
for i in range(nkeys):
    if B['TYPE_TEXT'][i] != ' ' or i % 2 == 0:
        fx.put(key_v(0.9), B['TYPE_START'] + i * B['TYPE_STEP'], -25 + rng.uniform(-2, 1), rng.uniform(-0.15, 0.15))
fx.put(click_v(), B['CHIP_OPEN'], -20)
fx.put(sweep_v(0.18, 900, 3500, 'bell', 1.3), B['CHIP_OPEN'] + 1, -30)
for i, h in enumerate(B['MENU_HOVERS']):
    fx.put(hover_v(880 + i * 60, 1180 + i * 60), h, -33)
fx.put(click_v(), B['MENU_SELECT'], -20)
fx.put(tick_v(Gs6, 0.03), B['MENU_SELECT'] + 2, -24)
fx.put(hover_v(700, 1000), B['SEND'] - 12, -31)
fx.put(click_v(deep=True), B['SEND'], -16)
# the slab tilts away: rising air, then it lands as a switch (thud + clack)
fx.put(sweep_v((B['TILT_END'] - B['SEND']) / FPS, 400, 5200, 'rise', 1.4), B['SEND'] + 1, -19)
fx.put(sub_v(), B['TOGGLE_MORPH'] + 6, -15)
fx.put(lock_v([B5, E6], 0.2), B['TOGGLE_MORPH'] + 8, -22)
for i, p in enumerate(B['PILL']):
    fx.put(sweep_v(13 / FPS, 600, 3000, 'bell', 1.3), p, -27, -0.4 + 0.4 * i)
    fx.put(click_v(), p + 10, -21, -0.4 + 0.4 * i)
    fx.put(tick_v([E6, Gs6, B6][i], 0.025), p + 10, -24, -0.4 + 0.4 * i)
# whip → streaks → convergence
whip = sweep_v(0.45, 500, 7000, 'rise', 1.1)
pp = np.linspace(0, 0.8, len(whip))
fx.put(np.vstack([whip * np.cos((pp + 1) * np.pi / 4), whip * np.sin((pp + 1) * np.pi / 4)]) * np.sqrt(2), B['WHIP'] - 6, -15)
fx.put(shimmer_v(0.9), B['WHIP'] + 4, -27)
ret = sweep_v((B['WORDS'][0][0] - B['WHIP'] - 20) / FPS, 7000, 400, 'rise', 1.2)
fx.put(ret, B['WHIP'] + 20, -22)
fx.put(sub_v(), B['WORDS'][0][0] - 2, -12)
fx.put(bell_v(E6, 1.6, 0.6, 1.2), B['WORDS'][0][0] - 2, -22)
# word morphs: each flip is a flick + a note climbing to the payoff
notes = [B5, Cs6, E6, Fs6, B6]
for i, (at, _) in enumerate(B['WORDS']):
    if i:
        fx.put(sweep_v(0.16, 4000, 900, 'rise', 1.4), at - 9, -27)
    for j in range(5):
        fx.put(tick_v(rng.uniform(2600, 4200), 0.004, 0.03), at + j * 2, -33, rng.uniform(-0.4, 0.4))
    fx.put(pluck_v(notes[i], 0.6, 0.2, 4000), at, -21)
fx.put(bell_v(E6, 1.4, 0.5, 0.8), B['WORDS'][-1][0], -20)
fx.put(bell_v(B6, 1.4, 0.5, 0.8), B['WORDS'][-1][0] + 4, -24)
# squash → line → card
fx.put(sweep_v(14 / FPS, 3500, 250, 'rise', 1.2), B['SQUASH'], -19)
fx.put(sweep_v(0.35, 300, 2800, 'fall', 1.2), B['CARD_POP'], -21)
fx.put(sub_v(light=True), B['CARD_POP'], -20)
for i, at in enumerate(B['CARD_ROWS']):
    fx.put(lock_v([[B5, E6], [Cs6, Gs6], [E6, B6], [Fs6, hz_(97)]][i], 0.2), at, -21 + i * 0.6)
# collapse → mark → burst
fx.put(sweep_v(0.37, 3500, 250, 'rise', 1.2), B['CARD_COLLAPSE'], -18)
fx.put(sub_v(), B['ICON'], -11)
fx.put(pop_v(420, 110, 0.4), B['ICON'], -18)
for j in range(16):
    fx.put(pop_v(rng.uniform(700, 1500), rng.uniform(250, 500), 0.06), B['BURST'] + rng.uniform(0, 8), -24, rng.uniform(-0.8, 0.8))
fx.put(shimmer_v(1.0), B['BURST'], -28)
fx.put(sweep_v(0.37, 2500, 600, 'bell', 1.2), B['SLIDE'], -24, -0.3)
for i in range(10):
    fx.put(tick_v(2400 + i * 140, 0.006, 0.03), B['CTA_IN'] + i * 1.5, -30, 0.3)
fx.put(hover_v(), B['CTA_CLICK'] - 10, -31)
fx.put(click_v(), B['CTA_CLICK'], -16)
fx.put(lock_v([E6, B6], 0.22), B['CTA_CLICK'] + 1, -20)
# fade to black → wordmark assembles → the mark lands
fx.put(sweep_v(0.32, 3000, 200, 'rise', 1.2), B['FADE_BLACK'], -19)
for i in range(11):
    fx.put(tick_v(rng.uniform(1800, 3800), 0.012, 0.05), B['WORDMARK'] + 6 + i * 3.2, -27, rng.uniform(-0.6, 0.6))
fx.put(shimmer_v(1.2, 1500, 7000), B['WORDMARK'], -29)
fx.put(sub_v(), B['MARK'], -12)
for j, (n, p) in enumerate(((E5, -0.35), (B5, 0), (E6, 0.35))):
    fx.put(bell_v(n), B['MARK'] + j * 5, -18 - j * 1.5, p)
fx.put(tick_v(B6, 0.01), B['URL'], -28)

# ─────────────────────────── MUSIC ───────────────────────────
EMAJ9 = [52, 59, 63, 66, 68]
CSM9 = [49, 56, 59, 63, 64]
AMAJ9 = [45, 52, 56, 59, 63]
BSUS = [47, 54, 59, 61, 64]
ROOTS = {id(EMAJ9): 40, id(CSM9): 37, id(AMAJ9): 33, id(BSUS): 35}


def beats(a, b, step=1.0):
    fr = a
    while fr < b - 1:
        yield fr
        fr += BF * step


def pad_span(a, b, notes, g, cut=1400, att=0.3):
    if b > a:
        mus.put(pad(notes, (b - a) / FPS + 0.35, cut, att), a, g)


def prog(a, b, chords, g=-28, cut=1500, bass=True, bass_g=-25):
    span, i, fr = BF * 4, 0, a
    while fr < b - 1:
        c = chords[i % len(chords)]
        e = min(b, fr + span)
        pad_span(fr, e, c, g, cut)
        if bass:
            for k, bf in enumerate(beats(fr, e, 0.5)):
                mus.put(pluck_v(hz_(ROOTS[id(c)]), 0.25, 0.09, 380) * (1 if k % 2 == 0 else 0.7), bf, bass_g)
        fr, i = e, i + 1


def drums(a, b, hats=1, clap=False, g=0):
    for i, fr in enumerate(beats(a, b)):
        mus.put(kick_v(), fr, -19 + g)
        if clap and i % 2 == 1:
            mus.put(clap_v(), fr, -26 + g)
        if hats >= 1:
            mus.put(hat_v(), fr + BF / 2, -34 + g, 0.25)
        if hats >= 2:
            mus.put(hat_v(), fr + BF / 4, -39 + g, -0.2)
            mus.put(hat_v(), fr + 3 * BF / 4, -39 + g, -0.2)


# intro: curious, sparse
pad_span(0, B['SEND'], EMAJ9, -31, 1000, 0.8)
for k, fr in enumerate(beats(B['TYPE_START'], B['SEND'] - 4, 0.5)):
    mus.put(pluck_v(hz_([64, 71, 68, 75, 73, 71][k % 6]), 0.5, 0.18, 2400), fr, -31, 0.3 * (-1) ** k)
# the tilt: riser into the land
mus.put(sweep_v((B['TOGGLE_MORPH'] - B['SEND']) / FPS, 300, 4000, 'rise', 2.5), B['SEND'], -25)
# switch: pulse starts on the land
prog(B['TOGGLE_MORPH'], B['WHIP'], [CSM9, AMAJ9], -29, 1300)
drums(B['TOGGLE_READY'], B['WHIP'], hats=1, g=-2)
# streaks: breath — no drums, a held suspended chord
pad_span(B['WHIP'], B['WORDS'][0][0], BSUS, -27, 2400, 0.05)
# words: the drop
prog(B['WORDS'][0][0], B['SQUASH'], [EMAJ9, CSM9], -27, 1800)
drums(B['WORDS'][0][0], B['SQUASH'], hats=2, clap=True)
for k, fr in enumerate(beats(B['WORDS'][0][0], B['SQUASH'], 0.25)):
    mus.put(pluck_v(hz_([64, 66, 71, 73, 76, 78, 83, 85][k % 8]), 0.25, 0.06, 3200), fr, -32, 0.3 * (-1) ** k)
# card: groove continues, lighter
prog(B['CARD_POP'], B['CARD_COLLAPSE'], [AMAJ9, BSUS], -28, 1600)
drums(B['CARD_POP'], B['CARD_COLLAPSE'], hats=1, clap=True, g=-1)
# mark + CTA: full
prog(B['ICON'], B['FADE_BLACK'], [EMAJ9, CSM9], -27, 1900)
drums(B['ICON'], B['FADE_BLACK'], hats=2, clap=True)
# black: silence. wordmark: a wide resolved chord
pad_span(B['WORDMARK'], B['durationInFrames'] + 40, [28, 40, 52, 59, 63, 66, 71], -26, 2600, 0.6)

# ─────────────────────────── master ───────────────────────────
import subprocess  # noqa: E402

from scipy.ndimage import minimum_filter1d  # noqa: E402


def lufs(x):
    tmp = os.path.join(ROOT, 'renders', '_m.wav')
    sf.write(tmp, x.T.astype(np.float32), SR)
    o = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.remove(tmp)
    return float(json.loads(o[o.rfind('{') : o.rfind('}') + 1])['input_i'])


def limit(x, c):
    g = np.minimum(1.0, c / np.maximum(np.max(np.abs(x), axis=0), 1e-9))
    g = minimum_filter1d(g, 193)
    rel = np.exp(-1 / (0.06 * SR))
    out, cur = np.empty_like(g), 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else g[i] + (cur - g[i]) * rel
        out[i] = cur
    return x * out


os.makedirs(os.path.join(ROOT, 'public/audio'), exist_ok=True)
for variant in ('organic', 'paid'):
    mix = (mus.buf + fx.buf)[:, :N]
    mix = np.vstack([hp(c, 28) for c in mix])
    nf = int(0.2 * SR)
    mix[:, -nf:] *= np.linspace(1, 0, nf) ** 2
    pre = mix / np.max(np.abs(mix)) * 0.5
    g = db(-12.9 - lufs(pre)) * 0.5 / np.max(np.abs(mix))
    out = limit(mix * g, db(-1.9))
    sf.write(os.path.join(ROOT, f'public/audio/morph-{variant}.wav'), out.T.astype(np.float32), SR, subtype='PCM_24')
    print('wrote', variant, f'{out.shape[1] / SR:.3f}s')
