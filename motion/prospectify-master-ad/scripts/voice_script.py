"""
Final voiceover, as timed segments.

Each entry: (id, text, gap_before_seconds, speed)
gap_before is the silence/visual-only time *before* the line. That is where the edit breathes:
the stall in the hook, the "which one would you pitch?" beat, the black frame before the reveal,
the pause after BUILD PROMPT — READY.

Delivery: smart 25-year-old founder explaining something obvious once you see it.
Calm, conversational, a little provocative. Never hype.
"""

VOICE = 'af_heart'

# Brand pronunciation override: PROS-pect-ify (stress on first syllable).
PHONEME_OVERRIDES = {'pɹəspˈɛktᵻfˌaɪ': 'pɹˈɑːspɛktᵻfˌaɪ'}

SEGMENTS = [
    # ACT 1 — HOOK
    ('v_build', "You can build a website in forty minutes now.", 0.40, 1.12),
    ('v_find', "But finding someone to sell it to?", 0.90, 1.08),
    ('v_night', "That still eats your whole night.", 0.85, 1.08),
    # ACT 2 — PAIN (one word-group per montage cut)
    ('v_maps', "Maps.", 0.40, 1.14),
    ('v_reviews', "Reviews.", 0.10, 1.14),
    ('v_site', "Their website.", 0.10, 1.14),
    ('v_insta', "Their Instagram.", 0.10, 1.14),
    ('v_email', "An email... somewhere.", 0.10, 1.17),
    ('v_worth', "Is this one even worth pitching?", 0.30, 1.13),
    ('v_zero', "And you still haven't sent a single message.", 0.30, 1.13),
    # ACT 3 — INSIGHT (the question is on screen; the voice waits)
    ('v_nowebsite', "No website isn't the opportunity.", 1.80, 1.08),
    ('v_demand', "It's a business with real customers... and a website holding it back.", 0.30, 1.08),
    # ACT 4 — SCALE
    ('v_fifty', "Now find fifty of them.", 0.55, 1.08),
    ('v_time', "That's where your time goes.", 0.55, 1.08),
    # ACT 5 — REVEAL (black, silence, then the mark)
    ('v_built', "That's what Prospectify is built for.", 1.40, 1.08),
    # ACT 6 — FIND + WHY
    ('v_pick', "Pick a city. Pick a niche.", 0.45, 1.12),
    ('v_finds', "It finds the local businesses actually worth pitching...", 0.40, 1.12),
    ('v_why', "and tells you why.", 0.55, 1.08),
    # ACT 7 — EVERYTHING READY
    ('v_next', "Then it gets your next move ready.", 0.45, 1.12),
    ('v_contact', "The contact.", 0.18, 1.06),
    ('v_angle', "The angle.", 0.18, 1.06),
    ('v_message', "The first message.", 0.18, 1.08),
    # ACT 8 — BUILD PROMPT (slows down)
    ('v_prompt', "And the website prompt...", 0.85, 1.05),
    ('v_exact', "written for that exact business.", 0.20, 1.05),
    # ACT 9 — YOUR BUILDER
    ('v_paste', "Paste it into whatever you build with.", 1.40, 1.1),
    # ACT 10 — BUILD / PITCH
    ('v_buildit', "Build it.", 0.80, 1.06),
    ('v_pitchit', "Pitch it.", 1.00, 1.06),
    # ACT 11/12 — SELL + TRACK
    ('v_sells', "And when it sells, log it,", 0.70, 1.1),
    ('v_working', "and see what's actually working.", 0.85, 1.1),
    # ACT 13 — LOOP
    ('v_l_find', "Find.", 0.70, 1.06),
    ('v_l_pitch', "Pitch.", 0.08, 1.06),
    ('v_l_build', "Build.", 0.08, 1.06),
    ('v_l_sell', "Sell.", 0.08, 1.06),
    ('v_l_repeat', "Repeat.", 0.22, 1.06),
    # ACT 14 — CTA
    ('v_youbuild', "You build the website.", 0.75, 1.05),
    ('v_wefind', "Prospectify finds the client.", 0.18, 1.05),
    ('v_start', "Start free.", 0.70, 1.03),
]

TAIL_SECONDS = 1.55  # end frame holds after the last word
