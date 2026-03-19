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
| `/volebny-kalkulator` | `src/app/volebny-kalkulator/page.tsx` | Done — 20-question cosine similarity |
| `/tipovanie` | `src/app/tipovanie/page.tsx` | Done UI, needs D1 for persistence |
| `/povolebne-plany` | `src/app/povolebne-plany/page.tsx` | Done UI, mock data |

---

## TO-DO LIST (Priority Order)

### 🔴 CRITICAL — Test Wikipedia scraper fix
**File:** `src/lib/scraper/wikipedia.ts`
**Problem:** Wikipedia table has "OĽaNO and Friends" with `colspan=3` (sub-columns: Slovakia, ZĽ, KÚ). Old scraper used DOM index which shifted all subsequent columns by +2. Demokrati showed 13.5% instead of ~5%.
**Fix applied (NOT YET TESTED):** Rewrote `buildColumnMap()` with 2D grid approach that properly expands colspan/rowspan.
**How to test:** Start dev server (`npx next dev`), visit `http://localhost:3000/api/scrape`, verify:
- Demokrati ≈ 5% (was incorrectly showing 13.5%)
- KDH ≈ 5-6%
- SaS ≈ 5-6%
- Smer ≈ 22-24%, PS ≈ 20-22%

Expected column mapping after fix:
- 0=Polling firm, 1=Date, 2=Sample, 3=Smer, 4=PS, 5=Hlas, 6=Slovakia, 7=ZĽ, 8=KÚ, 9=KDH, 10=SaS, 11=SNS, 12=Republika, 13=Hungarian Alliance, 14=Democrats, 15=We Are Family, 16=ĽSNS, 17=Others, 18=Lead

### 🟡 MEDIUM — Cloudflare D1 Setup + Deployment
**Purpose:** Persist `/tipovanie` crowd predictions across visitors
**Steps needed:**
1. `npm run cf-typegen` to generate D1 types
2. Create D1 database via Cloudflare dashboard or `wrangler d1 create progresivny-tracker`
3. Add to `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "progresivny-tracker"
   database_id = "YOUR_ID_HERE"
   ```
4. Create schema: `predictions` table (party_id, percentage, visitor_id, created_at)
5. Wire up `/tipovanie` page to use D1 via server actions
6. Deploy: `npm run deploy` (uses `@opennextjs/cloudflare`)

### 🟢 LOW — Real news data
`src/app/page.tsx` NewsHeadlines section still uses mock data. Could scrape SME.sk or Denník N RSS.

---

## Key Files

```
src/
  lib/
    scraper/wikipedia.ts      ← CRITICAL: colspan fix applied, needs testing
    poll-data.ts              ← getLatestPolls(), getAllPolls(), getFallbackData()
    parties.ts                ← 10 parties, colors, portraitUrl (.jpg)
    prediction/
      monte-carlo.ts          ← Box-Muller, 10k iterations
      dhondt.ts               ← D'Hondt 150 seats, 5% threshold
  components/
    PartyCard.tsx             ← h-44 portrait, party bg color, grayscale→color hover
    HeroBanner.tsx            ← PS vs Smer hero with clipPath portrait effect
  app/
    api/scrape/route.ts       ← GET /api/scrape test endpoint (edge runtime)
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

### ISR
`export const revalidate = 21600` (6 hours) on data-fetching pages to avoid hammering Wikipedia.

### D1Database Type
`tsconfig.json` has `"types": ["@cloudflare/workers-types"]` — required for D1Database type.

---

## Unresolved Warning
```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
We detected multiple lockfiles...
```
Non-blocking, can ignore.

---

## Design Rules
- Purple/violet theme (`#7c3aed` primary)
- Inter font
- Party cards: `h-44` portrait area with party backgroundColor, grayscale→color hover, bottom gradient in party color
- NO color overlays on faces — only background behind person
- Match progresivne.sk aesthetic

---

## Running Locally
```bash
cd /Users/dotmiracle/Downloads/progresivny-tracker
npx next dev
# Visit http://localhost:3000
# Test scraper: http://localhost:3000/api/scrape
```
