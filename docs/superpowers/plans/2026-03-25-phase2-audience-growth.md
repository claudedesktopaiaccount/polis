# Phase 2: Audience Growth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Get Polis beyond its own domain — build a public API, embeddable widgets, user accounts, prediction leaderboard, PWA support, and social sharing to drive audience growth toward 10k monthly visitors and 1k registered users.

**Architecture:** Six independent work streams organized in three parallel tracks: (A) API + embeds, (B) auth + leaderboard, (C) PWA + sharing. All persist to Cloudflare D1 via Drizzle ORM.

**Tech Stack:** Next.js 16 App Router, TypeScript, Drizzle ORM + Cloudflare D1, TailwindCSS 4, Vitest 4, Recharts 3, Web Crypto API (PBKDF2)

---

## Dependency Graph

```
Task 1 (Schema) ──┬──> Task 4 (Auth) ──┬──> Task 5 (Link Tipovanie)
                   │                    ├──> Task 6 (GDPR Updates)
                   │                    └──> Task 7 (Leaderboard)
                   │
Task 2 (API) ──────┴──> Task 3 (Embeds) ──> Task 10 (Media Page)

Task 8 (PWA) ──────── (independent, parallel)
Task 9 (Sharing) ──── (independent, parallel)
```

**Parallel streams:**
- **Stream A:** Tasks 1 → 4 → 5/6/7 (schema → auth → leaderboard)
- **Stream B:** Tasks 2 → 3 → 10 (API → embeds → media page)
- **Stream C:** Tasks 8 + 9 (PWA + sharing, fully independent)

---

## File Map

**New files:**
- `src/lib/auth/password.ts` — PBKDF2 password hashing (Web Crypto API)
- `src/lib/auth/session.ts` — session create/validate/delete with D1
- `src/lib/auth/validate.ts` — email/password/name validation
- `src/lib/auth/__tests__/password.test.ts`
- `src/lib/auth/__tests__/session.test.ts`
- `src/lib/auth/__tests__/validate.test.ts`
- `src/components/AuthProvider.tsx` — client context provider + useAuth hook
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/link-predictions/route.ts`
- `src/app/prihlasenie/page.tsx` + `PrihlasenieClient.tsx` — Login
- `src/app/registracia/page.tsx` + `RegistraciaClient.tsx` — Register
- `src/app/profil/page.tsx` + `ProfilClient.tsx` — Profile
- `src/app/api/v1/polls/route.ts` — Public polls API
- `src/app/api/v1/leaderboard/route.ts` — Public leaderboard API
- `src/app/embed/layout.tsx` — Minimal layout (no chrome)
- `src/app/embed/page.tsx` — Embed documentation
- `src/app/embed/polls/page.tsx` + `EmbedPollsClient.tsx`
- `public/embed.js` — Script loader for external sites
- `src/lib/prediction/scoring.ts` — Brier-inspired scoring
- `src/lib/prediction/scoring.test.ts`
- `src/app/api/admin/score-predictions/route.ts`
- `src/app/tipovanie/rebricek/page.tsx` + `RebricekClient.tsx` — Leaderboard
- `src/components/ShareButtons.tsx`
- `src/app/prieskumy/opengraph-image.tsx`
- `src/app/tipovanie/opengraph-image.tsx`
- `public/manifest.json`
- `public/sw.js`
- `src/app/pre-media/page.tsx` — Media partnership page

**Modified files:**
- `src/lib/db/schema.ts` — add users, userSessions, predictionScores tables; add userId to userPredictions
- `src/components/ui/Navbar.tsx` — user auth state display
- `src/app/api/tipovanie/route.ts` — link to user accounts, richer predictions
- `src/app/tipovanie/TipovanieClient.tsx` — richer prediction UI, leaderboard link
- `src/app/api/gdpr/delete/route.ts` — extend to user accounts
- `src/app/api/gdpr/export/route.ts` — extend to user accounts
- `src/app/sukromie/page.tsx` — updated privacy policy
- `src/app/layout.tsx` — AuthProvider wrapper, manifest link, SW registration
- `src/app/sitemap.ts` — new routes
- `src/app/prieskumy/PrieskumyClient.tsx` — share buttons
- `src/app/predikcia/PredikciaClient.tsx` — share buttons
- `src/app/koalicny-simulator/KoalicnyClient.tsx` — share buttons

---

## Task 1: Database Schema Extension

**Dependency:** None. All auth/leaderboard tasks depend on this.

**Files:**
- Modify: `src/lib/db/schema.ts`
- Generate: `drizzle/XXXX_phase2_users.sql`

- [x] **Step 1: Add users table to schema**

In `src/lib/db/schema.ts`, append:

```typescript
// ─── Users ──────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: text("created_at").notNull(),
  emailVerifiedAt: text("email_verified_at"),
  visitorId: text("visitor_id"), // link to legacy cookie-based identity
}, (table) => [
  uniqueIndex("users_email_unique").on(table.email),
  index("users_visitor_id_idx").on(table.visitorId),
]);

