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

## DONE

### ✅ Wikipedia scraper colspan fix
**File:** `src/lib/scraper/wikipedia.ts`
**Problem:** Wikipedia table had "OĽaNO and Friends" with `colspan=3` (sub-columns: Slovakia, ZĽ, KÚ). Old scraper used DOM index which shifted all subsequent columns by +2.
**Fix:** Rewrote `buildColumnMap()` with 2D grid approach that properly expands colspan/rowspan. Sub-columns are summed into one party value (lines 257-259).

---

## TO-DO LIST (Priority Order)

### ✅ Cloudflare D1 Setup
**Done:** D1 database created (`3988aa54-...`), wrangler.jsonc configured, Drizzle schema + migrations in place, `/tipovanie` uses `getDb(env.DB)`.
**Note:** `workers/scraper/wrangler.toml` still has `database_id = "TO_BE_CREATED"` — needs real ID if cron scraper worker is deployed separately.

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
