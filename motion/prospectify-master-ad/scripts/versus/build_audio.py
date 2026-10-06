#!/usr/bin/env python3
"""SAME NIGHT — mix: real music edit + voice + sound design → public/versus/audio/versus-mix.wav (48 kHz, −14 LUFS).

MUSIC: "Vittoro" by Blue Dot Sessions — CC BY 3.0 (jamendo.com/track/1365339), see
public/versus/audio/MUSIC_CREDITS.md. 127.97 BPM, warm, major, instrumental. One continuous performance:
  the hook rides its groove; the night sits on its breakdown under a gentle low-pass that opens;
  its full re-entry (bar 35) lands exactly on "With"; a soft fade ends it under the CTA.
Sound design is deliberately discreet (premium): soft ticks and locks, no harsh hits.
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy.ndimage import maximum_filter1d, minimum_filter1d
from scipy.signal import fftconvolve, resample_poly, sosfilt, butter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), 'final'))
from sonic import SR, click_v, db, hp, hz, key_v, lock_v, lp, noise, pop_v, sub_v, sweep_v, tick_v, tt, type_v  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
REPO = os.path.dirname(os.path.dirname(ROOT))
T = json.load(open(os.path.join(ROOT, 'src/versus/timeline.json')))
FPS = T['fps']
DUR = T['durationInFrames']
N = int(round(DUR / FPS * SR)) + SR
rng = np.random.default_rng(7)
CUES = []
MUSIC_SRC = os.environ.get('MUSIC_SRC', os.path.join(ROOT, 'renders/_music/vittoro.wav'))
BPM = 127.97
BEAT0 = 0.256
REENTRY_BAR = 35  # full band re-enters after the breakdown
BAR = 4 * 60 / BPM


def fs(fr):
    return int(round(fr / FPS * SR))


def bar_t(b):
    return BEAT0 + b * BAR


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
K = lambda k: T[k]  # noqa: E731


def cue(frame, scene, event, sound, sig, gain, pan=0.0, cat='MEDIUM', send=None):
    sfx.put(sig, frame, gain, pan)
    if send is not None:
        verb.put(sig, frame, gain + send)
    CUES.append({'frame': int(round(frame)), 'time': round(frame / FPS, 3), 'scene': scene, 'event': event, 'sound': sound, 'category': cat, 'volume_db': round(gain, 1)})


def mixs(*xs):
    n = max(len(x) for x in xs)
    out = np.zeros(n)
    for x in xs:
        out[: len(x)] += x
    return out


# ─────────────────────────── VOICE ───────────────────────────
voice_env = np.zeros(N)
for sid, v in T['VO'].items():
    x, sr = sf.read(os.path.join(ROOT, f'public/versus/voice/{sid}.wav'))
    x = hp(x, 90)
    x = x + 0.35 * hp(x, 2800) + 0.12 * lp(hp(x, 120), 300)  # presence + a little chest
    rms = np.sqrt(np.mean(x[np.abs(x) > 1e-3] ** 2) + 1e-12)
    x = x / rms * db(-19)
    x = np.tanh(x * 1.8) / 1.8  # glue: dense, forward, ad-read
    voice.put(x, v['start'], 0.0)
    verb.put(x, v['start'], -32)
    s0 = fs(v['start'])
    voice_env[s0:s0 + len(x)] = np.maximum(voice_env[s0:s0 + len(x)], np.abs(x) / np.max(np.abs(x)))

# ─────────────────────────── MUSIC ───────────────────────────
# "Vittoro" plays as one continuous performance (no edits), positioned so its re-entry after the
# breakdown (bar 35) lands exactly on "With". The night is a gentle low-pass that opens into that bar.
src, msr = sf.read(MUSIC_SRC)
if src.ndim == 1:
    src = np.vstack([src, src]).T
if msr != SR:
    src = resample_poly(src, 160, 147, axis=0) if msr == 44100 else resample_poly(src, SR, msr, axis=0)
src = src.T  # (2, n)
W_IN, T_IN, T_WITH = K('W_IN'), K('T_IN'), K('T_WITH')
off = bar_t(REENTRY_BAR) - T_WITH / FPS  # track time at film frame 0
a0 = int(off * SR)
seg = src[:, a0:a0 + N].copy()
if seg.shape[1] < N:
    seg = np.pad(seg, ((0, 0), (0, N - seg.shape[1])))
seg[:, : int(0.6 * SR)] *= np.linspace(0, 1, int(0.6 * SR)) ** 0.5  # soft fade-in on frame 0
# night: low-pass 1100 Hz → open, over W_IN..T_WITH (blocks)
s0, s1 = fs(W_IN), fs(T_WITH)
n = s1 - s0
blocks = 48
for i in range(blocks):
    a, b = s0 + i * n // blocks, s0 + (i + 1) * n // blocks
    p_ = (i + 0.5) / blocks
    fc = 1100 * (18000 / 1100) ** (p_ ** 2.5)
    sos = butter(2, min(fc, 20000), 'low', fs=SR, output='sos')
    pad = int(0.05 * SR)
    lo = max(0, a - pad)
    yb = sosfilt(sos, seg[:, lo:b], axis=1)
    seg[:, a:b] = yb[:, a - lo:] * (db(-2.5) + (1 - db(-2.5)) * p_)
# gentle ending: fade the last 2.6 s
e0 = fs(DUR) - int(2.6 * SR)
seg[:, e0:] *= np.linspace(1, 0, seg.shape[1] - e0) ** 1.6
music.put(seg, 0, 0.0)

# ─────────────────────────── SOUND DESIGN ───────────────────────────
def glitch():
    return mixs(tick_v(rng.uniform(1800, 3400), 0.006, 0.06), 0.7 * hp(noise(0.08), 2500) * np.exp(-tt(0.08) / 0.015))


def whoosh(d=0.45, up=True):
    return sweep_v(d, 300, 5000, 'rise' if up else 'fall', 1.6)


# hook
for fr in range(K('H_BUILD'), K('H_FORTY') + 10, 7):
    cue(fr, 'hook', 'site builds', 'ui tick', tick_v(rng.uniform(2200, 3200), 0.008, 0.05), -32, rng.uniform(-0.4, 0.4), 'MICRO')
cue(K('H_FORTY') + 12, 'hook', '40 min ✓', 'lock', lock_v([hz(84), hz(91)], 0.18), -22)
cue(K('H_ZERO'), 'hook', '0 clients', 'glitch hit + sub', mixs(glitch(), sub_v(light=True) * 0.8), -14, cat='MACRO')
# without
cue(W_IN, 'without', 'cold world', 'downer sweep', sweep_v(0.6, 2400, 200, 'fall', 1.3), -22, cat='MACRO')
for k in ['W_MAPS', 'W_TABS', 'W_GUESS', 'W_COLD', 'W_SEEN', 'W_GENERIC', 'W_LATE']:
    cue(K(k), 'without', f'clock jumps ({k})', 'clock glitch', glitch(), -24, rng.uniform(-0.3, 0.3), 'MICRO')
for i in range(14):
    cue(K('W_TABS') - 14 + i * 2, 'without', 'tab opens', 'tab pop', pop_v(rng.uniform(700, 1100), 300, 0.05), -28, rng.uniform(-0.7, 0.7), 'MICRO')
cue(K('W_TABS') + 2, 'without', '14 tabs.', 'glitch hit', glitch(), -18)
for i in range(3):
    cue(K('W_GUESS') + 12 + i * 6, 'without', '? stamp', 'stamp', click_v(deep=True), -22, (i - 1) * 0.5)
for i in range(4):
    cue(K('W_COLD') + i * 10 - 2, 'without', '⌘V', 'key', key_v(1.2), -18, -0.3 + i * 0.2, 'MICRO')
    cue(K('W_COLD') + i * 10 + 4, 'without', 'sent', 'send', sweep_v(0.18, 900, 3000, 'rise', 1.2), -28, 0.3, 'MICRO')
cue(K('W_SEEN') + 20, 'without', 'seen ✓✓', 'tick', tick_v(hz(96), 0.01), -26)
cue(K('W_NOREPLY'), 'without', 'No reply.', 'glitch hit', mixs(glitch(), sub_v(light=True) * 0.5), -17, cat='MACRO')
for i in range(25):
    cue(K('W_GENERIC') + i, 'without', 'typing', 'key', key_v(0.6), -32, rng.uniform(-0.2, 0.2), 'MICRO') if i % 2 == 0 else None
cue(K('W_LATE') + 1, 'without', '2:07 AM', 'glitch hit', glitch(), -18)
cue(K('W_ZERO'), 'without', '0 clients.', 'low hit', sub_v() * 0.9, -14, cat='MACRO')
# turn: rewind + riser, the drop does the rest
rw = sweep_v((T_WITH - T_IN) / FPS, 4000, 300, 'fall', 2.0)
cue(T_IN, 'turn', 'clock rewinds', 'tape rewind', rw * np.linspace(0.3, 1, len(rw)), -20, cat='MACRO')
cue(T_IN, 'turn', 'riser', 'noise riser', hp(noise((T_WITH - T_IN) / FPS), 1500) * np.linspace(0, 1, int((T_WITH - T_IN) / FPS * SR)) ** 2, -26, cat='MACRO')
cue(T_WITH, 'turn', 'DROP · With Prospectify', 'impact', mixs(sub_v() * 1.0, 0.6 * hp(noise(0.6), 3000) * np.exp(-tt(0.6) / 0.12)), -12, cat='MACRO', send=-6)
# with
for fr in K('F_KEYS')[::2]:
    cue(fr, 'with', 'typing', 'key', key_v(0.8), -30, rng.uniform(-0.2, 0.2), 'MICRO')
cue(K('F_SCAN'), 'with', 'scan', 'scan sweep', sweep_v(0.45, 600, 4200, 'rise', 1.4), -27)
for i, fr in enumerate(K('F_ROWS_EACH')):
    cue(fr, 'with', f'lead {i + 1}', 'pop', pop_v(900 + i * 80, 500, 0.06), -26, -0.4 + i * 0.2, 'MICRO')
cue(K('F_SCORE'), 'with', 'Client found', 'lock', lock_v([hz(84), hz(88), hz(91)], 0.2), -18)
cue(K('R_IN'), 'with', 'outreach tab', 'whoosh', whoosh(0.35), -26)
for k in ['R_WA', 'R_EMAIL', 'R_PHONE']:
    cue(K(k), 'with', k, 'tab click', click_v(), -21, 0.2)
cue(K('R_COPY'), 'with', 'Copied!', 'lock', lock_v([hz(88), hz(93)], 0.16), -20)
cue(K('P_IN'), 'with', 'AI prompt tab', 'whoosh', whoosh(0.35), -26)
for fr in range(K('P_TYPE0'), K('P_TYPE1'), 5):
    cue(fr, 'with', 'prompt streams', 'type', type_v(), -34, rng.uniform(-0.3, 0.3), 'MICRO')
cue(K('P_READY'), 'with', 'Ready to paste', 'lock', lock_v([hz(86), hz(91), hz(95)], 0.22), -18)
cue(K('TL_IN'), 'with', 'builders', 'whoosh', whoosh(0.5), -22, cat='MACRO')
for i, fr in enumerate(K('TL_LOGOS')):
    cue(fr, 'with', 'builder logo', 'pop', pop_v(800 + i * 120, 400, 0.06), -24, -0.3 + i * 0.3, 'MICRO')
cue(K('TL_PASTE'), 'with', '⌘V paste', 'key + whoosh', mixs(key_v(1.3), 0.5 * whoosh(0.5)), -16)
for fr in range(K('TL_PASTE') + 4, K('D_IN') + 30, 6):
    cue(fr, 'with', 'site builds', 'ui tick', tick_v(rng.uniform(2400, 3600), 0.007, 0.05), -33, rng.uniform(-0.5, 0.5), 'MICRO')
for i, k in enumerate(['D_FOUND', 'D_READY', 'D_BUILT']):
    cue(K(k), 'with', k, 'lock', lock_v([hz(86 + i * 3), hz(91 + i * 3)], 0.2, hero=(i == 2)), -16)
cue(K('D_SEND'), 'with', 'message sent', 'send swoosh', sweep_v(0.25, 800, 4000, 'rise', 1.2), -22, 0.4)
# recap + cta
cue(K('RC_IN'), 'recap', 'split', 'whoosh', whoosh(0.5), -20, cat='MACRO')
cue(K('RC_ALL'), 'recap', 'All night.', 'low tick', tick_v(hz(60), 0.04), -22, -0.5)
cue(K('RC_ONE'), 'recap', 'One search.', 'lock', lock_v([hz(86), hz(91), hz(98)], 0.24, hero=True), -15, 0.5)
cue(K('CTA_IN'), 'cta', 'brand', 'whoosh', whoosh(0.5, False), -22)
cue(K('CTA_START'), 'cta', 'Start free', 'pop', pop_v(700, 350, 0.08), -20)
cue(K('CTA_CLICK'), 'cta', 'cursor click', 'click', click_v(), -16)

# ─────────────────────────── ROOM · DUCK · MASTER ───────────────────────────
def make_ir(d=1.6):
    t = tt(d)
    ir = np.vstack([lp(noise(d) * np.exp(-t / 0.4), 6500) * np.minimum(1, t / 0.01) for _ in range(2)])
    return ir / np.sqrt(np.sum(ir ** 2))


ir = make_ir()
sfx.buf += np.vstack([fftconvolve(verb.buf[c], ir[c])[:N] for c in range(2)]) * db(-10)

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
sfx.buf *= 1 - (1 - db(-4)) * duck
# carve the voice band out of the music while she/he talks (1–4 kHz dip)
music.buf = music.buf - 0.45 * np.vstack([lp(hp(music.buf[c], 900), 4200) for c in range(2)]) * duck


def measure(x):
    tmp = os.path.join(ROOT, 'renders', '_lufs_versus.wav')
    sf.write(tmp, x.T.astype(np.float32), SR)
    o = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.remove(tmp)
    j = json.loads(o[o.rfind('{'): o.rfind('}') + 1])
    return float(j['input_i']), float(j['input_tp'])


def limit(x, ceiling_db):
    ceiling = db(ceiling_db)
    g = np.minimum(1.0, ceiling / np.maximum(np.max(np.abs(x), axis=0), 1e-9))
    g = minimum_filter1d(g, int(0.002 * SR) * 2 + 1)
    rel = np.exp(-1 / (0.08 * SR))
    o = np.empty_like(g)
    c = 1.0
    for i in range(len(g)):
        c = g[i] if g[i] < c else g[i] + (c - g[i]) * rel
        o[i] = c
    return x * o


MUSIC_GAIN = float(os.environ.get('MUSIC_GAIN', '-8.5'))
SFX_GAIN = float(os.environ.get('SFX_GAIN', '-5'))
n_out = int(round(DUR / FPS * SR))
stems = {'voice': voice.buf, 'music': music.buf * db(MUSIC_GAIN), 'sfx': sfx.buf * db(SFX_GAIN)}
mix = sum(stems.values())
mix = np.vstack([hp(ch, 28) for ch in mix])[:, :n_out]
nf = int(0.25 * SR)
mix[:, -nf:] *= np.linspace(1, 0, nf) ** 2
pre = mix / np.max(np.abs(mix)) * 0.5
I0, _ = measure(pre)
gain = db(-14 - I0) * 0.5 / np.max(np.abs(mix))
out = limit(mix * gain, -1.5)
I1, TP = measure(out)
OUT = os.path.join(ROOT, 'public/versus/audio')
os.makedirs(os.path.join(OUT, 'stems'), exist_ok=True)
sf.write(os.path.join(OUT, 'versus-mix.wav'), out.T.astype(np.float32), SR, subtype='PCM_24')
for name, s in stems.items():
    sf.write(os.path.join(OUT, 'stems', f'{name}.wav'), (s[:, :n_out] * gain).T.astype(np.float32), SR, subtype='PCM_24')
# voice-over-music margin while speaking (dB), for the log
vm = []
for v in T['VO'].values():
    a, b = fs(v['start']), fs(v['end'])
    ev = np.sqrt(np.mean(stems['voice'][:, a:b] ** 2)) + 1e-9
    em = np.sqrt(np.mean(stems['music'][:, a:b] ** 2)) + 1e-9
    vm.append(20 * np.log10(ev / em))
CUES.sort(key=lambda c: c['frame'])
os.makedirs(os.path.join(REPO, 'motion-source/production/versus'), exist_ok=True)
json.dump({'fps': FPS, 'sampleRate': SR, 'music': {'title': 'Vittoro', 'artist': 'Blue Dot Sessions', 'license': 'CC BY 3.0', 'url': 'https://www.jamendo.com/track/1365339', 'bpm': BPM},
           'integratedLUFS': round(I1, 2), 'truePeak_dBTP': round(TP, 2), 'voiceOverMusic_dB_median': round(float(np.median(vm)), 1), 'cues': CUES},
          open(os.path.join(REPO, 'motion-source/production/versus/AUDIO_CUE_MAP.json'), 'w'), indent=1, ensure_ascii=False)
print(f'mix {out.shape[1] / SR:.3f}s · {I1:.2f} LUFS · TP {TP:.2f} dBTP · voice/music median {np.median(vm):.1f} dB (min {np.min(vm):.1f}) · {len(CUES)} cues')
