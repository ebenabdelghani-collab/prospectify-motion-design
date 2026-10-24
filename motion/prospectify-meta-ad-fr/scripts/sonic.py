"""
Prospectify sonic library — synthesized, deterministic, 48 kHz.
MICRO (key, hover, click, tick) · MEDIUM (lock, ready, copy) · MACRO (sweep, sub, impact) · SIGNATURE (motif).
Shared voices are carried over from the master-ad engine (scripts/build_audio.py) so both films share one sound.
"""
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
FPS = 60
rng = np.random.default_rng(11)


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



# ─────────────────────────── SIGNATURE ───────────────────────────
# Three very short ascending tones (glass-pluck: digital attack, organic decay) + one low-mid resolved "lock".
SIG_TONES = (hz(81), hz(86), hz(89))  # A5 · D6 · F6 — rising fourth then minor third, lands on F
SIG_LOCK = (hz(53), hz(65), hz(72))  # F3 body + F4 + C5 fifth: the lock is a resolved F


def sig_tone(freq, d=0.32):
    t = tt(d)
    s = np.sin(2 * np.pi * freq * t + 0.6 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t / 0.03)) * np.exp(-t / 0.09)
    s += 0.18 * np.sin(2 * np.pi * freq * 3.01 * t) * np.exp(-t / 0.03)
    s += hp(noise(d), 5000) * np.exp(-t / 0.0012) * 0.25
    return edges(s * np.minimum(1, t / 0.0008), r=0.03)


def sig_lock(d=1.1, weight=1.0):
    t = tt(d)
    s = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / (0.32 - 0.07 * i)) * (0.9, 0.55, 0.3)[i] for i, f in enumerate(SIG_LOCK))
    s *= np.minimum(1, t / 0.002)
    s += lp(noise(d), 900) * np.exp(-t / 0.012) * 0.5  # the "seat" transient
    s += hp(noise(d), 3500) * np.exp(-t / 0.0015) * 0.3
    s += np.sin(2 * np.pi * 58 * t) * np.exp(-t / 0.12) * 0.5 * weight
    return edges(s, r=0.08)


def signature(level='full'):
    """full: 3 tones + lock · partial: last tone + lock (module READY) · strong: full + sub bloom."""
    gap = int(0.075 * SR)
    tones = SIG_TONES if level != 'partial' else SIG_TONES[2:]
    d = int(1.4 * SR)
    out = np.zeros(d)
    o = 0
    for f_ in tones:
        x = sig_tone(f_)
        out[o:o + len(x)] += x * (0.7 if level == 'partial' else 0.85)
        o += gap
    lk = sig_lock(weight=1.4 if level == 'strong' else 1.0) * (0.75 if level == 'partial' else 1.0)
    out[o:o + len(lk)] += lk[: d - o]
    return out, o / SR  # signal, lock offset (s) — the lock lands on the cue frame


def scan_v(d, f0=900, f1=4200):
    """Restrained scanning texture: narrow band noise gliding, with fine digital ticks."""
    t = tt(d)
    u = t / d
    s = svf_bp(noise(d), f0 * (f1 / f0) ** u, 6) * np.sin(np.pi * u) ** 0.8
    ticks = np.zeros_like(t)
    for k in np.arange(0, d, 0.035):
        i = int(k * SR)
        tk = tt(0.01)
        m = min(len(tk), len(ticks) - i)
        if m > 0:
            ticks[i:i + m] += (np.sin(2 * np.pi * (2500 + 3000 * k / d) * tk) * np.exp(-tk / 0.002) * 0.4)[:m]
    return edges(s / (np.max(np.abs(s)) + 1e-9) * 0.8 + ticks, 0.01, 0.02)


def type_v():
    """Softer, drier key for laptop typing."""
    t = tt(0.03)
    s = hp(noise(0.03), 3000) * np.exp(-t / 0.0025) * 0.5 + np.sin(2 * np.pi * rng.uniform(380, 520) * t) * np.exp(-t / 0.006) * 0.35
    return edges(s)
