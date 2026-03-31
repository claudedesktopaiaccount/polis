# Polis v2 Overhaul — Design Spec

**Date**: 2026-03-31
**Approach**: Hybrid — Bloomberg-style dashboard + guided onboarding for new voters
**Primary audience**: New voters (18-25)
**Secondary audiences**: Political junkies, general news readers
**Design philosophy**: Evolve the existing editorial system (keep sharp corners, serif headlines, newsprint palette, no shadows)
**Inspiration**: The Economist / Bloomberg — premium, authoritative, information-dense

---

## 1. Homepage — Adaptive Dual-Mode

The homepage serves two experiences from one URL, detected via cookie.

### First-Visit Mode

- Centered hero with quiz CTA: "Kde stojíš v slovenskej politike?"
- Large Newsreader serif headline, Inter body, sharp borders, paper background
- Below hero: teaser strip showing top 4–5 party polling numbers (colored circles + percentages, no chart)
- Bottom: subtle "Preskočiť na dashboard →" link for power users
- Cookie set after first meaningful interaction (quiz completion or prediction submission)

### Returning-User Mode

- **Ticker bar** (dark background, monospace): party abbreviations with % and delta arrows, source + timestamp right-aligned
- **Personal bar**: prediction score, rank out of total, "Aktualizovať predikciu →" CTA
- **Main grid** (3-column):
  - Left: prediction model hero — two leading candidates with win probability, 90-day trend sparkline
  - Center: party data table — party name, %, delta, seats, inline trend indicator
  - Right sidebar: crowd sentiment bars, leaderboard top 5, news feed (3–4 headlines)
- **Coalition bar** (bottom): top 3 scenarios with party color badges and formation probability percentage

### Detection Logic

- Cookie-based: `polis_engaged=1` set on quiz completion or prediction submission
- Server component checks cookie → renders appropriate variant
- No auth required for the switch — cookie is sufficient
- All subpages (/prieskumy, /predikcia, etc.) always show full data view regardless of user state

---

## 2. Navigation & Information Architecture

### Primary Nav (always visible)

- **Prehľad** — homepage/dashboard
- **Prieskumy** — polls
- **Predikcia** — prediction model
- **Tipovanie** — crowd predictions + leaderboard

### Secondary Nav (dropdown or "Viac" menu)

- Koaličný simulátor
- Volebný kalkulátor
- Povolebné plány

### Utility Nav (right side)

- Dark mode toggle
- Auth button (login/register) or user avatar + score badge

### Personal Score Badge

- For cookie-identified or logged-in users: small score indicator in navbar (e.g., "847 · #47")
- Always visible — persistent engagement pull

### Mobile

- Bottom tab bar with 4 primary nav items
- Secondary pages via hamburger menu
- Score badge in top header bar

### Design Continuity

- Keep thick `border-b-3 border-ink` bottom border
- Keep "Polis → πóλις" logo hover transition
- No rounded pills, no gradients on nav items

---

## 3. Page Improvements

### Prieskumy (Polls)

- **Poll comparison tool**: select 2+ polling agencies to overlay results on one chart
- **Triple view toggle**: "Model vs. Dav vs. Prieskumy" showing all three data sources on one visualization
- **Historical context callout**: inline note showing what polls said at this point before the last election
- **Party drill-down**: click any party row to expand full polling history inline

### Predikcia (Prediction Model)

- **"What if" slider**: adjust a party's polling ±3% and re-run simulation client-side to see seat allocation changes
- **Confidence intervals**: visualize the range from Monte Carlo simulations, not just point estimates
- **Methodology explainer**: collapsible section written for a 20-year-old, not a statistician

### Tipovanie (Crowd Predictions)

- **Leaderboard UI**: surface the existing backend — top 20 + your rank highlighted
- **Scoring breakdown**: winner prediction, percentage accuracy, coalition prediction, total score columns
- **Time filters**: all-time, this month, this week
- **Prediction history**: all your past predictions with accuracy scores over time
- **Social sharing cards**: OG image with your score and rank
- **Crowd consensus view**: aggregate visualization of what the crowd collectively predicts
- **Anonymous CTA**: "Zaregistruj sa a sleduj svoje skóre" for non-auth users viewing the leaderboard

### Koaličný Simulátor (Coalition Simulator)

- **Save & share**: generate a URL encoding party selections as query params (`?parties=PS,PROG,KDH,SaS`)
- **Probability overlay**: show the model's probability for each coalition configuration
- **Pre-built scenarios**: "Najpravdepodobnejšia", "Opozícia víťazí", "Veľká koalícia" as starting points

### Volebný Kalkulátor (Electoral Calculator)

- **Post-quiz funnel**: results page becomes a gateway — "Your top match is PS → see how PS is polling → predict the election → join the leaderboard"
- **Share your result**: OG image card with alignment breakdown
- This is the key onboarding entry point for the first-visit homepage

### Povolebné Plány (Post-election Plans)

- **Promise tracker**: status indicators per promise (fulfilled / in progress / broken / not started)
- **Compare parties**: side-by-side promise comparison on a given topic

---

## 4. Visual Design Evolution

### What Stays (Editorial DNA)

- 0px border-radius everywhere
- Newsreader serif for headlines
- Inter for body and UI text
- Newsprint color palette (ink, paper, surface, divider tokens)
- No box shadows
- Dark mode via class toggle with cookie persistence

### What Evolves

#### Typography

