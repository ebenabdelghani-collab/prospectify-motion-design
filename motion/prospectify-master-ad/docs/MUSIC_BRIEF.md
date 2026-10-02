# Music brief (for a licensed or composed replacement score)

The current score is synthesized in code (`scripts/build_audio.py`) and follows this brief. No licensed music
library or music-generation service was reachable from the build environment. To upgrade, commission or
license a track to this map, drop it in as the music stem, and keep the provided voice and SFX stems
(`public/audio/stems/`).

- **Tempo:** 120 BPM.
- **Key:** E major. The palette is Emaj9, C♯m9, Amaj9 and Bsus.
- **Instrumentation:** restrained electronic pulse, tactile percussion, sub bass, minimal synth plucks, soft pad.
- **Avoid:** EDM drops, trap, trailer hits, motivational corporate.
- **Mix rule:** the music ducks ~14 dB under the voice and must never mask a word.

| Time (s) | Section | Music |
|---|---|---|
| 0.00–2.6 | Hook | Minimal and curious. Sparse 8th-note plucks over a quiet Emaj9 pad. |
| ~4.9 | Stall | **Everything stops.** Hard cut to silence after "sell it to?" (~0.6s). |
| 5.9–7.6 | The night | Low E drone. A clock tick every 0.25s. |
| 7.6–14.3 | Pain | Repetitive pressure: a 16th-note single-note ostinato with its filter opening, 4-on-floor kick and hats. Add 16th hats at "worth pitching?". |
| 14.3–17.8 | "0" | **Hard stop.** One sub thud on *single*. Near-silence. |
| 17.9–24.3 | Insight | Reduction: C♯m9 pad only. Lifts to Amaj9 with soft bass on "real customers". |
| 24.3–28.0 | Fifty | Pressure returns faster: 16th bass, hats and a riser. |
| 28.0–28.5 | Black | **Silence.** |
| 28.5 | Reveal | **Release.** Sub hit, the Prospectify signature motif (bells E5→B5→E6) and a wide Emaj9. |
| 30.9–42.8 | Product | Structured groove: E → C♯m → A → B (1 bar each), kick, 8th hats, 8th bass. |
| 42.8–46.1 | Build prompt | **Harmonic lift:** A → B, a rising 16th arpeggio, half-time drums, riser. |
| 46.1 | Prompt ready | Clean resolve, then the music **breathes out** (~0.8s). |
| 46.9–49.3 | Builder choice | Calm: pad and soft plucks. |
| 49.3–57.3 | Build / sell / track | **Momentum:** full groove with clap on 2 and 4, starting exactly on the builder click. |
| 57.5–60.1 | Loop | A hit on each word: Find, Pitch, Build, Sell. A wide chord on Repeat. |
| 61.0–67.6 | End frame | Drums out. A resolved, wide Emaj9 and the signature motif on the logo. Ring out. |

Every sync point is a frame in `src/constants/timeline.json`, generated from the voiceover.
