# Remotion setup

## Remotion
- `remotion` / `@remotion/*` **4.0.532** in both projects. All `@remotion/*` packages are pinned to the same
  version, which is mandatory for Remotion.
- React 18.3.1, TypeScript. Everything renders at 60 fps: a 1080×1920 master, and 4K via `scale: 2`.
- Projects:
  - `motion/prospectify-master-ad/`: main project (master, morph and stack-check compositions);
  - `motion/prospectify-launch-ad/`: the original 15 s ad.
- Package manager: **npm** (`package-lock.json`). There is no second lockfile.

## Remotion Claude Code plugin
- `remotion@remotion` **4.0.532**, from the marketplace `remotion-dev/claude-code-plugin`.
- Installed at user scope and enabled (`claude plugin list` → ✓ enabled).
- **Persistence.** This cloud container is ephemeral, so `~/.claude` is lost.
  - The repo's `.claude/settings.json` declares the marketplace (`extraKnownMarketplaces`) and enables the plugin
    (`enabledPlugins`).
  - Any new Claude Code session opened on this repo offers to install it automatically.
- A plugin installed mid-session loads its skills on the **next** session start.

## Remotion Agent Skills
There are 12 official skills, from `remotion-dev/skills` @ `0b5db9d`:
- `remotion-best-practices`, `-create`, `-docs`, `-render`, `-studio`, `-upgrade`;
- `-captions`, `-multimedia`, `-maps`, `-markup`, `-interactivity`, `-saas`.

They are available two ways:
1. **Project skills**, committed in `.claude/skills/`. They work in every session, with no install step.
2. **Plugin skills**, from the same 12 skills inside the plugin cache.

`npx skills add -g` was deliberately **not** run. It would install a third copy of the same skills and create
duplicate triggers.

## Render tooling
- `remotion.config.ts`:
  - PNG frames;
  - Chromium headless shell 1194;
  - concurrency 4;
  - ANGLE GL (WebGL / Three.js works headless);
  - `webpack-override.mjs` (see `MOTION_STACK.md`).
- `scripts/render.mjs`: `node scripts/render.mjs <organic|paid> <scale> <out> [crf]`. The env var `COMP` selects
  the composition family and `AUDIO` selects the audio prefix.
- `scripts/stills.mjs`: `COMP=<id> node scripts/stills.mjs <frames…>` writes to `renders/stills/`.
- Both scripts pass the same `webpackOverride` and `chromiumOptions: {gl: 'angle'}` as the CLI config.

## Verified (2026-10-02)
- `npx tsc --noEmit` passes in both projects.
- Stills render for `ProspectifyMaster` (frame 1600), `ProspectifyMorph` (frame 500) and `StackCheck`
  (frames 20 / 59 / 100). No regression in the existing compositions.
