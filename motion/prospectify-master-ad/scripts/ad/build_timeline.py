#!/usr/bin/env python3
"""THE AD — cues + word-by-word captions from the ElevenLabs take's word timings → src/ad/timeline.json."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
FPS = 60
VO_AT = 18                      # the card is on screen ~0.3 s before she speaks
TAIL = 42                       # last beat after the voice
W = json.load(open(os.path.join(ROOT, 'src/ad/words.json')))
f = lambda t: VO_AT + round(t * FPS)  # noqa: E731
last = f(W[-1]['b'])
END = last + TAIL

def at(word, nth=0, o=0.0):
    k = [x for x in W if re.sub(r"[^a-z0-9']", '', x['w'].lower()) == word.lower()]
    return f(k[nth]['a'] + o) if len(k) > nth else f(W[0]['a'])

C = {'VO_AT': VO_AT}
C['HK_NOWEB'] = at('no')                 # "and no website."
C['HK_SCORE'] = at("that's")             # "That's your next client."
C['PR_IN'] = at('prospectify')
C['ROWS'] = [at('finds') + i * 5 for i in range(6)]
C['MSG_IN'] = at('writes')
C['PROMPT_IN'] = at('prompt')
C['PASTE'] = at('paste')
C['LOVABLE'] = at('lovable')
C['CTA_IN'] = at('10')
C['CTA_FREE'] = at('free')
C['CTA_CLICK'] = last + 16

ACCENT = {'312', 'website', 'client', 'prospectify', 'finds', 'message', 'prompt', 'lovable', '10', 'free'}
FIX = {'lovable': 'Lovable', 'prospectify': 'Prospectify', '10': '10'}
caps, out = [], []
for w in W:
    tok = w['w'].strip(); core = re.sub(r'[^\w]', '', tok)
    tok = tok.replace(core, FIX.get(core.lower(), core))
    out.append({'w': tok, 'a': f(w['a']) - 1, 'b': f(w['b']) + 6, 'accent': core.lower() in ACCENT})
out[0]['w'] = out[0]['w'][:1].upper() + out[0]['w'][1:]
# chunks: break on punctuation, max 3 words
ph, cur = [], []
for w in out:
    cur.append(w)
    if re.search(r'[.,!?]$', w['w']):
        ph.append(cur); cur = []
if cur: ph.append(cur)
for p in ph:
    n = len(p); k = -(-n // 3)
    sizes = [n // k + (1 if i < n % k else 0) for i in range(k)]
    j = 0
    for s in sizes:
        ch = p[j:j + s]; j += s
        caps.append({'words': ch, 'a': ch[0]['a'] - 1, 'b': ch[-1]['b'] + 6})
for i in range(len(caps) - 1):
    caps[i]['b'] = min(max(caps[i]['b'], caps[i + 1]['a'] - 1), caps[i]['b'] + 30, caps[i + 1]['a'] - 1)
caps[-1]['b'] = END - 4

o = {'fps': FPS, 'durationInFrames': END, 'width': 1080, 'height': 1920, 'CAPS': caps, **C}
json.dump(o, open(os.path.join(ROOT, 'src/ad/timeline.json'), 'w'), indent=1)
print('duration', END, '=', round(END / FPS, 2), 's ·', len(caps), 'chunks')
