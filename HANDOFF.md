# Polis — AI Handoff Document

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

## Dokončené (zhrnutie)

Všetky core features hotové: Wikipedia scraper (colspan fix), D1 setup, real news scraping, error/loading states, worker scraper, CSRF, GDPR consent+audit, security hardening, SEO metadata, accessibility, 33+ unit testov. Production readiness Phase 0 (blockers) + Phase 1 (reliability/observability) dokončené. Editorial Authority redesign (R0-R7) + dark mode hotový.

**Posledná zmena (2026-03-22):** Zoradenie strán podľa % v `/prieskumy` — legenda, tooltip, aj tabuľky zoradené od najvyššej preferencie. Custom legend renderer (Recharts defaultne triedil abecedne). `itemSorter` na Tooltip.

---

### 🟡 Phase 2: Performance

#### 2.1 Dynamic import for Recharts
- Lazy-load via `next/dynamic` with `ssr: false` in `PrieskumyClient.tsx`
- ⚠️ Zmena v working tree (uncommitted)

#### 2.2 Image optimization
- Verify all portrait usages use `next/image` `<Image>` (not raw `<img>`)
- Check `HeroBanner.tsx` and `TipovanieClient.tsx`

#### 2.3 News ISR interval
- Split revalidation: polls stay at 6h, homepage/news to `revalidate = 3600` (1h)
- ⚠️ Zmena v working tree (uncommitted)

#### 2.4 Responsive charts
- `PollTrendChart.tsx` — responsive breakpoints (300px mobile, 400px tablet, 500px desktop)
- ⚠️ Zmena v working tree (uncommitted)

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

### Priority Matrix (zostávajúce)

| Priority | Item | Risk if Skipped |
|----------|------|-----------------|
| MEDIUM | Image optimization | Slow page loads |
| MEDIUM | E2E tests (Playwright) | Regression risk |
| LOW | Analytics (Umami) | No usage data |
| LOW | README | Missing documentation |

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

## ✅ Redesign — Editorial Authority + Dark Mode (DONE)

Všetkých 8 fáz (R0-R7) dokončených. FiveThirtyEight-inspired editorial broadsheet dizajn. ThemeProvider (cookie-based dark/light). Všetky komponenty používajú editorial tokeny.

---

## Running Locally
```bash
cd /Users/dotmiracle/Downloads/progresivny-tracker
npx next dev
# Visit http://localhost:3000
# Test scraper: http://localhost:3000/api/scrape
```

---

## 🎯 Gap Analysis — Čo chýba na "milión"

**Aktuálny stav:** Funkčné MVP s 9 stránkami, real data pipeline, editorial dizajnom, GDPR compliance, CI/CD, a error trackingom. Solidný technický základ — ale na monetizovateľný produkt chýba veľa.

---

### 🔴 Must-Have (bez toho to nie je produkt)

#### 1. Business Model & Monetizácia
- **Žiadny revenue stream** — stránka je čisto bezplatná bez akejkoľvek monetizačnej stratégie
- Možnosti:
  - **Freemium:** základné dáta zadarmo, detailné analýzy/historické dáta za predplatné
  - **Newsletter:** týždenný politický prehľad (lead generation + sponzori)
  - **API access:** predaj poll dát a predikcií pre médiá/akademikov
  - **Reklama:** programmatic ads alebo priami sponzori (politicky neutrálne!)
  - **B2B:** white-label dashboardy pre médiá, think-tanky, politické strany

#### 2. Reálne dáta namiesto mockov
- **Volebný kalkulátor** (`/volebny-kalkulator`) — 20 otázok má **hardcoded party weights** (nie sú odvodené z reálnych programov)
- **Povolebné plány** (`/povolebne-plany`) — **mock dáta** pre všetkých 10 strán (nie sú reálne programové body)
- **News scraping** — dáta sa nikde neperzistujú do DB, pri každom requeste sa scrapujú nanovo
- Fix: Admin panel na správu obsahu + reálne party manifesto dáta + news caching do D1

#### 3. Admin Panel
- Žiadny spôsob ako spravovať obsah bez deploymentu
- Treba: CMS alebo admin dashboard na:
  - Správu party dát a programových bodov
  - Manuálne pridávanie poll výsledkov
  - Moderáciu crowd predictions
  - Monitoring scraper health

#### 4. SEO & Discoverability
- **Chýba `robots.txt`** — search engines nemajú guidance
- **Žiadne OG images** — social sharing vyzerá generic (žiadny preview obrázok)
- **Žiadne JSON-LD structured data** — Google nezobrazí rich snippets
- **Sitemap bez `lastmod`/`priority`** — crawlery nevedia čo je dôležité
- **Žiadne social sharing tlačidlá** na stránkach

#### 5. User Authentication & Accounts
- Len cookie-based anonymous visitor tracking
- Treba:
  - **User accounts** (email/OAuth) — personalizácia, saved preferences
  - **Email notifikácie** — "tvoja predikcia sa zmenila", weekly digest
  - **Uložené tipovanie** — história tipov naprieč zariadeniami
  - **Profil** — track record presnosti predikcií

---

### 🟡 Should-Have (bez toho to nie je profesionálny produkt)

#### 6. Analytics & Metriky
- **Žiadna analytics platforma** — nevieme koľko ľudí stránku používa
- Odporúčanie: **Umami** (GDPR-compliant, self-hosted) alebo **Plausible**
- Treba sledovať: page views, bounce rate, feature engagement, conversion funnel
- **Žiadne A/B testing** — nevieme čo funguje lepšie

