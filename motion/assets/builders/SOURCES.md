# AI builder marks — sources

These marks appear only to show that a Prospectify-generated website prompt can be pasted into the
user's builder of choice. They do **not** imply partnership, sponsorship, endorsement or an official
integration. The ad carries the on-screen note *"Trademarks belong to their owners. No affiliation implied."*

Geometry and colours are unmodified. Retrieved 2026-10-01. Each brand's own site (lovable.dev, base44.com,
bolt.new) was blocked by this build environment's network policy, so the marks below come from the brand's
own source code where one was available, and otherwise from maintained brand-icon libraries.

| Brand   | File          | Type | Source | Notes |
|---------|---------------|------|--------|-------|
| Lovable | `lovable.svg` | SVG (colour mark, gradient) | npm `@lobehub/icons-static-svg@1.95.1`, `icons/lovable-color.svg` (github.com/lobehub/lobe-icons) | Same geometry and gradient stops as svgl's `lovable.svg`. Only the `width/height="1em"` and inline `style` attributes were removed, so it can be sized as an image. |
| Base44  | `base44.svg`  | SVG (official mark, #FF631F) | **Official.** github.com/base44/cli @ `30dc7063`, `packages/cli/templates/backend-and-client/src/components/Base44Logo.jsx`; the same component ships in the npm `base44@0.1.25` CLI | Path data extracted verbatim from Base44's own `Base44Logo` React component. |
| Claude  | `claude.svg`  | SVG (spark mark, #D97757) | github.com/pheralb/svgl @ `ed75393d`, `static/library/claude-ai-icon.svg` | Matches lobehub `claude-color.svg` and simple-icons `claude.svg`. |
| Bolt    | `bolt.svg`    | SVG (current "bolt" wordmark, white for dark backgrounds) | github.com/pheralb/svgl @ `ed75393d`, `static/library/bolt-new_dark.svg` | The blue lightning tile in the open-source `stackblitz/bolt.new` repo is the legacy icon and was deliberately **not** used. |

Before paid media runs, have someone with brand-portal access to each company re-check the marks against
its current press kit.
