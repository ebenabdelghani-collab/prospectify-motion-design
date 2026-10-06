#!/usr/bin/env python3
"""
PROSPECTIFY — THE PLAYBOOK (16:9) · VOICE + SCORE + SOUND SYSTEM (48 kHz)

Reads src/playbook/timeline.json (built from the real voiceover). Every cue is placed on the same frame as its
visual and logged to motion-source/production/playbook/AUDIO_CUE_MAP.json (frame · time · scene · event · sound ·
volume · pan · ducking · notes). Priority: VOICE → MUSIC → SFX, with sidechain ducking under the voice.

Score: 115 BPM, D minor (the world as it is) → F major (Prospectify). It evolves per act:
minimal pulse · drop · growing manual loop · stop · stripped insight · tension · freeze · resolution ·
clean product rhythm · prompt lift · anticipation · build momentum · resolve · minimal CTA.

Outputs: public/playbook/audio/playbook-mix.wav (24-bit, −14 LUFS integrated, −1 dBTP ceiling)
         public/playbook/audio/stems/{voice,music,sfx}.wav
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy.ndimage import maximum_filter1d, minimum_filter1d
from scipy.signal import fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), 'final'))
sys.path.insert(0, HERE)
from sonic import (  # noqa: E402
    SR, bell_v, click_v, clock_v, db, edges, hat_v, hover_v, hp, hz, kick_v, clap_v, lp, noise, pad, pluck_v,
    pop_v, saw, scan_v, signature, sub_v, sweep_v, tab_v, tick_v, tt, type_v, lock_v, glass_v,
)

ROOT = os.path.dirname(os.path.dirname(HERE))
REPO = os.path.dirname(os.path.dirname(ROOT))
T = json.load(open(os.path.join(ROOT, 'src/playbook/timeline.json')))
FPS = T['fps']
DUR = T['durationInFrames']
N = int(round(DUR / FPS * SR)) + SR
BPM = 124
BEAT_F = 60 / BPM * FPS  # frames per beat (31.30)
rng = np.random.default_rng(5)
CUES = []


def fs(fr):
    return int(round(fr / FPS * SR))


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
VO_SPANS = [(v['start'], v['end']) for v in T['VO'].values()]


def under_vo(fr):
    return any(a - 6 <= fr <= b + 6 for a, b in VO_SPANS)


def cue(frame, scene, event, sound, sig, gain, pan=0.0, cat='MEDIUM', notes='', send=None):
    sfx.put(sig, frame, gain, pan)
    if send is not None:
        verb.put(sig, frame, gain + send)
    CUES.append({'frame': int(round(frame)), 'time': round(frame / FPS, 3), 'scene': scene, 'event': event, 'sound': sound, 'category': cat,
                 'volume_db': round(gain, 1), 'pan': round(float(pan), 2), 'ducking': 'sfx −5 dB under VO' if under_vo(frame) else 'none', 'notes': notes})


def sig_cue(frame, scene, event, level, gain):
    s, off = signature(level)
    sfx.put(s, frame - off * FPS, gain)
    verb.put(s, frame - off * FPS, gain - 7)
    CUES.append({'frame': int(frame), 'time': round(frame / FPS, 3), 'scene': scene, 'event': event, 'sound': f'SIGNATURE ({level})', 'category': 'SIGNATURE',
                 'volume_db': gain, 'pan': 0, 'ducking': 'sfx −5 dB under VO' if under_vo(frame) else 'none', 'notes': 'three ascending tones lead in; the lock transient lands exactly on this frame'})


K = lambda k: T[k]  # noqa: E731
VS = lambda k: T['VO'][k]['start']  # noqa: E731

# ─────────────────────────── VOICE (dry, close, consistent) ───────────────────────────
voice_env = np.zeros(N)
for sid, v in T['VO'].items():
    x, sr = sf.read(os.path.join(ROOT, f'public/playbook/voice/{sid}.wav'))
    x = hp(x, 80)
    x = x + 0.4 * hp(x, 3000)  # presence + air: forward, energetic read that survives phone speakers
    rms = np.sqrt(np.mean(x[np.abs(x) > 1e-3] ** 2) + 1e-12)
    x = x / rms * db(-20)
    x = np.tanh(x * 1.5) / 1.5  # gentle glue, no pumping
    voice.put(x, v['start'], 0.0)
    verb.put(x, v['start'], -30)  # barely-there room so it isn't sterile
    s0 = fs(v['start'])
    voice_env[s0:s0 + len(x)] = np.maximum(voice_env[s0:s0 + len(x)], np.abs(x) / np.max(np.abs(x)))

# ─────────────────────────── SFX (playbook) ───────────────────────────
for g in K('CLOCK_GLITCH') + [K('MINUTE_FLIP'), K('SEARCH_IN'), K('TABS_IN')]:
    cue(g, 'night', 'clock glitch', 'digital glitch', tick_v(rng.uniform(1800, 3200), 0.006, 0.05) + 0.6 * hp(noise(0.05), 2500) * np.exp(-tt(0.05) / 0.01), -24, rng.uniform(-0.3, 0.3), 'MICRO')
cue(K('CLOCK_IN'), 'night', 'clock appears', 'low hit', sub_v(light=True), -20, cat='MACRO')
cue(K('BUILD_IN'), 'night', 'clock parks / prompt in', 'whoosh', sweep_v(0.3, 3000, 500, 'fall', 1.2), -27, -0.3, 'MACRO')
for k in K('BUILD_KEYS')[::2]:
    cue(k, 'night', 'key', 'type', type_v(), -29, rng.uniform(-0.1, 0.1), 'MICRO')
for j, fr in enumerate(K('BUILD_STEPS')):
    cue(fr, 'night', f'site region {j + 1}', 'construct', tick_v(hz(74 + j * 2), 0.016), -27, -0.3 + 0.08 * j, 'MICRO')
cue(K('BUILD_DONE'), 'night', '40 min ✓', 'pop lock', lock_v([hz(86), hz(93)], 0.16), -22, 0.4)
cue(K('SEARCH_IN'), 'night', 'site flies out', 'whip', sweep_v(0.25, 600, 5000, 'rise', 1.2), -24, -0.5, 'MACRO')
for k in K('SEARCH_KEYS'):
    cue(k, 'night', 'key', 'type', type_v(), -28, rng.uniform(-0.1, 0.1), 'MICRO')
cue(K('SEARCH_BURST'), 'night', 'letters explode', 'glass burst', glass_v(), -20, cat='MACRO')
cue(K('SEARCH_BURST'), 'night', 'burst body', 'sub', sub_v(light=True), -19, cat='MACRO')


def mixs(*xs):
    n = max(len(x) for x in xs)
    out = np.zeros(n)
    for x in xs:
        out[:len(x)] += x
    return out


for j, fr in enumerate(K('TAB_STEPS')):
    cue(fr, 'night', ['5 tabs', '9 tabs', '13 tabs', '14 TABS.'][j], 'glitch hit', mixs(clap_v() * 0.6, tick_v(2400, 0.01, 0.05)), -22 + j, rng.uniform(-0.3, 0.3), 'MEDIUM')
    for q in range(4):
        cue(fr + q * 2, 'night', 'tab pops', 'tab', tab_v(), -27, rng.uniform(-0.8, 0.8), 'MICRO')
for k_, sc in (('HERE_IN', -0.6), ('THERE_IN', 0.6)):
    cue(K(k_), 'night', k_.lower(), 'whoosh + hit', sweep_v(0.18, 500, 4000, 'rise', 1.2), -25, sc, 'MACRO')
cue(K('EVERY_IN'), 'night', 'everywhere ring', 'swirl', sweep_v(0.8, 300, 3000, 'bell', 1.4), -23, cat='MACRO')
cue(K('SPLAT') - 8, 'transition', 'liquid splat', 'reverse swell', sweep_v(8 / 60, 200, 4000, 'rise'), -22, cat='MACRO')
cue(K('SPLAT'), 'transition', 'night → day', 'splash impact', mixs(sub_v() * 0.8, 0.5 * lp(noise(1.1), 1500) * np.exp(-tt(1.1) / 0.08)), -16, cat='MACRO')
cue(K('PB_TITLE'), 'day', 'The playbook.', 'type hit', click_v(deep=True), -22)
for j, fr in enumerate(K('PB_STEPS')):
    cue(fr, 'day', f'step {j + 1} row', 'tick', tick_v(hz(77 + j * 3), 0.02), -24, -0.2, 'MICRO')
for k_ in ('STEP1', 'STEP2', 'STEP3', 'STEP4'):
    cue(K(k_), 'day', k_, 'stage swap whoosh', sweep_v(0.22, 2800, 500, 'fall', 1.2), -26, 0.4, 'MACRO')
for j, fr in enumerate(K('ONE_PINS')):
    cue(fr, 'day', 'pin drops', 'pop', pop_v(rng.uniform(500, 800), 180), -27, rng.uniform(0.1, 0.8), 'MICRO')
cue(K('ONE_CARD'), 'day', 'Prospectify card', 'slide', sweep_v(0.2, 700, 3000, 'bell'), -26, 0.6, 'MACRO')
for j in range(3):
    cue(K('ONE_RANK') + j * 6, 'day', 'ranked lead', 'tick', tick_v([hz(89), hz(86), hz(84)][j], 0.014), -24, 0.5, 'MICRO')
a_, b_ = K('TWO_TYPE')
for fr in range(a_, b_, 3):
    cue(fr, 'day', 'message types', 'type', type_v(), -31, rng.uniform(-0.1, 0.3), 'MICRO')
cue(K('TWO_COPY'), 'day', 'Copied', 'click + confirm', click_v(), -20)
cue(K('THREE_PICK'), 'day', 'pick builder', 'click', click_v(), -20, -0.2)
for j, fr in enumerate(K('THREE_STEPS')):
    cue(fr, 'day', f'site region {j + 1}', 'construct', tick_v(hz(74 + j * 2), 0.018), -25, 0.1 * j - 0.3, 'MICRO')
cue(K('STEP4') + 10, 'day', 'message bubble', 'send whoosh', sweep_v(0.2, 800, 4000, 'rise'), -25, 0.3, 'MACRO')
cue(K('FOUR_SENT'), 'day', 'Sent.', 'sent pop', mixs(pop_v(900, 400, 0.08), tick_v(hz(93), 0.03)), -20, 0.3)
for fr in K('KNEW_CHECKS'):
    cue(fr, 'day', 'check', 'check tick', tick_v(hz(89), 0.03), -21, -0.3)
cue(K('NIGHTS_HIT'), 'day', 'all night.', 'glitch hit', mixs(clap_v(), sub_v(light=True) * 0.6), -18, cat='MACRO')
cue(K('MERGE'), 'day', 'steps 1+2 merge', 'suck in', sweep_v(0.3, 3000, 300, 'rise', 1.3), -22, -0.4, 'MACRO')
sig_cue(K('LOGO') + 6, 'brand', 'Prospectify mark', 'strong', -14)
cue(K('TAG1'), 'brand', 'Fewer tabs.', 'tabs fall away', sweep_v(0.6, 3000, 300, 'fall', 1.2), -24, cat='MACRO')
cue(K('TAG2'), 'brand', 'More clients.', 'hit', click_v(deep=True), -19)
sig_cue(K('CTA') + 4, 'cta', 'CTA', 'partial', -19)
cue(K('URL'), 'cta', 'url', 'tick', tick_v(hz(89), 0.012), -28, cat='MICRO')
cue(K('URL') + 34, 'cta', 'cursor clicks Start free', 'click', click_v(), -21, 0.2)





# D minor = the grind. F major = Prospectify. Energy from the first second; two drops (reveal, website build).
Dm9 = [50, 57, 60, 64, 65]
Bbmaj9 = [46, 53, 57, 60, 62]
Gm9 = [43, 50, 53, 57, 58]
Asus = [45, 52, 57, 59, 62]
Fadd9 = [41, 53, 57, 60, 67]
C_E = [40, 52, 55, 60, 62]
Dm7 = [38, 50, 57, 60, 65]
Bbadd9 = [46, 53, 58, 60, 62]
Csus = [48, 55, 60, 62, 65]
CROOT = {id(Dm9): 38, id(Bbmaj9): 34, id(Gm9): 31, id(Asus): 33, id(Fadd9): 29, id(C_E): 28, id(Dm7): 38, id(Bbadd9): 34, id(Csus): 36}
MU = {'pad': -30, 'kick': -18, 'clap': -26, 'hat': -34, 'ohat': -36, 'bass': -24, 'pluck': -31, 'arp': -31, 'ost': -32, 'riser': -29, 'drone': -30, 'perc': -33, 'impact': -18, 'roll': -30}
pump = Bus('pump')  # pads / bass / arps — sidechained to the kick
kick_env = np.zeros(N)


def grid(fr):
    return round(fr / BEAT_F) * BEAT_F


def beats(a, b, step=1.0):
    fr = grid(a)
    if fr < a - 1:
        fr += BEAT_F * step
    while fr < b - 1:
        yield fr
        fr += BEAT_F * step


def K_(fr, g=0.0, punch=1.0):
    music.put(kick_v(punch), fr, MU['kick'] + g)
    s0 = fs(fr)
    n = int(0.22 * SR)
    seg = np.exp(-np.arange(n) / (0.07 * SR))
    e = min(N, s0 + n)
    kick_env[s0:e] = np.maximum(kick_env[s0:e], seg[: e - s0])


def pad_span(a, b, notes, gain, cut=1600, att=0.15, rel=0.4, bus=None):
    if b <= a:
        return
    p = pad(notes, (b - a) / FPS + rel, cut, att, rel)
    (bus or pump).put(p, a, gain)
    verb.put(p, a, gain - 9)


def bass(a, b, root, gain=0.0, step=0.5, off=True):
    for k, fr in enumerate(beats(a, b, step)):
        t_ = fr + (BEAT_F * step / 2 if off else 0)
        if t_ < b:
            s = pluck_v(hz(root), 0.22, 0.09, 520) + 0.5 * pluck_v(hz(root + 12), 0.22, 0.05, 1400)
            pump.put(s, t_, MU['bass'] + gain)


def drums(a, b, kick=1, clap=True, hats=2, ohat=True, gain=0.0):
    for i, fr in enumerate(beats(a, b)):
        if kick == 1 or (kick == 2 and i % 2 == 0):
            K_(fr, gain)
        if clap and i % 2 == 1:
            music.put(clap_v(), fr, MU['clap'] + gain, 0.05)
            verb.put(clap_v(), fr, MU['clap'] - 9)
        if hats >= 1:
            music.put(hat_v(), fr + BEAT_F / 2, MU['hat'] + gain + (2 if ohat else 0), 0.2)
        if hats >= 2:
            music.put(hat_v(), fr + BEAT_F / 4, MU['hat'] - 4 + gain, -0.25)
            music.put(hat_v(), fr + 3 * BEAT_F / 4, MU['hat'] - 4 + gain, -0.25)
        if ohat and i % 2 == 1:
            music.put(hat_v(True), fr + BEAT_F / 2, MU['ohat'] + gain, 0.3)


def halftime(a, b, gain=0.0):
    for i, fr in enumerate(beats(a, b)):
        if i % 4 == 0 or i % 4 == 2.5:
            K_(fr, gain - 1)
        if i % 4 == 2:
            music.put(clap_v(), fr, MU['clap'] + gain, 0.05)
            verb.put(clap_v(), fr, MU['clap'] - 6)
        if i % 4 == 3:
            K_(fr + BEAT_F / 2, gain - 4)
        music.put(hat_v(), fr + BEAT_F / 2, MU['hat'] + gain - 2, 0.2)


def arp(a, b, notes, step=0.25, gain=0.0, bright=3200):
    for k, fr in enumerate(beats(a, b, step)):
        pump.put(pluck_v(hz(notes[k % len(notes)]), 0.22, 0.06, bright), fr, MU['arp'] + gain, 0.3 * (-1) ** k)


def roll(a, b, gain=0.0):
    """snare roll that accelerates into b"""
    span = b - a
    t = 0.0
    k = 0
    while t < span:
        fr = a + t
        music.put(clap_v() * 0.8, fr, MU['roll'] + gain + 8 * (t / span), 0.05 * (-1) ** k)
        step = BEAT_F * (0.5 if t < span * 0.5 else 0.25 if t < span * 0.8 else 0.125)
        t += step
        k += 1


def riser(a, b, gain=0.0):
    music.put(sweep_v((b - a) / FPS, 300, 6000, 'rise', 2.2), a, MU['riser'] + gain)


def impact(fr, gain=0.0):
    music.put(sub_v(), fr, MU['impact'] + gain)
    music.put(hat_v(True), fr, MU['ohat'] + 6 + gain)
    verb.put(clap_v(), fr, MU['clap'] - 2)


def progression(a, b, chords, bars=1.0, gain=0.0, cut=1700, bgain=0.0, bstep=0.5):
    span = BEAT_F * 4 * bars
    i, fr = 0, a
    while fr < b - 1:
        c = chords[i % len(chords)]
        e = min(b, fr + span)
        pad_span(fr, e, c, MU['pad'] + gain, cut)
        bass(fr, e, CROOT[id(c)], bgain, bstep)
        fr, i = e, i + 1


# NIGHT — tense, filtered pulse that builds through the tabs, peaks on "everywhere", cuts for the splat
N0, N1 = K('CLOCK_IN'), K('SPLAT') - 4
pad_span(N0, N1, Dm9, MU['pad'] - 2, 1100, 0.4, bus=music)
for i, fr in enumerate(beats(N0, K('SEARCH_IN'))):
    K_(fr, -6 + 3 * (fr > K('BUILD_IN')), 0.7)
drums(K('BUILD_IN'), K('SEARCH_IN'), kick=0, clap=False, hats=1, ohat=False, gain=-4)
arp(K('BUILD_IN'), K('SEARCH_IN'), [62, 69, 65, 72], 0.25, -4, 2400)
drums(K('SEARCH_IN'), N1, kick=1, clap=True, hats=2, ohat=True, gain=-1)
bass(K('SEARCH_IN'), N1, 38, 0, 0.25)
arp(K('TABS_IN'), N1, [50, 53, 57, 60, 57, 62, 60, 65], 0.25, 0, 3000)
roll(K('HERE_IN'), N1, 0)
riser(K('TABS_IN'), N1, 0)
# DAY — the drop: bright F-major groove under the playbook
D0, D1 = K('SPLAT'), K('KNEW')
impact(D0, 0)
drums(D0, D1, kick=1, clap=True, hats=2, ohat=True, gain=0)
progression(D0, D1, [Fadd9, C_E, Dm7, Bbadd9], 1.0, 0, 2100)
arp(D0, D1, [77, 72, 69, 72, 81, 77, 72, 77], 0.25, -2, 3800)
# KNEW / NIGHTS — strip back to halftime, tension on "nights"
halftime(K('KNEW'), K('MERGE'), -2)
pad_span(K('KNEW'), K('MERGE'), Dm7, MU['pad'], 1500)
roll(K('NIGHTS_HIT'), K('MERGE'), -1)
riser(K('NIGHTS'), K('MERGE'), 0)
# BRAND — second drop, then the tag and a clean end
B0 = K('MERGE')
impact(B0, 0)
drums(B0, K('URL'), kick=1, clap=True, hats=2, ohat=True, gain=0)
progression(B0, K('URL') + 10, [Fadd9, Bbadd9, C_E, Dm7], 1.0, 1, 2300, 1)
arp(B0, K('URL'), [77, 81, 84, 81, 89, 84, 81, 84], 0.25, -1, 4200)
impact(K('URL') + 12, -2)
pad_span(K('URL') + 12, DUR + 40, [29, 41, 53, 57, 60, 64, 67], MU['pad'] + 2, 2400, 0.02, 1.2, bus=music)

# sidechain: pads / bass / arps duck with every kick
sc = np.clip(kick_env, 0, 1)
pump.buf *= 1 - 0.55 * sc
music.buf += pump.buf

# ─────────────────────────── ROOM · DUCK · MASTER ───────────────────────────


def make_ir(d=2.0):
    t = tt(d)
    irs = [lp(noise(d) * np.exp(-t / 0.5), 6500) * np.minimum(1, t / 0.01) for _ in range(2)]
    ir = np.vstack(irs)
    return ir / np.sqrt(np.sum(ir ** 2))


ir = make_ir()
music.buf += np.vstack([fftconvolve(verb.buf[c], ir[c])[:N] for c in range(2)]) * db(-10)

env = maximum_filter1d(voice_env, int(0.04 * SR))
a_, r_ = np.exp(-1 / (0.012 * SR)), np.exp(-1 / (0.3 * SR))
sm = np.empty_like(env)
cur = 0.0
for i in range(0, N, 32):
    v = env[i]
    cur = v + (cur - v) * (a_ ** 32 if v > cur else r_ ** 32)
    sm[i:i + 32] = cur
duck = np.clip(sm, 0, 1)
music.buf *= 1 - (1 - db(-15)) * duck
sfx.buf *= 1 - (1 - db(-5)) * duck
# keep the low end out of the voice's way: music low-mids dip under speech
music.buf = music.buf - 0.35 * np.vstack([lp(hp(music.buf[c], 180), 900) for c in range(2)]) * duck


def measure(x):
    tmp = os.path.join(ROOT, 'renders', '_lufs_playbook.wav')
    sf.write(tmp, x.T.astype(np.float32), SR)
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.remove(tmp)
    j = json.loads(out[out.rfind('{'): out.rfind('}') + 1])
    return float(j['input_i']), float(j['input_tp'])


def limit(x, ceiling_db):
    ceiling = db(ceiling_db)
    g = np.minimum(1.0, ceiling / np.maximum(np.max(np.abs(x), axis=0), 1e-9))
    g = minimum_filter1d(g, int(0.002 * SR) * 2 + 1)
    rel = np.exp(-1 / (0.08 * SR))
    out = np.empty_like(g)
    c = 1.0
    for i in range(len(g)):
        c = g[i] if g[i] < c else g[i] + (c - g[i]) * rel
        out[i] = c
    return x * out


n_out = int(round(DUR / FPS * SR))
stems = {'voice': voice.buf, 'music': music.buf, 'sfx': sfx.buf}
mix = sum(stems.values())
mix = np.vstack([hp(ch, 30) for ch in mix])[:, :n_out]
nf = int(0.2 * SR)
mix[:, -nf:] *= np.linspace(1, 0, nf) ** 2
pre = mix / np.max(np.abs(mix)) * 0.5
I0, _ = measure(pre)
gain = db(-14 - I0) * 0.5 / np.max(np.abs(mix))
out = limit(mix * gain, -1.6)
I1, TP = measure(out)
OUT = os.path.join(ROOT, 'public/playbook/audio')
os.makedirs(os.path.join(OUT, 'stems'), exist_ok=True)
sf.write(os.path.join(OUT, 'playbook-mix.wav'), out.T.astype(np.float32), SR, subtype='PCM_24')
for name, s in stems.items():
    sf.write(os.path.join(OUT, 'stems', f'{name}.wav'), (s[:, :n_out] * gain).T.astype(np.float32), SR, subtype='PCM_24')
CUES.sort(key=lambda c: c['frame'])
os.makedirs(os.path.join(REPO, 'motion-source/production'), exist_ok=True)
json.dump({'fps': FPS, 'sampleRate': SR, 'bpm': BPM, 'integratedLUFS': round(I1, 2), 'truePeak_dBTP': round(TP, 2), 'mixPriority': ['voice', 'music', 'sfx'],
           'ducking': {'music': '-13 dB under voice (12 ms attack, 300 ms release) + low-mid dip', 'sfx': '-5 dB under voice'}, 'cues': CUES},
          open(os.path.join(REPO, 'motion-source/production/playbook/AUDIO_CUE_MAP.json'), 'w'), indent=1, ensure_ascii=False)
print(f'mix {out.shape[1] / SR:.3f}s · {I1:.2f} LUFS · TP {TP:.2f} dBTP · {len(CUES)} cues')
