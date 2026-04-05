# Phase 5: AI Prediction Upgrade — Design Spec

**Date:** 2026-04-05
**Status:** Approved

## Overview

Replace the single-agency poll input with a weighted poll aggregate (exponential decay, 12-month window), and add a Claude-generated Slovak narrative that summarises the current prediction state. The Monte Carlo simulation and D'Hondt allocator are unchanged.

---

## 1. Architecture & Data Flow

```
D1 polls table (all agencies, last 12 months)
  ↓  src/lib/poll-aggregate.ts  [NEW]
Weighted mean per party + dynamic stdDev
  ↓  src/lib/prediction/monte-carlo.ts  [unchanged]
Simulation results (10k iterations, D'Hondt)
  ↓  src/lib/prediction/narrative.ts  [NEW]
Hash check → D1 narrative cache → Claude API (only on change)
  ↓  src/app/predikcia/page.tsx  [updated]
PredikciaClient  [updated — methodology modal added]
```

### Files changed

| File | Change |
|------|--------|
| `src/lib/poll-aggregate.ts` | New — weighted aggregation logic |
| `src/lib/prediction/narrative.ts` | New — hash cache + Claude API call |
| `src/lib/db/schema.ts` | Add `prediction_narrative` table |
| `src/app/predikcia/page.tsx` | Swap data source, pass narrative |
| `src/app/predikcia/PredikciaClient.tsx` | Add narrative block + methodology modal |
| `drizzle/` | New migration for `prediction_narrative` |
| `.env.example` | Add `ANTHROPIC_API_KEY` |
| `wrangler.jsonc` | Add `ANTHROPIC_API_KEY` to vars |

---

## 2. Poll Aggregation (`src/lib/poll-aggregate.ts`)

### Window
Only polls published within the last **12 months** are used. Older polls are excluded entirely — they reflect a different political reality.

### Weight formula
```
weight = e^(-λ × days_since_poll)
```
`λ = 0.023` gives a 30-day half-life: a poll from 30 days ago counts as ~50% of today's, a poll from 90 days ago counts ~12%.

### Weighted mean per party
```
meanPct = Σ(weight × pct) / Σ(weight)
```

### stdDev
Computed via the existing `estimateStdDev()` in `monte-carlo.ts`, fed the spread of raw agency values within the window per party. Replaces the hardcoded brackets (`2.5 / 2.0 / 1.5`) currently in `predikcia/page.tsx`.

### Fallback
If no polls exist within the 12-month window (cold DB, data gap), fall back to `getLatestPolls()` and log a warning.

### Output
```ts
interface AggregatedParty {
  partyId: string;
  meanPct: number;
  stdDev: number;
  pollCount: number;      // number of polls included
  oldestPollDate: string; // for UI transparency
  newestPollDate: string;
}
```
Shape is compatible with `PartyInput[]` expected by `runSimulation()`.

---

## 3. Narrative Cache (`src/lib/prediction/narrative.ts`)

### D1 table: `prediction_narrative`
```ts
{
  id: 'current',        // single row, always upserted
  inputHash: string,    // SHA-256 of JSON.stringify(aggregatedParties)
  narrative: string,    // Slovak text, 2–3 sentences
  generatedAt: number,  // unix timestamp (ms)
}
```

### Cache logic
1. Serialize aggregated poll inputs → SHA-256 hash
2. Query D1 for `id = 'current'`
3. **Hash matches** → return cached narrative (no API call)
4. **Hash differs or no row** → call Claude API, upsert row, return new narrative

### Claude API call
- **Model:** `claude-haiku-4-5-20251001` (lowest cost, sufficient quality)
- **Max tokens:** 200
- **Prompt language:** Slovak
- **Prompt structure:**
  ```
  Si analytik slovenských volieb. Na základe nasledujúcich dát napíš 2-3 vety
  neutrálnej, novinárskej analýzy aktuálneho stavu prieskumov a predikcie.
  Buď stručný a faktický. Nepoužívaj hodnotové súdy.

  Dáta: [JSON of aggregated means + simulation win probabilities + seat ranges]
  ```
- **Expected cost:** ~$0.00025 per call, ~2–3 calls/week in practice

### Error handling
- Claude API unavailable → return last cached narrative from D1 (stale is fine)
- No cached narrative + Claude unavailable → return `null`; page renders without narrative block
- The prediction model never blocks on Claude

---

## 4. UI Changes (`PredikciaClient.tsx`)

### Narrative block
Rendered below the `SectionHeading`, above the charts. Only shown if `narrative !== null`. Styled as a pull-quote in the editorial system (Newsreader italic, ink border-left 3px, no background, no radius).

### Methodology modal
A `?` icon button placed inline with the `SectionHeading` title. Triggers a client-side modal (no library — simple `useState` + fixed overlay). Modal content in Slovak:

- **Agregácia prieskumov** — exponenciálny pokles váhy podľa veku prieskumu, okno 12 mesiacov
- **Monte Carlo simulácia** — 10 000 iterácií, každá s náhodnou odchýlkou od priemeru
- **Intervaly spoľahlivosti** — 5. a 95. percentil výsledkov simulácií
- **AI analýza** — text generovaný modelom Claude (Anthropic), aktualizovaný pri zmene prieskumov
- **Mandáty** — metóda D'Hondt, 150 mandátov, 5% prah

Modal uses existing editorial design tokens: 0px radius, 1px divider border, no shadows.

---

## 5. Error Handling Summary

| Failure | Behaviour |
|---------|-----------|
| Claude API down | Serve stale narrative from D1 cache |
| No narrative in cache + Claude down | Render page without narrative block |
| No polls in 12-month window | Fall back to `getLatestPolls()`, log warning |
| D1 query error | Propagate — existing error boundary handles it |

---

## 6. Testing

| Test | File | What it verifies |
|------|------|-----------------|
| `poll-aggregate.test.ts` | `src/lib/` | Correct weights, decay, stdDev, 12-month cutoff, fallback |
| `narrative.test.ts` | `src/lib/prediction/` | Cache hit skips API call; cache miss calls API and upserts; null on total failure |
| Existing Monte Carlo tests | unchanged | No regression |

---

## 7. Environment Variables

```bash
# .env.example
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Also added to `wrangler.jsonc` under `[vars]` for Cloudflare Workers runtime access.

---

## Out of Scope (Phase 5)

- Mock data replacement in `/volebny-kalkulator` and `/povolebne-plany` → Phase 4.5
- Agency credibility scoring → future phase (insufficient historical data)
- Narrative on pages other than `/predikcia`
- Streaming narrative generation
