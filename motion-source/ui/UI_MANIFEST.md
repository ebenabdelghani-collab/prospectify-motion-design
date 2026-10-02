# Prospectify UI — visual source manifest

**How these were captured.**
- Captured 2026-10-02 from the **live public site** https://prospectify.net with headless Chromium:
  - desktop 1440 px wide at 2× DPR;
  - mobile 390 px wide.
- On the cookie banner, "Essential only" was clicked. This affects local consent only; no account was created and
  no production data was touched.
- Capture scripts: `../research/shoot.py` and `../research/sections.py`. Raw files are in `../research/`.

**Real or demo?** Everything below is the real production UI and real production copy. Any business shown in it
(Napoli Pizza, Sharp Cuts Barber, Peak Fitness Gym…) is **demo content written by Prospectify for its own landing
page**. Those are not customers and must never be presented as real results.

| File | Route / source | What it proves | Real / demo |
|---|---|---|---|
| `landing-hero-product-mock.png` | `/` hero, right column (isolated) | **Best product proof available.** Search field "New York" + filter "no website"; gradient progress bar; 3 lead cards with niche icon, city, ★ rating and an **opportunity score /100** (93 / 89 / 85); 3 actions: **WhatsApp · AI prompt · Tracked** | Real UI component; demo businesses |
| `landing-hero-desktop.png` / `landing-hero-mobile.png` | `/` first viewport | Headline "Find clients. Sell AI websites.", offer chip "3 free leads · No card required", CTA styling, real layout | Real |
| `landing-full-desktop.png` / `landing-full-mobile.png` | `/` full page | The whole landing in order: page rhythm, spacing, section system | Real |
| `landing-how-it-works.png` | `/` "HOW IT WORKS" | "From opportunity to sale, in 4 steps": You search → Prospectify analyzes → You reach out → You deliver | Real |
| `landing-why-10x.png` | `/` "WHY PROSPECTIFY" | "Searching by hand is 10× slower." This is the site's own marketing claim: quote it as such, never as a measured stat | Real (claim) |
| `landing-features.png` | `/` "EVERYTHING INCLUDED" | 6 features: Opportunity search, Opportunity score (0–100), Reachability signals, Outreach generator (WhatsApp / email / phone script), Tailored AI prompts (Lovable, Base44, Bolt, Webflow, Framer), Prospect tracking (auto follow-up alert at day 3) | Real |
| `landing-earnings-calculator.png` | `/` "EARNING POTENTIAL" | Interactive "How much can you earn?" calculator. Its outputs are user-driven hypotheticals, **not results** | Real UI; hypothetical numbers |
| `landing-pricing.png` | `/` "SIMPLE PRICING" | "One tool. Two plans.": Starter $25/mo · 100 leads; Growth $45/mo · 200 leads; packs +30 leads $5 / +60 leads $10 | Real |
| `landing-faq.png` | `/` FAQ | Product answers in Prospectify's own words | Real |
| `landing-final-cta.png` | `/` closing section | "Your first client is already out there." | Real |
| `landing-tools-strip.png` | `/` "Build with the tools you already love" | Prospectify itself presents builder logos (Base44, Cursor, Claude, Replit, Framer, Webflow, WordPress, Lovable…) as compatible tools | Real |
| `app-brand-loading-screen.png` | `/finder` while logged out | The app's branded loading screen (logo on dark) before it redirects to login | Real |
| `app-login.png` | `/login` | The real auth screen | Real |

## Screens NOT captured, and why
The app behind login was **not** screenshotted:
- finder results;
- lead detail / "Why this lead is valuable";
- Before / After;
- outreach generator;
- AI prompt generator;
- tracker;
- Mark as sold;
- analytics.

Capturing them would mean creating an account on production. That consumes the free-lead allowance and writes to
production data, which the brief forbids. The app's source repository is also not available in this session
(only this motion repo is reachable).

These screens are **proven to exist** by strings in the production JS bundle (`../research/app-ui-strings-en.txt`,
`../research/app-i18n-strings.md`), for example:
- "Why this lead is valuable", "Before / After — the opportunity at a glance", "Customer lost here";
- "Generate the AI prompt", "optimised for your tool";
- "Copy WhatsApp";
- "Mark as sold", "Sale price", "Congratulations — client signed!";
- "Contacted / In progress / Signed / Sold";
- "Revenue", "Websites sold", "Leads left".

**To unlock real in-app footage**, any one of these from the founder is enough:
1. a demo account (or a staging URL) with seeded demo data;
2. screenshots or screen recordings of those screens;
3. access to the app repository, so the UI can be rendered locally with fixtures.

Until then, an in-app screen in a video must be rebuilt **only** from this manifest's real components and tokens,
using only fields that exist in the bundle. No invented features.
