# Builder logos — sources

**Purpose.** These marks may appear only to show that a Prospectify-generated website prompt can be pasted into the
builder the user already uses. This matches the product: the app generates "AI prompts optimized for Lovable, Bolt
and Base44", and its `og:description` reads "Works with Lovable, Bolt, Cursor, Claude, Base44 and more".

**Legal.** These marks do **not** imply partnership, sponsorship, endorsement or an official integration.
- Any video that shows them carries the note *"Trademarks belong to their owners. No affiliation implied."*
- Geometry and colours are never modified, and no mark is recoloured to the Prospectify pink.
- Lucide or AI substitutes are never used.

Retrieved **2026-10-02**. Every file below was downloaded from the brand's own domain or its official press kit.
Each one was then rendered and checked visually: the contact sheet was checked once; it is not stored in the repo.

| Brand | File | Format | Official source URL | Original / derived | Use |
|---|---|---|---|---|---|
| **Lovable** | `lovable-logomark-color.svg` | SVG, gradient heart | https://lovablebrand.lovable.app/logos/logomark-color.svg (official brand portal, linked from https://lovable.dev/brand) | Original, byte-for-byte | **Primary mark.** Works on dark backgrounds |
| Lovable | `lovable-wordmark-white.svg` | SVG, white wordmark | https://lovablebrand.lovable.app/assets/wordmark-white-BVUXiBjb.svg | Original | Name on dark backgrounds |
| Lovable | `lovable-icon-site.svg` | SVG, app icon | https://lovable.dev/icon.svg | Original | Small sizes / favicon scale only |
| **Claude** | `claude-spark-clay.svg` | SVG, Spark in Clay #D97757 | Anthropic press kit zip, https://www.anthropic.com/press-kit → `Anthropic logos/Claude logos/3 Claude Spark/SVG/Claude Spark - Clay.svg` | Original | **Primary mark** |
| Claude | `claude-icon-rounded.svg` | SVG, rounded app tile | Same press kit → `4 Claude icon/SVG/ClaudeIcon-Rounded.svg` | Original | App-icon contexts |
| **Bolt** | `bolt-wordmark-white.svg` | SVG, "bolt.new" wordmark, white | Inline header SVG on https://bolt.new (viewBox `0 0 85 24`) | Extracted verbatim. Only `aria-hidden` and an XML prolog changed | **Primary mark** on dark backgrounds |
| Bolt | `bolt-icon-site.svg` | SVG, "b" on a black tile | https://bolt.new/static/favicon.svg | Original | Small sizes only (16-unit artboard) |
| **Base44** | `base44-wordmark-ink.svg` | SVG, single-band sun + "Base44", ink #1E1E24 | Inline header SVG on https://base44.com (`aria-label="Base44 logo"`) | Extracted. Tailwind `class` removed; `var(--ink-800, #1E1E24)` resolved to its own fallback `#1E1E24`. No geometry change | **Light backgrounds only** |
| Base44 | `base44-icon-site.png` | PNG 192×192, single-band sun, #FF6A00 | https://media.base44.com/images/public/marketing-site-assets/branded/favicon-branded-v2.png | Original | **Primary mark** on dark backgrounds. Do not upscale past 192 px; use the vector in the wordmark for large sizes |
| Base44 | `base44-mark-cli.svg` | SVG, three-band sun, #FF631F | github.com/base44/cli @ `30dc7063`, `Base44Logo.jsx` (the official CLI) | Path data verbatim | **Legacy / secondary.** The current website uses the single-band sun; prefer the site assets |

## Notes and open points
- **Base44 on dark.** base44.com ships no white wordmark in its markup.
  - On dark backgrounds, use `base44-icon-site.png` (orange, no wordmark).
  - Or place the ink wordmark on a light chip.
  - Do **not** recolour the ink wordmark to white without Base44's own white variant.
- **Lovable.** The portal also offers lockups, PDFs and the Camera Plain font zip. Only the files above were saved;
  nothing else was needed.
- **Claude.** "Claude" is a product name only. The video must not suggest that Anthropic endorses Prospectify.
- `motion/assets/builders/` still holds the marks used by the existing ads (svgl / lobehub / Base44 CLI). They were
  left untouched.
  - The Claude and Lovable files there have the same shapes, but in a different coordinate system: they are icon-library
    re-exports, not the brands' own files. Use the official files here for every new production.
  - The Bolt file there is the same wordmark.
  - The Base44 file there is the **three-band legacy** mark: swap it for the single-band site mark in the next production.
- Before paid media runs, someone with brand-portal access should re-check each mark against the brand's current kit.
