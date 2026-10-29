#!/usr/bin/env python3
"""public/audio/vo.wav -> public/audio/vo.words.json (Whisper word timings) + a printed transcript for QA."""
import json
import os
import subprocess

import numpy as np
from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(ROOT, 'public/audio/vo.wav')
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
segs, _ = WhisperModel('small.en', compute_type='int8').transcribe(audio, word_timestamps=True)
words = []
for s in segs:
    print(f'[{s.start:6.2f}-{s.end:6.2f}] {s.text}')
    words += [[round(w.start, 3), round(w.end, 3), w.word.strip()] for w in s.words]
json.dump(words, open(os.path.join(ROOT, 'public/audio/vo.words.json'), 'w'))
print(len(words), 'words', f'{len(words) / (words[-1][1] - words[0][0]) * 60:.0f} wpm')
