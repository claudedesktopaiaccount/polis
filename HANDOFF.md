# Progressive Tracker — AI Handoff Document

## Project Overview
Slovak political survey analysis website. Next.js 16 + Tailwind CSS v4 + Cloudflare Pages.

**Repo:** `claudedesktopaiaccount/progresivny-tracker` (private)
**Working dir:** `/Users/dotmiracle/Downloads/progresivny-tracker`
**Design ref:** https://progresivne.sk/lidri-zmeny/
**Stack:** Next.js App Router, TypeScript, Tailwind v4 (CSS config, NOT tailwind.config.ts), Recharts, Cheerio, @opennextjs/cloudflare, Drizzle ORM + Cloudflare D1

---

## Pages

| Route | File | Status |
|-------|------|--------|
| `/` | `src/app/page.tsx` | Done — uses real poll data |
| `/prieskumy` | `src/app/prieskumy/page.tsx` + `PrieskumyClient.tsx` | Done |
| `/predikcia` | `src/app/predikcia/page.tsx` + `PredikciaClient.tsx` | Done — Monte Carlo |
| `/koalicny-simulator` | `src/app/koalicny-simulator/KoalicnyClient.tsx` | Done — D'Hondt |
| `/volebny-kalkulator` | `src/app/volebny-kalkulator/page.tsx` + `VolebnyKalkulatorClient.tsx` | Done — 20 otázok, 10 strán |
| `/tipovanie` | `src/app/tipovanie/page.tsx` + `TipovanieClient.tsx` | Done — D1 persistence + CSRF |
| `/povolebne-plany` | `src/app/povolebne-plany/page.tsx` + `PovolebnePlanyClient.tsx` | Done — mock dáta pre 10 strán |
| `/sukromie` | `src/app/sukromie/page.tsx` + `DeleteDataButton.tsx` + `ExportDataButton.tsx` + `ConsentManager.tsx` | Done — privacy policy + data deletion + export + consent management |
| `/podmienky` | `src/app/podmienky/page.tsx` | Done — Terms of Service |

---

## DONE

### ✅ Wikipedia scraper colspan fix
**File:** `src/lib/scraper/wikipedia.ts`
**Problem:** Wikipedia table had "OĽaNO and Friends" with `colspan=3` (sub-columns: Slovakia, ZĽ, KÚ). Old scraper used DOM index which shifted all subsequent columns by +2.
**Fix:** Rewrote `buildColumnMap()` with 2D grid approach that properly expands colspan/rowspan. Sub-columns are summed into one party value (lines 257-259).

---

## DONE

### ✅ Cloudflare D1 Setup
D1 database created (`3988aa54-...`), wrangler.jsonc configured, Drizzle schema + migrations in place, `/tipovanie` uses `getDb(env.DB)`.

### ✅ Real news scraping
Homepage volá `scrapeNews()` v server componente (`src/app/page.tsx:15`). Ťahá SME, Denník N, Aktuality RSS s political keyword filtrom.

### ✅ Error & Loading states
- `error.tsx` — error boundary s "Skúsiť znova" tlačidlom
- `not-found.tsx` — 404 stránka
- `loading.tsx` skeletony pre `/prieskumy`, `/predikcia`, `/tipovanie`

### ✅ Worker scraper deployment
- `workers/scraper/wrangler.toml` — doplnené reálne `database_id`
- Cron trigger `0 */6 * * *` už bol nakonfigurovaný

### ✅ Environment variables
- `.env.example` vytvorený, `.gitignore` upravený aby ho neigrnoroval

### ✅ Security hardening (základné)
- Rate limiting na `/api/tipovanie` (10 req/min per IP)
- Input validácia — `selectedWinner` overený voči `PARTY_LIST`, fingerprint max 128 znakov