// ─── User Sessions ──────────────────────────────────────

export const userSessions = sqliteTable("user_sessions", {
  id: text("id").primaryKey(), // session token (UUID)
  userId: text("user_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
}, (table) => [
  index("user_sessions_user_idx").on(table.userId),
  index("user_sessions_expires_idx").on(table.expiresAt),
]);

// ─── Prediction Scores ─────────────────────────────────

export const predictionScores = sqliteTable("prediction_scores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id),
  visitorId: text("visitor_id"),
  electionId: text("election_id").notNull(), // e.g., "sr-2027"
  winnerScore: real("winner_score"),
  percentageScore: real("percentage_score"),
  coalitionScore: real("coalition_score"),
  totalScore: real("total_score").notNull().default(0),
  scoredAt: text("scored_at").notNull(),
}, (table) => [
  index("pred_scores_user_idx").on(table.userId),
  index("pred_scores_election_idx").on(table.electionId),
  index("pred_scores_total_idx").on(table.totalScore),
]);
```

- [x] **Step 2: Add userId column to userPredictions**

In the existing `userPredictions` table definition, add:
```typescript
userId: text("user_id").references(() => users.id),
```

- [x] **Step 3: Generate migration**

```bash
npm run db:generate
```

- [x] **Step 4: Verify migration file**

- [x] **Step 5: Apply migration locally**

```bash
npm run db:migrate
```

- [x] **Step 6: Commit**

```bash
git commit -m "feat: add users, user_sessions, prediction_scores tables for Phase 2"
```

---

## Task 2: Public Polls API

**Dependency:** None (reads existing tables).

**Files:**
- Create: `src/app/api/v1/polls/route.ts`
- Create: `src/app/api/v1/polls/__tests__/route.test.ts`

- [x] **Step 1: Write failing tests**

Create `src/app/api/v1/polls/__tests__/route.test.ts`:
- Test CORS headers present on response
- Test limit parameter validation (default 10, max 50)
- Test response shape has `polls`, `parties`, `generatedAt`

- [x] **Step 2: Implement the route**

Create `src/app/api/v1/polls/route.ts`:
- `export const runtime = "edge"`
- GET handler: join `polls` + `pollResults` tables, return last N polls
- Optional `?limit=` (default 10, max 50) and `?partyId=` filter
- CORS headers: `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET`
- Cache: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=1800`
- OPTIONS handler for CORS preflight
- Response shape:
  ```json
  {
    "polls": [{ "agency": "Focus", "publishedDate": "2026-03-20", "results": { "ps": 24.8 } }],
    "parties": [{ "id": "ps", "name": "...", "abbreviation": "PS", "color": "#00BDFF" }],
    "generatedAt": "2026-03-25T12:00:00Z"
  }
  ```

- [x] **Step 3: Run tests**

- [x] **Step 4: Commit**

```bash
git commit -m "feat: public read-only polls API at /api/v1/polls with CORS"
```

---

## Task 3: Embeddable Chart Widgets

**Dependency:** Task 2 (public API).

**Files:**
- Create: `src/app/embed/layout.tsx`
- Create: `src/app/embed/page.tsx`
- Create: `src/app/embed/polls/page.tsx`
- Create: `src/app/embed/polls/EmbedPollsClient.tsx`
- Create: `public/embed.js`
- Modify: `src/app/sitemap.ts`

