# Motion stack — `motion/prospectify-master-ad`

Installed with npm into the existing `package.json` / `package-lock.json`. No new lockfile was created.

| Tool | Version | Role |
|---|---|---|
| `remotion` + `@remotion/cli/bundler/renderer/fonts` | 4.0.532 | Timeline, rendering, fonts |
| `@remotion/motion-blur` | 4.0.532 | `CameraMotionBlur`: real shutter blur on fast camera moves (blur-whips) |
| `@remotion/transitions` | 4.0.532 | `TransitionSeries` with fade / slide / wipe and custom presentations between scenes |
| `@remotion/paths` | 4.0.532 | `evolvePath`, path interpolation and measurement: scan lines, route lines, the signal path |
| `@remotion/shapes` | 4.0.532 | Precise SVG primitives (circle, rect, star, triangle) for brand-object geometry |
| `gsap` (+ `SplitText`, `CustomEase`) | 3.15.0 | Complex typographic choreography and custom curves. GSAP is fully free since 3.13, plugins included |
| `@remotion/gsap` | 4.0.532 | `useGsapTimeline`: drives a paused GSAP timeline from Remotion's frame, so the result stays deterministic |
| `@remotion/lottie` | 4.0.532 | Plays Lottie JSON frame-accurately (only if a licensed / own Lottie is supplied) |
| `@remotion/rive` | 4.0.532 | Plays Rive state machines frame-accurately (same condition) |
| `three` | 0.169.0 | 3D engine |
| `@react-three/fiber` | 8.18.0 | React renderer for three (the line compatible with React 18) |
| `@remotion/three` | 4.0.532 | `ThreeCanvas`: three.js synced to the Remotion frame |
| `@react-three/drei` | **9.122.0** | Helpers: `RoundedBox`, `Text`, `Environment`, `MeshTransmissionMaterial`… |
| `@react-three/postprocessing` (+ `postprocessing` 6.39.5) | **2.19.1** | Bloom, DOF, chromatic aberration and noise on the 3D layer |

## Compatibility decisions
- **React 18 is kept.** Every existing composition is built and validated on React 18.3.1, so the 3D add-ons use
  their React 18 lines:
  - drei@9 / postprocessing@2 have a `react ^18` peer and `fiber ^8`;
  - the latest drei 10 / postprocessing 3 require React 19 / fiber 9.
  - Upgrading to React 19 is a separate, deliberate migration.
- **`@remotion/transitions` ESM bug under React 18.**
  - Its ESM entry (4.0.532) bundles React-DOM 19 internals, so webpack fails with
    `__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE not found in 'react'`.
  - Fix: `webpack-override.mjs` aliases `@remotion/transitions$` to its CJS build, which works.
  - The alias is applied in `remotion.config.ts` (Studio / CLI) and in `scripts/render.mjs` / `scripts/stills.mjs`.
  - Sub-paths (`@remotion/transitions/fade`, …) are untouched.
- `@types/react` 19 sits alongside React 18 (pre-existing). Typecheck passes; left unchanged.
- WebGL renders headless with `chromiumOptions.gl = 'angle'`. Keep `CameraMotionBlur` **off** around
  `ThreeCanvas` windows: it multiplies WebGL contexts.

## Proof: `src/stack-check/StackCheck.tsx`
- This is a verification composition, **not a deliverable** (`StackCheck`, 105 frames, safe to delete).
- In one render it exercises:
  - GSAP SplitText + CustomEase through `useGsapTimeline`;
  - `TransitionSeries` + `fade`;
  - `evolvePath`;
  - `Circle`;
  - a `ThreeCanvas` with a drei `RoundedBox`, through `EffectComposer` + `Bloom`.
- Lottie and Rive are imported, which proves they resolve and bundle. They play no asset because none is licensed.
- Stills at frames 20, 59 and 100 rendered correctly.

## Already in the codebase (reused, not replaced)
- `src/fx/camera.tsx`: virtual camera keyframes, velocity-driven blur, grain, vignette, sheen, 3D tilt.
- `src/fx/morphkit.tsx`: bloom pools, light streaks, `LetterFlip`, icon bursts.
- `scripts/build_audio.py`:
  - Kokoro TTS voice-over;
  - synthesized SFX and music;
  - ducking;
  - −14 LUFS master;
  - a shared timing file (`timeline.json`), so picture and sound stay in sync.