### ✅ CSRF ochrana
- Double-submit cookie pattern: `src/proxy.ts` nastaví `pt_csrf` cookie, client posiela `X-CSRF-Token` header
- Validácia v `src/app/api/tipovanie/route.ts` a `src/app/api/gdpr/delete/route.ts`

### ✅ GDPR Consent
- **`src/components/GdprBanner.tsx`** — fixed-bottom banner s "Prijať"/"Odmietnuť", localStorage
- **`src/lib/consent.ts`** — `hasConsent()` helper
- **`src/lib/fingerprint.ts`** — guard: bez súhlasu nevytvára fingerprint
- **`src/app/sukromie/page.tsx`** — slovenská privacy policy stránka
- **`src/app/sukromie/DeleteDataButton.tsx`** — tlačidlo na vymazanie dát
- **`src/app/api/gdpr/delete/route.ts`** — endpoint na vymazanie užívateľských dát + dekrementácia aggregátov

### ✅ Neúplné features opravené
- `/predikcia` — zobrazuje všetkých 10 strán (odstránený `.slice(0, 5)`)
- `/povolebne-plany` — mock dáta pre všetkých 10 strán (republika, sns, demokrati, aliancia, slovensko)
- `/volebny-kalkulator` — pridané váhy pre `aliancia` a `slovensko` do všetkých 20 otázok
- `/volebny-kalkulator` + `/povolebne-plany` — refaktorované na server/client split pattern

### ✅ SEO & Metadata
- Per-page metadata (`title`, `description`, `openGraph`) na všetkých stránkach
- Default OG tagy v root `layout.tsx` (locale sk_SK, siteName)
- **`src/app/sitemap.ts`** — automatická sitemap generácia pre všetkých 8 routes

### ✅ Accessibility
- Alt text na party portraits: `Portrét {leader}, líder {name}` v `PartyCard.tsx` a `TipovanieClient.tsx`
- `role="group"` a `aria-label` na koaličný simulátor grid
- `aria-pressed` na party selection tlačidlách (koaličný simulátor + tipovanie)
- `role="progressbar"` s `aria-valuenow` na volebný kalkulátor progress bar
- `aria-label` na answer buttons vo volebnom kalkulátore

---