- [x] **Step 1: Create embed layout**

`src/app/embed/layout.tsx` — Minimal: no Navbar, Footer, or GdprBanner. Load fonts + globals.css. Add `<meta name="robots" content="noindex">`.

- [x] **Step 2: Create embed polls page**

`src/app/embed/polls/page.tsx` — Server component fetching poll data. Query params: `?theme=light|dark`, `?parties=ps,smer-sd`, `?height=400`. Bottom attribution: "Zdroj: Polis | polis.sk".

- [x] **Step 3: Create embed client component**

`src/app/embed/polls/EmbedPollsClient.tsx` — `"use client"`, dynamically imports `PollTrendChart` (same pattern as `PrieskumyClient`).

- [x] **Step 4: Create script loader**

`public/embed.js` (~2KB): reads `data-*` attributes from its own `<script>` tag, creates iframe pointing to `/embed/polls?...`.

Usage:
```html
<script src="https://polis.sk/embed.js" data-chart="polls" data-theme="light"></script>
```

- [x] **Step 5: Create embed documentation page**

`src/app/embed/page.tsx` — how-to page with code snippets for iframe and script tag, live preview.

- [x] **Step 6: Add /embed to sitemap**

- [x] **Step 7: Write tests + verify build**

- [x] **Step 8: Commit**

```bash
git commit -m "feat: embeddable poll trend chart widgets with iframe + script loader"
```

---

## Task 4: User Authentication

**Dependency:** Task 1 (schema).

**Key decision:** PBKDF2 via Web Crypto API (not bcrypt — unavailable in Cloudflare Workers). Opaque session tokens in D1 (not JWT).

**Reference:** `src/lib/admin-auth.ts` — existing HMAC-SHA256 pattern using `crypto.subtle`.

**Files:**
- Create: `src/lib/auth/password.ts`, `session.ts`, `validate.ts`
- Create: `src/lib/auth/__tests__/password.test.ts`, `session.test.ts`, `validate.test.ts`
- Create: `src/app/api/auth/register/route.ts`, `login/route.ts`, `logout/route.ts`, `me/route.ts`
- Create: `src/app/prihlasenie/page.tsx` + `PrihlasenieClient.tsx`
- Create: `src/app/registracia/page.tsx` + `RegistraciaClient.tsx`
- Create: `src/app/profil/page.tsx` + `ProfilClient.tsx`
- Create: `src/components/AuthProvider.tsx`
- Modify: `src/components/ui/Navbar.tsx`
- Modify: `src/app/layout.tsx` (wrap with AuthProvider)

### Sub-steps:

- [x] **Step 1: Write password hashing tests**

`src/lib/auth/__tests__/password.test.ts`:
- hash + verify round-trip succeeds
- wrong password fails verification
- hash format is `salt:hash` hex string

- [x] **Step 2: Implement password.ts**

`src/lib/auth/password.ts`:
- `hashPassword(password)`: PBKDF2 SHA-256, 100k iterations, 16-byte random salt, return `salt:hash` hex
- `verifyPassword(password, stored)`: split stored, re-derive, compare

- [x] **Step 3: Write validation tests**

`src/lib/auth/__tests__/validate.test.ts`:
- Email: valid/invalid cases, max 254 chars
- Password: min 8, max 128
- Display name: min 2, max 50, no HTML tags

- [x] **Step 4: Implement validate.ts**

- [x] **Step 5: Write session tests**

`src/lib/auth/__tests__/session.test.ts`:
- create → validate round-trip
- expired session returns null
- delete removes session

- [x] **Step 6: Implement session.ts**

`src/lib/auth/session.ts`:
- `createSession(userId, db)`: UUID token, store in `userSessions`, 30-day expiry
- `validateSession(token, db)`: lookup, check expiry, return userId or null
- `deleteSession(token, db)`: delete from table
- Cookie name: `polis_session`, httpOnly, secure, sameSite=lax

- [x] **Step 7: Create API routes**

