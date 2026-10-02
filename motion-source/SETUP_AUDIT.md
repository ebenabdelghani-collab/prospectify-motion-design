# Setup audit — 2026-10-02

## What already existed (kept, untouched)
- `motion/prospectify-launch-ad/`: the 15 s launch ad (Remotion 4.0.532, React 18).
- `motion/prospectify-master-ad/`, with:
  - the master (VF), morph and paid compositions;
  - the camera / morph FX kits;
  - the Python audio pipeline (Kokoro VO, SFX, ducking, −14 LUFS);
  - the shared timing file;
  - 1080p renders.
- `motion/assets/prospectify/`: the founder's logo + a transparent cut. `motion/assets/builders/`: 4 builder marks
  (icon-library sources).
- `.claude/skills/`: the 12 official Remotion agent skills.
- Package manager: npm (one `package-lock.json` per project).

## What was missing
- The Remotion Claude Code plugin and the Figma MCP plugin.
- GSAP, transitions, paths, shapes, Lottie / Rive players, drei and postprocessing.
- A single source folder for brand, UI, builders and references.
- A verified product-truth document. The existing ads used Geist / `#E63F6D`, while production uses
  Plus Jakarta Sans / `#f42562`.
- Real UI captures, official builder logos from the brands' own domains, and a creative brief.

## What was installed / added
| Item | Where |
|---|---|
| Plugin `remotion@remotion` 4.0.532 | user scope; persisted via `.claude/settings.json` |
| Plugin `figma@claude-plugins-official` 2.2.120 (MCP `https://mcp.figma.com/mcp`) | user scope; persisted via `.claude/settings.json`. **OAuth pending** |
| `gsap` 3.15, `@remotion/gsap/transitions/paths/shapes/lottie/rive` 4.0.532, `@react-three/drei` 9.122, `@react-three/postprocessing` 2.19.1 | `motion/prospectify-master-ad` (npm) |
| `webpack-override.mjs` + its wiring in config and scripts | fixes the `@remotion/transitions` ESM / React 18 crash |
| `src/stack-check/StackCheck.tsx` (`StackCheck` composition) | proof that the whole stack bundles and renders. Not a deliverable |
| `motion-source/` | brand, ui, builders, references, research, voice, audio + the 10 documents |

## Not touched (on purpose)
- No existing composition, scene, timing, audio script or render was modified or deleted.
- `theme.ts` still uses Geist / `#E63F6D`. The divergence is documented in `brand/BRAND_SOURCE.md` and should be
  applied in the next production, not retro-fitted.
- React stays at 18. A React 19 migration is out of scope.
- No storyboard, no final video, and no Prospectify redesign.
- No account was created on prospectify.net, and no production data was touched.
- The stray empty folder `renders/send/` at the repo root (untracked, created by an earlier mis-pathed command) was
  removed.

## Folder map
```
motion-source/
  SETUP_AUDIT.md  REMOTION_SETUP.md  MOTION_STACK.md  FIGMA_SETUP.md
  PRODUCT_TRUTH.md  CREATIVE_BRIEF.md
  brand/       BRAND_SOURCE.md, official logo (site master 1254 px + founder JPG), tokens, legacy files flagged
  ui/          UI_MANIFEST.md, 15 real captures of prospectify.net (hero product mock, sections, login, loading)
  builders/    SOURCES.md, official Lovable / Claude / Bolt / Base44 marks from their own domains / press kits
  references/  REFERENCE_SOURCES.md (3 references, URLs only)
  research/    raw evidence: site HTML, prod JS/CSS bundles, extracted UI strings, capture scripts
  voice/ audio/   empty, reserved for the production
```

## Blockers / limits
1. **Figma OAuth** must be completed by the founder (`FIGMA_SETUP.md`). No Prospectify Figma file is known.
2. **The app's source repo is not reachable** from this session, and in-app screens sit behind login.
   - Only public pages were captured.
   - In-app features are proven by production bundle strings (`ui/UI_MANIFEST.md`).
3. **No vector master of the Prospectify logo** exists publicly. The 1254 px PNG is the best available.
4. The live site still serves an obsolete og-image (purple, €) and the default Vite favicon. This is a site issue
   for the founder.
