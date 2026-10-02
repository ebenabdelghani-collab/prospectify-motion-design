# Final QC — what was checked, what was changed

**Review method.**
- A full 540p review cut with audio was rendered and watched as two contact sheets per 9 s, one frame every 0.5 s.
- Key frames were then checked as full-resolution stills.
- A stem energy timeline was used for the "eyes-closed" check.
- The mix was measured with ffmpeg loudnorm.
- I can't literally *listen*. The sound audit is based on measurements (levels, margins, silences, structure) and on the cue map, not on hearing.

## Fixes made after the first full review
| Found | Fix |
|---|---|
| 0:01: the prompt box crossed the rising site (muddy overlap) | The box leaves faster (16 frames) and the site starts 10 frames later |
| 0:04–0:09: the receded site was still too present under the empty prompt | Opacity cut to 7 % (the stall now reads as empty) |
| 0:27: "The better opportunity?" had no on-screen text (sound-off gap) | Kinetic headline added, synced to the line |
| 0:28–0:33: the "Demand first" hold was static | A slow 5 % push on card B through the insight |
| 1:02: the builder canvas flashed a blank cream page before building | The page background now arrives *with* the grid step |
| The stall drone got louder ("music almost disappears" was not true) | Drone −9 dB |
| 1080p draft render would take ~48 min (6-sample shutter on 12 heavy 3D windows) | Manual-hunt windows get cheap per-element blur instead; shutter samples 6 → 5 elsewhere. About 4× faster on those frames |
| The freeze impact was too loud (−18 dB RMS) | −22 dB; silences sit on a −52 dB room tone instead of digital zero |

## Retention audit (every 2–4 s has a reason to stay)
| Time | Open question / payoff |
|---|---|
| 0–4 s | A prompt types and a site builds itself: satisfying, fast |
| 4–9 s | The caret blinks with no answer, then the clock runs to 1:58 AM: "that's me" |
| 9–18 s | Tabs keep multiplying (counter 2 → 20+): the pain builds |
| 18–21 s | Hard stop, "0 pitches sent", in silence |
| 21–27 s | "Which one would you pitch?", an interactive question, then B |
| 27–33 s | The takeaway worth saving: Demand first / Website problem second |
| 33–38 s | "Now find 50 of those": the noise peaks |
| 38–42 s | Freeze, signal, lock, mark: the pattern break |
| 42–47 s | Search: results rank themselves; "why" is answered |
| 47–53 s | Contact / angle / outreach each resolve to READY; counter 3 / 4 |
| 53–58 s | The 4th module: the website prompt (the second reveal) |
| 58–62 s | Your builder (official marks), click |
| 62–66 s | The prompt becomes the site (hero motion), then the pitch |
| 66–71 s | Mark as sold, then analytics |
| 71–73 s | The loop: Repeat |
| 73–81 s | CTA hold |

## Conversion audit (after one viewing the viewer knows…)
| Point | Where |
|---|---|
| ✅ It finds businesses worth pitching | Search + ranked results + "worth pitching" VO |
| ✅ It explains why | "Why this lead is valuable" + "High confidence · Strong need + solid reputation" |
| ✅ Contact | CONTACT module (phone · "WhatsApp ready to paste") |
| ✅ It prepares outreach | Fragments become a WhatsApp message, then Copy |
| ✅ It prepares the website prompt | The full prompt-build sequence + "Ready to paste" |
| ✅ Use it in your builder | Selector with official marks + transfer |
| ✅ You build and sell | Site assembles, pitch sent, Mark as sold |
| ✅ It tracks | Analytics tiles |
| ✅ Low risk | Start free · 3 real leads free · No card required |

## Premium / trust audit
- No stock footage, no stock music, no AI imagery, no fake testimonials, no user counts, no revenue claims.
- The single sale is typed by the user and the scene carries a DEMO DATA tag.
- Colour discipline: neutral until the reveal, then about 5 % accent.
- One motion grammar (signal / scan / lock / ready) carries the whole product section.
- Continuity, no hard cuts.

## Sound audit (measured)
- **Loudness:** −14.07 LUFS integrated, −1.57 dBTP, 48 kHz.
- **Voice above music on every line:** at least +14.4 dB, median +18 dB.
- **Voice above SFX:** at least +9.5 dB.
- **Silences are real:** stall ≈ −30 dBFS, "0" hold ≈ −52 dB room tone, question hold ≈ −39 dBFS.
- 359 frame-accurate cues.
- The signature lock always lands on the visual lock frame.

## No-sound audit
- Every spoken idea has an on-screen carrier:
  - "Building the site: 40 minutes.";
  - the empty "Find someone…" prompt;
  - the clock;
  - the tab counter;
  - "0 pitches sent.";
  - the Q&A cards, "Demand first.", "Now find 50 of those.";
  - "Why this lead is valuable", the READY tags, "Website prompt", "Your prompt. Your builder.", "Pitch.";
  - Analytics, "Repeat.", the CTA.

## Mobile audit
- Designed natively on a 1080×1920 grid, with critical content inside x 90–990 and y 150–1600.
- Smallest critical text is 18–20 px at 1080 (mono labels).
- Headlines are 64–112 px.
- The 540p review cut stays readable at phone size.
