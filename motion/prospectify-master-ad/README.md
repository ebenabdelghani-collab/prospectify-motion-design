# Prospectify: master ad (9:16, 4K60, ~67.6s)

The voice drives the edit:

1. `scripts/voice_script.py` holds the final script, the pauses and the brand pronunciation.
2. `scripts/build_voice.py` synthesizes each line locally with Kokoro TTS → `public/voice/*.wav` and `src/constants/voice.json`.
3. `scripts/build_timeline.py` places the real speech, then derives **every** visual and audio cue → `src/constants/timeline.json`.
4. `scripts/build_audio.py` builds voice, evolving music and SFX with sidechain ducking, masters to −14 LUFS / −1 dBTP, and writes stems.
5. Remotion renders the picture (vector, frame-accurate). `scripts/render.mjs` then muxes the master WAV.

```bash
npm install
pip install numpy scipy soundfile kokoro-onnx   # kokoro-v1.0.onnx + voices-v1.0.bin in scripts/ (github.com/thewh1teagle/kokoro-onnx releases)
cd scripts && python3 build_voice.py && python3 build_timeline.py && python3 build_audio.py && cd ..
node scripts/render.mjs organic 2 renders/prospectify-master-4k60-highquality.mp4 8   # 2160×3840
node scripts/render.mjs organic 1 renders/prospectify-social-1080x1920-60.mp4 14       # 1080×1920
node scripts/render.mjs paid 1 renders/prospectify-social-1080x1920-60-paid.mp4 14
node scripts/stills.mjs 0 600 1800                                                      # QA stills
```

The film is designed on a 1080×1920 grid and rendered at scale 2, so the 4K master is true vector 4K, not upscaled.

## Sources of truth

| What | Where |
|---|---|
| Script, pauses, pronunciation | `scripts/voice_script.py` |
| Every frame cue (generated) | `src/constants/timeline.json` |
| Mix levels, ducking, loudness | `src/constants/mix.json` |
| Colours, type, easing, safe zones | `src/constants/theme.ts` |
| On-screen copy (headline/caption track) | `src/constants/copy.ts` |
| Demo business, prompt, builders | `src/constants/demoData.ts` |

## Honesty notes (read before media spend)

- **Product UI is a reconstruction.**
  - No Prospectify screenshots or app code were available, and prospectify.net is blocked from the build environment.
  - The screens are rebuilt in the Prospectify visual language and limited to the workflow described in the brief: search by city and niche, opportunity signals, why-them, contact, angle, outreach with Copy, the website build prompt, Mark as sold (amount, date, optional URL), and a sales dashboard.
  - Swap in the real UI or labels in `src/scenes/Product.tsx` and `src/scenes/Sell.tsx`.
- **Demo data is fictional.**
  - Bellwood Plumbing uses a 555 phone number.
  - The $1,500 sale is the demo user's own dashboard entry, tagged "Demo account". It is not a result claim.
  - Conversion rate is not shown.
- **Paid variant.** "3 real leads free · No card" appears only in `ProspectifyMasterPaid`. Verify the offer is live first.
- **Builder logos** are unmodified, with an on-screen non-affiliation note. See `../assets/builders/SOURCES.md`.
- **Voice** is local neural TTS. Re-record with a human using `docs/voiceover-direction.md`; the timeline re-times automatically.
- **Music** is synthesized to `docs/MUSIC_BRIEF.md`. Stems are in `public/audio/stems/` so a licensed score can replace it.
