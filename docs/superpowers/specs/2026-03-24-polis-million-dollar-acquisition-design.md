# Polis — $1M Acquisition Roadmap Design

**Date:** 2026-03-24
**Goal:** Position Polis for acquisition by a Slovak/Czech media company, data/research firm, or EU regional media group at a ~$1M valuation
**Timeline:** 24 months
**Strategy:** The Election Platform — build audience infrastructure now, launch election-specific viral features before the election cycle, negotiate acquisition from peak traffic leverage

---

## Context

Polis is a Slovak political tracker with a technically strong MVP: 9 pages, real data pipeline (Wikipedia scraping), Monte Carlo prediction model, D'Hondt coalition simulator, crowd predictions, GDPR compliance, editorial broadsheet design, Cloudflare Workers deployment, and 33+ unit tests. Current traffic is pre-launch (under 500 monthly visitors). Slovak parliamentary elections are expected within 12–24 months.

The gap analysis in HANDOFF.md identifies the core weaknesses: no audience, mock data on two key pages, no newsletter, no user accounts, no admin panel, and no business model signals.

---

## Strategic Positioning

This is an **acquisition play**, not a standalone business play. The goal is to make Polis look like an irresistible infrastructure asset to a media acquirer — something they would take 18 months and €200k+ to rebuild from scratch, but can acquire proven and audience-validated for €1M.

**Three acquirer hooks:**
1. **Unique tech** — Monte Carlo prediction engine, D'Hondt seat calculator, coalition simulator. No Slovak media outlet has these. Rebuild cost is prohibitive.
2. **Engaged audience** — newsletter subscribers + registered users are a portable asset the acquirer can immediately leverage for their existing brand.
3. **Proven election-night platform** — demonstrated peak traffic during elections, cited by journalists, with live tools no competitor offers.

**Target acquirers (priority order):**
1. Denník N — data journalism credibility gap, would benefit most from Polis's unique tools
2. RTVS / TA3 — TV broadcasters need live election night infrastructure desperately
3. Aktuality.sk / Ringier — high traffic, zero data product
4. SME / Petit Press — largest Slovak media group, broadest use case
5. IVO and Slovak think-tanks — research and data infrastructure angle
6. EU regional media groups — broader potential if Polis expands to Czech/EU political data

---

## Phase 1: Foundation (Months 1–4)

**Goal:** Remove the two biggest blockers — mock data and zero distribution assets.

### 1.1 Weekly Newsletter — "Polis Týždenník"
- Launch a weekly email digest covering poll changes, prediction shifts, and one editorial angle per week
- Stack: Resend or Mailchimp (free tier to start)
- Placement: homepage hero signup section, footer, dedicated `/newsletter` landing page
- Target: 2,000 subscribers by end of Phase 1
- A list of 5,000 engaged political readers is worth more to a media acquirer than 50,000 anonymous page views

### 1.2 Replace Mock Data
- `/volebny-kalkulator` — replace hardcoded party weights with weights derived from actual 2023 party manifestos (manually curated initially, reviewed before elections)
- `/povolebne-plany` — replace all 10 mock program entries with real, sourced policy commitments per party. Source: official party websites, parliamentary records

### 1.3 News Caching to D1
- Current state: news scraped fresh on every request (latency, no archive, no history)
- Add Cloudflare Cron Trigger: scrape news sources every 60 minutes, persist to D1 `news_items` table (already in schema)
- Benefits: eliminates per-request latency, enables historical news archive, makes data asset defensible

### 1.4 Lightweight Admin Panel
- Password-protected `/admin` route (basic HTTP auth via Cloudflare Access or env-variable secret)
- CRUD interface over D1 tables: parties, poll results, party program points
- No full CMS needed — simple forms are sufficient
- Critical for keeping data fresh post-launch without deploying code

**Phase 1 success metric:** Newsletter launched, mock data replaced on all pages, news cached, admin panel live.

---

## Phase 2: Audience Growth (Months 5–10)

**Goal:** Get Polis out of its own domain — embed content on other sites, build a registered user base, create retention loops.

### 2.1 Embeddable Chart Widgets
- `<script>` embed and iframe option for any external site to display live poll trends, seat projections, or coalition math
- When media outlets embed Polis charts with "Zdroj: Polis" attribution, Polis gets backlinks, brand exposure, and becomes infrastructure rather than a competitor
- Acquirers buy infrastructure providers, not competitors
- Launch with 5–10 direct journalist outreach to seed adoption

### 2.2 User Accounts (Email-Based)
- Simple email + password auth (no OAuth complexity at this stage)
- Unlocks: saved prediction history across devices, personalized email alerts, registered user count for acquisition term sheet
- Anonymous visitors don't appear in acquisition negotiations; registered users do

### 2.3 Prediction Leaderboard
- Upgrade `/tipovanie` from basic vote to scored prediction game
- Users predict winner, seat count, and coalition; earn accuracy points post-election
- Public leaderboard creates return visits, word-of-mouth, and social sharing
- Slovak political Twitter is a small, active community — a leaderboard will generate organic discussion

### 2.4 PWA + Social Sharing
- Add `manifest.json` and service worker for offline/installable support
- Pre-rendered OG share cards per party and per chart (dynamic `opengraph-image` routes)
- One-tap sharing from any page
- Low effort, high distribution surface area

### 2.5 Media Partnership Program
- Direct outreach to 5–10 Slovak political journalists
- Offer: free data exports, custom chart embeds, early access to predictions
- Goal: journalists become evangelists; their bylines link to Polis

