"""
PROSPECTIFY — "THE PLAYBOOK" (16:9). Acquisition film, Lovable-style:
the subject is the process (how people sell AI websites to local businesses); Prospectify is the missing
piece inside it, named only near the end.

(id, text, gap_before_seconds, speed, act)
"""

VOICE_BLEND = {'af_heart': 0.55, 'af_sarah': 0.45}
PHONEME_OVERRIDES = {'pɹəspˈɛktᵻfˌaɪ': 'pɹˈɑːspɛktᵻfˌaɪ'}

SEGMENTS = [
    # ACT 1 — NIGHT (the grind)
    ('p_time', "It's eleven forty-six PM.", 0.55, 1.05, 'night'),
    ('p_built', "The website took forty minutes.", 0.35, 1.10, 'night'),
    ('p_find', "Finding someone to buy it?", 0.55, 1.08, 'night'),
    ('p_tabs', "Fourteen tabs.", 0.95, 1.05, 'night'),
    ('p_here', "They're over here...", 0.55, 1.12, 'night'),
    ('p_there', "over there...", 0.12, 1.12, 'night'),
    ('p_every', "everywhere.", 0.12, 1.06, 'night'),
    # ACT 2 — DAY (the playbook)
    ('p_playbook', "Here's the playbook that actually works!", 0.95, 1.08, 'day'),
    ('p_one', "One. Find a business that already has customers.", 0.70, 1.10, 'day'),
    ('p_two', "Two. Know exactly what to say.", 0.85, 1.10, 'day'),
    ('p_three', "Three. Build their site with AI.", 0.85, 1.10, 'day'),
    ('p_four', "Four. Send it!", 1.10, 1.08, 'day'),
    ('p_knew', "You already knew three and four.", 0.80, 1.06, 'day'),
    ('p_nights', "One and two? That's where your nights go.", 0.45, 1.06, 'day'),
    ('p_does', "Prospectify does both. In one search.", 0.90, 1.04, 'brand'),
    ('p_tag', "Fewer tabs. More clients.", 1.30, 1.00, 'brand'),
    ('p_start', "Start free!", 0.55, 1.00, 'brand'),
]

TAIL_SECONDS = 2.4

# ── DIRECTION ───────────────────────────────────────────────────────────────────────────────────────
# Words the read leans on (pitch accent + level). '!' = strong accent. Applied with a WORLD vocoder
# pass in build_voice.py, on top of the raw Kokoro take, so the line keeps its natural timing.
EMPH = {
    'p_time': ['forty-six'],
    'p_built': ['forty!'],
    'p_find': ['buy'],
    'p_tabs': ['Fourteen!'],
    'p_here': ['here'],
    'p_there': ['there'],
    'p_every': ['everywhere!'],
    'p_playbook': ['playbook', 'actually!'],
    'p_one': ['One!', 'already'],
    'p_two': ['Two!', 'exactly!'],
    'p_three': ['Three!', 'AI!'],
    'p_four': ['Four!', 'Send!'],
    'p_knew': ['already!', 'three', 'four'],
    'p_nights': ['nights!'],
    'p_does': ['both!', 'one!'],
    'p_tag': ['Fewer!', 'More!'],
    'p_start': ['free!'],
}
# Tone per act: pitch range expansion around the speaker's median (liveliness) and register shift (st).
TONE = {
    'night': {'range': 1.30, 'shift': -0.3, 'accent': 2.2},  # tight, a little low: tired, tense
    'day': {'range': 1.50, 'shift': 0.6, 'accent': 3.0},  # bright, bouncy: the coach
    'brand': {'range': 1.45, 'shift': 0.9, 'accent': 3.2},  # confident lift on the payoff
}
# Takes per line (style blends); the most melodic clean take wins (see build_voice.py).
TAKES = [
    {'af_heart': 0.55, 'af_sarah': 0.45},
    {'af_heart': 0.5, 'af_bella': 0.5},
    {'af_bella': 0.7, 'af_nicole': 0.3},
    {'af_heart': 0.7, 'af_nova': 0.3},
]