### ✅ Unit testy (Vitest)
- **`vitest.config.ts`** — Vitest setup s path alias `@/*`, coverage cez `@vitest/coverage-v8`
- **`src/lib/scraper/wikipedia.test.ts`** — 17 testov: `resolvePartyId`, `parsePercentage`, `parseWikiDate`, `buildColumnMap` (colspan/rowspan regression)
- **`src/lib/prediction/dhondt.test.ts`** — 8 testov: seat allocation, threshold edge cases, determinism
- **`src/lib/prediction/monte-carlo.test.ts`** — 8 testov: `estimateStdDev` clamping, simulation stats, parliament probability
- Scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`

---

## Production Readiness Plan

### ✅ Phase 0: Pre-Launch Blockers (All Done)

#### ✅ 0.1 Commit all uncommitted work
Committed as part of Phase 0 completion.

#### ✅ 0.2 Fix race conditions
- **Tipovanie duplicate vote:** Added UNIQUE index on `visitor_id` + try/catch for constraint violation (belt-and-suspenders with existing SELECT check). Migration: `drizzle/0002_fix_duplicate_race.sql`
- **Tipovanie aggregate:** Already used atomic `INSERT ... ON CONFLICT DO UPDATE` with `sql` template — no fix needed.
- **GDPR delete:** Rewrote to delete-first-then-recompute pattern (crash-safe, idempotent).

#### ✅ 0.3 Add fetch timeouts to scrapers
Already had `AbortSignal.timeout(10_000)` on all fetch calls.

#### ✅ 0.4 Fix rate limiter for Cloudflare
- Was already D1-based (not in-memory). Fixed race condition: insert-first-then-count pattern prevents concurrent requests from bypassing the limit.

#### ✅ 0.5 Authenticate scraper `/run` endpoint
Already had `Authorization: Bearer <SCRAPER_SECRET>` header check.

#### ✅ 0.6 Fix `region` column misuse
- Migration `0001` added `fingerprint` column and copied data.
- Removed dead `region` column from Drizzle schema. SQLite column remains but is unused.

---

### ✅ Phase 1: Reliability & Observability (All Done)

#### ✅ 1.1 Error monitoring (Sentry)
- Installed `toucan-js` (Sentry client for Cloudflare Workers — `@sentry/nextjs` incompatible with Workers runtime)
- Created `src/lib/sentry.ts` — `createSentry()`, `createSentryWithoutRequest()`, `captureException()` wrappers
- Wired into all 4 API routes (`tipovanie`, `gdpr/delete`, `gdpr/export`, `scrape`) + `tipovanie/page.tsx` server component
- Created `src/app/api/report-error/route.ts` — client-side error forwarding endpoint
- Updated `src/app/error.tsx` — POSTs errors to `/api/report-error` via `useEffect`
- `SENTRY_DSN` configured as Cloudflare secret (added to `.env.example`)

#### ✅ 1.2 CI/CD pipeline (GitHub Actions)
- Created `.github/workflows/ci.yml` with 4 jobs: lint+typecheck, test, build, deploy
- Deploy job runs only on push to main, uses `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` secrets

#### ✅ 1.3 GDPR audit logging
- Added `gdprAuditLog` table to `src/lib/db/schema.ts` (action, visitorIdHash SHA-256, timestamp, recordsAffected)
- Migration: `drizzle/0003_gdpr_audit_log.sql`
- Extracted shared `hashString()` utility to `src/lib/hash.ts` (replaces inline `hashIp` in tipovanie route)
- Audit rows inserted in `gdpr/delete` and `gdpr/export` routes

#### ✅ 1.4 Stale fallback data
- Added `getFallbackFromDb(db)` to `src/lib/poll-data.ts` — queries latest poll+results from D1
- `getLatestPolls(db?)` now accepts optional DB parameter
- Fallback chain: scrape Wikipedia → D1 → hardcoded (last resort)
- Homepage (`src/app/page.tsx`) passes DB instance to `getLatestPolls()`

---

### 🟡 Phase 2: Performance

#### 2.1 Dynamic import for Recharts
- Lazy-load via `next/dynamic` with `ssr: false` in `PrieskumyClient.tsx`
- Recharts is ~200KB gzipped, only used on one page

#### 2.2 Image optimization
- Verify all portrait usages use `next/image` `<Image>` (not raw `<img>`)
- Check `HeroBanner.tsx` and `TipovanieClient.tsx`

#### 2.3 News ISR interval
- Split revalidation: polls stay at 6h, homepage/news to `revalidate = 3600` (1h)

#### 2.4 Responsive charts
- `PollTrendChart.tsx` has fixed 400px height — unreadable on mobile
- Add responsive breakpoints (250px on mobile)

---

### 🟡 Phase 3: Testing

#### 3.1 E2E tests (Playwright)
Critical flows: homepage load, prieskumy chart, tipovanie vote+duplicate, koalicny-simulator, GDPR delete, volebny-kalkulator quiz

#### 3.2 Scraper integration test
Daily scheduled test fetching real Wikipedia page, validating ≥5 polls with recognized party IDs

---

### 🟢 Phase 4: Polish (Nice-to-Have)

- **Analytics:** Umami (GDPR-compliant, self-hosted)
- ~~**Dark mode:**~~ ✅ Done (cookie-based ThemeProvider + CSS custom properties)
- **Data retention:** Scheduled purge of old `userPredictions` after electoral cycle
- **README:** Replace default create-next-app with real documentation

---

### Priority Matrix

| Priority | Item | Risk if Skipped |
|----------|------|-----------------|
| BLOCKER | Commit uncommitted work | Deploy ships incomplete app |
| BLOCKER | Fix aggregate race condition | Lost votes under load |
| BLOCKER | Add fetch timeouts | Scraper hangs crash cron |
| BLOCKER | Fix rate limiter for Cloudflare | Rate limiting non-functional |
| BLOCKER | Auth on scraper /run endpoint | Abuse vector |
| BLOCKER | Fix region/fingerprint column | Schema integrity + GDPR export incomplete |
| ~~HIGH~~ | ~~Sentry error monitoring~~ | ✅ Done (toucan-js) |
| ~~HIGH~~ | ~~CI/CD pipeline~~ | ✅ Done (GitHub Actions) |
| ~~HIGH~~ | ~~GDPR audit log~~ | ✅ Done (gdpr_audit_log table) |
| MEDIUM | Dynamic import Recharts | Slow page loads |
| MEDIUM | News ISR to 1h | Stale news |
| MEDIUM | E2E tests | Regression risk |
| LOW | Analytics, dark mode, README | Polish |

### Verification Checklist
- After Phase 0: `npm run build` succeeds, `npm test` passes, manual test of vote flow with concurrent requests
- After Phase 1: Sentry captures a test error, CI runs green, audit log table populated after delete
- After Phase 2: Lighthouse score improvement, bundle size reduction visible
- After Phase 3: Playwright tests pass in CI

---

## Key Files

```
src/
  proxy.ts                    ← CSRF cookie (Next.js 16 proxy convention, NOT middleware)
  lib/
    scraper/wikipedia.ts      ← CRITICAL: colspan fix applied, needs testing
    poll-data.ts              ← getLatestPolls(), getAllPolls(), getFallbackData()
    parties.ts                ← 10 parties, colors, portraitUrl (.jpg)
    consent.ts                ← GDPR consent helpers (localStorage)
    fingerprint.ts            ← Browser fingerprint (consent-gated)
    prediction/
      monte-carlo.ts          ← Box-Muller, 10k iterations
      dhondt.ts               ← D'Hondt 150 seats, 5% threshold
  components/
    PartyCard.tsx             ← h-44 portrait, party bg color, grayscale→color hover
    HeroBanner.tsx            ← PS vs Smer hero with clipPath portrait effect
    GdprBanner.tsx            ← GDPR consent banner (fixed-bottom)
  app/
    api/scrape/route.ts       ← GET /api/scrape test endpoint (edge runtime)
    api/tipovanie/route.ts    ← POST voting + GET aggregates (CSRF protected)
    api/gdpr/delete/route.ts  ← POST data deletion (CSRF protected)
    api/gdpr/export/route.ts  ← POST data export as JSON (CSRF protected)
    sukromie/page.tsx          ← Privacy policy page
    sukromie/ExportDataButton.tsx ← Data export download button
    sukromie/ConsentManager.tsx   ← Fingerprinting consent toggle
    podmienky/page.tsx         ← Terms of Service page
    sitemap.ts                ← Auto-generated sitemap (9 routes)