**Phase 2 success metric:** 10,000 monthly visitors, 1,000 registered users, embeds live on at least 3 external media sites.

---

## Phase 3: Election Build-Up (Months 11–18)

**Goal:** Transform Polis from a data site into essential election infrastructure. Be so useful to journalists and engaged citizens that media companies feel they need to own it.

### 3.1 Live Election Tracker (`/volby/2026`)
- Dedicated election results page with real-time count ingestion as official results are published
- D'Hondt seat projections updating live as percentages change
- Coalition majority meters showing live paths to 76-seat majority
- Comparison panel: Polis pre-election prediction vs. actual unfolding results
- Embed widget in sidebar so any journalist can drop live results into their article
- This is the product demo event — everything else builds to this page

### 3.2 AI Daily Political Summaries
- Automated one-paragraph daily summary of biggest political shifts
- Input: scraped news + poll delta from previous day
- Output: generated summary via Claude API, published to homepage and newsletter
- Cost: ~$5–15/month at current API pricing
- High perceived editorial value, low ongoing effort

### 3.3 Election Countdown Widget
- Persistent homepage widget counting down to election day
- Weekly "state of the race" snapshot published as a shareable card
- Gives people a reason to bookmark and return regularly

### 3.4 Public API
- Documented REST API: `/api/v1/polls`, `/api/v1/predictions`, `/api/v1/coalitions`, `/api/v1/parties`
- Free tier for journalists and researchers (generates goodwill + press coverage)
- Paid tier for commercial/research use (signals commercializability to acquirer)
- API documentation page at `/api-docs`

### 3.5 Regional Breakdown (if data available)
- If regional polling data exists from any source, show results by kraj
- Differentiates Polis from competitors who only show national numbers
- If data is unavailable, skip — don't build a page for empty data

**Phase 3 success metric:** 30,000 monthly visitors, public API live with documented endpoints, live tracker in staging ready for election night.

---

## Phase 4: Election Peak & Acquisition (Months 19–24)

**Goal:** Execute the acquisition play from a position of maximum leverage.

### 4.1 Election Night Execution
- Live tracker runs flawlessly on election night — this is the product demo
- Pre-arranged media coverage: reach out to 3–5 journalists 2 weeks before election with early access
- Social media presence activated: real-time coalition updates, seat projection tweets/posts
- Cloudflare Workers + D1 handle traffic spikes natively — no scaling crisis

### 4.2 Acquisition Outreach Timeline
- **Month 16–18:** First outreach — share API access, traffic stats, election preview features. No hard pitch yet. Build relationships.
- **Month 19–21:** Active conversations — share traffic projections, demonstrate live tracker, begin LOI discussions with 2–3 targets simultaneously
- **Election night:** Peak traffic moment — have active conversations in progress so acquirers see the spike in real time
- **Month 22–24:** Term sheet, due diligence, transfer

### 4.3 The Acquisition Pitch
Core argument: "You could build this yourself in 18 months for €200k+ in development costs — or acquire a proven, election-validated platform with 10,000+ subscribers, 100,000 election-night visitors, a data archive, and a public API for €1M today. The next election cycle is 4 years away. Do you want to own the Slovak political data space or watch someone else do it?"

### 4.4 Due Diligence Readiness
Prepare in advance:
- Clean codebase (already done: E2E tests, TypeScript, GDPR compliance)
- Traffic analytics export (Umami)
- Newsletter subscriber count + open rate
- Registered user count
- API usage statistics
- D1 database record counts (polls, predictions, news items)
- Revenue signals (even minimal API paid tier revenue)

**Phase 4 success metric:** Term sheet from at least one qualified acquirer at or above €800k.

---

## What to Deprioritize

These items from the HANDOFF.md gap analysis are deliberately excluded from this roadmap because they don't move the acquisition needle:

- Multi-language (English version) — out of scope for Slovak acquisition target
- Native mobile app — PWA is sufficient; app store presence doesn't help an acquisition in this market
- Staging environment — useful but not acquisition-critical; Cloudflare preview deployments suffice
- Advanced A/B testing — no time or traffic to make this meaningful
- Full-blown CMS — a lightweight admin panel is sufficient
- Accessibility deep-dive — important but not a valuation driver for a media acquisition

---

## Success Metrics Summary

| Phase | Month | Key Metric |
|-------|-------|------------|
| 1 | 4 | Newsletter launched, zero mock data |
| 2 | 10 | 10k monthly visitors, 1k registered users |
| 3 | 18 | 30k monthly visitors, public API live |
| 4 | Election night | 100k+ visitors, active acquisition conversations |
| 4 | 24 | Term sheet ≥ €800k |

---

## Technical Architecture Notes

No major architectural changes required. The existing stack (Next.js 16, Cloudflare Workers, D1, Drizzle ORM, Recharts) is well-suited for all phases. Key additions:

- **Resend or Mailchimp** for newsletter delivery (Phase 1)
- **Cloudflare Cron Triggers** for scheduled news scraping (Phase 1)
- **Simple auth** for user accounts — consider Cloudflare Access for admin, custom JWT for user accounts (Phase 2)
- **Claude API** for AI summaries (Phase 3) — one call/day, minimal cost
- **WebSocket or SSE** for live election night results (Phase 3) — Cloudflare Durable Objects if needed

All pages continue using the existing editorial broadsheet design system. No visual redesign required.
