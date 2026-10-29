#!/usr/bin/env python3
"""Voice + a handful of small sound effects -> public/audio/mix.wav (48 kHz stereo, about -14 LUFS).

No music (founder's brief). Each effect sits under a visual action and stays quiet: they support the
picture, they never announce themselves. Effects live in public/audio/sfx/ (ElevenLabs sound effects).
"""
import json
import os

import numpy as np
import soundfile as sf
from scipy.signal import butter, resample_poly, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
T = json.load(open(os.path.join(ROOT, 'src/data/timeline.json')))
FPS, C = T['fps'], T['cues']
N = int(round(T['durationInFrames'] / FPS * SR)) + SR
db = lambda x: 10 ** (x / 20)  # noqa: E731


def load(path):
    x, sr = sf.read(path, always_2d=True)
    x = x.T
    if x.shape[0] == 1:
        x = np.vstack([x, x])
    if sr != SR:
        x = resample_poly(x, SR, sr, axis=1)
    return x


def hp(x, f):
    return sosfilt(butter(2, f, 'hp', fs=SR, output='sos'), x, axis=-1)


mix = np.zeros((2, N))


def put(x, frame, gain, pan=0.0):
    s = int(round(frame / FPS * SR))
    th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
    x = x * np.array([[np.cos(th)], [np.sin(th)]]) * np.sqrt(2) * db(gain)
    if s < 0:
        x, s = x[:, -s:], 0
    e = min(N, s + x.shape[1])
    mix[:, s:e] += x[:, : e - s]


# ── voice ──
v = load(os.path.join(ROOT, 'public/audio/vo.wav')).mean(0)
v = hp(v, 70)
v = v / (np.sqrt(np.mean(v[np.abs(v) > 1e-3] ** 2)) + 1e-12) * db(-18)
put(np.vstack([v, v]) / np.sqrt(2), T['voAt'], 0.0)

# ── sound effects ──
SFX = {}
d = os.path.join(ROOT, 'public/audio/sfx')
for fn in sorted(os.listdir(d)) if os.path.isdir(d) else []:
    if fn.endswith('.wav'):
        x = load(os.path.join(d, fn))
        x = x / (np.max(np.abs(x)) + 1e-9)
        SFX[fn[:-4]] = x

# (effect, frame, gain dB, pan). Kept sparse on purpose.
EV = [
    ('whoosh', C['S2'] - 6, -30, 0), ('tick', C['S2'], -31, -0.3), ('tick', C['S2'] + 10, -32, 0), ('tick', C['S2'] + 20, -33, 0.3),
    ('swipe', C['nosite'] + 16, -29, 0.4),
    ('type', C['search'] + 4, -31, 0.3),
    ('thud', C['nothing'], -25, 0.2),
    ('pop', C['cant'], -31, 0),
    ('whoosh', C['S4'] - 8, -27, 0), ('pop', C['millions'] - 4, -27, 0),
    ('whoosh', C['S5'] - 8, -30, 0), ('pop', C['S6'], -29, -0.4),
    ('tick', C['p500'] - 4, -29, 0.3), ('tick', C['p2000'] - 4, -27, 0.3),
    ('whoosh', C['S7'] - 8, -30, 0), ('rise', C['fifty'] - 40, -30, 0.2), ('pop', C['fifty'] + 40, -29, 0.3),
    ('thud', C['S8'] + 2, -25, 0),
    ('whoosh', C['S9'] - 8, -31, 0), ('thud', C['finding'] + 8, -26, 0.3),
    ('pop', C['S10'] - 4, -31, -0.5), ('pop', C['checking'] - 6, -31, 0), ('pop', C['writing'] - 6, -31, 0.5),
    ('type', C['writing'] + 6, -33, 0.5),
    ('thud', C['quit'] + 2, -24, 0.1),
    ('whoosh', C['tool'] - 10, -28, 0), ('pop', C['prospectify'], -28, 0),
    ('tick', C['finds'] + 4, -32, -0.4), ('tick', C['finds'] + 12, -32, -0.4), ('tick', C['finds'] + 20, -32, -0.4), ('tick', C['finds'] + 28, -32, -0.4),
    ('type', C['writes'] + 4, -33, 0.4), ('type', C['prompt'] + 6, -33, 0.4),
    ('whoosh', C['S13'] - 8, -31, 0), ('rise', C['clients'] - 30, -32, 0),
    ('whoosh', C['S14'] - 8, -30, 0), ('type', C['up'] - 2, -29, 0), ('pop', C['up'] + 6, -26, 0.2), ('swipe', C['link'], -29, 0),
]
missing = sorted({e[0] for e in EV} - set(SFX))
if missing:
    print('missing sfx (skipped):', missing)
for name, fr, g, pan in EV:
    if name in SFX:
        put(SFX[name], fr, g, pan)

# ── master: gentle peak control, normalise to about -14 LUFS (pyloudnorm if present) ──
mix = mix[:, : int(round(T['durationInFrames'] / FPS * SR))]
try:
    import pyloudnorm as pyln
    lufs = pyln.Meter(SR).integrated_loudness(mix.T)
    mix *= db(-14 - lufs)
except ImportError:
    mix *= db(-16) / (np.sqrt(np.mean(mix ** 2)) + 1e-12)
mix = np.tanh(mix * 1.1) / 1.1
peak = np.max(np.abs(mix))
if peak > db(-1.5):
    mix *= db(-1.5) / peak
sf.write(os.path.join(ROOT, 'public/audio/mix.wav'), mix.T, SR, subtype='PCM_24')
print('mix.wav', f'{mix.shape[1] / SR:.2f}s', 'peak', f'{20 * np.log10(np.max(np.abs(mix))):.1f} dBFS')