Register (`/api/auth/register`): POST, CSRF validation, rate limit 5/IP/hour, hash password, insert user, create session, link pt_visitor if present.

Login (`/api/auth/login`): POST, CSRF validation, rate limit 10/IP/15min, verify password, create session.

Logout (`/api/auth/logout`): POST, delete session, clear cookie.

Me (`/api/auth/me`): GET, validate session, return user profile or 401.

- [x] **Step 8: Create auth UI pages**

Login page: `src/app/prihlasenie/page.tsx` + `PrihlasenieClient.tsx`
Register page: `src/app/registracia/page.tsx` + `RegistraciaClient.tsx`
Profile page: `src/app/profil/page.tsx` + `ProfilClient.tsx`

All follow existing server/client split pattern. Slovak UI text. Editorial design system.

- [x] **Step 9: Create AuthProvider**

`src/components/AuthProvider.tsx`: `"use client"` context, fetches `/api/auth/me` on mount, provides `useAuth()` hook with `{ user, isLoading, login, logout, register }`.

- [x] **Step 10: Update Navbar**

`src/components/ui/Navbar.tsx`: Show "Prihlásiť sa" / "Registrovať" when logged out, display name + "Odhlásiť sa" when logged in.

- [x] **Step 11: Wrap layout with AuthProvider**

`src/app/layout.tsx`: Wrap children with `<AuthProvider>`.

- [x] **Step 12: Run all tests + build**

- [x] **Step 13: Commit**

```bash
git commit -m "feat: email-based user accounts with PBKDF2 password hashing"
```

---

## Task 5: Link Tipovanie to User Accounts

**Dependency:** Task 4 (auth).

**Files:**
- Modify: `src/app/api/tipovanie/route.ts`
- Create: `src/app/api/auth/link-predictions/route.ts`
- Modify: `src/app/tipovanie/TipovanieClient.tsx`

- [x] **Step 1: Update tipovanie POST**

In `src/app/api/tipovanie/route.ts`: check for `polis_session` cookie, if valid use `userId` alongside `visitorId`. Add `userId` to insert. Duplicate check by userId too.

- [x] **Step 2: Create link-predictions endpoint**

`src/app/api/auth/link-predictions/route.ts`: POST, authenticated, claims anonymous predictions by pt_visitor → sets userId on matching rows.

- [x] **Step 3: Update TipovanieClient**

Show display name if logged in. Prompt "Prihláste sa pre uloženie tipu naprieč zariadeniami" if anonymous.

- [x] **Step 4: Commit**

```bash
git commit -m "feat: link tipovanie predictions to user accounts"
```

---

## Task 6: GDPR Updates for User Accounts

**Dependency:** Task 4 (auth).

**Files:**
- Modify: `src/app/api/gdpr/delete/route.ts`
- Modify: `src/app/api/gdpr/export/route.ts`
- Modify: `src/app/sukromie/page.tsx`
- Modify: `src/app/profil/ProfilClient.tsx`

- [x] **Step 1: Extend delete endpoint**

If logged in: also delete from `users`, `userSessions`. Update audit log. Clear `polis_session` cookie.

- [x] **Step 2: Extend export endpoint**

If logged in: include account data (email, displayName, createdAt) + all predictions linked by userId.

- [x] **Step 3: Update privacy policy**

Add sections: user account data (email, display name, password hash), data portability (Article 20), updated retention.

- [x] **Step 4: Add account management to profile page**

"Vymazať účet" + "Exportovať dáta" buttons with confirmation dialog.

- [x] **Step 5: Commit**

```bash
git commit -m "feat: extend GDPR delete/export to cover user accounts"
```

---

## Task 7: Prediction Leaderboard

**Dependency:** Tasks 1, 4, 5.

**Files:**
- Create: `src/lib/prediction/scoring.ts`
- Create: `src/lib/prediction/scoring.test.ts`
- Create: `src/app/api/admin/score-predictions/route.ts`
- Create: `src/app/api/v1/leaderboard/route.ts`
- Create: `src/app/tipovanie/rebricek/page.tsx` + `RebricekClient.tsx`
- Modify: `src/app/tipovanie/TipovanieClient.tsx` (richer prediction UI)
- Modify: `src/app/api/tipovanie/route.ts` (accept new fields)
- Modify: `src/app/tipovanie/page.tsx` (link to leaderboard)