- **Larger headline range**: h1 at 32px (from 24px), tighter tracking (-0.03em)
- **Serif subheadlines**: 18px Newsreader for section subtitles
- **Tighter body**: 14px (from 16px) for Bloomberg-level density
- **Monospace data font**: all poll percentages, deltas, scores, seat counts rendered in monospace (JetBrains Mono or system monospace)
- **Uppercase micro-labels**: 11px, letter-spacing 0.1em, 40% opacity — section headers like "PRIESKUMY · POSLEDNÝ MESIAC"

#### Color Usage

- **Party colors as accents only**: left-border on cards, dot indicators in tables, badge backgrounds
- **Semantic deltas**: green (#00E676) for positive changes, red (#FF5252) for negative, muted for neutral
- **Dark ticker bar**: #111 background with monospace green/red text for the top polling strip

#### Components

- **Party cards**: evolved with left party-color border, monospace numbers, mini sparkline, seat count
- **Data tables**: tighter rows, party color dots, inline trend indicators, monospace alignment
- **Coalition badges**: party-colored pills with abbreviations

#### Motion & Interactions

- **Number tickers**: poll percentages animate from 0 to value on first load (400ms, CSS or lightweight JS)
- **Chart transitions**: Recharts animationBegin/animationDuration, sequential left-to-right easing
- **Hover data reveals**: party cards show sparkline + seat count on hover; table rows get party color left-border accent
- **Live pulse indicator**: CSS-only pulsing dot next to "Aktualizované pred Xh" timestamp
- **Respects prefers-reduced-motion**: all animations disabled for accessibility

---

## 5. Engagement Mechanics

### Leaderboard System

- Backend exists (`predictionScores` table, `/v1/leaderboard` endpoint) — needs UI
- Dedicated section on Tipovanie page
- Top 20 display + user's own rank highlighted
- Columns: rank, username, winner score, percentage score, coalition score, total
- Time filters: all-time, this month, this week

### Prediction Feedback Loop

- After submitting predictions: comparison card — "Ty vs. Model vs. Dav"
- Side-by-side display of user prediction, Monte Carlo output, and crowd aggregate
- When new polls drop: accuracy scores update, notification sent (backend notification system exists)
- Historical accuracy graph: Brier score trend over time per user

### Social Sharing

- Shareable OG image cards for: quiz results, prediction scorecard, leaderboard rank, coalition scenario
- Generated server-side via API route (`/api/share/[type]`)
- SVG templates returned directly (edge-runtime compatible, no PNG conversion)
- Cards include Polis branding + URL back to relevant page
- Share targets: Facebook, Instagram Stories (aspect ratio variant), WhatsApp, copy link

### Onboarding Funnel

1. Land on hook homepage → take quiz (Volebný kalkulátor)
2. See results → CTA: "Chceš vedieť, ako dopadnú voľby? Tipni si."
3. Submit prediction → see comparison card (you vs. model vs. crowd)
4. See leaderboard → CTA: "Zaregistruj sa a sleduj svoje skóre"
5. Register → personal score bar appears in navbar on all pages

Each step has one clear next action. No dead ends.

---

## 6. Backend Changes

### Already Built — Needs UI Wiring

| Feature | Table/Endpoint | Status |
|---------|---------------|--------|
| Leaderboard scoring | `predictionScores`, `/v1/leaderboard` | Backend complete |
| Crowd aggregates | `crowd_aggregates`, `/tipovanie` GET | Backend complete |
| Notifications | `userNotificationPrefs`, `notificationLog`, `/cron/notifications` | Backend complete |
| Newsletter | `newsletterSubscriptions`, `/newsletter/*` | Backend complete |
| API monetization | `apiKeys`, `apiUsage`, `/keys`, `/stripe/*` | Backend complete |
| Admin scoring | `/admin/score-predictions` | Backend complete |

### New Backend Work

- **Adaptive homepage**: cookie detection in page server component — no new tables, no new endpoints
- **Social share card generation**: new route `/api/share/[type]` — returns SVG directly (no PNG conversion needed — SVG works as OG image via `<meta>` tags). Templates render quiz results, scorecards, leaderboard rank, coalition scenarios. Edge-runtime compatible (no Sharp/Canvas dependencies).
- **Prediction history query**: join `userPredictions` with `predictionScores` over time — no new tables, data already has timestamps
- **Coalition sharing**: encode party selections as URL query params — no backend storage
- **Promise tracker status**: add `status` enum column to `party_promises` table (fulfilled / in_progress / broken / not_started) + admin update endpoint

### Explicitly Out of Scope for v2

- No real-time WebSocket updates — ISR with 6-hour revalidation is sufficient
- No user-generated content or comments — avoids moderation complexity
- No native mobile app — responsive web only
- No content paywall — API monetization stays separate from user-facing content
- No i18n beyond Slovak

---

## 7. Key Files to Modify

```
src/app/page.tsx                      — Adaptive homepage (dual-mode)
src/app/layout.tsx                    — Score badge in navbar
src/components/ui/Navbar.tsx          — 3-tier nav, score badge, mobile bottom bar
src/components/HeroBanner.tsx         — First-visit hook mode
src/components/PartyCard.tsx          — Evolved card with sparkline + monospace
src/app/prieskumy/page.tsx            — Comparison tool, triple view, drill-down
src/app/predikcia/page.tsx            — "What if" slider, confidence intervals
src/app/tipovanie/page.tsx            — Leaderboard UI, prediction history, sharing
src/app/koalicny-simulator/page.tsx   — Share URLs, probability overlay, presets
src/app/volebny-kalkulator/page.tsx   — Post-quiz funnel, share cards
src/app/povolebne-plany/page.tsx      — Promise tracker, party comparison
src/app/api/share/[type]/route.ts     — Social sharing card generation (new)
src/app/globals.css                   — Typography scale, monospace font, motion
src/lib/db/schema.ts                  — Promise status column addition
```
