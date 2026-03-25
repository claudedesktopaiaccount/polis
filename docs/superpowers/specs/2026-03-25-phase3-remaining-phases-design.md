# Polis — Phase 3 + Remaining Phases Design Spec

**Date:** 2026-03-25
**Status:** Approved
**Author:** Claude (brainstorming session)

---

## Context

Phases 1 and 2 are complete:
- **Phase 1 (Foundation):** Newsletter subscriber table, D1 news cache, party promises DB, admin panel
- **Phase 2 (Audience Growth):** Public API, embeddable widgets, user auth (PBKDF2 + D1 sessions), prediction leaderboard, PWA, social sharing, media page

The project now has: users with accounts, a newsletter subscriber list, a public API, and social distribution channels. The next step is to activate those assets into retention and revenue.

---

## Phase 3: Activation & First Revenue

**Theme:** Turn the audience Phase 2 built into engaged, retained, and eventually paying users.

**Goal:** 1,000 newsletter opens/week, 50 paying API customers, volebný kalkulátor cited by at least one Slovak media outlet.

**Implementation approach:** Three parallel independent streams.

---

### Stream A: Newsletter Delivery + Email Notifications

**Goal:** Send a weekly digest to subscribers and per-user event notifications.

**Architecture:**
- Cloudflare Workers cron trigger (`0 9 * * 1` — Monday 9am) reads from `newsletterSubscribers` (Phase 1 table), fetches latest polls from D1, renders a text/HTML email template, sends via Resend API.
- Per-user notifications: a new `userNotificationPrefs` table (`userId`, `onNewPoll`, `onScoreChange`) controlled from `/profil`. A second cron (`0 * * * *` — hourly) checks for new polls or score changes and queues notifications. Max 1 email per user per day (rate limit in D1).
- Unsubscribe: each email contains a signed unsubscribe token (`HMAC-SHA256` over `email + secret`). GET `/api/newsletter/unsubscribe?token=...` marks `unsubscribedAt`.

**New tables:**
- `userNotificationPrefs` — userId (FK users), onNewPoll (int 0/1), onScoreChange (int 0/1), updatedAt
- `notificationLog` — userId, type, sentAt (for rate limiting and dedup)

**New files:**
- `src/app/api/cron/newsletter/route.ts` — weekly digest handler (GET, Cloudflare cron-triggered)
- `src/app/api/cron/notifications/route.ts` — hourly notification handler (GET, Cloudflare cron-triggered)
- `src/app/api/newsletter/unsubscribe/route.ts` — unsubscribe handler
- `src/app/profil/NotificationPrefs.tsx` — opt-in UI in profile page

**Key decisions:**
- Resend API (already in `.env.example`) over SES/Postmark — simpler SDK, generous free tier
- Cron workers are separate from the main app worker to avoid timeout risk
- HMAC unsubscribe tokens over DB-stored tokens — stateless, no extra table

---

### Stream B: API Freemium Tier

**Goal:** Generate first revenue from the public API built in Phase 2.

**Architecture:**
- **Free tier:** 100 requests/day, requires API key. No payment.
- **Paid tier:** Unlimited requests, $9/month, via Stripe Checkout.
- API keys stored in new `apiKeys` table (`id`, `userId`, `keyHash`, `tier`, `createdAt`, `stripeSubscriptionId`).
- Key passed as `?key=` query param or `Authorization: Bearer <key>` header.
- Rate limiting: D1 `apiUsage` table (`keyId`, `date`, `count`); checked + incremented on each request.
- Stripe flow: user visits `/api-pristup` → clicks "Predplatiť" → Stripe Checkout → webhook `/api/stripe/webhook` → updates `apiKeys.tier` to `paid`.
- Key generation: crypto.randomUUID() → SHA-256 hash stored in DB, full key shown once at creation.

**New tables:**
- `apiKeys` — id, userId (FK), keyHash, tier ('free'|'paid'), createdAt, stripeSubscriptionId
- `apiUsage` — keyId (FK), date (text YYYY-MM-DD), count (int)

**New files:**
- `src/app/api-pristup/page.tsx` + `ApiPristupClient.tsx` — API access page (pricing, key management)
- `src/app/api/keys/route.ts` — GET (list keys), POST (create free key)
- `src/app/api/stripe/checkout/route.ts` — create Stripe Checkout session
- `src/app/api/stripe/webhook/route.ts` — handle subscription events
- `src/lib/api-keys/rate-limit.ts` — check + increment usage
- Modify: `src/app/api/v1/polls/route.ts` — require API key, enforce rate limit

**Key decisions:**
- SHA-256 hash of key stored (not plaintext) — same pattern as existing admin auth
- Rate limit per calendar day (UTC) — simple, predictable for developers
- Stripe Checkout over custom payment form — PCI compliance handled by Stripe
- Free tier requires key (not open) — captures emails, enables upgrade flow

---

### Stream C: Real Volebný Kalkulátor Data

