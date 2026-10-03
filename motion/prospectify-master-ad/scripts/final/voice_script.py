"""
PROSPECTIFY — FINAL FILM · voiceover as timed segments.

(id, text, gap_before_seconds, speed, act)

gap_before is picture-only time before the line: that is where the film breathes —
the blinking cursor, the "which one would you pitch?" hold, the freeze before the signal,
the pause after the prompt is READY.

Voice: a smart young operator who has lived the problem. Warm, sharp, calm, a little provocative.
Pace map: chaos faster (1.08–1.12) · insight slower (0.95–0.98) · Prospectify controlled (1.0)
          · build prompt slower (0.94) · CTA calm (0.93).
"""

# Kokoro style blend chosen from 8 measured candidates (see VOICE_DIRECTION_FINAL.md):
# af_heart (grade-A naturalness) warmed down into a low-mid register with af_kore.
VOICE_BLEND = {'af_heart': 0.55, 'af_sarah': 0.45}  # v2: more expressive (see VOICE_DIRECTION)

# Brand pronunciation: PROS-pect-ify (stress on first syllable).
PHONEME_OVERRIDES = {'pɹəspˈɛktᵻfˌaɪ': 'pɹˈɑːspɛktᵻfˌaɪ'}

SEGMENTS = [
    # 1 — HOOK
    ('v_build', "You can build a website in forty minutes now.", 0.90, 1.12, 'hook'),
    ('v_find', "But finding someone to actually pay you for it?", 0.50, 1.10, 'hook'),
    ('v_night', "That takes all night.", 0.55, 1.05, 'hook'),
    # 2 — MANUAL (rapid fire)
    ('v_maps', "Open Maps.", 0.25, 1.18, 'manual'),
    ('v_reviews', "Check the reviews.", 0.05, 1.20, 'manual'),
    ('v_site', "Their website.", 0.05, 1.20, 'manual'),
    ('v_insta', "Their Instagram.", 0.05, 1.20, 'manual'),
    ('v_owner', "Who's the owner?", 0.05, 1.18, 'manual'),
    ('v_email', "Is there even an email?", 0.05, 1.18, 'manual'),
    ('v_worth', "Is this one even worth it?", 0.08, 1.16, 'manual'),
    ('v_zero', "And you haven't sent a single pitch.", 0.20, 1.08, 'manual'),
    # 3 — INSIGHT
    ('v_thing', "Here's the thing.", 0.65, 1.08, 'insight'),
    ('v_nowebsite', "No website doesn't mean good client.", 1.00, 1.08, 'insight'),
    ('v_better', "The best ones already have customers...", 0.20, 1.08, 'insight'),
    ('v_holding', "and a website that's holding them back.", 0.10, 1.08, 'insight'),
    # 4 — SCALE
    ('v_fifty', "Now find fifty of those.", 0.40, 1.12, 'scale'),
    ('v_time', "That's your whole week, gone.", 0.25, 1.10, 'scale'),
    # 5 — REVEAL
    ('v_built', "That's exactly what Prospectify does.", 1.90, 1.06, 'reveal'),
    # 6 — PRODUCT
    ('v_finds', "It finds local businesses worth pitching...", 1.20, 1.12, 'product'),
    ('v_why', "and tells you why.", 0.15, 1.10, 'product'),
    ('v_contact', "The contact.", 0.75, 1.10, 'ready'),
    ('v_angle', "The angle.", 0.30, 1.10, 'ready'),
    ('v_outreach', "The message.", 0.30, 1.10, 'ready'),
    ('v_ready', "Ready.", 0.85, 1.05, 'ready'),
    # 7 — BUILD PROMPT
    ('v_prompt', "And it even writes the website prompt...", 0.75, 1.05, 'prompt'),
    ('v_exact', "for that exact business.", 0.20, 1.04, 'prompt'),
    # 8 — BUILDER → BUILD → PITCH
    ('v_anywhere', "Build it wherever you want.", 0.90, 1.10, 'builder'),
    ('v_paste', "Paste.", 0.95, 1.05, 'build'),
    ('v_buildw', "Build.", 0.40, 1.05, 'build'),
    ('v_pitch', "Pitch!", 1.30, 1.05, 'build'),
    # 9 — SELL / TRACK
    ('v_close', "Close the deal...", 0.80, 1.10, 'sell'),
    ('v_track', "and track what's working.", 0.90, 1.10, 'track'),
    # 10 — LOOP + CTA
    ('v_youbuild', "You build the website.", 2.45, 1.02, 'cta'),
    ('v_wefind', "Prospectify finds the client.", 0.30, 1.02, 'cta'),
    ('v_start', "Start free today.", 0.50, 1.00, 'cta'),
]

TAIL_SECONDS = 2.3  # end frame holds for comprehension + click intent
