#!/usr/bin/env python3
"""Final film voiceover → public/final/voice/*.wav (48 kHz) + src/final/voice.json.

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
from voice_script import PHONEME_OVERRIDES, SEGMENTS, VOICE_BLEND  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
MODEL = os.path.join(ROOT, 'scripts')
OUT = os.path.join(ROOT, 'public/final/voice')
CACHE = os.path.join(ROOT, 'renders/_voicecache_final')
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


if __name__ == '__main__':
    meta = {}
    for sid, text, gap, speed, act in SEGMENTS:
        s, sr = synth(text, speed)
        y = trim(s, sr)
        y48 = resample_poly(y, 2, 1)  # 24 kHz → 48 kHz
        sf.write(os.path.join(OUT, f'{sid}.wav'), y48.astype(np.float32), 48000, subtype='FLOAT')
        meta[sid] = {'text': text, 'gapBefore': gap, 'seconds': round(len(y48) / 48000, 4), 'act': act, 'speed': speed}
        print(f'{sid:12s} {meta[sid]["seconds"]:5.2f}s  {text}')
    json.dump(meta, open(os.path.join(ROOT, 'src/final/voice.json'), 'w'), indent=2)
    tot = sum(m['seconds'] for m in meta.values())
    words = sum(len(m['text'].split()) for m in meta.values())
    print('speech', round(tot, 2), 's ·', words, 'words · speech-only rate', round(words / tot * 60), 'wpm')
