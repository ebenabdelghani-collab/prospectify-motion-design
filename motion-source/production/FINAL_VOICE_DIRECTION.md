# Final voice direction

**Character.**
- A smart young operator, 25 to 29, who has lived the problem. She is warm, sharp, calm, a little provocative and credible.
- She does not sound like an ad: no hype, no upspeak, no fry, no breathiness.
- Her sentence endings land downward.

## Production (what was actually done)
- **No ElevenLabs or other cloud voice service is configured in this environment.**
  - No API key or connector was found.
  - The highest-quality voice workflow available is the local **Kokoro v1.0 (ONNX)** model already in the repo.
- **Eight candidate voices were rendered** on the same test line: "But finding someone worth pitching it to? That can still take all night."
- They were measured objectively:
  - median F0, the target being a **low-mid female register of about 180–195 Hz**;
  - the contour at the end of the sentence, which should land downward;
  - F0 stability (jitter);
  - pace.

| Candidate | Median F0 | End of sentence | Notes |
|---|---|---|---|
| af_heart | 208 Hz | 163 Hz ↓ | Most natural model (grade A), but slightly bright/young |
| af_bella | 194 Hz | 178 Hz | Endings stay up (questioning cadence) |
| af_sarah | 195 Hz | — | Wide range, more "presenter" |
| af_aoede | 183 Hz | 146 Hz ↓ | Low-mid, but rises in the middle of questions |
| af_kore | 148 Hz | 117 Hz | Too low, with risk of fry |
| af_nicole | 160 Hz | — | Breathy and whispered, rejected |
| **heart 70 % + kore 30 % (selected)** | **185 Hz** | **151 Hz ↓** | af_heart's naturalness, pulled into a low-mid register, with clear downward landings |
| heart 60 % + sarah 40 % | 188 Hz | — | Brighter, more "ad" |

**Limitation, stated honestly.**
- Selection was made from acoustic measurements plus the model's published quality grades.
- No human listening test could be run in this environment.
- A human read can replace these files 1:1. Drop WAVs named `<id>.wav` into `public/final/voice/`, then run `build_timeline.py` and `build_audio.py`. The whole film re-times itself to the new read.

## Delivery map (speed per line, in `scripts/final/voice_script.py`)
| Section | Speed | Intent |
|---|---|---|
| Hook | 0.98–1.02 | Conversational, unhurried; the stall is silence, not words |
| Manual | 1.08–1.12 | Slightly faster and listing, fatigue in the rhythm |
| Insight | 0.95–0.97 | Slower; teaching, not selling |
| Prospectify | 0.98–1.00 | Controlled |
| Build prompt | 0.94–0.95 | Slower, for the "wait, it does that too?" beat |
| CTA | 0.93–0.94 | Calm, settled |

## Processing
- 80 Hz high-pass.
- A light presence lift above 3.5 kHz, so consonants survive phone speakers.
- Per-line RMS normalisation, plus a soft tanh glue (no pumping).
- Close and dry, with a barely audible room send (−30 dB).
- 48 kHz.
- Brand pronunciation is forced to **PROS-pect-ify** with a phoneme override.
