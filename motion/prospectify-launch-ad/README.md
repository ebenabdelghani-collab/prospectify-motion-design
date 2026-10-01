# Prospectify — 15s launch ad (9:16)

Remotion + React for frame-accurate motion. Music and SFX are synthesized in Python from the **same**
frame constants, so sound and picture cannot drift.

## Commands

```bash
npm install
pip install numpy scipy          # audio engine (ffmpeg is also required)
npm run audio                    # → public/audio/mix-organic.wav, mix-paid.wav  (48 kHz, -14 LUFS)
node scripts/render.mjs all      # → renders/*.mp4  (1080×1920, 60 fps, H.264 + AAC 320k)
node scripts/stills.mjs 0 300 600  # inspection stills → renders/stills/
npm run studio                   # interactive preview
```

## Single sources of truth

| What | File |
|---|---|
| Every motion **and** audio beat (frames @ 60 fps) | `src/constants/timeline.json` |
| Mix levels (dB), loudness target | `src/constants/mix.json` |
| Colours, type, easing, safe zones, layout | `src/constants/theme.ts` |
| Every visible phrase | `src/constants/copy.ts` |
| Demo business, prompt, builder list | `src/constants/demoData.ts` |

To retime a beat, change its value in `timeline.json`, then re-run `npm run audio` and the render. The
visual and its sound move together.

## Structure

```
src/
  compositions/ProspectifyAd.tsx   layer stack + audio
  scenes/   Hook · Chaos · Brand · ProspectFlow (search → file → prompt) · Builder (choose → build → sell) · Final
  components/primitives.tsx        Mark (official logo), Cursor, Check, MaskLine, Skeleton
  motion/anim.ts                   ramp / path / typed / press helpers
scripts/
  build_audio.py   synth + SFX + music + mastering (reads timeline.json + mix.json)
  render.mjs       full renders
  stills.mjs       QA stills
public/
  prospectify/  builders/  fonts/ (Geist, OFL)  audio/
```

## Variants

- `ProspectifyAd` (organic): CTA is **Start free** plus prospectify.net.
- `ProspectifyAdPaid`: adds **"3 real leads free · No card"** under the CTA. Confirm the offer is live
  before you run it.

## Notes before media spend

- **Product UI.** No product screenshots were supplied, and prospectify.net was unreachable from the
  build environment. The product scenes are therefore reconstructions in the Prospectify visual language.
  They are limited to the workflow in the brief: search by niche and city, opportunity reason, contact,
  outreach with Copy, the website build prompt, and Mark as sold. If any field or label differs from the
  live app, update it in `ProspectFlow.tsx` / `Builder.tsx`.
- **Demo data.** The business is fictional. "Bellwood Plumbing" uses a 555-01xx phone number. There are
  no revenue figures anywhere.
- **Builder marks.** See `../assets/builders/SOURCES.md`.