**Goal:** Replace hardcoded mock party weights with real data from party programs, sourced and managed via admin CMS.

**Architecture:**
- New `partyPositions` table: `id`, `partyId`, `questionId`, `stance` (-2 to +2 int), `sourceUrl`, `updatedAt`.
- 20 questions stay as-is in code; their IDs become stable foreign keys.
- Admin page `/admin/kalkulator` — CRUD for party stances per question, with source URL field.
- Score calculation in `volebny-kalkulator` reads from D1 instead of hardcoded weights.
- Seeder script (`scripts/seed-kalkulator.ts`) with initial sourced data for all 10 parties × 20 questions.

**New tables:**
- `partyPositions` — id (autoincrement), partyId (text), questionId (text), stance (int -2..+2), sourceUrl (text), updatedAt (text)

**New files:**
- `src/lib/db/kalkulator.ts` — `getPartyPositions(db)` helper
- `src/app/admin/kalkulator/page.tsx` — admin stance editor
- `scripts/seed-kalkulator.ts` — initial data seeder
- Modify: `src/app/volebny-kalkulator/page.tsx` — fetch from D1
- Modify: `src/app/volebny-kalkulator/VolebnyKalkulatorClient.tsx` — accept DB positions as props

---

## Phase 4: Content Authority

**Theme:** Make Polis the credible, citable source for Slovak political data.

**Goal:** Historical poll archive browsable back 2+ years, election countdown live on homepage, all party program data sourced and attributed.

### Key work streams:

**Historical poll archive**
- New `/prieskumy/archiv` page with full poll history (currently only shows last N polls)
- D1 already has historical data; just needs UI: timeline view, filter by agency/party, CSV export
- Per-page OG image for sharing specific date ranges

**Election countdown**
- Homepage hero component showing days to next Slovak election
- `src/lib/site-config.tsx` gets `NEXT_ELECTION_DATE` constant
- Countdown visible on homepage and in Navbar (subtle)
- Auto-hides post-election, switches to "výsledky" mode

**Source attribution & legal**
- Each poll result shows agency name + source link (already in DB, not surfaced in UI)
- `/zdroje` page listing all data sources with methodology notes
- Impressum page (`/impressum`) — required by EU law, who operates the site
- Cookie policy page (`/cookies`) separate from privacy policy

**Admin CMS improvements**
- Bulk poll import via CSV upload in `/admin/polls`
- News scraper health dashboard in `/admin/scrapers` (last run, item count, errors)
- Audit log viewer in `/admin/audit`

---

## Phase 5: Scale & Brand

**Theme:** Prepare for sustained traffic growth and establish Polis as a recognizable brand.

**Goal:** Survive 10k concurrent users, pass Lighthouse 95+, have a real logo, and offer B2B embedding.

### Key work streams:

**Infrastructure hardening**
- Cloudflare D1 automated backup script (Wrangler export → R2 bucket, daily cron)
- Staging environment: second Cloudflare Pages deployment + second D1 database bound to `wrangler.staging.jsonc`
- Load testing: k6 scripts for homepage, API, tipovanie POST — establish baseline, identify bottlenecks
- Monitoring dashboard: Cloudflare Analytics + Umami side-by-side view in admin

**Brand & onboarding**
- SVG logo (wordmark + πόλις mark) — consistent across favicon, OG images, PWA icons
- Homepage onboarding tooltip sequence for first-time visitors (cookie-gated, max 3 steps)
- Loading skeletons for all data-fetching pages (currently "jumps" on hydration)
- 404 page with navigation suggestions

**B2B embedding & white-label**
- `/pre-media` page (Phase 2) extended with self-serve embed configuration UI
- Embed query params: `?theme=`, `?parties=`, `?height=`, `?lang=sk|en`
- Basic English translation layer (`src/lib/i18n/en.ts`) for embed mode only (not full site)
- B2B inquiry form on `/pre-media` → email notification to admin

---

## Cross-Cutting Constraints (all phases)

- **No `tailwind.config.ts`** — TailwindCSS v4 CSS config in `globals.css`
- **No `middleware.ts`** — use `src/proxy.ts` (Next.js 16)
- **All UI text in Slovak** (except embed English layer in Phase 5)
- **`export const runtime = "edge"`** on all API routes
- **`getCloudflareContext({ async: true })`** for D1 access
- **Editorial design system** — newsprint colors, Newsreader/Inter, 0px border-radius, no shadows
- **TDD** — tests before implementation for all business logic

---

## Phase Summary Table

| Phase | Name | Primary goal | Revenue impact |
|-------|------|-------------|---------------|
| 3 | Activation & First Revenue | Newsletter digest, email notifications, API freemium, real kalkulátor data | First direct revenue (API subscriptions) |
| 4 | Content Authority | Historical archive, election countdown, source attribution, CMS polish | Credibility → media citations → traffic |
| 5 | Scale & Brand | D1 backup, staging, load testing, logo, B2B embeds | B2B partnerships, sustained organic growth |