public/portraits/             ← 10 .jpg files (actually JPEG despite old .webp names)
```

---

## Important Technical Notes

### Tailwind v4 — CSS Config (NOT tailwind.config.ts)
```css
/* src/app/globals.css */
@theme inline {
  --color-primary: #7c3aed;
  /* etc */
}
```
Do NOT create tailwind.config.ts — this project uses v4 CSS-based config.

### Portrait Files
All portraits in `public/portraits/` are `.jpg` (downloaded from Wikipedia, actually JPEG format). All references in code use `.jpg`. Do NOT change to `.webp`.

### Server/Client Split Pattern
Pages that need real data + interactivity use a split:
- `page.tsx` = async server component, fetches data, passes as props
- `*Client.tsx` = `'use client'` component, handles UI interactivity

### Next.js 16 Proxy (NOT middleware)
`src/proxy.ts` s `export default function proxy()`. Next.js 16 premenoval `middleware` na `proxy`. Do NOT create `middleware.ts`.

### ISR
`export const revalidate = 21600` (6 hours) on data-fetching pages to avoid hammering Wikipedia.

### D1Database Type
`tsconfig.json` has `"types": ["@cloudflare/workers-types"]` — required for D1Database type.

---

## GDPR / Privacy / Terms of Service

### Architecture Overview
- **Consent flow:** `GdprBanner` → localStorage `gdpr_consent` → gates fingerprinting
- **Cookie `pt_visitor`** — 1-year, visitor ID for vote deduplication in Tipovanie
- **Cookie `pt_csrf`** — CSRF double-submit pattern (set in `src/proxy.ts`)

### File Map

| File | Purpose |
|------|---------|
| `src/components/GdprBanner.tsx` | Fixed-bottom consent banner (Prijať/Odmietnuť) |
| `src/lib/consent.ts` | `getConsentStatus()`, `hasConsent()`, `setConsent()` — localStorage wrapper |
| `src/lib/fingerprint.ts` | Browser fingerprint (SHA-256), consent-gated (returns `""` if no consent) |
| `src/app/sukromie/page.tsx` | Privacy policy page (Slovak) |
| `src/app/sukromie/DeleteDataButton.tsx` | Data deletion UI with confirmation dialog |
| `src/app/api/gdpr/delete/route.ts` | POST endpoint — deletes votes, decrements aggregates, clears cookie |
| `src/app/api/gdpr/export/route.ts` | POST endpoint — exports user votes as JSON (Article 15) |
| `src/app/sukromie/ExportDataButton.tsx` | Data export UI — downloads JSON file |
| `src/app/sukromie/ConsentManager.tsx` | Consent change widget — toggle fingerprinting on/off |
| `src/app/podmienky/page.tsx` | Terms of Service page (Slovak) |

### Consent Flow Detail
1. Banner appears when `getConsentStatus() === null`
2. **Accept** → `setConsent("accepted")` → fingerprint enabled → stored alongside vote
3. **Reject** → `setConsent("rejected")` → fingerprint returns `""`, voting still works (cookie-only dedup)

### Data Collected
| Data | Storage | Retention |
|------|---------|-----------|
| Voting choice (`selectedWinner`) | D1 `userPredictions` | Electoral cycle |
| Visitor ID (`pt_visitor` cookie) | Browser cookie | 1 year |
| Fingerprint hash | D1 `userPredictions` | Electoral cycle (only with consent) |
| IP address | Not stored in DB | Temporary, rate-limiting only |

### Data Deletion Flow
1. User clicks "Vymazať moje dáta" on `/sukromie` → confirmation dialog
2. Client sends POST `/api/gdpr/delete` with CSRF token from `pt_csrf` cookie
3. Server deletes all `userPredictions` rows for that `visitorId`
4. Server decrements `totalBets` in crowd aggregates for each deleted vote
5. Server clears `pt_visitor` cookie; client clears `gdpr_consent` from localStorage

### Known Gaps / Privacy TO-DO
- **No audit logging** — deletions/exports not logged for compliance records
- **No scheduled data retention cleanup** — old voting data not auto-purged after electoral cycle

---

## Unresolved Warning
```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
We detected multiple lockfiles...
```
Non-blocking, can ignore.

---

## Design Rules — Editorial Authority Redesign

**Smer:** FiveThirtyEight / Financial Times / The Economist inšpirovaný editorial broadsheet.
**Stitch zdroj:** `stitch/` priečinok — HTML mockupy + screenshoty + `editorial_authority_prd.html`

### Design System

| Token | Light | Dark |
|-------|-------|------|
| Background | `#F4F3EE` (newsprint off-white) | `#101622` |
| Surface | `#FFFFFF` | `#1A1F2E` |
| Ink (primary) | `#111110` | `#E8E8E3` |
| Text | `#2C2C2A` | `#E8E8E3` |
| Divider | `#D6D5CF` | `#2A2F3E` |
| Hover | `#EBEBE6` | `#252A38` |

