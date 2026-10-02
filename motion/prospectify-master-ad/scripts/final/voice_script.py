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
VOICE_BLEND = {'af_heart': 0.70, 'af_kore': 0.30}

# Brand pronunciation: PROS-pect-ify (stress on first syllable).
PHONEME_OVERRIDES = {'pɹəspˈɛktᵻfˌaɪ': 'pɹˈɑːspɛktᵻfˌaɪ'}

SEGMENTS = [
    # 1 — HOOK: building is fast
    ('v_build', "You can build a website in forty minutes now.", 1.10, 1.02, 'hook'),
    # 2 — HOOK: finding is not
    ('v_find', "But finding someone worth pitching it to?", 0.90, 1.00, 'hook'),
    ('v_night', "That can still take all night.", 1.20, 0.98, 'hook'),
    # 3 — MANUAL PAIN (accelerates)
    ('v_maps', "So you open Maps.", 0.40, 1.08, 'manual'),
    ('v_reviews', "Check the reviews.", 0.10, 1.10, 'manual'),
    ('v_site', "Open their website.", 0.08, 1.10, 'manual'),
    ('v_insta', "Check Instagram.", 0.08, 1.12, 'manual'),
    ('v_owner', "Try to find the owner.", 0.08, 1.12, 'manual'),
    ('v_email', "Find an email.", 0.08, 1.12, 'manual'),
    ('v_worth', "Figure out if they're even worth contacting...", 0.10, 1.10, 'manual'),
    ('v_zero', "and you still haven't written the pitch.", 0.30, 1.00, 'manual'),
    # 4 — INSIGHT (slower; the question holds in silence)
    ('v_thing', "And here's the thing.", 1.00, 0.97, 'insight'),
    ('v_nowebsite', "No website doesn't automatically mean good client.", 1.60, 0.97, 'insight'),
    ('v_better', "The better opportunity?", 0.35, 0.96, 'insight'),
    ('v_demand', "A business that already has customers...", 0.30, 0.96, 'insight'),
    ('v_holding', "but a website holding it back.", 0.20, 0.95, 'insight'),
    # 5 — SCALE
    ('v_great', "Great.", 0.80, 1.00, 'scale'),
    ('v_fifty', "Now find fifty of those.", 0.25, 1.02, 'scale'),
    ('v_time', "That's where your time disappears.", 0.60, 1.02, 'scale'),
    # 6 — REVEAL (freeze, signal, lock)
    ('v_built', "That's what Prospectify is built for.", 1.90, 0.98, 'reveal'),
    # 7 — PRODUCT
    ('v_finds', "It finds local businesses worth pitching...", 1.50, 1.00, 'product'),
    ('v_why', "and tells you why.", 0.40, 0.98, 'product'),
    ('v_contact', "The contact.", 0.90, 1.00, 'ready'),
    ('v_angle', "The angle.", 0.45, 1.00, 'ready'),
    ('v_outreach', "The outreach.", 0.45, 1.00, 'ready'),
    ('v_ready', "Ready.", 1.25, 0.96, 'ready'),
    # 8 — BUILD PROMPT (slows down)
    ('v_prompt', "And it even prepares the website prompt...", 1.00, 0.95, 'prompt'),
    ('v_exact', "for that exact business.", 0.35, 0.94, 'prompt'),
    # 9 — BUILDER
    ('v_anywhere', "Then build it wherever you want.", 1.15, 1.00, 'builder'),
    # 10 — PASTE / BUILD / PITCH
    ('v_paste', "Paste.", 1.35, 1.00, 'build'),
    ('v_buildw', "Build.", 0.55, 1.00, 'build'),
    ('v_pitch', "Pitch.", 1.75, 1.00, 'build'),
    # 11 — SELL / TRACK
    ('v_close', "And when you close one...", 0.90, 1.00, 'sell'),
    ('v_track', "track what's actually working.", 1.35, 1.00, 'track'),
    # 12 — LOOP (picture only) + CTA
    ('v_youbuild', "You build the website.", 2.40, 0.94, 'cta'),
    ('v_wefind', "Prospectify finds the client.", 0.45, 0.94, 'cta'),
    ('v_start', "Start free.", 0.70, 0.93, 'cta'),
]

TAIL_SECONDS = 2.6  # end frame holds for comprehension + click intent
