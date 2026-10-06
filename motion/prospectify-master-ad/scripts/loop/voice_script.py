"""
PROSPECTIFY — "THE LOOP" (16:9, ~35 s). Retention cut built on the founder's reference reel lessons
(motion-source/references/LESSONS_RETENTION_REEL.md): proof in the first frame, a numbered open loop
(one / two / three), word-by-word captions, a change every 0.5 s, and an ending that loops back to frame 0.

(id, text, gap_before_seconds, act, intensity) — intensity feeds Chatterbox exaggeration (soft scale).
"""

SEGMENTS = [
    ('h_pizzeria', "This pizzeria has three hundred and twelve reviews...", 0.15, 'hook', 0.80),
    ('h_noweb', "and no website.", 0.12, 'hook', 0.90),
    ('h_client', "That's your next client.", 0.25, 'hook', 0.95),
    ('p_pain', "But finding them takes all night.", 0.25, 'pain', 0.75),
    ('r_three', "Prospectify does three things for you.", 0.30, 'reveal', 0.95),
    ('n1', "One. It finds businesses like this one, and scores them.", 0.25, 'one', 0.90),
    ('n2', "Two. It writes the message. WhatsApp, email, or a call script.", 0.25, 'two', 0.90),
    ('n3', "Three. It writes the prompt for a premium site.", 0.25, 'three', 0.95),
    ('n3b', "Paste it into Lovable, Bolt, or Base forty-four.", 0.12, 'three', 0.85),
    ('cta', "Ten free leads. No card.", 0.30, 'cta', 1.00),
    ('loop', "Your first one could be... this pizzeria.", 0.25, 'loop', 0.90),
]

TAIL_SECONDS = 0.35  # the last frame matches frame 0, so the video loops seamlessly