- **Fonts:** Newsreader (serif, nadpisy), Inter (body/dáta), tabular-nums pre čísla
- **Border radius:** 0px všade (ostré hrany)
- **Borders:** Hairline 1px (`divider`), thick 3px (`ink`) pre navbar
- **Shadows:** Žiadne — len borders
- **Party colors:** Zachovať existujúce z `globals.css`

---

## 🔄 Redesign — Editorial Authority + Dark Mode

### Fáza R0: Design System Foundation
**Status:** ✅ DONE

Nahradený @theme block editorial tokenmi (ink, paper, surface, divider, hover). Pridané `:root` a `.dark` CSS premenné. Newsreader font cez `next/font/google`. Globálne `border-radius: 0 !important`, žiadne shadows.

---

### Fáza R1: Zdieľané komponenty + Dark Mode infraštruktúra
**Status:** ✅ DONE

ThemeProvider (cookie-based dark/light). Navbar: 3px bottom border, 60px, sun/moon toggle. Footer: hardcoded dark bg. SectionHeading: serif + uppercase subtitle + hairline.

---

### Fáza R2: Homepage
**Status:** ✅ DONE

2-stĺpcový layout (content + news sidebar). HeroBanner: serif typografia, štvorcové portréty, vertikálna hairline. PartyCard: transparentné bg, bottom hairline. NewsHeadlines: vertikálny zoznam.