#### 7. Performance Optimalizácia
- **Recharts nie je lazy-loaded** — ~200KB gzipped na každej stránke (aj keď sa nepoužíva)
- **Portraits sú raw JPG** — nie WebP/AVIF, nie optimalizované cez `next/image` všade
- **Grafy majú fixed height 400px** — nečitateľné na mobile
- **Žiadny bundle analysis** — nevieme kde sú bottlenecky
- **ISR interval 6h pre news** — novinky sú zastaralé (treba 1h)

#### 8. E2E & Integration Testy
- **33 unit testov** ale **žiadne E2E testy** (Playwright)
- **Žiadne integration testy** pre API routes
- Kritické netestované flows:
  - Homepage load → poll data rendering
  - Tipovanie: vote → duplicate detection → CSRF
  - GDPR: delete → verify removal → audit log
  - Koalícny simulátor: party selection → seat calculation

#### 9. Engagement & Retention
- **Žiadny newsletter** — najsilnejší retention nástroj pre politický obsah
- **Žiadne push notifikácie** — nové prieskumy, zmeny v predikciách
- **Žiadne social sharing** — stránky sa nedajú ľahko zdieľať
- **Tipovanie je basic** — chýba leaderboard, historické skóre, gamification
- **Žiadne komentáre/diskusia** — žiadna komunita

#### 10. Accessibility (A11y) Gaps
- **Žiadny skip-to-main link** — screen reader users musia prechádzať celý navbar
- **Žiadny focus management** na mobile drawer menu
- **Color contrast neverifikovaný** — editorial palette môže mať problémy
- **Žiadne keyboard navigation guides** v interaktívnych komponentoch
- **Chýba `lang="sk"` na `<html>` tagu** (treba overiť)

---

### 🟢 Nice-to-Have (bez toho to nie je premium produkt)

#### 11. PWA & Mobile Experience
- **Žiadny `manifest.json`** — nedá sa "pridať na plochu"
- **Žiadny service worker** — žiadny offline support
- **Žiadne native-feel** gestá (swipe medzi stránkami, pull-to-refresh)

#### 12. Infrastructure & Scale
- **Žiadny staging environment** — zmeny idú rovno na prod
- **Žiadny monitoring dashboard** — len Sentry pre errory
- **Žiadny automated backup** pre D1 databázu
- **Žiadne load testing** — nevieme koľko concurrent users zvládne
- **Žiadny scheduled data retention cleanup** — staré dáta sa nehromadia

#### 13. Advanced Features (competitors have these)
- **Historické porovnania** — "ako vyzerali prieskumy pred minulými voľbami?"
- **Regionálne dáta** — prieskumy po krajoch (ak sú dostupné)
- **Koaličný tracker** — sledovanie koaličných vyhlásení strán
- **Election countdown** — odpočet do volieb s live dátami
- **Embedding** — widgety pre médiá (iframe poll chart)
- **API dokumentácia** — verejné API pre vývojárov/novinárov
- **Multi-language** — anglická verzia pre zahraničné médiá

#### 14. Legal & Compliance Gaps
- **Žiadna cookie policy stránka** — GDPR consent banner existuje ale chýba detailná policy
- **Žiadny imprint/impressum** — kto prevádzkuje stránku (vyžadované v EU)
- **Žiadne source attribution** — odkiaľ pochádzajú dáta (Wikipedia disclaimer)
- **Žiadne content moderation policy** pre crowd predictions

#### 15. Brand & Design Polish
- **Žiadne logo** — len text "Polis" (s hover efektom πόλις)
- **Žiadny favicon set** — len basic `favicon.ico` (chýba apple-touch-icon, 192x192, 512x512)
- **Žiadne loading animations** — stránky "skočia" pri renderovaní
- **Žiadne onboarding** — nový používateľ nevie čo stránka robí

---

### Prioritná Roadmapa

```
Mesiac 1: SEO + Analytics + Reálne dáta (kalkulátor, plány)
Mesiac 2: User accounts + Newsletter + Admin panel
Mesiac 3: E2E testy + Performance optimalizácia + PWA
Mesiac 4: Monetizácia (freemium/API) + Social sharing + Engagement
Mesiac 5: Advanced features + Multi-language + Brand polish
Mesiac 6: B2B offering + Embedding widgets + Scale testing
```

### Porovnanie s konkurenciou

| Feature | Polis | FiveThirtyEight | Politico | Mandáty.sk |
|---------|:-------------------:|:---------------:|:--------:|:----------:|
| Real-time polls | ✅ | ✅ | ✅ | ✅ |
| Prediction model | ✅ Monte Carlo | ✅ Bayesian | ❌ | ❌ |
| Coalition simulator | ✅ | ❌ | ❌ | ✅ |
| Crowd predictions | ✅ basic | ✅ advanced | ❌ | ❌ |
| User accounts | ❌ | ✅ | ✅ | ❌ |
| Newsletter | ❌ | ✅ | ✅ | ❌ |
| API access | ❌ | ✅ | ✅ | ❌ |
| Mobile app/PWA | ❌ | ✅ | ✅ | ❌ |
| Analytics | ❌ | ✅ | ✅ | ❌ |
| Monetizácia | ❌ | ✅ ads+premium | ✅ subscription | ❌ |
| GDPR compliance | ✅ | ✅ | ✅ | ❌ |
| Dark mode | ✅ | ❌ | ❌ | ❌ |
| E2E testy | ❌ | ✅ | ✅ | ❌ |

**Verdict:** Technicky silný základ s unikátnymi features (Monte Carlo, D'Hondt, coalition sim). Na "milión" chýba hlavne: business model, user engagement loop, reálne dáta namiesto mockov, a profesionálna distribúcia (SEO, newsletter, social).
