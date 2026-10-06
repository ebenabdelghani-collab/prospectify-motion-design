#!/usr/bin/env python3
"""SAME NIGHT voiceover → public/versus/voice/*.wav (48 kHz) + src/versus/voice.json (with word timings).

Engine: Chatterbox TTS (Resemble AI, MIT licence) — expressive, with an emotion-intensity control
("exaggeration") set per line in voice_script.py. Runs in its own venv (torch CPU):
    /root/venvs/cb/bin/python scripts/versus/build_voice.py
Up to two takes per line (a second seed only when the first mis-speaks); each take is transcribed by faster-whisper and the take with the
lowest word error (then the most melodic) wins. Whisper's word timestamps give the frame-exact cues used
by build_timeline.py.
"""
import hashlib
import json
import os
import re
import sys

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from voice_script import SEGMENTS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, 'public/versus/voice')
CACHE = os.path.join(ROOT, 'renders/_voicecache_versus')
os.makedirs(OUT, exist_ok=True)
os.makedirs(CACHE, exist_ok=True)
SEEDS = [11, 23]
EXTRA_SEEDS = [37, 51, 73]  # only when no clean take yet
TEMPO = 1.1  # brisker delivery; ffmpeg atempo keeps the pitch
CFG = 0.4
TEMP = 0.8
# Female voice: Chatterbox takes its timbre from a short reference clip. The reference is itself synthetic
# (Kokoro af_bella/af_heart, upbeat read; public/versus/voice/_ref_female.wav) so no real person is cloned.
VOICE_REF = os.path.join(ROOT, 'public/versus/voice/_ref_female.wav')
EX_BOOST = 0.3  # brighter, more playful read across every line

_tts = None
_asr = None


def tts():
    global _tts
    if _tts is None:
        import torch
        from chatterbox.tts import ChatterboxTTS

        torch.set_num_threads(os.cpu_count() or 4)
        _tts = ChatterboxTTS.from_pretrained(device='cpu')
    return _tts


def asr():
    global _asr
    if _asr is None:
        from faster_whisper import WhisperModel

        _asr = WhisperModel('small.en', device='cpu', compute_type='int8')
    return _asr


def synth(text, ex, seed):
    key = hashlib.sha1(f'cb|{text}|{ex}|{CFG}|{TEMP}|{seed}|{VOICE_REF}|{EX_BOOST}'.encode()).hexdigest()[:16]
    path = os.path.join(CACHE, key + '.wav')
    if not os.path.exists(path):
        import torch

        torch.manual_seed(seed)
        m = tts()
        wav = m.generate(text, audio_prompt_path=VOICE_REF, exaggeration=min(1.3, ex + EX_BOOST), cfg_weight=CFG, temperature=TEMP)
        sf.write(path, wav.squeeze(0).numpy(), m.sr)
        print('   synth', seed, flush=True)
    return sf.read(path)