---

### Fáza R3: Prieskumy (Polls)
**Status:** ✅ DONE

AreaChart → LineChart 500px, 2px čiary, 5% dashed threshold. Filter sidebar (agency checkboxes + time range). Raw data tabuľka + CSV export. Theme-aware CSS variables pre Recharts.

---

### Fáza R4: Predikcia
**Status:** ✅ DONE

ParliamentGrid (10×15, 150 seats). 50/50 layout: win probability bars (32px) + seat grid. Editorial prediction tabuľka.

---

### Fáza R5: Koalícny simulátor
**Status:** ✅ DONE

SVG Hemicycle (5 riadkov: 20,25,30,35,40 dots), dashed majority line. Hemicycle hore, seat counter + "VÄČŠINA" stamp, party tabuľka s checkboxami, preset koalície.

---

### Fáza R6: Tipovanie
**Status:** ✅ DONE

2-stĺpcový layout na desktope (voting + crowd results). Editorial party list, leaderboard tabuľka s progress barmi. Slider model ODLOŽENÝ.

---

### Fáza R7: Polish + Dark Mode finalizácia
**Status:** ✅ DONE

Restyled: error.tsx, GdprBanner.tsx, sukromie (page + ExportDataButton + DeleteDataButton + ConsentManager), podmienky, VolebnyKalkulatorClient, PovolebnePlanyClient. Všetky komponenty používajú editorial tokeny. Dark mode funguje cez CSS custom properties. Build + lint + 39 testov OK.

---

### Čo zo stitch NEPREBERIEME

| Návrh | Dôvod |
|---|---|
| 3-stĺpcový layout s ľavým sidebar nav | Duplikuje navbar |
| Material Symbols ikony | +100KB, inline SVG je lepšie |
| Slider model tipovanie | Vyžaduje DB migráciu |
| Odlišné party farby z PRD | Zachovávame Wikipedia-verified |

### Poradie implementácie
```
R0 (tokens) → R1 (shared + dark) → R2 (homepage) → R3 (prieskumy)
→ R4 (predikcia) → R5 (simulátor) → R6 (tipovanie) → R7 (polish)
```
Fázy R0+R1 sú prerequisite. R3-R6 sú nezávislé (možno paralelizovať).

---

## Running Locally
```bash
cd /Users/dotmiracle/Downloads/progresivny-tracker
npx next dev
# Visit http://localhost:3000
# Test scraper: http://localhost:3000/api/scrape
```
