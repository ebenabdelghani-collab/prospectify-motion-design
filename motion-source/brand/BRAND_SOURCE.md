# Prospectify brand — verified source of truth

Verified 2026-10-02 against the **live production site** https://prospectify.net: the HTML, the production CSS
bundle `index-D1xQzUXm.css` and computed styles read from the browser. The raw evidence is in `../research/`.

> Rules:
> - **Never** redraw the logo, rebuild the "P" in CSS, approximate it with AI or recolour it.
> - Use only the files below.

## Logo files

| File | What | Source | Status |
|---|---|---|---|
| `prospectify-logo-site.png` | Official mark, 1254×1254 RGBA, transparent background with a soft outer glow (alpha bbox 91–1127 × 9–1198) | https://prospectify.net/logo.png, referenced by the live site HTML | **Primary master.** Highest resolution available. Official |
| `prospectify-logo-founder.jpg` | Same mark on black, 1029×1029 | Supplied directly by the founder earlier in this project (`motion/assets/prospectify/`) | Official. Use when a black plate is wanted |
| `prospectify-mark-transparent.png` | 465×469 RGBA cut of the founder JPG: black removed, edges un-premultiplied, RGB untouched | Derived in this project (see `motion/assets/prospectify/SOURCES.md`) | Derived, not redrawn. Superseded by `prospectify-logo-site.png` for new work |
| `LEGACY-og-image-do-not-use.png` | 1200×630 social card: **old purple brand with a lightning bolt**, French copy, €15 / €20 pricing, FR/BE/CH only | https://prospectify.net/og-image.png (still live) | **Obsolete. Do not use.** It contradicts the current brand and pricing. The founder should replace it on the site |
| `LEGACY-favicon-vite-default-do-not-use.svg` | The default purple Vite favicon | https://prospectify.net/favicon.svg (still live) | **Not Prospectify. Do not use.** The site should ship a favicon made from the real mark |

**There is no official SVG / vector master.**
- Nothing in this folder is named `.svg` for the Prospectify mark.
- If the founder has the original vector (Figma, AI or SVG export), drop it here as `prospectify-logo.svg`.
- That vector becomes the master for 4K scaling. The 1254 px PNG is enough for 1080p and holds up to roughly
  700 px tall on screen in 4K.

The mark is a geometric "P" whose counter is a speech-bubble tail, filled with a diagonal gradient. The colours
were sampled from the file, not invented: magenta-violet bottom-left → hot pink → coral-orange top-right
(pixel samples: `#DB00A0` foot → `#F7028E` → `#FC0A73` stem → `#FC3752` top bar → `#FB554B` top-right of the bowl).
It sits close to the site's own `--grad`.

## Colour tokens (production CSS, verified)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#09090b` | page background (computed body bg is `rgb(10,10,12)` = `#0A0A0C`, also the `theme-color`) |
| `--bg-2` | `#0d0d10` | alternate section bg |
| `--surface` / `--surface-2` / `--surface-3` | `#111114` / `#16161a` / `#1c1c21` | cards, inputs |
| `--line` / `--line-strong` | `#ffffff12` / `#ffffff1f` | hairlines |
| `--text` / `--text-2` / `--text-3` | `#f5f5f7` / `#a1a1aa` / `#71717a` | text hierarchy |
| `--accent` | **`#f42562`** | primary accent |
| `--accent-bright` | `#ff3b5f` | hover / highlight |
| `--accent-deep` | `#c41850` | pressed / deep |
| `--accent-2` / `--accent-2-bright` | `#ff5a45` / `#ff6a54` | coral secondary |
| `--accent-soft` / `--accent-2-soft` | `#f425621f` / `#ff5a451f` | tinted fills |
| `--grad` | `linear-gradient(120deg, #f42562 0%, #ff3b5f 55%, #ff5a45 100%)` | brand gradient (CTA, progress bar) |
| `--ease-out` | `cubic-bezier(.22, 1, .36, 1)` | site's own ease-out |
| `--ease-spring` | `cubic-bezier(.34, 1.4, .5, 1)` | site's own spring |

## Typography (verified)
- **Plus Jakarta Sans**, weights 300–800, loaded from Google Fonts. The body stack is
  `"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- Headlines are tight, with negative tracking, in weights 700–800 (see `../ui/landing-*.png`).
- Eyebrows are small uppercase, wide-tracked and in the accent colour ("EVERYTHING INCLUDED", "HOW IT WORKS").

## ⚠ Divergences from the existing motion code (not changed; flagged for the next production)
- `motion/prospectify-master-ad/src/constants/theme.ts` uses accent `#E63F6D`, a `#E8445F → #E53C75` gradient,
  bg `#050505` and the **Geist** font.
- Production uses accent **`#f42562`**, the gradient **`#f42562 → #ff3b5f → #ff5a45`**, bg **`#09090b`** and
  **Plus Jakarta Sans**.
- The next production should take its values from this file. The existing, working compositions were deliberately
  **not** modified.
- The obsolete og-image (purple, euros, FR/BE/CH) and the Vite favicon are live-site issues for the founder.
  They are not motion issues.

## Official vs inferred
- **Official:** the logo files above, every CSS token, the font, the eases, the copy on the screenshots.
- **Inferred:** the hex values of the logo gradient (pixel samples) and "Prospectify brand object" ideas in
  `CREATIVE_BRIEF.md`.
