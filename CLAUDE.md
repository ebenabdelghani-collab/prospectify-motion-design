# Prospectify motion design — standing instructions

The founder writes in French; answer in French.

## Before any new motion piece, read these
- `motion-source/references/LESSONS_RETENTION_REEL.md`: retention lessons from the founder's reference reel. **Apply the checklist.**
- `motion-source/references/LESSONS_MOTION_DESIGNER_REEL.md`: the "made by a motion designer" benchmark (style, acquisition structure, voice direction).
- `motion-source/PRODUCT_TRUTH.md`: claim only verified features; never invent customers, revenue or stats.
- `motion-source/brand/BRAND_SOURCE.md`: real logo PNG only, the production tokens and Plus Jakarta Sans.
- `motion-source/production/`: the current final film (code in `motion/prospectify-master-ad/src/final/`, scripts in `scripts/final/`).

## Founder preferences learned so far
- **Colour:** real, colourful visuals (real photos, real-looking Maps / Instagram / sites). No grey placeholder UI.
- **Typography:** no serif or italic "signature" type.
- **Pace:** an energetic voice and music; it must hook from A to Z, with fast pacing and no long static holds.
- **Quality bar:** studio-level, "worth $10,000". Highest perceived quality wins over feature coverage.
- **Format:** 16:9 (1920×1080, 60 fps) for the current film, `ProspectifyPlaybook` in `src/playbook/`.
- **Acquisition:** the process is the subject (Lovable-style); Prospectify is the missing piece, not the hero. The goal is virality first, then conversion.
- **Voice:** the tone must fit each line, lean on the key words, and stay energetic. No flat read.
- **Look:** "motion designer", not "AI-made": kinetic type, chromatic hits, a liquid transition, real UI fragments.
- **Palette:** the Prospectify dark (`#09090b`) with `#f42562 → #ff3b5f → #ff5a45` only. **No light or pastel pink**, and no cream "day" world with pink glows: the founder flagged it as off-palette.
- **Sound:** generic synthesised music and a flat TTS "put him to sleep". Use real produced music (CC0 / CC BY, credited), **premium and warm** (e.g. Blue Dot Sessions "Vittoro"), not club/tech-house, with its re-entry on the reveal. Use an expressive voice: Chatterbox (`scripts/versus/build_voice.py`, venv `/root/venvs/cb`), checked by Whisper. **Female voice** (founder's choice): soft, warm and upbeat — not fast, not aggressive (~150 wpm, moderate intensity), tone fitted to each line. Its timbre comes from a synthetic reference clip (`public/versus/voice/_ref_female.wav`), never a real person.
- **Story:** show the pain fully ("without"), then the same night with Prospectify. Name its three jobs clearly: find the client, write the outreach (WhatsApp / email / phone script), write the prompt for a premium site.
- **Layout:** text never sits on top of a visual. Visuals live in the upper zone; kinetic captions have their own band at the bottom; the app is framed in a window with captions below it.
- **Delivery:** send the video directly in the chat (a compressed copy under about 20 MB). The full quality version goes in `renders/`.
