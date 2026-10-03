# Final asset map

| Asset | Source of truth | Used as |
|---|---|---|
| Prospectify mark | `motion-source/brand/prospectify-logo-site.png` (the official site master, 1254 px) → `public/final/prospectify-logo.png` | The real PNG via `<Img>`, never redrawn. It is revealed by clip from the lock geometry, then used in the header and the CTA |
| Brand tokens | Production CSS (`brand/BRAND_SOURCE.md`) → `src/final/tokens.ts` | bg `#09090b`, surfaces `#111114` / `#16161a` / `#1c1c21`, text `#f5f5f7` / `#a1a1aa` / `#71717a`, accent `#f42562`, gradient `#f42562 → #ff3b5f → #ff5a45`, the site's own eases |
| Typeface | Plus Jakarta Sans (production), from `@fontsource-variable/plus-jakarta-sans` → `public/fonts/PlusJakartaSans-Variable.woff2` | All type. GeistMono only for tiny tracked data labels |
| Product UI | `motion-source/ui/landing-hero-product-mock.png` and the production bundle strings | LeadRow (niche tile · name · pin city · ★ · score /100), search field, gradient Search, progress bar, action tiles. Strings include "Why this lead is valuable", "High confidence · Strong need + solid reputation", "Weak site vs. excellent Google reputation", "Copy number", "WhatsApp ready to paste", "Copy WhatsApp", "✓ Copied!", "Generate the AI prompt", "This prompt includes", "Ready to paste", "optimised for your tool", "Select your AI tool", "Your pipeline", "Mark as sold", "Record a sale", "Sale price", "Sale date", "Website URL", "Congratulations — client signed!", "Revenue · all time", "Websites sold · closed deals", "Avg. sale · per website", "contacted → sold", "Recent websites sold" |
| Builder marks | `motion-source/builders/` (official files) → `public/final/builders/` | Lovable logomark (portal), Claude Spark (Anthropic press kit), bolt.new wordmark (bolt.new), Base44 icon (base44.com). Geometry and colour are untouched |
| Icons | Lucide geometry (ISC licence), the same family as the app | `kit/icons.tsx` |
| Demo data | `src/final/data.ts` | Fictional businesses, 555 phone number, one illustrative $750 sale. The product scenes carry a **DEMO DATA** tag |
| Voice | Kokoro v1.0 local, blended style | `public/final/voice/*.wav` (48 kHz) |
| Music + SFX | Synthesised in `scripts/final/` (no stock, no samples) | `public/final/audio/prospectify-final-mix.wav` and the stems |
| Grain texture | `public/fx/grain.png` (pre-existing) | Film texture at 4 % overlay |

**Not used, on purpose.**
- The legacy og-image and the Vite favicon (obsolete).
- Any third-party UI or logo in the manual-hunt act (neutral generic windows only).
- Stock footage, stock music or AI-generated imagery.

## v2 — real imagery (founder feedback: "no grey visuals, real Maps / Instagram examples")
| Asset | Source | License | Used in |
|---|---|---|---|
| 83 photos (food, restaurants, cafés, nails, barber, florist, bars) | Openverse search → original hosts; each file is listed in `motion/prospectify-master-ad/public/final/photos/CREDITS.json` (title, creator, source URL) | **All CC0, public domain**: no attribution required, commercial use allowed | Manual-hunt windows (Maps sheet, list, reviews, social profile, old site), insight cards, the 50-node field, client websites, Instagram-style grids |
| Real map of central and East Austin | OpenStreetMap standard tiles, zoom 16, 8×10 tiles fetched once and stitched → `public/final/map/east-austin-z16.png` | © OpenStreetMap contributors (ODbL); the attribution is rendered on every map view | Maps windows |

**Interfaces.**
- The Maps, social profile, search and spreadsheet windows are faithful *generic* recreations: light UI and real layouts.
- They carry **no Google or Instagram logos or wordmarks**. The tab titles say "Maps", "@handle", "Search" and "Sheets".
- The businesses are fictional (demo).
- Photos of identifiable people were excluded. Review avatars are initials, not faces.
