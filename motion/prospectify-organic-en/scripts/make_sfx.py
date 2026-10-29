#!/usr/bin/env python3
"""Synthesise 7 clean, subtle UI sound effects -> public/audio/sfx/*.wav (48 kHz mono).
No samples, no licensing. Each is short and understated — support for the picture, never a gimmick."""
import os
import numpy as np
import soundfile as sf

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public/audio/sfx')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def env(n, a=0.002, d=0.08, curve=3.0):
    t = np.arange(n) / SR
    at = np.clip(t / a, 0, 1)
    de = np.exp(-t / d) ** 1.0
    e = at * de
    return e / (e.max() + 1e-9)


def tone(f, n, kind='sine'):
    t = np.arange(n) / SR
    if kind == 'sine':
        return np.sin(2 * np.pi * f * t)
    return np.sign(np.sin(2 * np.pi * f * t))


def soft_noise(n, lp=0.2):
    x = rng.standard_normal(n)
    # simple one-pole lowpass
    y = np.zeros(n)
    a = lp
    for i in range(1, n):
        y[i] = a * x[i] + (1 - a) * y[i - 1]
    return y / (np.max(np.abs(y)) + 1e-9)


def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    # tiny fade to avoid clicks
    k = 64
    x[:k] *= np.linspace(0, 1, k)
    x[-k:] *= np.linspace(1, 0, k)
    sf.write(os.path.join(OUT, name + '.wav'), x.astype(np.float32), SR)


# pop — a soft rounded blip (card appears)
n = int(0.12 * SR)
f = np.linspace(520, 300, n)
t = np.cumsum(2 * np.pi * f / SR)
save('pop', np.sin(t) * env(n, 0.001, 0.05))

# tick — a short woody click (counter step / small item)
n = int(0.05 * SR)
save('tick', (tone(1800, n) * 0.5 + soft_noise(n, 0.5) * 0.5) * env(n, 0.0005, 0.016))

# whoosh — a filtered noise sweep (scene change)
n = int(0.5 * SR)
t = np.arange(n) / SR
nz = soft_noise(n, 0.08)
# bandpass sweep by amplitude modulation + rising lp
sweep = nz * np.interp(t, [0, 0.25, 0.5], [0.1, 1.0, 0.0])
sweep += 0.3 * np.sin(2 * np.pi * np.cumsum(np.linspace(120, 480, n)) / SR) * np.interp(t, [0, 0.3, 0.5], [0, 0.5, 0])
save('whoosh', sweep * env(n, 0.03, 0.28, 1.0))

# swipe — a quick short whoosh (link/sent)
n = int(0.22 * SR)
t = np.arange(n) / SR
save('swipe', soft_noise(n, 0.12) * np.interp(t, [0, 0.08, 0.22], [0.2, 1.0, 0.0]) * env(n, 0.004, 0.1))

# type — a soft keypress (typing)
n = int(0.035 * SR)
save('type', (soft_noise(n, 0.6) * 0.7 + tone(2400, n) * 0.3) * env(n, 0.0004, 0.01))

# thud — a soft low impact (reveal / punch word)
n = int(0.3 * SR)
f = np.linspace(150, 55, n)
t = np.cumsum(2 * np.pi * f / SR)
body = np.sin(t)
click = soft_noise(int(0.01 * SR), 0.5)
x = body * env(n, 0.001, 0.12, 2.0)
x[:len(click)] += click * 0.25
save('thud', x)

# rise — a gentle riser (before a reveal)
n = int(0.8 * SR)
t = np.arange(n) / SR
f = np.linspace(180, 900, n)
ph = np.cumsum(2 * np.pi * f / SR)
x = (np.sin(ph) * 0.4 + soft_noise(n, 0.05) * 0.6)
x *= np.interp(t, [0, 0.8], [0.0, 1.0]) ** 2
save('rise', x * env(n, 0.05, 0.6, 1.0) * 0 + x * np.interp(t, [0, 0.7, 0.8], [0, 1, 0.2]))

print('sfx:', sorted(os.listdir(OUT)))
