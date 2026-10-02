# Final motion system — SIGNAL · SCAN · LOCK · READY

The code lives in `motion/prospectify-master-ad/src/final/`.

## Primitives (`kit/`)
| Primitive | File | Behaviour |
|---|---|---|
| **SignalLine** | `signal.tsx` | A thin coral line whose head travels a path (pathLength-normalised), with a white hot tip, a glow and an optional persistent trace. Used for the reveal serpentine, the results sweep, the dossier rail, the prompt transfer and the loop |
| **Scan** | `signal.tsx` | A horizontal read-line with a faint coral wash behind it, passing down a rect |
| **LockCorners** | `signal.tsx` | Four corner guides contract onto a rect and *seat* (FAST_LOCK), then fade. The neutral white version appears in the Hook; coral from the reveal on |
| **ReadyOutline / ReadyTag** | `signal.tsx` | The module outline draws coral, then settles toward warm white, with a tiny tonal flash. A mono "READY" pill with a filling dot. No generic green checkbox |
| **Glow** | `signal.tsx` | A rare light pool on payoff beats only (reveal, prompt READY, site lock, sold, CTA) |
| **Kinetic** | `type.tsx` | Words rise out of masks, staggered, with a short vertical smear while moving, and leave by compressing up. A frame-deterministic equivalent of a GSAP SplitText timeline |
| **Cursor** | `cursor.tsx` | macOS-style arrow on keyframes, CAMERA ease with a slight human arc; clicks press it and emit a ring |
| **Cam / rectLerp** | `camera.tsx` | Spatial camera (centre, geometric zoom, rotateX/Y) and FLIP rect interpolation for layout continuity |
| **Website / MobileSite** | `website.tsx` | The client site assembles region by region (grid → header → hero → CTA → services → imagery → reviews → booking), plus a responsive mobile state |
| **UI** | `ui.tsx` | Real Prospectify components rebuilt from the production landing component and tokens: LeadRow, ScoreBox, SearchField, GradBar, GradButton, Chip, Panel, AppHeader. Also the official `Logo` (the real PNG) |

## Curves (`tokens.ts`)
| Name | Definition | Use |
|---|---|---|
| EASE_FAST_LOCK | GSAP **CustomEase** `M0,0 C0.08,0.62 0.16,0.94 0.34,1.006 0.5,1.012 0.7,1.001 1,1` | Arrivals and locks: fast attack, hard deceleration, a 0.6 % seat (not a bounce) |
| EASE_UI | `cubic-bezier(.22,1,.36,1)`, the site's own `--ease-out` | UI fades and reveals |
| EASE_CAMERA | `cubic-bezier(.6,.02,.18,1)` | Camera, cursor travel, FLIP moves |
| EASE_SOFT | `cubic-bezier(.4,0,.2,1)` | Scans, count-ups |
| EASE_HEAVY | GSAP **CustomEase** `M0,0 C0.55,0 0.18,0.72 0.42,0.92 0.6,1 0.8,1 1,1` | Big structural moves (prompt expands, builder window opens, survivor push) |
| EASE_OVERSHOOT | `cubic-bezier(.34,1.4,.5,1)`, the site's `--ease-spring` | Reserved; not used in the film |
| EASE_EXIT | `cubic-bezier(.7,0,.84,0)` | Exits |

## Rules
- No fade/slide defaults. Things **resolve**: from depth (Manual), from noise (Field), from the signal (results), from the business into the prompt, from the prompt into the page.
- **Continuity, no hard cuts.**
  - The B card becomes one of fifty nodes.
  - The survivor node becomes the mark, and the mark becomes the header.
  - The selected lead becomes the dossier identity.
  - The prompt module becomes a hero, then an object, then a pill that travels into the chosen builder tile, which becomes the builder window.
  - The site becomes the pitch's link preview.
  - The analytics give way to the loop, and the loop gives way to the mark.
- **Motion blur** (`@remotion/motion-blur` CameraMotionBlur, 180° shutter, 6 samples) applies only inside listed high-velocity windows (`Film.tsx`), never on reading holds.
- **3D is restrained.**
  - The manual windows pile up in CSS perspective depth.
  - The 50-node field tilts (rotateX 24°) at peak noise.
  - Nothing floats or spins for its own sake.
- **Colour logic.** Neutral until the reveal; the coral signal is the first brand pixel.

## GSAP usage (honest scope)
- **CustomEase** defines the two signature curves.
- Every other effect a GSAP plugin would provide is computed per frame from the shared timeline, so each frame is exactly reproducible at 4K:
  - SplitText → `Kinetic`;
  - DrawSVG / MotionPath → pathLength dash heads;
  - FLIP → `rectLerp`.
- The `useGsapTimeline` path is installed and proven in `StackCheck`. It wasn't needed here, and plugins weren't added as gimmicks.