NUM = {'0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '14': 'fourteen', '40': 'forty', '44': 'forty four', '100': 'hundred'}


def norm(s):
    s = s.lower().replace('base44', 'base 44').replace('a.m.', 'am').replace('a m', 'am')
    s = re.sub(r'\d+', lambda m: ' ' + NUM.get(m.group(0), m.group(0)) + ' ', s)
    s = s.replace('-', ' ').replace('scene', 'seen').replace('sight', 'site').replace('for four', 'forty four').replace('everyone', 'every one')
    s = re.sub(r"[^a-z0-9' ]", ' ', s)
    return s.split()


def wer(ref, hyp):
    r, h = norm(ref), norm(hyp)
    d = np.zeros((len(r) + 1, len(h) + 1), int)
    d[:, 0] = range(len(r) + 1)
    d[0, :] = range(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
    return d[len(r), len(h)] / max(1, len(r))


def trim(x, sr, thr_db=-40, pre=0.015, post=0.09):
    w = int(0.01 * sr)
    env = np.convolve(np.abs(x), np.ones(w) / w, 'same')
    on = np.where(env > np.max(env) * 10 ** (thr_db / 20))[0]
    a = max(0, on[0] - int(pre * sr))
    b = min(len(x), on[-1] + int(post * sr))
    y = x[a:b].copy()
    f = int(0.006 * sr)
    y[:f] *= np.linspace(0, 1, f)
    y[-f:] *= np.linspace(1, 0, f)
    return y, a / sr


def melodic(x, sr):
    import pyworld as pw

    f0, _ = pw.harvest(x.astype(np.float64), sr, f0_floor=70, f0_ceil=500, frame_period=5.0)
    v = f0[f0 > 0]
    return float(np.std(12 * np.log2(v / np.median(v)))) if len(v) > 10 else 0.0


def transcribe(path):
    segs, _ = asr().transcribe(path, language='en', word_timestamps=True, beam_size=5)
    words = []
    text = ''
    for s in segs:
        text += s.text
        for w in s.words:
            words.append({'w': w.word.strip(), 'start': w.start, 'end': w.end})
    return text.strip(), words


if __name__ == '__main__':
    meta = {}
    for sid, text, gap, act, ex in SEGMENTS:
        best = None
        for seed in SEEDS + EXTRA_SEEDS:
            nw = len(text.split())
            slow = best is not None and nw >= 8 and (len(best[2]) / best[3]) / nw > 0.4
            if seed in EXTRA_SEEDS and best is not None and best[6] == 0 and not slow:
                break
            x, sr = synth(text, ex, seed)
            y, off = trim(x, sr)
            tmp = os.path.join(CACHE, f'_{sid}_{seed}.wav')
            sf.write(tmp, y, sr)
            hyp, words = transcribe(tmp)
            e = wer(text, hyp)
            mel = melodic(y, sr)
            score = -e * 10 + mel * 0.35 - 4.0 * (len(y) / sr) / max(1, len(text.split()))  # clean > lively > brisk
            print(f'{sid:10s} seed {seed}  wer {e:.2f}  mel {mel:.2f}  {len(y) / sr:.2f}s  “{hyp}”', flush=True)
            if best is None or score > best[0]:
                best = (score, seed, y, sr, words, hyp, e)

        score, seed, y, sr, words, hyp, e = best
        # a hallucinated tail ("…every one go!"): cut right after the script's last word
        last = norm(text)[-1]
        hw = [w for w in words]
        if norm(hyp) and norm(hyp)[-1] != last:
            ends = [w for w in hw if norm(w['w']) and norm(w['w'])[-1] == last]
            if ends:
                cut = int((ends[-1]['end'] + 0.08) * sr)
                y = y[:cut].copy()
                f = int(0.012 * sr)
                y[-f:] *= np.linspace(1, 0, f)
                words = [w for w in hw if w['start'] < ends[-1]['end']]
                hyp = ' '.join(w['w'] for w in words)
                e = wer(text, hyp)
                print(f'   cut hallucinated tail → “{hyp}”')
        import subprocess
        tin, tout = os.path.join(CACHE, '_tin.wav'), os.path.join(CACHE, '_tout.wav')
        sf.write(tin, y, sr)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tin, '-af', f'atempo={TEMPO}', '-ar', '48000', tout], check=True)
        y48, _ = sf.read(tout)
        words = [{'w': w['w'], 'start': w['start'] / TEMPO, 'end': w['end'] / TEMPO} for w in words]
        sf.write(os.path.join(OUT, f'{sid}.wav'), y48.astype(np.float32), 48000, subtype='FLOAT')
        meta[sid] = {'text': text, 'gapBefore': gap, 'seconds': round(len(y48) / 48000, 4), 'act': act, 'exaggeration': ex, 'seed': seed, 'asr': hyp, 'wer': round(e, 3), 'words': [{'w': w['w'], 'start': round(w['start'], 3), 'end': round(w['end'], 3)} for w in words]}
    json.dump(meta, open(os.path.join(ROOT, 'src/versus/voice.json'), 'w'), indent=2)
    tot = sum(m['seconds'] for m in meta.values())
    words = sum(len(m['text'].split()) for m in meta.values())
    print('speech', round(tot, 2), 's ·', words, 'words ·', round(words / tot * 60), 'wpm · worst wer', max(m['wer'] for m in meta.values()))
