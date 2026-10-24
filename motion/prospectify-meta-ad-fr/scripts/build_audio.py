#!/usr/bin/env python3
"""Mix : voix ElevenLabs + « Dream keeper » (zero-project, CC BY 3.0) + 10 micro-effets synthétisés
→ public/audio/mix.wav (48 kHz, −14 LUFS intégré, crête ≤ −1,5 dBTP).

Chaque effet correspond à une action visuelle (voir SFX ci-dessous). Rien n'est ajouté « pour remplir ».
La musique est ducée sous la voix, creusée dans les médiums de la parole, puis éclaircie sur l'offre.
Les effets sont synthétisés ici (scripts/sonic.py) : aucun sample tiers, aucun problème de licence.
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
sys.path.insert(0, HERE)
from sonic import SR, click_v, db, hp, hz, lock_v, lp, noise, pluck_v, pop_v, sub_v, sweep_v, tick_v, tt  # noqa: E402

ROOT = os.path.dirname(HERE)
T = json.load(open(os.path.join(ROOT, 'src/data/timeline.json')))
FPS, DUR = T['fps'], T['durationInFrames']
N = int(round(DUR / FPS * SR))
K = lambda k: T[k]  # noqa: E731
MORPH = T['DEMO'] - 8  # identique à src/scenes/Scenes.tsx


def fs(fr):
    return int(round(fr / FPS * SR))


class Bus:
    def __init__(self):
        self.buf = np.zeros((2, N + SR))

    def put(self, sig, frame, gain_db, pan=0.0):
        start = fs(frame)
        if sig.ndim == 1:
            th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
            sig = np.vstack([sig * np.cos(th), sig * np.sin(th)]) * np.sqrt(2)
        if start < 0:
            sig, start = sig[:, -start:], 0
        end = min(self.buf.shape[1], start + sig.shape[1])
        if end > start:
            self.buf[:, start:end] += sig[:, : end - start] * db(gain_db)


voice, music, sfx, verb = Bus(), Bus(), Bus(), Bus()


def mixs(*xs):
    n = max(len(x) for x in xs)
    o = np.zeros(n)
    for x in xs:
        o[: len(x)] += x
    return o


# ── VOIX : une prise ElevenLabs, non accélérée ──
x, sr = sf.read(os.path.join(ROOT, 'public/audio/vo.wav'))
x = x.mean(1) if x.ndim > 1 else x
if sr != SR:
    x = resample_poly(x, SR, sr)
x = hp(x, 80)
x = x + 0.22 * hp(x, 3200) + 0.08 * lp(hp(x, 110), 260)   # présence + un peu de corps
rms = np.sqrt(np.mean(x[np.abs(x) > 1e-3] ** 2) + 1e-12)
x = x / rms * db(-19)
x = np.tanh(x * 1.5) / 1.5                                  # compression douce
voice.put(x, K('VO_AT'), 0.0)
verb.put(x, K('VO_AT'), -36)
voice_env = np.zeros(voice.buf.shape[1])
s0 = fs(K('VO_AT'))
voice_env[s0:s0 + len(x)] = np.abs(x) / np.max(np.abs(x))

# ── MUSIQUE : extrait continu, sans montage ──
m, msr = sf.read(os.path.join(ROOT, 'public/audio/music_dreamkeeper_excerpt.wav'))
m = np.vstack([m, m]).T if m.ndim == 1 else m
if msr != SR:
    m = resample_poly(m, SR, msr, axis=0)
m = m.T[:, :N + SR]
m = np.pad(m, ((0, 0), (0, max(0, N + SR - m.shape[1]))))
nin = int(0.35 * SR)
m[:, :nin] *= np.linspace(0, 1, nin) ** 0.6
# offre : la musique s'ouvre (un peu plus de brillance et de niveau)
br = np.clip((np.arange(m.shape[1]) - fs(K('DIX') - 6)) / (0.6 * SR), 0, 1)
m = m * (1 + 0.18 * br) + np.vstack([hp(m[c], 2800) for c in range(2)]) * 0.35 * br
e0 = N - int(1.4 * SR)
m[:, e0:N] *= np.linspace(1, 0, N - e0) ** 1.6                  # fin propre, sans coupure
m[:, N:] = 0
music.put(m, 0, 0.0)


def whoosh(d, at, gain, f0=300, f1=3800):
    s = sweep_v(d, f0, f1, 'rise', 1.4)
    sfx.put(s, at - d * FPS * 0.7, gain)
    verb.put(s, at - d * FPS * 0.7, gain - 8)


# ── LES 10 MICRO-EFFETS (chacun = une action à l'écran) ──
SFX = [
    ('1 impact doux · accroche', 0),
    ('2 pop grave · « 0 CLIENT »', K('ZERO')),
    ('3 whoosh · vers Prospectify', K('REGARDE')),
    ('4 clic · champ Ville', K('VILLE')),
    ('5 clic · champ Catégorie', K('COMMERCE')),
    ('6 clic · Rechercher', K('RECHERCHE')),
    ('7 révélation · résultats', K('RESULTS')),
    ('8 tick · score', K('SCORE')),
    ('9 whoosh · vers la démo', MORPH),
    ('10 son positif · 10 PROSPECTS GRATUITS', K('DIX') - 2),
]
imp = mixs(sub_v() * 0.8, 0.35 * hp(noise(0.4), 2600) * np.exp(-tt(0.4) / 0.05))
sfx.put(imp, 0, -15)
verb.put(imp, 0, -22)
sfx.put(mixs(pop_v(240, 95, 0.12), 0.5 * sub_v(light=True)), K('ZERO'), -19)
sfx.put(sweep_v(0.22, 500, 2600, 'rise', 1.2), K('PROB') - 5, -30)          # glissé de la scène 2, très bas
whoosh(0.4, K('REGARDE'), -22)
for k in ('VILLE', 'COMMERCE'):
    sfx.put(click_v(), K(k), -19, 0.15)
sfx.put(click_v(deep=True), K('RECHERCHE'), -17)
sfx.put(tick_v(1400, 0.01, 0.05), K('RECHERCHE') + 6, -32)                   # chargement : un seul blip doux
for i, n in enumerate([76, 81, 88]):
    sfx.put(pluck_v(hz(n), 0.6, 0.18, 2400), K('RESULTS') + i * 4, -24, -0.3 + i * 0.3)
sfx.put(tick_v(2100, 0.012, 0.06), K('SCORE'), -21, 0.3)
whoosh(0.45, MORPH + 6, -22, 260, 3200)
sfx.put(lock_v([hz(76), hz(80), hz(83), hz(88)], 0.32), K('DIX') - 2, -16)
verb.put(lock_v([hz(76), hz(80), hz(83), hz(88)], 0.32), K('DIX') - 2, -22)

# ── PIÈCE · DUCKING · MASTER ──
t = tt(1.2)
ir = np.vstack([lp(noise(1.2) * np.exp(-t / 0.3), 6500) * np.minimum(1, t / 0.01) for _ in range(2)])
ir /= np.sqrt(np.sum(ir ** 2))
L = sfx.buf.shape[1]
sfx.buf += np.vstack([fftconvolve(verb.buf[c], ir[c])[:L] for c in range(2)]) * db(-12)

env = maximum_filter1d(voice_env, int(0.04 * SR))
a_, r_ = np.exp(-1 / (0.012 * SR)), np.exp(-1 / (0.28 * SR))
sm = np.empty_like(env)
cur = 0.0
for i in range(0, len(env), 32):
    v = env[i]
    cur = v + (cur - v) * (a_ ** 32 if v > cur else r_ ** 32)
    sm[i:i + 32] = cur
duck = np.clip(sm, 0, 1)
music.buf *= 1 - (1 - db(-8)) * duck
music.buf -= 0.4 * np.vstack([lp(hp(music.buf[c], 900), 4000) for c in range(2)]) * duck


def measure(a):
    tmp = os.path.join(ROOT, 'exports', '_lufs.wav')
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


MUSIC_GAIN = float(os.environ.get('MUSIC_GAIN', '-13'))
stems = {'voice': voice.buf, 'music': music.buf * db(MUSIC_GAIN), 'sfx': sfx.buf}
mix = sum(stems.values())[:, :N]
mix = np.vstack([hp(ch, 30) for ch in mix])
nf = int(0.08 * SR)
mix[:, -nf:] *= np.linspace(1, 0, nf)
os.makedirs(os.path.join(ROOT, 'exports'), exist_ok=True)
I0, _ = measure(mix / np.max(np.abs(mix)) * 0.5)
out = limit(mix * db(-14 - I0) * 0.5 / np.max(np.abs(mix)), -1.5)
I1, TP = measure(out)
sf.write(os.path.join(ROOT, 'public/audio/mix.wav'), out.T.astype(np.float32), SR, subtype='PCM_24')
a, b = s0, s0 + len(x)
vm = 20 * np.log10(np.sqrt(np.mean(stems['voice'][:, a:b] ** 2)) / (np.sqrt(np.mean(stems['music'][:, a:b] ** 2)) + 1e-12))
print(f'mix {out.shape[1] / SR:.2f} s · {I1:.2f} LUFS · {TP:.2f} dBTP · voix/musique {vm:.1f} dB')
for name, fr in SFX:
    print(f'  {fr / FPS:6.2f} s  {name}')