### Scoring Algorithm:
- **Winner pick:** 100 pts if correct, 0 if wrong
- **Percentage accuracy:** per party: `max(0, 50 - (predicted - actual)²)`, sum across parties
- **Coalition prediction:** 100 pts exact match, partial credit for overlap (25 pts per correct party in coalition)
- All pure functions in `scoring.ts`

- [x] **Step 1: Write scoring tests**

`src/lib/prediction/scoring.test.ts`: perfect prediction, completely wrong, partial match, edge cases.

- [x] **Step 2: Implement scoring module**

`src/lib/prediction/scoring.ts`: `scoreWinnerPick()`, `scorePercentage()`, `scoreCoalition()`, `computeTotalScore()`.

- [x] **Step 3: Enhance tipovanie prediction form**

Update `TipovanieClient.tsx`: add percentage prediction per party (number inputs), coalition prediction (multi-select). Update API route to accept `predictedPercentages: Record<string, number>` and `coalitionPick: string[]`.

- [x] **Step 4: Create admin scoring trigger**

`src/app/api/admin/score-predictions/route.ts`: POST, admin-only, takes actual results, iterates predictions, computes scores, inserts into `predictionScores`. Batch 100 at a time.

- [x] **Step 5: Create leaderboard API**

`src/app/api/v1/leaderboard/route.ts`: GET, public, returns top 50 by `?electionId=`. CORS headers.

- [x] **Step 6: Create leaderboard page**

`src/app/tipovanie/rebricek/page.tsx` + `RebricekClient.tsx`: table with rank, displayName (or "Anonym"), totalScore, breakdown. Highlight current user. Slovak: "Rebríček predpovedí".

- [x] **Step 7: Link from tipovanie to leaderboard**

Add "Pozrite si rebríček" link.

- [x] **Step 8: Run tests + build**

- [x] **Step 9: Commit**

```bash
git commit -m "feat: prediction leaderboard with scoring algorithm"
```

---

## Task 8: PWA Support

**Dependency:** None (parallel).

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Create: `src/app/icon-192.tsx` or static PNG
- Create: `src/app/icon-512.tsx` or static PNG
- Modify: `src/app/layout.tsx`

- [x] **Step 1: Create manifest.json**

