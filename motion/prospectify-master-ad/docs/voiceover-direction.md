# Voiceover: direction

**Character:** a smart 25-year-old founder explaining something that is obvious once you see it.
Calm, conversational, slightly provocative. Never hype, never "guru", never corporate.

**Current read:** Kokoro v1.0, a local neural TTS (Apache-2.0), voice `af_heart`.
- Each line is synthesized on its own and trimmed to its spoken extent.
- The edit is then built around the real speech (`scripts/build_timeline.py`).
- "Prospectify" is forced to **PROS-pect-ify** (stress on the first syllable) with a phoneme override in `scripts/voice_script.py`.

**Re-recording with a human voice (recommended before paid spend):**
1. Record each line in `voiceover-script.txt` as a separate take. Name each file after its segment id (`v_build.wav`, …), at 48 kHz.
2. Drop the takes into `public/voice/`, then run `python3 scripts/build_voice.py --skip-synth`, or delete the cache and replace the files.
3. Run `python3 scripts/build_timeline.py && python3 scripts/build_audio.py` and re-render. Every visual and SFX re-times to the new read automatically.

## Line delivery

| Line | Delivery |
|---|---|
| You can build a website in forty minutes now. | Matter-of-fact. Light lift on *forty minutes*. |
| But finding someone to sell it to? | Slower. The question hangs, so let the silence after it happen. |
| That still eats your whole night. | Dry, tired, knowing. Lands on *whole night*. |
| Maps. / Reviews. / Their website. / Their Instagram. / An email… somewhere. | Clipped list, accelerating. Slight weariness on *somewhere*. |
| Is this one even worth pitching? | Real doubt, almost to yourself. |
| And you still haven't sent a single message. | Flat. The punchline is the zero. |
| No website isn't the opportunity. | Confident correction. Teach, don't sell. |
| It's a business with real customers… and a website holding it back. | Beat after *customers*. Warm on *holding it back*. |
| Now find fifty of them. | Wry. |
| That's where your time goes. | Quiet, lower. |
| That's what Prospectify is built for. | First brand mention. Settled, not announced. |
| Pick a city. Pick a niche. | Easy, rhythmic. |
| It finds the local businesses actually worth pitching… | Emphasis on *actually*. |
| and tells you why. | Small smile. Lands lightly. |
| Then it gets your next move ready. | Building momentum. |
| The contact. / The angle. / The first message. | Three beats, each a notch more impressed. |
| And the website prompt… | Slow down. This is the reveal. |
| written for that exact business. | Emphasis on *exact*. Then silence. |
| Paste it into whatever you build with. | Casual freedom. |
| Build it. / Pitch it. | Crisp, two beats. |
| And when it sells, log it, / and see what's actually working. | Practical, forward. |
| Find. Pitch. Build. Sell. Repeat. | Metronomic, ending open on *Repeat*. |
| You build the website. / Prospectify finds the client. | The thesis. Unhurried, certain. |
| Start free. | Soft, a little warmer. An invitation, not a shout. |
