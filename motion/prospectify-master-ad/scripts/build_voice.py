#!/usr/bin/env python3
"""Synthesize the voiceover (Kokoro TTS, local) → public/voice/*.wav + src/constants/voice.json.

Each segment is trimmed to its spoken extent so its start frame is exact; the timeline is then
built around the real speech (scripts/build_timeline.py). Cached by text/voice/speed.
"""
import hashlib
import json
import os
import sys

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

from voice_script import PHONEME_OVERRIDES, SEGMENTS, VOICE

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'public/voice')
CACHE = os.path.join(ROOT, 'renders/_voicecache')
os.makedirs(OUT, exist_ok=True)
os.makedirs(CACHE, exist_ok=True)

_k = None


def kokoro():
    global _k
    if _k is None:
        from kokoro_onnx import Kokoro

        _k = Kokoro(os.path.join(HERE, 'kokoro-v1.0.onnx'), os.path.join(HERE, 'voices-v1.0.bin'))
    return _k


def synth(text, speed):
    key = hashlib.sha1(f'{VOICE}|{speed}|{text}|{PHONEME_OVERRIDES}'.encode()).hexdigest()[:16]
    path = os.path.join(CACHE, key + '.wav')
    if not os.path.exists(path):
        k = kokoro()
        ph = k.tokenizer.phonemize(text, 'en-us')
        for a, b in PHONEME_OVERRIDES.items():
            ph = ph.replace(a, b)
        s, sr = k.create(ph, voice=VOICE, speed=speed, is_phonemes=True)
        sf.write(path, s, sr)
    s, sr = sf.read(path)
    return s, sr


def trim(x, sr, thr_db=-42, pre=0.012, post=0.06):
    env = np.convolve(np.abs(x), np.ones(int(0.01 * sr)) / int(0.01 * sr), 'same')
    on = np.where(env > np.max(env) * 10 ** (thr_db / 20))[0]
    a = max(0, on[0] - int(pre * sr))
    b = min(len(x), on[-1] + int(post * sr))
    y = x[a:b].copy()
    f = int(0.006 * sr)
    y[:f] *= np.linspace(0, 1, f)
    y[-f:] *= np.linspace(1, 0, f)
    return y


SKIP = '--skip-synth' in sys.argv  # use human takes already placed in public/voice/<id>.wav

meta = {}
for sid, text, gap, speed in SEGMENTS:
    if SKIP:
        s, sr = sf.read(os.path.join(OUT, f'{sid}.wav'))
        s = s.mean(1) if s.ndim > 1 else s
        y = trim(s, sr)
        y48 = resample_poly(y, 48000, sr) if sr != 48000 else y
    else:
        s, sr = synth(text, speed)
        y = trim(s, sr)
        y48 = resample_poly(y, 2, 1)  # 24 kHz → 48 kHz
    sf.write(os.path.join(OUT, f'{sid}.wav'), y48.astype(np.float32), 48000, subtype='FLOAT')
    meta[sid] = {'text': text, 'gapBefore': gap, 'seconds': round(len(y48) / 48000, 4)}
    print(f'{sid:12s} {meta[sid]["seconds"]:5.2f}s  {text}')

json.dump(meta, open(os.path.join(ROOT, 'src/constants/voice.json'), 'w'), indent=2)
print('speech total', round(sum(m['seconds'] for m in meta.values()), 2), 's')
