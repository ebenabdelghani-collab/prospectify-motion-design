#!/usr/bin/env python3
"""FR ad — mix : voix ElevenLabs (FR, femme) + « Dream keeper » (CC BY, Openverse) + design sonore
→ public/fr/audio/fr-mix.wav (48 kHz, −14 LUFS).

Design sonore volontairement clairsemé : un impact image 0 pour arrêter le scroll, la musique qui
se retire sous le chuchotement, six impacts courts sur les fragments du chaos, deux risers doux
(vers le déclic et vers l'offre) et un impact sur la marque. Aucun effet qui se répète.
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
from sonic import SR, click_v, db, hp, hz, key_v, lock_v, lp, noise, pop_v, sub_v, sweep_v, tt  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
T = json.load(open(os.path.join(ROOT, 'src/fr/timeline.json')))
FPS, DUR = T['fps'], T['durationInFrames']
N = int(round(DUR / FPS * SR)) + SR
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


# ── VOIX (une seule prise ElevenLabs, chuchotement inclus) ──
x, sr = sf.read(os.path.join(ROOT, 'public/fr/audio/vo.wav'))
if x.ndim > 1:
    x = x.mean(1)
if sr != SR:
    x = resample_poly(x, SR, sr)
x = hp(x, 90)
x = x + 0.3 * hp(x, 2800) + 0.1 * lp(hp(x, 120), 300)
rms = np.sqrt(np.mean(x[np.abs(x) > 1e-3] ** 2) + 1e-12)
x = x / rms * db(-19)
# le chuchotement est remonté pour rester intelligible sans perdre son souffle
wa, wb = fs(K('WH_IN') - 6), fs(K('WH_OUT'))
g = np.ones(len(x))
g[wa:wb] = db(5.5)
e = int(0.12 * SR)
g[wa:wa + e] = np.linspace(1, db(5.5), e)
g[wb - e:wb] = np.linspace(db(5.5), 1, e)
x = x * g[: len(x)]
x = np.tanh(x * 1.6) / 1.6
voice.put(x, 0, 0.0)
verb.put(x, 0, -33)
verb.put(x[wa:wb], K('WH_IN') - 6, -22)   # le chuchotement respire dans la pièce
voice_env = np.zeros(N)
voice_env[: len(x)] = np.abs(x[:N]) / np.max(np.abs(x))

# ── MUSIQUE : une seule performance continue, déjà sous licence (CC BY) ──
src, msr = sf.read(os.path.join(ROOT, 'renders/_music/dreamkeeper.wav'))
if src.ndim == 1:
    src = np.vstack([src, src]).T
if msr != SR:
    src = resample_poly(src, SR, msr, axis=0)
src = src.T
OFF = int(float(os.environ.get('MUSIC_OFFSET', '30')) * SR)
seg = src[:, OFF:OFF + N].copy()
if seg.shape[1] < N:
    seg = np.pad(seg, ((0, 0), (0, N - seg.shape[1])))
nin = int(0.5 * SR)
seg[:, :nin] *= np.linspace(0, 1, nin) ** 0.6
# retrait sous le chuchotement, re-entrée sur le chaos
duck_w = np.ones(seg.shape[1])
a0, a1 = fs(K('WH_IN') - 10), fs(K('WH_OUT') - 4)
duck_w[a0:a1] = db(-16)
duck_w[a0 - int(0.35 * SR):a0] = np.linspace(1, db(-16), int(0.35 * SR))
duck_w[a1:a1 + int(0.5 * SR)] = np.linspace(db(-16), 1, int(0.5 * SR))
seg *= duck_w
e0 = fs(DUR) - int(1.8 * SR)
seg[:, e0:] *= np.linspace(1, 0, seg.shape[1] - e0) ** 1.4
music.put(seg, 0, 0.0)


def riser(dur_s, gain, at):
    """Riser doux : bruit filtré plus une tonalité montante discrète. Fait attendre sans siffler."""
    n = int(dur_s * SR)
    t = np.arange(n) / SR
    env = (t / dur_s) ** 2.6
    sw = lp(hp(noise(dur_s), 400), 2600) * env * 0.8
    sw += 0.45 * np.sin(2 * np.pi * np.cumsum(np.linspace(150, 520, n)) / SR) * env
    fa = int(0.05 * SR)
    sw[:fa] *= np.linspace(0, 1, fa)
    sw[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    sfx.put(sw, at - dur_s * FPS, gain)
    verb.put(sw, at - dur_s * FPS, gain - 10)


def impact(at, gain, big=False):
    s = mixs(sub_v() * (1.0 if big else 0.7), 0.5 * hp(noise(0.5), 2500) * np.exp(-tt(0.5) / (0.10 if big else 0.06)))
    sfx.put(s, at, gain)
    verb.put(s, at, gain - 7)


# ── DESIGN SONORE ──
impact(0, -13, big=True)                                  # image 0 : l'arrêt du scroll
sfx.put(pop_v(620, 320, 0.07), K('HOOK_B'), -22)          # les créneaux clients apparaissent
impact(K('HOOK_C'), -17)
for i, fr in enumerate(K('CHAOS')):                       # six fragments, six impacts courts
    sfx.put(mixs(sub_v() * 0.45, 0.4 * hp(noise(0.3), 2800) * np.exp(-tt(0.3) / 0.05)), fr, -21 + (i % 2), -0.5 + i * 0.2)
sfx.put(lp(hp(noise(0.5), 900), 6000) * np.minimum(1, tt(0.5) / 0.03) * np.exp(-tt(0.5) / 0.22), K('REPEAT'), -20)
impact(K('BARS'), -18)
riser(1.6, -27, K('BRAND'))                               # le riser qui mène au déclic
impact(K('BRAND'), -11, big=True)
sfx.put(lock_v([hz(84), hz(88), hz(91)], 0.26), K('BRAND') + 3, -19)
sfx.put(key_v(0.8), K('PR_IN') - 14, -24)                 # la recherche se tape
sfx.put(lock_v([hz(86), hz(91)], 0.18), K('SCORE'), -20)  # la fiche s'ouvre
sfx.put(pop_v(760, 420, 0.06), K('MSG_IN'), -24)
sfx.put(mixs(key_v(1.0), 0.5 * sweep_v(0.4, 300, 4000, 'rise', 1.4)), K('PASTE'), -16)   # ⌘V
riser(1.8, -26, K('CTA_IN'))                              # celui qui tient jusqu'à l'offre
impact(K('CTA_IN'), -12, big=True)
sfx.put(pop_v(700, 350, 0.08), K('CTA_FREE'), -20)
sfx.put(click_v(), K('CTA_CARD'), -18)

# ── PIÈCE · DUCKING · MASTER ──
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
    tmp = os.path.join(ROOT, 'renders', '_lufs_fr.wav')
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
OUT = os.path.join(ROOT, 'public/fr/audio')
os.makedirs(OUT, exist_ok=True)
sf.write(os.path.join(OUT, 'fr-mix.wav'), out.T.astype(np.float32), SR, subtype='PCM_24')
b = len(x)
vm = 20 * np.log10((np.sqrt(np.mean(stems['voice'][:, :b] ** 2)) + 1e-9) / (np.sqrt(np.mean(stems['music'][:, :b] ** 2)) + 1e-9))
print(f'mix {out.shape[1] / SR:.2f}s · {I1:.2f} LUFS · TP {TP:.2f} dBTP · voix/musique {vm:.1f} dB')
