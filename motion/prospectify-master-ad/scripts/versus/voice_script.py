"""
PROSPECTIFY — "SAME NIGHT" (16:9). Without vs with Prospectify.
The subject is the viewer's own process (find → message → build → send). The pain is shown first, in full;
then the same night again, with Prospectify doing the three hard parts: find the client, write the outreach
(WhatsApp / email / phone script), write the build prompt for a premium site. Claims: PRODUCT_TRUTH.md only.

(id, text, gap_before_seconds, act, exaggeration)  — exaggeration = Chatterbox emotion intensity.
"""

SEGMENTS = [
    # HOOK
    ('v_hook1', "You can build a website in forty minutes.", 0.30, 'hook', 0.75),
    ('v_hook2', "So why don't you have a single client?", 0.15, 'hook', 0.85),
    # WITHOUT — the pain, fast and specific
    ('v_without', "Here's your night without Prospectify.", 0.45, 'without', 0.70),
    ('v_maps', "Three hours scrolling Maps.", 0.25, 'without', 0.65),
    ('v_tabs', "Fourteen tabs.", 0.12, 'without', 0.70),
    ('v_guess', "Guessing who even needs a site.", 0.12, 'without', 0.65),
    ('v_cold', "Copy, paste, the same cold message.", 0.18, 'without', 0.65),
    ('v_seen', "Seen. No reply.", 0.25, 'without', 0.60),
    ('v_generic', "Generic prompt. Generic site.", 0.25, 'without', 0.65),
    ('v_late', "Two AM. Still zero clients.", 0.30, 'without', 0.70),
    # TURN
    ('v_turn', "Now. Same night. With Prospectify.", 0.70, 'turn', 0.95),
    # WITH — the mechanism, three proofs
    ('v_find', "It finds local businesses that need a website, and scores every one.", 0.30, 'with', 0.90),
    ('v_reach', "It writes your outreach. WhatsApp, email, or a phone script.", 0.25, 'with', 0.90),
    ('v_prompt', "Then it writes the prompt for a premium site, made for that exact business.", 0.25, 'with', 0.95),
    ('v_tools', "Paste it into Lovable, Bolt, or Base44.", 0.15, 'with', 0.85),
    ('v_done', "Client found. Message ready. Site built.", 0.30, 'with', 1.00),
    # RECAP + OFFER
    ('v_recap', "Without it, all night. With it, one search.", 0.45, 'recap', 0.95),
    ('v_first', "Your first client is already out there.", 0.40, 'cta', 0.90),
    ('v_start', "Start free. Three leads, no card.", 0.20, 'cta', 1.00),
]

TAIL_SECONDS = 2.2
