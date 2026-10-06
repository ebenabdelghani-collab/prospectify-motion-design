# PRODUCT_TRUTH — what Prospectify is, verified

# ⚠ UPDATE 2026-10-06 — the live site changed (re-verified on prospectify.net)
This section **supersedes** older lines below where they conflict. Evidence: screenshots + production bundle
`index-BO3UaEVJ.js` / `index-CvFqll2r.css` captured 2026-10-06.

- **Hero:** "Find businesses that need a website. Sell them one." / "Prospectify finds local businesses with no
  website on Google Maps, writes the message to send them, and gives you the prompt to build their site with AI."
  Chips: "3 free leads · No card required · Any country".
- **Typeface is now Geist** (headings 600, tight tracking). Colour tokens unchanged (#09090b, #f42562 → #ff3b5f →
  #ff5a45). Buttons are pills (radius 980 px) with a #ff3b5f → #f42562 gradient and a sheen; cards 16 px radius.
- **App (current UI):** sidebar Home / Find / My leads / Analytics / Method. "Find clients": city field +
  industry select + "Search"; "15 businesses · Highest score first"; rows = score · business photo · name ·
  niche · city · ★ rating (reviews) · status badge (No website / Social media only / Basic website) · price
  range (e.g. $400–750) · phone. Lead panel: the business's **Google Maps photo** (credited "Photo: author ·
  Google Maps"), name, score, chips, tabs **Message / Website prompt**, tones **Friendly / Formal / Direct**,
  Copy, **Mark as contacted**. Also "Website sold" + amount, "Replied to your WhatsApp" notifications.
- **What it does (site's own list):** finds businesses whose Google listing has no website; shows their real
  phone, address, rating and reviews; writes the first message, the follow-up and a call script; writes the
  prompt to build their site with an AI builder. Messages in the business's language, several tones.
- **What it does NOT do (site's own list):** send messages for you; guarantee clients or income; **build the
  site itself (your AI builder does, from the prompt)**; lock you in (cancel anytime from Settings).
- **Prompts ready for:** Lovable, Bolt.new, Base44, Cursor, Claude, Replit, Framer, Webflow.
- **Pricing (monthly):** Free $0 — 3 leads to try it, no card. Starter $9.99 first month, then $19.99/month —
  100 new leads every month. Pro $19.99 first month, then $39.99/month — 300 new leads every month. Payments by
  Stripe. (The older $25 / $45 / lead-pack lines below are obsolete.)
- **Closing CTA:** "Your first three leads are free. Start with your own city." Button: "Get 3 free leads".
- The "$600 · Website sold" card and the "Do the math" slider are illustrations ("A simple division, not a
  forecast") — never present them as results.


**Sources.** Every line below comes from one of these, all fetched on 2026-10-02:
- the live production site https://prospectify.net (landing + public routes);
- its production JS bundle `index-DAduTZ6l.js`;
- its CSS bundle;
- its sitemap.

Evidence lives in `research/` (`app-i18n-strings.md`, `app-ui-strings-en.txt`, `computed-tokens.json`, screenshots)
and in `ui/`. The app source repository was **not** available, so a feature counts as real only if its UI strings
or data fields ship in production.

Legend: ✅ verified in production · ⚠ verified, but with a caveat · ❌ do not claim

## One-line truth
✅ *"The operating system for the AI-website side hustle."*
- Prospectify finds real local businesses that need a website, scores each opportunity 0–100, and hands you the
  outreach message and an AI build prompt for your website builder.
- You then track the deal all the way to "Sold".
- Landing sub-line (verbatim): "AI made websites faster to build. Prospectify makes clients faster to find — real
  local businesses that need a site, with the outreach message and AI build prompt ready to go."

## Audience
✅ Freelancers and side-hustlers who build websites with AI / no-code tools and need **clients**.
- The meta line is "Find your first freelance clients, no-code".
- The closing CTA is "Your first client is already out there."

## Core loop (landing "4 steps", verbatim)
✅ **You search → Prospectify analyzes → You reach out → You deliver.** ("From opportunity to sale, in 4 steps.")

## Features — verified
| Feature | Evidence | Status |
|---|---|---|
| Search by country, city and industry, worldwide | `finder.country/city/niche`, "Available worldwide", "Search any city" | ✅ |
| Industries | restaurant, barber, beauty_salon, mechanic, hotel, plumber, gym, local_shop, electrician, dentist, coach, real_estate | ✅ |
| Leads per search, chosen by the user | `PER_SEARCH` 5–30 (default 15), "you choose how many per search" | ✅ |
| Only new leads, never repeated | "Only new leads each search — never the same one twice" | ✅ |
| Verified on Google Maps | "verified on Google Maps", "Verify on Google Maps" | ✅ (it is a verification link/source; it does **not** mean a Google partnership) |
| Website status per lead | `websiteStatus`: none / old / weak / social_only. Tags: "No website", "Social media only", "Weak site" | ✅ |
| Opportunity score 0–100 | `opportunityScore`; labels High / Good / Medium opportunity; "Every business gets a 0–100 score" | ✅ |
| Rating, reviews, price range | `rating`, `reviewCount`, `priceRange` | ✅ |
| "Why this lead is valuable" panel, pain points | `painPoints[]`, "Why this lead is valuable", "Customer lost here" | ✅ |
| Before / After view | "Before / After — the opportunity at a glance" | ✅ |
| Reachability signals | Landing feature: "whether the business is reachable and responsive" | ✅ |
| Outreach generator: WhatsApp, email, phone script, with a tone choice | "Copy WhatsApp", phone script, email, tone "Friendly…"; landing: "personalized, ready in 2 seconds" | ✅ ("2 seconds" is the site's own claim; quote it, don't measure it) |
| Tailored AI prompt per builder | "Generate the AI prompt", "optimised for your tool"; landing: "Lovable, Base44, Bolt, Webflow, Framer — a precise prompt per tool" | ✅ |
| Pipeline tracker | Contacted / In progress / Signed / Sold; "Mark as contacted"; auto follow-up alert at day 3; "from discovery to signature" | ✅ |
| Record a sale | "Mark as sold", Sale price, Sale date, "Congratulations — client signed!" | ✅ |
| Analytics | Revenue, Websites sold, Avg. sale, Leads found, contacted → sold, Prompts copied, Leads left | ✅ (these are the **user's own** figures, never Prospectify results) |
| Method checklist | `/checklist` | ✅ |

## The "no website" nuance — ⚠ important
- The **finder copy is centred on businesses without a website**:
  - "businesses without a website worldwide";
  - "Only fresh businesses without a website";
  - the hero filter chip "no website".
- The data model and the tags **also** cover `social_only`, `weak` and `old` sites.
- So it is safe to say: "local businesses with **no website — or only social media / a weak site**".
- It is **not** safe to build a video on "no website isn't the opportunity". That contradicts the product's own
  primary copy, and the previous ads' line has to be realigned.

## Offer & pricing (verified, USD as shown on the landing)
| Item | Value |
|---|---|
| Free trial | ✅ **3 free leads on signup, no card required** (`FREE_TRIAL_LEADS: 3`, "3 free leads · No card required") |
| Starter | ✅ **$25/mo · 100 leads/month** ($250/yr) |
| Growth | ✅ **$45/mo · 200 leads/month** ($450/yr) |
| Lead packs | ✅ **+30 leads for $5 · +60 leads for $10** |
| Payment | ✅ Stripe |
| Currencies | ✅ USD, EUR, GBP, CAD, AUD, CHF, AED… (the price shown depends on locale) |

⚠ After the free leads, the finder shows "Subscription required — Choose a plan to generate real leads". A video
may say "Start free — 3 leads, no card". It must **not** say "free forever" or "unlimited".
⚠ "Pro plan: unlimited AI prompts" appears in the bundle, but there is no "Pro" plan on the pricing section.
**Do not claim unlimited anything.**

## Approved message territory
- Find clients. Sell AI websites.
- Real local businesses that need a website, anywhere in the world.
- Each lead is scored 0–100, so you start with the best opportunity.
- Message and AI build prompt ready: WhatsApp, email or phone script, plus a prompt tuned for Lovable, Bolt or
  Base44 (and others).
- Track every prospect from first message to "Sold".
- Start free: 3 leads, no card.
- Your first client is already out there.

## ❌ Forbidden claims (never invent)
- Customer revenue, money earned, average sale price "users get", conversion rates.
- User counts, customer logos, testimonials, reviews, "trusted by…".
- Time saved, "10× faster" as a measured fact. That line is the site's own marketing; at most quote it as such, and
  better leave it out.
- Partnerships, integrations or endorsements with Lovable, Bolt, Base44, Claude, Google or any other brand.
  Builder logos only mean "paste the prompt into the tool you use".
- Market share or "#1".
- Outcomes promised ("you will sign a client", "guaranteed").
- The checklist's "$50/month maintenance… 30 to 40% of clients accept": that is advice inside the app, not a stat.
- The earnings calculator's numbers: they are user hypotheticals.
- Demo businesses as customers: Napoli Pizza, Sharp Cuts Barber, Peak Fitness Gym, "Boulangerie Artisanale
  Martin"… are demo data.
- The old og-image offer (€15 / €20, FR/BE/CH): obsolete.

## Routes (sitemap + bundle)
- Public: `/`, `/login`, `/finder`, `/cgv`, `/privacy`, `/legal`.
- App: `/dashboard`, `/finder`, `/my-leads`, `/opportunity/:id`, `/tracker`, `/analytics`, `/checklist`,
  `/settings`, `/onboarding`.

## Brand
See `brand/BRAND_SOURCE.md`: accent `#f42562`, gradient `#f42562 → #ff3b5f → #ff5a45`, bg `#09090b`, Plus Jakarta Sans.
