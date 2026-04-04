# Claude OSS Program — Application Narrative

**Date**: 2026-04-04
**Program**: Anthropic Claude for Open Source (6 months Claude Max 20x)
**Repo**: [to be filled once public]
**Live demo**: [to be filled after deploy]

---

## Project Description

**Polis** is a civic tech web app tracking Slovak politics ahead of the 2027 parliamentary elections. It is designed specifically for 18–25 year old first-time voters — the demographic with the highest abstention rate in Slovakia — and provides the tools they need to make an informed decision: real polling data, a probabilistic election model, coalition simulations, a crowd prediction game, a party alignment quiz, and post-election promise tracking.

Slovakia's EU alignment is genuinely in question ahead of 2027. The current government has moved toward Russian positions on Ukraine and has taken steps to weaken independent institutions. Informed voters are the most reliable counter to misinformation at scale. Polis exists to lower the barrier to political literacy.

---

## What Is Built

Nine complete pages, all in Slovak:

| Page | What it does |
|------|-------------|
| **Prehľad** (Dashboard) | Adaptive homepage — first-visit quiz CTA or returning-user Bloomberg-style dashboard with ticker, prediction model, leaderboard preview |
| **Prieskumy** (Polls) | All polling agency data with trend charts, agency comparison, party drill-down |
| **Predikcia** (Model) | Monte Carlo simulation (10k iterations) with confidence intervals, D'Hondt seat allocation, "what if" sliders |
| **Tipovanie** (Crowd predictions) | User prediction submission, leaderboard (scored on winner + % accuracy + coalition), prediction history |
| **Koaličný simulátor** | Interactive coalition builder with D'Hondt seat recalculation, shareable URL |
| **Volebný kalkulátor** | 20-question party alignment quiz with weighted scoring, post-quiz prediction funnel |
| **Povolebné plány** | Promise tracker for 10 parties with status indicators (fulfilled / in progress / broken / not started) |
| **Podmienky / Súkromie** | GDPR-compliant legal pages |

**Tech stack**: Next.js 16 (App Router) + React 19 + TypeScript + TailwindCSS 4 + Recharts 3 + Cloudflare D1 (SQLite) via Drizzle ORM + Cloudflare Workers (OpenNextJS)

**Auth**: PBKDF2 (100k iterations, per-user salt, constant-time comparison), double-submit cookie CSRF, session tokens

**Security**: Full security audit + red team adversarial audit completed. All critical findings resolved before going public (committed secrets removed from wrangler.jsonc, reflected XSS in newsletter unsubscribe fixed, unauthenticated cron endpoints locked, CSRF gap on link-predictions fixed, userId stripped from leaderboard API).

---

## What Is Incomplete — Where Claude Comes In

The v2 overhaul is merged and deployed. These features remain:

1. **Social sharing cards** — OG image generation for quiz results, prediction scorecards, leaderboard rank. Backend route stub exists (`/api/share/[type]`), SVG templates not yet built.

2. **Crowd consensus visualization** — aggregate view of what all users collectively predict. Data exists in `crowd_aggregates` table, UI not wired.

3. **Real kalkulator weights** — volebný kalkulátor party position weights are currently static defaults. Need to be replaced with curated real positions sourced from party manifestos (seed script scaffolded, data curation not done).

4. **Real promise data** — seed script with 27 real promises written, needs to be run against production D1 and expanded to full coverage for all 10 parties.

5. **Notification system UI** — backend for poll-drop notifications exists (`userNotificationPrefs`, `notificationLog`, `/cron/notifications`), no user-facing opt-in UI.

6. **Prediction feedback loop** — "you vs. model vs. crowd" comparison card after submitting a prediction. Backend data available, UI not built.

7. **Adaptive homepage completion** — personal score bar in navbar for logged-in users, prediction score badge.

Claude will be used to complete each of these features iteratively, using the existing design spec (`docs/superpowers/specs/2026-03-31-polis-v2-overhaul-design.md`) and the editorial design system (0px radius, newsprint palette, no shadows, Newsreader serif headings, monospace data).

---

## Why This Project

- **Real civic impact**: Slovakia is a live case where a well-informed electorate materially affects EU coherence. This is not a toy project.
- **Target audience that doesn't currently have a good tool**: Most Slovak political sites are designed for political junkies. Polis's onboarding funnel (quiz → prediction → leaderboard) is designed for people who barely know the parties yet.
- **Substantial existing work**: 9 pages, full auth, real algorithms (D'Hondt, Monte Carlo), security-audited, deployed on Cloudflare Workers. Not a greenfield project — Claude would be accelerating a working product.
- **Clear remaining scope**: The incomplete features are well-defined and bounded. Six months of Claude Max would be enough to complete them and keep the data current through the 2027 election.

---

## Tone Note

This application is honest about what is and isn't built. The project is real and functional. The pitch is: a working civic tech product with a specific audience, a specific political moment, and a specific set of remaining features that Claude can help complete.
