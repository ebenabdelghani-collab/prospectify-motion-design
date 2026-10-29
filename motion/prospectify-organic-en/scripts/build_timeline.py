#!/usr/bin/env python3
"""Script + word timings of the voiceover -> src/data/timeline.json (cue frames for every visual beat).

The voice take is transcribed with Whisper (scripts/transcribe.py -> public/audio/vo.words.json).
Script words are aligned to the transcript (difflib), so every cue below lands on the real word.
Without a transcript, an estimated read (~165 wpm) stands in so the film can be previewed.
"""
import difflib
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 60
LEAD = 0.25          # seconds of picture before the first word
TAIL = 1.6           # seconds held after the last word (end card)

SCRIPT = open(os.path.join(ROOT, 'scripts/script.txt')).read()

# (cue name, phrase in the script). Searched in order: each phrase is found after the previous one.
CUES = [
    ('S1', 'Right now'), ('street', 'street'), ('money', 'real money'), ('nosite', 'no website at all'),
    ('S2', 'Five-star'), ('line', 'A line'), ('search', 'search for it'), ('nothing', 'nothing'),
    ('S3', 'Every day'), ('cant', "can't find"), ('else', 'somewhere else'),
    ('S4', "And it's not"), ('millions', 'millions'), ('city', 'every city'),
    ('S5', 'Which is why'), ('building', 'building websites'), ('simplest', 'simplest'),
    ('S6', 'With AI'), ('afternoon', 'afternoon'), ('owners', 'owners'), ('p500', 'five hundred'),
    ('p2000', 'two thousand'),
    ('S7', 'Some small agencies'), ('fifty', 'fifty thousand'), ('month', 'a month'),
    ('S8', 'So why'), ('everyone', 'everyone'),
    ('S9', 'Because building'), ('hard', 'hard part'), ('finding', 'Finding the clients'),
    ('S10', 'Hours on Google Maps'), ('checking', 'Checking every'), ('writing', 'Writing every'),
    ('hand', 'by hand'),
    ('S11', "That's where"), ('quit', 'quit'),
    ('S12', 'The ones who scale'), ('tool', 'They use a tool'), ('prospectify', 'Prospectify'),
    ('finds', 'It finds'), ('writes', 'writes the message'), ('prompt', 'even writes the prompt'),
    ('build', 'build their site'),
    ('S13', 'The skill'), ('clients', 'The clients are'), ('outthere', 'out there'),
    ('S14', 'Comment'), ('up', 'UP'), ('link', 'the link'), ('findsyou', 'finds them'),
]


def norm(w):
    return re.sub(r"[^a-z0-9']", '', w.lower().replace('’', "'"))


raw = SCRIPT.split()
words = [norm(w) for w in raw]

vo_words_path = os.path.join(ROOT, 'public/audio/vo.words.json')
if os.path.exists(vo_words_path):
    tx = json.load(open(vo_words_path))            # [[start, end, word], ...]
    tw = [norm(w) for _, _, w in tx]
    sm = difflib.SequenceMatcher(a=words, b=tw, autojunk=False)
    times = [None] * len(words)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            times[a + k] = (tx[b + k][0], tx[b + k][1])
    known = [i for i, t in enumerate(times) if t]
    for i in range(len(words)):                    # unmatched words ("$500" vs "five hundred"): interpolate
        if times[i] is None:
            lo = max([k for k in known if k < i], default=None)
            hi = min([k for k in known if k > i], default=None)
            if lo is None:
                times[i] = (times[hi][0], times[hi][0])
            elif hi is None:
                times[i] = (times[lo][1], times[lo][1])
            else:
                f = (i - lo) / (hi - lo)
                s = times[lo][1] + f * (times[hi][0] - times[lo][1])
                times[i] = (s, s)
    vo_end = tx[-1][1]
    source = 'whisper'
else:
    t, times = 0.0, []
    for w in raw:
        d = 0.22 + 0.014 * len(norm(w))
        times.append((t, t + d))
        t += d + (0.36 if re.search(r'[.?!]$', w) else 0.12 if w.endswith(',') or w.endswith('...') else 0.0)
    vo_end = t
    source = 'estimate'

cue, pos = {}, 0
for name, phrase in CUES:
    p = [norm(w) for w in phrase.split()]
    for i in range(pos, len(words)):
        if words[i:i + len(p)] == p:
            cue[name] = round((times[i][0] + LEAD) * FPS)
            pos = i + 1
            break
    else:
        raise SystemExit(f'cue not found: {name} / {phrase}')

# Word list for the optional caption track and QA.
wl = [{'w': raw[i], 's': round((times[i][0] + LEAD) * FPS), 'e': round((times[i][1] + LEAD) * FPS)}
      for i in range(len(raw))]
out = {
    'fps': FPS, 'source': source, 'voAt': round(LEAD * FPS),
    'durationInFrames': round((vo_end + LEAD + TAIL) * FPS),
    'cues': cue, 'words': wl,
}
json.dump(out, open(os.path.join(ROOT, 'src/data/timeline.json'), 'w'), indent=1)
print(source, out['durationInFrames'], 'frames', f"{out['durationInFrames'] / FPS:.2f}s")
