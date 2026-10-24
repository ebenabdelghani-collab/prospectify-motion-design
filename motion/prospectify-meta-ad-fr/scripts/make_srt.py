#!/usr/bin/env python3
"""Sous-titres SRT + script horodaté, depuis src/data/timeline.json → exports/."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = json.load(open(os.path.join(ROOT, 'src/data/timeline.json')))
FPS = T['fps']


def ts(fr, sep=','):
    s = max(0, fr) / FPS
    h, m = int(s // 3600), int(s % 3600 // 60)
    return f'{h:02d}:{m:02d}:{s % 60:06.3f}'.replace('.', sep)


srt = []
for i, c in enumerate(T['CAPS'], 1):
    srt.append(f"{i}\n{ts(c['a'])} --> {ts(c['b'])}\n{c['text']}\n")
open(os.path.join(ROOT, 'exports/prospectify_fr_meta_conversion_ad_v1.srt'), 'w').write('\n'.join(srt))

md = ['# Script final horodaté — voix ElevenLabs (homme, FR)', '', '| Début | Fin | Voix | Titre à l\'écran |', '| --- | --- | --- | --- |']
for c in T['CAPS']:
    mid = (c['a'] + c['b']) / 2
    h = next((x for x in T['HEAD'] if x['a'] <= mid <= x['b']), None)
    head = ' / '.join(h['lines']) if h else ('10 PROSPECTS GRATUITS · Essayer gratuitement · prospectify.net' if mid >= T['DIX'] - 4 else '')
    md.append(f"| {ts(c['a'], '.')[3:]} | {ts(c['b'], '.')[3:]} | {c['text']} | {head} |")
md += ['', f"Durée totale : {T['durationInFrames'] / FPS:.2f} s ({T['durationInFrames']} images à {FPS} i/s). La voix démarre à l'image {T['VO_AT']}."]
open(os.path.join(ROOT, 'exports/script_horodate.md'), 'w').write('\n'.join(md) + '\n')
print(len(srt), 'sous-titres')
