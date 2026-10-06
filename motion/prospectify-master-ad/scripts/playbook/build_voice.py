#!/usr/bin/env python3
"""Final film voiceover → public/playbook/voice/*.wav (48 kHz) + src/playbook/voice.json.

Kokoro (local) with a weighted style blend. Each segment is trimmed to its spoken extent so its
start frame is exact; scripts/final/build_timeline.py then builds the film around real speech.
Candidates: `--candidates` renders N takes per line (different blends/speeds) into renders/_final_takes
and scores them; the selected configuration is the one in voice_script.py.
"""
import hashlib
import json
import os
import sys

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from voice_script import EMPH, PHONEME_OVERRIDES, SEGMENTS, TAKES, TONE, VOICE_BLEND  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
MODEL = os.path.join(ROOT, 'scripts')
OUT = os.path.join(ROOT, 'public/playbook/voice')
CACHE = os.path.join(ROOT, 'renders/_voicecache_playbook')
os.makedirs(OUT, exist_ok=True)
os.makedirs(CACHE, exist_ok=True)

_k = None


def kokoro():
    global _k
    if _k is None:
        from kokoro_onnx import Kokoro

        _k = Kokoro(os.path.join(MODEL, 'kokoro-v1.0.onnx'), os.path.join(MODEL, 'voices-v1.0.bin'))
    return _k


def style(blend):
    V = np.load(os.path.join(MODEL, 'voices-v1.0.bin'))
    return sum(V[n] * w for n, w in blend.items()) / sum(blend.values())


def synth(text, speed, blend=VOICE_BLEND):
    key = hashlib.sha1(f'{sorted(blend.items())}|{speed}|{text}|{PHONEME_OVERRIDES}'.encode()).hexdigest()[:16]
    path = os.path.join(CACHE, key + '.wav')
    if not os.path.exists(path):
        k = kokoro()
        ph = k.tokenizer.phonemize(text, 'en-us')
        for a, b in PHONEME_OVERRIDES.items():
            ph = ph.replace(a, b)
        s, sr = k.create(ph, voice=style(blend), speed=speed, is_phonemes=True)
        sf.write(path, s, sr)
    return sf.read(path)


def trim(x, sr, thr_db=-42, pre=0.012, post=0.07):
    w = int(0.01 * sr)
    env = np.convolve(np.abs(x), np.ones(w) / w, 'same')
    on = np.where(env > np.max(env) * 10 ** (thr_db / 20))[0]
    a = max(0, on[0] - int(pre * sr))
    b = min(len(x), on[-1] + int(post * sr))
    y = x[a:b].copy()
    f = int(0.006 * sr)
    y[:f] *= np.linspace(0, 1, f)
    y[-f:] *= np.linspace(1, 0, f)
    return y


# ─────────────────────────── DIRECTION (word timing · melody · accents) ───────────────────────────
import re  # noqa: E402

import pyworld as pw  # noqa: E402

SR24 = 24000


def words_of(text):
    return [(m.group(0), m.start(), m.end()) for m in re.finditer(r"[A-Za-z0-9'\-]+", text)]


def word_times(text, x, sr):
    """Word boundaries: the take is cut into phrases at its real pauses (matched to the line's
    punctuation), and each phrase is shared between its words by phoneme count, then each boundary is
    snapped to the nearest energy dip (±45 ms)."""
    k = kokoro()
    ws = words_of(text)
    ph = [max(1, len(re.sub(r'[ˈˌː ]', '', k.tokenizer.phonemize(w, 'en-us')))) for w, _, _ in ws]
    # phrase breaks after words followed by . ? ! , or ...
    brk = [i for i, (w, a, b) in enumerate(ws[:-1]) if re.match(r'\s*[.?!,…]', text[b:b + 2])]
    w = int(0.01 * sr)
    env = np.convolve(x ** 2, np.ones(w) / w, 'same')
    thr = np.max(env) * 10 ** (-38 / 10)
    quiet = env < thr
    # silent runs ≥ 60 ms inside the take
    runs, i0 = [], None
    for i, q in enumerate(quiet):
        if q and i0 is None:
            i0 = i
        elif not q and i0 is not None:
            if i - i0 > 0.06 * sr and i0 > 0.05 * sr:
                runs.append((i0 / sr, i / sr))
            i0 = None
    runs = sorted(runs, key=lambda r: r[1] - r[0], reverse=True)[: len(brk)]
    runs.sort()
    if len(runs) < len(brk):  # the take ran a break together: share the whole line by phonemes
        brk, runs = [], []
    groups, g0 = [], 0
    for bi in brk:
        groups.append((g0, bi + 1))
        g0 = bi + 1
    groups.append((g0, len(ws)))
    edges_ = [(0.0, None)] + [(r[0], r[1]) for r in runs]
    total = len(x) / sr
    out = [None] * len(ws)
    for gi, (ga, gb) in enumerate(groups):
        start = edges_[gi][1] if gi > 0 and gi < len(edges_) else (0.0 if gi == 0 else out[ga - 1]['end'])
        end = runs[gi][0] if gi < len(runs) else total
        n = sum(ph[ga:gb])
        t = start
        for j in range(ga, gb):
            d = (end - start) * ph[j] / n
            out[j] = {'w': ws[j][0], 'start': round(t, 3), 'end': round(t + d, 3)}
            t += d
        # snap inner boundaries
        for j in range(ga, gb - 1):
            c = int(out[j]['end'] * sr)
            r = int(0.045 * sr)
            lo, hi = max(0, c - r), min(len(x) - 1, c + r)
            nb = round((lo + int(np.argmin(env[lo:hi]))) / sr, 3)
            out[j]['end'] = out[j + 1]['start'] = nb
    return out


