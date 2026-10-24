#!/usr/bin/env python3
"""Contrôle qualité automatique du MP4 exporté → exports/qa_report.json + exports/qa_contact_sheet.jpg

Usage : python scripts/qa.py exports/prospectify_fr_meta_conversion_ad_v1.mp4
Vérifie : durée, résolution, i/s, codecs, présence d'audio, images noires, loudness et crête,
transcription Whisper du rendu final comparée au script, et produit une planche (1 image / seconde).
"""
import difflib
import json
import os
import re
import subprocess
import sys
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MP4 = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'exports/prospectify_fr_meta_conversion_ad_v1.mp4')
T = json.load(open(os.path.join(ROOT, 'src/data/timeline.json')))
R = {}


def run(*a):
    return subprocess.run(list(a), capture_output=True, text=True)


p = json.loads(run('ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', MP4).stdout)
v = next(s for s in p['streams'] if s['codec_type'] == 'video')
a = [s for s in p['streams'] if s['codec_type'] == 'audio']
R['duration_s'] = round(float(p['format']['duration']), 3)
R['size_mb'] = round(int(p['format']['size']) / 1e6, 1)
R['video'] = f"{v['codec_name']} {v['width']}x{v['height']} {v['r_frame_rate']} {v.get('pix_fmt')}"
R['audio'] = f"{a[0]['codec_name']} {a[0]['sample_rate']} Hz {a[0]['channels']} ch" if a else 'ABSENT'

bd = run('ffmpeg', '-hide_banner', '-nostats', '-i', MP4, '-vf', 'blackdetect=d=0.1:pix_th=0.06:pic_th=0.98', '-an', '-f', 'null', '-').stderr
R['black_segments'] = re.findall(r'black_start:([\d.]+) black_end:([\d.]+)', bd)

ln = run('ffmpeg', '-hide_banner', '-nostats', '-i', MP4, '-af', 'loudnorm=print_format=json', '-vn', '-f', 'null', '-').stderr
j = json.loads(ln[ln.rfind('{'): ln.rfind('}') + 1])
R['loudness_lufs'], R['true_peak_dbtp'] = float(j['input_i']), float(j['input_tp'])

# Transcription du rendu final (pas de la voix seule) : le mix doit rester intelligible.
wav = os.path.join(ROOT, 'exports', '_qa.wav')
run('ffmpeg', '-y', '-v', 'error', '-i', MP4, '-ac', '1', '-ar', '16000', wav)
from faster_whisper import WhisperModel  # noqa: E402

m = WhisperModel('small', device='cpu', compute_type='int8')
segs, _ = m.transcribe(wav, language='fr', beam_size=5)
heard = ' '.join(s.text.strip() for s in segs)
os.remove(wav)


def toks(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').replace('10', 'dix')
    return re.findall(r'[a-z]+', s)


script = ' '.join(c['text'] for c in T['CAPS'])
sm = difflib.SequenceMatcher(a=toks(script), b=toks(heard), autojunk=False)
R['transcript'] = heard
R['word_match_ratio'] = round(sm.ratio(), 3)
R['word_diffs'] = [(' '.join(toks(script)[i1:i2]), ' '.join(toks(heard)[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
R['prospectify_heard'] = heard.lower().count('prospectify')

# Planche contact : 1 image par seconde.
sheet = os.path.join(ROOT, 'exports/qa_contact_sheet.jpg')
run('ffmpeg', '-y', '-v', 'error', '-i', MP4, '-vf', 'fps=1,scale=180:-1,tile=10x3:padding=4:color=black', '-frames:v', '1', '-q:v', '3', sheet)
R['contact_sheet'] = os.path.relpath(sheet, ROOT)

R['checks'] = {
    'resolution_1080x1920': v['width'] == 1080 and v['height'] == 1920,
    'fps_30': v['r_frame_rate'] in ('30/1', '30000/1000'),
    'h264_aac': v['codec_name'] == 'h264' and bool(a) and a[0]['codec_name'] == 'aac',
    'duration_25_30s': 25 <= R['duration_s'] <= 30,
    'no_black_frames': not R['black_segments'],
    'loudness_-14_pm1': abs(R['loudness_lufs'] + 14) <= 1,
    'peak_below_-1dBTP': R['true_peak_dbtp'] <= -1.0,
    'speech_matches_script_95pct': R['word_match_ratio'] >= 0.95,
    'brand_said_twice': R['prospectify_heard'] >= 2,
}
json.dump(R, open(os.path.join(ROOT, 'exports/qa_report.json'), 'w'), ensure_ascii=False, indent=1)
for k, ok in R['checks'].items():
    print(('OK  ' if ok else 'ÉCHEC'), k)
print(json.dumps({k: R[k] for k in ('duration_s', 'size_mb', 'video', 'audio', 'loudness_lufs', 'true_peak_dbtp', 'word_match_ratio', 'word_diffs')}, ensure_ascii=False, indent=1))
