#!/usr/bin/env python3
"""THE AD — mix: ElevenLabs voice + "Dream keeper" (CC BY, Openverse) + discreet design
→ public/ad/audio/ad-mix.wav (48 kHz, −14 LUFS).

Sound design is deliberately sparse: one impact on frame 0 to stop the scroll, soft locks and pops on
the product beats, and one impact on the offer. No risers (the founder found them repetitive).
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy.ndimage import maximum_filter1d, minimum_filter1d
from scipy.signal import fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), 'final'))
from sonic import SR, click_v, db, hp, hz, key_v, lock_v, lp, noise, pop_v, sub_v, sweep_v, tick_v, tt  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
T = json.load(open(os.path.join(ROOT, 'src/ad/timeline.json')))
FPS, DUR = T['fps'], T['durationInFrames']
N = int(round(DUR / FPS * SR)) + SR
rng = np.random.default_rng(3)
K = lambda k: T[k]  # noqa: E731


def fs(fr):
    return int(round(fr / FPS * SR))


class Bus:
    def __init__(self):
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


voice, music, sfx, verb = Bus(), Bus(), Bus(), Bus()


def mixs(*xs):
    n = max(len(x) for x in xs)
    o = np.zeros(n)
    for x in xs:
        o[: len(x)] += x
    return o


# ── VOICE (one continuous ElevenLabs take) ──
x, sr = sf.read(os.path.join(ROOT, 'public/ad/audio/vo.wav'))
if x.ndim > 1:
    x = x.mean(1)
if sr != SR:
    x = resample_poly(x, SR, sr)
x = hp(x, 90)
x = x + 0.3 * hp(x, 2800) + 0.1 * lp(hp(x, 120), 300)
rms = np.sqrt(np.mean(x[np.abs(x) > 1e-3] ** 2) + 1e-12)
x = x / rms * db(-19)
x = np.tanh(x * 1.6) / 1.6
VO_AT = K('VO_AT')
voice.put(x, VO_AT, 0.0)
verb.put(x, VO_AT, -33)
voice_env = np.zeros(N)
s0 = fs(VO_AT)
voice_env[s0:s0 + len(x)] = np.abs(x[: max(0, N - s0)]) / np.max(np.abs(x))

# ── MUSIC: one continuous performance, soft, no edit ──
src, msr = sf.read(os.path.join(ROOT, 'renders/_music/dreamkeeper.wav'))
if src.ndim == 1:
    src = np.vstack([src, src]).T
if msr != SR:
    src = resample_poly(src, SR, msr, axis=0)
src = src.T
OFF = int(float(os.environ.get('MUSIC_OFFSET', '30')) * SR)  # into the track, where it is full
seg = src[:, OFF:OFF + N].copy()
if seg.shape[1] < N:
    seg = np.pad(seg, ((0, 0), (0, N - seg.shape[1])))
nin = int(0.5 * SR)
seg[:, :nin] *= np.linspace(0, 1, nin) ** 0.6
e0 = fs(DUR) - int(1.6 * SR)
seg[:, e0:] *= np.linspace(1, 0, seg.shape[1] - e0) ** 1.4
music.put(seg, 0, 0.0)


def riser(dur_s, gain, at, peak_extra=0.0):
    """noise riser that peaks exactly on `at` (frames)."""
    n = int(dur_s * SR)
    t = np.arange(n) / SR
    env = (t / dur_s) ** 2.2
    sw = hp(noise(dur_s), 900) * env
    sw += 0.5 * np.sin(2 * np.pi * np.cumsum(np.linspace(220, 1400, n)) / SR) * env
    sfx.put(sw, at - dur_s * FPS, gain)
    verb.put(sw, at - dur_s * FPS, gain - 8)


def impact(at, gain, big=False):
    s = mixs(sub_v() * (1.0 if big else 0.7), 0.5 * hp(noise(0.5), 2500) * np.exp(-tt(0.5) / (0.10 if big else 0.06)))
    sfx.put(s, at, gain)
    verb.put(s, at, gain - 7)


def whoosh(d, at, gain, up=True):
    sfx.put(sweep_v(d, 300, 4200, 'rise' if up else 'fall', 1.5), at - (d * FPS if up else 0), gain)


# ── SOUND DESIGN: impacts stop the scroll, risers build the wait ──
impact(0, -13, big=True)                       # frame 0: the scroll-stopper
sfx.put(lp(hp(noise(0.3), 2400), 7000) * np.minimum(1, tt(0.3) / 0.02) * np.exp(-tt(0.3) / 0.26), K('HK_NOWEB'), -21)  # pencil circle
impact(K('HK_SCORE'), -14)                     # the 94 badge lands
sfx.put(lock_v([hz(84), hz(88), hz(91)], 0.22), K('HK_SCORE'), -18)
for i, fr in enumerate(K('ROWS')):
    sfx.put(pop_v(880 + i * 70, 500, 0.05), fr, -27, -0.4 + i * 0.16)
sfx.put(lock_v([hz(86), hz(91)], 0.18), K('ROWS')[-1] + 6, -20)
sfx.put(mixs(key_v(1.3), 0.5 * sweep_v(0.4, 300, 4000, 'rise', 1.4)), K('PASTE'), -15)   # ⌘V
impact(K('CTA_IN'), -12, big=True)
sfx.put(pop_v(700, 350, 0.08), K('CTA_FREE'), -20)
sfx.put(click_v(), K('CTA_CLICK'), -17)
impact(DUR - 2, -14, big=True)

# ── ROOM · DUCK · MASTER ──
t = tt(1.4)
ir = np.vstack([lp(noise(1.4) * np.exp(-t / 0.35), 6500) * np.minimum(1, t / 0.01) for _ in range(2)])
ir /= np.sqrt(np.sum(ir ** 2))
sfx.buf += np.vstack([fftconvolve(verb.buf[c], ir[c])[:N] for c in range(2)]) * db(-11)

env = maximum_filter1d(voice_env, int(0.04 * SR))
a_, r_ = np.exp(-1 / (0.015 * SR)), np.exp(-1 / (0.25 * SR))
sm = np.empty_like(env)
cur = 0.0
for i in range(0, N, 32):
    v = env[i]
    cur = v + (cur - v) * (a_ ** 32 if v > cur else r_ ** 32)
    sm[i:i + 32] = cur
duck = np.clip(sm, 0, 1)
music.buf *= 1 - (1 - db(-9)) * duck
sfx.buf *= 1 - (1 - db(-3)) * duck
music.buf -= 0.45 * np.vstack([lp(hp(music.buf[c], 900), 4200) for c in range(2)]) * duck


def measure(a):
    tmp = os.path.join(ROOT, 'renders', '_lufs_ad.wav')
    sf.write(tmp, a.T.astype(np.float32), SR)
    o = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.remove(tmp)
    j = json.loads(o[o.rfind('{'): o.rfind('}') + 1])
    return float(j['input_i']), float(j['input_tp'])


def limit(a, ceiling_db):
    g = np.minimum(1.0, db(ceiling_db) / np.maximum(np.max(np.abs(a), axis=0), 1e-9))
    g = minimum_filter1d(g, int(0.002 * SR) * 2 + 1)
    rel = np.exp(-1 / (0.08 * SR))
    o = np.empty_like(g)
    c = 1.0
    for i in range(len(g)):
        c = g[i] if g[i] < c else g[i] + (c - g[i]) * rel
        o[i] = c
    return a * o


MUSIC_GAIN = float(os.environ.get('MUSIC_GAIN', '-12'))
SFX_GAIN = float(os.environ.get('SFX_GAIN', '0'))
n_out = int(round(DUR / FPS * SR))
stems = {'voice': voice.buf, 'music': music.buf * db(MUSIC_GAIN), 'sfx': sfx.buf * db(SFX_GAIN)}
mix = sum(stems.values())
mix = np.vstack([hp(ch, 28) for ch in mix])[:, :n_out]
nf = int(0.12 * SR)
mix[:, -nf:] *= np.linspace(1, 0, nf)
pre = mix / np.max(np.abs(mix)) * 0.5
I0, _ = measure(pre)
gain = db(-14 - I0) * 0.5 / np.max(np.abs(mix))
out = limit(mix * gain, -1.5)
I1, TP = measure(out)
OUT = os.path.join(ROOT, 'public/ad/audio')
os.makedirs(OUT, exist_ok=True)
sf.write(os.path.join(OUT, 'ad-mix.wav'), out.T.astype(np.float32), SR, subtype='PCM_24')
a, b = fs(VO_AT), fs(VO_AT) + len(x)
vm = 20 * np.log10((np.sqrt(np.mean(stems['voice'][:, a:b] ** 2)) + 1e-9) / (np.sqrt(np.mean(stems['music'][:, a:b] ** 2)) + 1e-9))
print(f'mix {out.shape[1] / SR:.2f}s · {I1:.2f} LUFS · TP {TP:.2f} dBTP · voice/music {vm:.1f} dB')