```json
{
  "name": "Polis — Slovenské prieskumy a predikcie",
  "short_name": "Polis",
  "description": "Agregátor prieskumov, predikcie volieb, koaličný simulátor a tipovanie.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F4F3EE",
  "theme_color": "#111110",
  "lang": "sk",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [x] **Step 2: Generate PWA icons**

Use existing `renderBrandIcon` pattern from `src/lib/site-config.tsx` to create 192px and 512px versions.

- [x] **Step 3: Create service worker**

`public/sw.js`: cache-first for static assets (`/_next/static/`, fonts, portraits), network-first for API routes and pages, offline fallback.

- [x] **Step 4: Add manifest + SW registration to layout**

`src/app/layout.tsx`: `<link rel="manifest" href="/manifest.json">`, `<meta name="theme-color">`, inline `<script>` for SW registration.

- [x] **Step 5: Commit**

```bash
git commit -m "feat: PWA manifest + service worker for offline support"
```

---

## Task 9: Social Sharing

**Dependency:** None (parallel).

**Files:**
- Create: `src/components/ShareButtons.tsx`
- Create: `src/components/__tests__/ShareButtons.test.tsx`
- Create: `src/app/prieskumy/opengraph-image.tsx`
- Create: `src/app/tipovanie/opengraph-image.tsx`
- Modify: `src/app/prieskumy/PrieskumyClient.tsx`
- Modify: `src/app/predikcia/PredikciaClient.tsx`
- Modify: `src/app/tipovanie/TipovanieClient.tsx`
- Modify: `src/app/koalicny-simulator/KoalicnyClient.tsx`

- [x] **Step 1: Write ShareButtons tests**

Test render, button click handlers, Web Share API usage.

- [x] **Step 2: Implement ShareButtons**

`src/components/ShareButtons.tsx`: `"use client"`, buttons for Facebook, X/Twitter, LinkedIn, Copy link, native share (Web Share API on mobile). Props: `url`, `title`, `description?`. Editorial design: hairline borders, ink-colored icons.

- [x] **Step 3: Add to key pages**

Add `<ShareButtons>` to prieskumy, predikcia, tipovanie (after voting), koalicny-simulator.

- [x] **Step 4: Create per-page OG images**

`src/app/prieskumy/opengraph-image.tsx`: dynamic OG with latest poll numbers.
`src/app/tipovanie/opengraph-image.tsx`: "Tipovanie na Polis" card.
Follow existing pattern from `src/app/opengraph-image.tsx`.

- [x] **Step 5: Commit**

```bash
git commit -m "feat: social sharing buttons + per-page OG images"
```

---

## Task 10: Media Partnership Page

**Dependency:** Task 3 (embeds).

**Files:**
- Create: `src/app/pre-media/page.tsx`
- Modify: `src/app/sitemap.ts`

- [x] **Step 1: Create media page**

`src/app/pre-media/page.tsx`: static page "Pre médiá a novinárov". Sections: embed instructions (link to `/embed`), API access description, data partnership info, contact email. Editorial design.

- [x] **Step 2: Add to sitemap**

- [x] **Step 3: Commit**

```bash
git commit -m "feat: media partnership page with embed instructions"
```

---

## Phase 2 Completion Checklist

Before declaring Phase 2 done, verify:

- [x] Public API at `/api/v1/polls` returns correct data with CORS headers
- [x] Embed page renders chart without navbar/footer
- [x] `embed.js` script creates working iframe on external page
- [x] User registration + login + logout works end-to-end
- [x] Password hashing uses PBKDF2 (not plaintext, not bcrypt)
- [x] Sessions expire after 30 days
- [x] Logged-in user's predictions linked to their account
- [x] GDPR delete removes user account + all associated data
- [x] GDPR export includes user account data
- [x] Privacy policy updated for user accounts
- [x] Scoring algorithm produces correct results for test cases
- [x] Leaderboard page shows ranked predictions
- [x] Admin can trigger scoring with actual election results
- [x] PWA manifest valid (test with Lighthouse)
- [x] Service worker caches static assets
- [x] Share buttons work on mobile (Web Share API) and desktop (URL buttons)
- [x] Per-page OG images render correctly
- [x] Media page links to embed docs
- [x] `npm run build` succeeds
- [x] `npm test` passes (all existing + new tests)
- [x] All new routes added to sitemap

---

## Key Technical Decisions

1. **PBKDF2 over bcrypt** — Cloudflare Workers doesn't support Node.js `crypto` module. `crypto.subtle.deriveBits` with PBKDF2-SHA256 and 100k iterations is secure and Workers-compatible.

2. **Opaque sessions over JWT** — Simpler, revocable, matches existing admin auth pattern. UUID tokens stored in `userSessions` table. No key management complexity.

3. **Embed isolation** — Separate `/embed/layout.tsx` with no page chrome. `noindex` meta to avoid SEO duplication. CORS on API for cross-origin data fetching.

4. **Brier-inspired scoring** — Pure functions, deterministic, testable. Winner binary (100/0), percentage inverse squared error, coalition partial credit.

5. **User ↔ visitor migration** — When a user registers while having a `pt_visitor` cookie, their `visitorId` is saved on the user record. A dedicated endpoint can retroactively link anonymous predictions.

## Notes for Implementer

- **Do NOT** create `tailwind.config.ts` — project uses TailwindCSS v4 CSS config in `globals.css`
- **Do NOT** create `middleware.ts` — project uses `src/proxy.ts` (Next.js 16)
- Use `getCloudflareContext({ async: true })` for D1 access in API routes
- All API routes: `export const runtime = "edge"`
- Reuse `isAdminAuthed` from `src/lib/admin-auth.ts` for admin-only endpoints
- All UI text in **Slovak**
- Follow editorial design tokens (newsprint colors, Newsreader/Inter fonts, 0px border-radius, no shadows)