def melody(x, sr):
    xd = x.astype(np.float64)
    f0, t = pw.harvest(xd, sr, f0_floor=110, f0_ceil=520, frame_period=5.0)
    return f0, t, xd


def take_score(x, sr):
    """melodic + clean: semitone spread of voiced F0, penalising octave jumps / creak."""
    f0, _, _ = melody(x, sr)
    v = f0[f0 > 0]
    if len(v) < 10:
        return -1e9
    st = 12 * np.log2(v / np.median(v))
    jumps = np.mean(np.abs(np.diff(st)) > 4)
    return float(np.std(st) - 25 * jumps)


def direct(x, sr, times, emph, tone):
    xd = x.astype(np.float64)
    f0, t = pw.harvest(xd, sr, f0_floor=110, f0_ceil=520, frame_period=5.0)
    sp = pw.cheaptrick(xd, f0, t, sr)
    ap = pw.d4c(xd, f0, t, sr)
    voiced = f0 > 0
    med = np.median(f0[voiced])
    st = np.zeros_like(f0)
    st[voiced] = 12 * np.log2(f0[voiced] / med)
    st *= tone['range']  # livelier melody around the speaker's centre
    st += tone['shift']
    gain = np.ones(len(x))
    lowers = [w['w'].lower() for w in times]
    for e in emph:
        strong = e.endswith('!')
        key = e.rstrip('!').lower()
        if key not in lowers:
            print('   ! emphasis word not found:', e)
            continue
        wi = times[lowers.index(key)]
        a, b = wi['start'], wi['end']
        A = tone['accent'] * (1.25 if strong else 1.0)
        # pitch accent: rise into the stressed syllable (~35% in), then settle
        pk = a + 0.35 * (b - a)
        k = np.where(t < pk, np.clip((t - (a - 0.04)) / max(0.03, pk - a + 0.04), 0, 1), np.clip(1 - (t - pk) / max(0.05, (b - pk) * 1.4), 0, 1))
        st += A * np.sin(k * np.pi / 2) ** 2
        # level: +2.5 dB (+3.5 strong) over the word with soft edges
        g = 10 ** ((3.5 if strong else 2.5) / 20)
        ia, ib = int(max(0, a - 0.02) * sr), int(min(len(x) / sr, b + 0.03) * sr)
        ramp_n = int(0.025 * sr)
        env = np.ones(ib - ia) * g
        env[:ramp_n] = np.linspace(1, g, min(ramp_n, len(env)))[: len(env[:ramp_n])]
        env[-ramp_n:] = np.linspace(g, 1, ramp_n)[-len(env[-ramp_n:]):]
        gain[ia:ib] = np.maximum(gain[ia:ib], env)
    f0n = np.where(voiced, med * 2 ** (st / 12), 0.0)
    y = pw.synthesize(f0n, sp, ap, sr, 5.0)[: len(x)]
    if len(y) < len(x):
        y = np.pad(y, (0, len(x) - len(y)))
    y *= gain
    return (y / max(1e-9, np.max(np.abs(y))) * np.max(np.abs(x))).astype(np.float32)


if __name__ == '__main__':
    meta = {}
    takes_dir = os.path.join(ROOT, 'renders/_playbook_takes')
    os.makedirs(takes_dir, exist_ok=True)
    # one voice for the whole film: the blend with the best mean score across every line wins
    scores = np.zeros(len(TAKES))
    for sid, text, gap, speed, act in SEGMENTS:
        for ti, blend in enumerate(TAKES):
            s, sr = synth(text, speed, blend)
            y = trim(s, sr)
            scores[ti] += take_score(y, sr) / len(SEGMENTS)
            sf.write(os.path.join(takes_dir, f'{sid}_t{ti}.wav'), y, sr)
    ti = int(np.argmax(scores))
    blend = TAKES[ti]
    print('take scores', np.round(scores, 2), '→', blend)
    for sid, text, gap, speed, act in SEGMENTS:
        s, sr = synth(text, speed, blend)
        y = trim(s, sr)
        sc = take_score(y, sr)
        times = word_times(text, y, sr)
        yd = direct(y, sr, times, EMPH.get(sid, []), TONE[act])
        y48 = resample_poly(yd, 2, 1)  # 24 kHz → 48 kHz
        sf.write(os.path.join(OUT, f'{sid}.wav'), y48.astype(np.float32), 48000, subtype='FLOAT')
        meta[sid] = {'text': text, 'gapBefore': gap, 'seconds': round(len(y48) / 48000, 4), 'act': act, 'speed': speed, 'take': ti, 'words': times}
        print(f'{sid:12s} {meta[sid]["seconds"]:5.2f}s take {ti} ({sc:4.2f})  {text}')
    json.dump(meta, open(os.path.join(ROOT, 'src/playbook/voice.json'), 'w'), indent=2)
    tot = sum(m['seconds'] for m in meta.values())
    words = sum(len(m['text'].split()) for m in meta.values())
    print('speech', round(tot, 2), 's ·', words, 'words · speech-only rate', round(words / tot * 60), 'wpm')
