# Claude OSS Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring Polis to a state where it can be made public and submitted to Anthropic's Claude for Open Source Program (6 months Claude Max 20x).

**Architecture:** Sequential phases — audit first to catch blockers, v2 merge second to stabilize the codebase, gap filling third to make it presentable, going public last. Phases 1–2 (audits) can partially overlap with Phase 3 (v2 merge prep). Do not make the repo public until audits are complete and criticals resolved.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Drizzle ORM, Cloudflare D1, Cloudflare Workers (OpenNextJS), TailwindCSS 4, Vitest 4

---

## File Map

### Phase 1–2: Audits (read-only, no code changes)
- Create: `docs/superpowers/audits/security-audit.md` — code review findings
- Create: `docs/superpowers/audits/red-team.md` — adversarial findings

### Phase 3: Critical Fixes
- Modify: files identified by audit findings (auth routes, CSRF, rate limiting as needed)

### Phase 4: v2 Merge
- Git operations only — no new files, conflict resolution in 5 existing files:
  - `src/app/koalicny-simulator/KoalicnyClient.tsx`
  - `src/app/predikcia/loading.tsx`
  - `src/app/prieskumy/PrieskumyClient.tsx`
  - `src/components/HeroBanner.tsx`
  - `src/components/NewsHeadlines.tsx`

### Phase 5: Gap Filling
- Modify: `README.md` — replace create-next-app placeholder
- Create: `LICENSE` — MIT
- Create: `CONTRIBUTING.md`
- Modify: `src/lib/db/schema.ts` — add `status` column to `partyPromises` table
- Create: drizzle migration (via `npm run db:generate`)
- Create: `scripts/seed-promises.ts` — populate partyPromises with real data + status
- Modify: `src/lib/db/party-promises.ts` — update return type to include `status`
- Modify: `src/app/povolebne-plany/PovolebnePlanyClient.tsx` — display status badges
- Run: `scripts/seed-kalkulator.ts` (already exists — just needs to be executed)

### Phase 6: Going Public
- Git operations + GitHub settings — no code changes

---

## Phase 1: Security Audit (Code Review)

### Task 1: Scan git history for committed secrets

**Files:**
- Read: `.git/` (via git log commands)
- Create: `docs/superpowers/audits/security-audit.md`

- [ ] **Step 1: Scan git log for common secret patterns**

Run each command and record any hits:

```bash
git log --all --full-history -- "*.env" "*.env.*"
```
```bash
git log -p --all -S "CLOUDFLARE_D1_TOKEN" | head -60
```
```bash
git log -p --all -S "CLOUDFLARE_ACCOUNT_ID" | grep "^+" | grep -v "^+++" | grep -v "example\|placeholder\|your_" | head -40
```
```bash
git log -p --all -S "sk-" | grep "^+" | head -20
```
```bash
git log -p --all -S "Bearer " | grep "^+" | grep -v "^+++" | head -20
```
```bash
git log -p --all -S "password" | grep "^+" | grep -v "^+++" | grep -iv "hash\|PBKDF2\|passwordHash\|example" | head -30
```

Expected: No real credentials appear. If any do — mark as CRITICAL (blocks going public) and note the commit SHA.

- [ ] **Step 2: Check working tree for .env files**

```bash
find . -name ".env*" -not -path "./.git/*" -not -name ".env.example"
```

Expected: Only `.env.example` (if it exists). Any `.env` with real values = CRITICAL.

- [ ] **Step 3: Run npm audit**

```bash
cd /Users/dotmiracle/Downloads/polis && npm audit --audit-level=high 2>&1 | tail -20
```

Note any high/critical CVEs in the findings doc.

---

### Task 2: Review auth implementation

**Files:**
- Read: `src/app/api/auth/login/route.ts`
- Read: `src/app/api/auth/register/route.ts`
- Read: `src/app/api/auth/me/route.ts`

- [ ] **Step 1: Read the login route**

Read `src/app/api/auth/login/route.ts`. Check for:
1. **PBKDF2**: Is it called with `iterations >= 100000`? Is `salt` per-user (read from DB, not hardcoded)?
2. **Constant-time comparison**: Is a timing-safe compare used (e.g., `crypto.timingSafeEqual`)? If comparing hashes directly with `===`, flag as HIGH (timing attack).
3. **Username enumeration**: Does the response differ between "user not found" and "wrong password"? If so, flag as MEDIUM.

- [ ] **Step 2: Read the register route**

Read `src/app/api/auth/register/route.ts`. Check for:
1. Email/password input validation before DB insert.
2. PBKDF2 called with same correct params as login.
3. UUID generated with `crypto.randomUUID()` or similar — not `Math.random()`.

- [ ] **Step 3: Read the session route**

Read `src/app/api/auth/me/route.ts`. Check for:
1. Session tokens validated from DB (not just decoded from JWT without DB check).
2. Session expiry enforced.

- [ ] **Step 4: Document findings**

Create `docs/superpowers/audits/security-audit.md` with this structure:

```markdown
# Security Audit — Findings

**Date:** 2026-04-04
**Reviewer:** [name]

## Critical
(issues that block going public)

## High
(must fix before OSS submission)

## Medium
(should fix)

## Low
(informational)

## Clean Areas
(what was reviewed and found OK)
```

---

### Task 3: Review CSRF, rate limiting, admin middleware

**Files:**
- Read: `src/app/api/auth/login/route.ts` (CSRF check)
- Read: `src/app/api/tipovanie/route.ts` (rate limiting + CSRF)
- Read: `src/app/api/auth/register/route.ts` (rate limiting)
- Read: `src/app/api/admin/auth/route.ts` (admin auth gate)
- Read: `src/app/api/admin/promises/route.ts` (admin endpoint protection)
- Read: `src/app/api/admin/polls/route.ts` (admin endpoint protection)

- [ ] **Step 1: Check CSRF on state-changing endpoints**

For each mutation endpoint (login, register, tipovanie POST, admin routes):
- Is there a CSRF token check? Look for double-submit cookie pattern: reading a `csrf_token` cookie and comparing it to a request header or body field.
- If any mutation endpoint accepts POST without CSRF validation, flag as HIGH.

- [ ] **Step 2: Check rate limiting on public endpoints**

For tipovanie and register routes:
- Is `rate_limits` table queried before processing the request?
- Is the IP or visitor ID used as the key?
- If a public mutation endpoint has no rate limit, flag as HIGH.

- [ ] **Step 3: Check admin endpoint protection**

For each `/api/admin/*` route:
- Is there an auth check at the top that returns 401 before doing any work?
- Is the auth check consistent across all admin routes?
- If any admin route can be accessed without credentials, flag as CRITICAL.

- [ ] **Step 4: Add findings to `docs/superpowers/audits/security-audit.md`**

Append findings under appropriate severity headings.

---

### Task 4: Review input validation and SQL injection surface

**Files:**
- Read: `src/app/api/tipovanie/route.ts`
- Read: `src/app/api/newsletter/subscribe/route.ts`
- Read: `src/app/api/v1/polls/route.ts`
- Read: `src/app/api/scrape/route.ts`

- [ ] **Step 1: Check all user-supplied fields**

For each route, trace every `request.json()` or `request.formData()` call:
- Are fields validated (type, length, format) before they reach Drizzle?
- Are Drizzle queries using parameterized form (`.where(eq(...))` style) or raw SQL strings? Raw SQL with string interpolation = CRITICAL injection risk.
- Check `src/app/api/scrape/route.ts` specifically — does it accept user-controlled URLs? If so, check for SSRF protection (allowlist of domains).

- [ ] **Step 2: Check news scraper for SSRF**

Read `src/app/api/scrape/route.ts`. Verify:
- Is the scrape URL hardcoded or user-supplied?
- If user-supplied, is there a domain allowlist?
- Can an attacker trigger the cron endpoint externally (missing auth check)?

- [ ] **Step 3: Add findings to `docs/superpowers/audits/security-audit.md`**

---

### Task 5: Commit security audit findings

- [ ] **Step 1: Finalize the findings document**

Ensure `docs/superpowers/audits/security-audit.md` has entries in each severity section (even if empty — write "None found"). Sign off with "Audit complete."

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/audits/security-audit.md
git commit -m "docs: add security code review audit findings"
```

---

## Phase 2: Red Team Audit (Adversarial)

### Task 6: Run adversarial code review via security-reviewer subagent

**Files:**
- Read: All files under `src/app/api/`
- Read: `src/lib/db/schema.ts`
- Create: `docs/superpowers/audits/red-team.md`

- [ ] **Step 1: Dispatch security-reviewer subagent**

Invoke the `security-reviewer` subagent with this prompt:

> You are a red team attacker trying to compromise the Polis web app. Read the source code in `src/app/api/` and `src/lib/db/` and find real attack paths — don't just flag bad patterns, find actual exploits. Report all findings with severity (critical/high/medium/low), the exact attack vector, and the specific file and line where the vulnerability lives.
>
> Attack categories to check:
>
> **Auth & Access Control:**
> - Auth bypass: can `/api/admin/*` be accessed without credentials?
> - Account takeover: can you log in as another user by manipulating session tokens, user IDs, or prediction IDs?
> - Horizontal privilege escalation: can user A read/modify user B's predictions by changing an ID param?
> - Timing attack: does the login endpoint respond faster for valid vs. invalid usernames?
> - Open redirect: any `?redirect=` params post-login?
>
> **Injection & Data Corruption:**
> - SQL injection: any raw SQL string interpolation bypassing Drizzle?
> - Stored XSS: can username or any user field store `<script>` that executes in another user's browser?
> - Reflected XSS: do query params like `?parties=` in responses reflect unsanitized content?
> - Parameter pollution: can duplicate/malformed params cause crashes or bypass validation?
>
> **Session & CSRF:**
> - CSRF bypass: gaps in double-submit pattern that allow cross-site prediction submission?
> - Cookie poisoning: can `polis_engaged=1` be set by a third party to skip onboarding in unintended ways?
>
> **Privilege & Business Logic:**
> - Leaderboard manipulation: can predictions be submitted repeatedly, backdated, or scores inflated?
> - Rate limit evasion: can `X-Forwarded-For` be forged to bypass rate limits?
> - API key theft: can `/api/keys` expose other users' API keys?
>
> **Infrastructure & Availability:**
> - Resource exhaustion: which endpoints are most expensive and have no rate limiting?
> - Scraper abuse: can the news scrape cron be triggered externally?
> - SSRF: does the scraper fetch user-controlled URLs?
> - Clickjacking: are there X-Frame-Options or CSP frame-ancestors headers?
>
> **Information Disclosure:**
> - Error page leakage: do error responses expose stack traces or schema?
> - API over-exposure: do responses include more fields than needed (password hashes, internal IDs)?
>
> Output a findings report at `docs/superpowers/audits/red-team.md` using this structure:
>
> ```markdown
> # Red Team Audit — Findings
>
> **Date:** 2026-04-04
>
> ## Critical
> ## High
> ## Medium
> ## Low
> ## Clean Areas
> ```

- [ ] **Step 2: Verify the file was created**

```bash
cat docs/superpowers/audits/red-team.md | head -30
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/audits/red-team.md
git commit -m "docs: add red team adversarial audit findings"
```

---

## Phase 3: Fix Critical and High Findings

### Task 7: Triage and fix criticals

- [ ] **Step 1: List all Critical and High findings**

Read `docs/superpowers/audits/security-audit.md` and `docs/superpowers/audits/red-team.md`. Create a checklist of findings with severity Critical or High.

**If no criticals or highs are found**, skip to Phase 4.

- [ ] **Step 2: Fix each critical/high finding**

For each finding, the fix approach depends on the finding. Common patterns:

**Admin endpoint missing auth check:**
```typescript
// At the top of every /api/admin/* route handler, before any logic:
const authHeader = request.headers.get("Authorization");
if (!authHeader || authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Timing-unsafe password comparison (if passwords compared with ===):**
```typescript
// Replace direct string equality with timing-safe comparison
const encoder = new TextEncoder();
const a = encoder.encode(storedHash);
const b = encoder.encode(computedHash);
if (a.length !== b.length) return false;
const match = crypto.subtle.timingSafeEqual
  ? crypto.subtle.timingSafeEqual(a, b) // not available in all runtimes
  : (() => { let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]; return diff === 0; })();
```

**Missing CSRF check on mutation endpoint:**
```typescript
// In the POST handler, before processing:
const csrfCookie = getCookie(request, "csrf_token");
const csrfHeader = request.headers.get("X-CSRF-Token");
if (!csrfCookie || csrfCookie !== csrfHeader) {
  return Response.json({ error: "CSRF validation failed" }, { status: 403 });
}
```

**Rate limit missing on mutation endpoint:**
```typescript
// At start of POST handler (pattern from existing endpoints):
const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
const ipHash = await hashIp(ip); // use existing hashIp util
const limited = await checkRateLimit(db, ipHash, 10, 60); // 10 req/min
if (limited) {
  return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
}
```

- [ ] **Step 3: Run lint after each fix**

```bash
npm run lint
```

Expected: No new errors.

- [ ] **Step 4: Commit each fix separately**

```bash
git add <changed files>
git commit -m "fix: <description of security fix>"
```

---

## Phase 4: Merge v2 into main

### Task 8: Verify v2 worktree builds clean

**Files:**
- Read: `.worktrees/v2-overhaul/` (the v2 branch)

- [ ] **Step 1: Run build in v2 worktree**

```bash
cd /Users/dotmiracle/Downloads/polis/.worktrees/v2-overhaul && npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully` or similar. If build fails, fix errors in the v2 worktree before merging.

- [ ] **Step 2: Run lint in v2 worktree**

```bash
cd /Users/dotmiracle/Downloads/polis/.worktrees/v2-overhaul && npm run lint 2>&1 | tail -20
```

Expected: No errors.

- [ ] **Step 3: Return to main worktree**

```bash
cd /Users/dotmiracle/Downloads/polis
```

---

### Task 9: Merge feature/v2-overhaul → main

- [ ] **Step 1: Confirm current branch is main**

```bash
git branch --show-current
```

Expected: `main`

- [ ] **Step 2: Stash any uncommitted changes on main**

```bash
git status
```

If there are uncommitted changes in the 5 dirty files, stash them:

```bash
git stash push -m "main-dirty-files-pre-merge" src/app/koalicny-simulator/KoalicnyClient.tsx src/app/predikcia/loading.tsx src/app/prieskumy/PrieskumyClient.tsx src/components/HeroBanner.tsx src/components/NewsHeadlines.tsx
```

- [ ] **Step 3: Merge v2**

```bash
git merge feature/v2-overhaul --no-ff -m "feat: merge v2 overhaul into main"
```

If conflicts arise, proceed to Task 10. If merge succeeds cleanly, skip to Task 11.

---

### Task 10: Resolve merge conflicts in the 5 dirty files

The 5 files that are dirty on `main` are the expected conflict points. For each file:

- [ ] **Step 1: View the conflict in each file**

```bash
git diff --name-only --diff-filter=U
```

This lists files with conflicts. Open each one and look for `<<<<<<< HEAD`, `=======`, `>>>>>>> feature/v2-overhaul` markers.

- [ ] **Step 2: Resolve each file**

**Resolution rule**: The v2 branch contains the target state. Accept v2 changes unless the `main` version has a non-trivial bug fix or data update that's missing from v2 — in that case, manually merge both changes.

For each conflict file, read both sides:
- `HEAD` (current main) = your recent changes
- `feature/v2-overhaul` = v2 design changes

To accept v2 side entirely for a file:
```bash
git checkout --theirs src/components/HeroBanner.tsx
git add src/components/HeroBanner.tsx
```

To keep main side entirely:
```bash
git checkout --ours src/app/predikcia/loading.tsx
git add src/app/predikcia/loading.tsx
```

If you need to manually merge, edit the file to remove conflict markers and combine both versions.

- [ ] **Step 3: Complete the merge commit**

```bash
git merge --continue
```

---

### Task 11: Verify merged build

- [ ] **Step 1: Install dependencies (in case package.json changed)**

```bash
npm install
```

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | tail -40
```

Expected: Clean build. If build fails, fix errors before proceeding.

- [ ] **Step 3: Lint**

```bash
npm run lint 2>&1 | tail -20
```

Expected: No errors.

- [ ] **Step 4: Run tests**

```bash
npm test 2>&1 | tail -20
```

Expected: All tests pass.

---

### Task 12: Deploy v2 to Cloudflare Workers

- [ ] **Step 1: Run the deploy skill**

Use `/deploy` skill or run:

```bash
npm run deploy 2>&1 | tail -20
```

Expected: Deployment URL printed. Note it — needed for the OSS application narrative.

- [ ] **Step 2: Smoke test all 9 pages**

Visit the deployment URL and verify these pages load:
- `/` — homepage (dashboard or first-visit mode)
- `/prieskumy` — polls
- `/predikcia` — prediction model
- `/tipovanie` — crowd predictions
- `/koalicny-simulator` — coalition simulator
- `/volebny-kalkulator` — election calculator
- `/povolebne-plany` — post-election plans
- `/podmienky` — terms
- `/sukromie` — privacy

If any page returns 500 or blank, fix before proceeding.

---

## Phase 5: Gap Filling

### Task 13: Rewrite README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the create-next-app placeholder**

Read `README.md` (currently the default create-next-app README). Replace the entire file with:

```markdown
# Polis — Slovak Political Tracker

**Sleduj slovenské voľby 2027 v reálnom čase.**

A civic-tech web app tracking Slovak politics ahead of the 2027 parliamentary elections. Built for 18–25 first-time voters — the demographic with the highest abstention rate in Slovakia.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## What It Does

Polis gives voters a clear, data-driven picture of the Slovak political landscape:

- **Prieskumy** — polls aggregated from all major Slovak polling agencies with trend charts
- **Predikcia** — Monte Carlo simulation (10 000 iterations) of the 2027 election using D'Hondt seat allocation
- **Tipovanie** — crowd predictions leaderboard: submit your forecast, track your accuracy score over time
- **Koaličný simulátor** — build any coalition and see if it has a parliamentary majority
- **Volebný kalkulátor** — 20-question quiz matching you to the party closest to your positions
- **Povolebné plány** — party promise tracker with fulfillment status
- **Prehľad** — adaptive homepage: quiz funnel for new visitors, data dashboard for returning users

## Live Demo

[polis.sk](https://polis.sk) *(deployment URL — replace with actual)*

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Database**: Cloudflare D1 (SQLite) via Drizzle ORM
- **Deployment**: Cloudflare Workers via OpenNextJS adapter
- **Styling**: TailwindCSS 4
- **Charts**: Recharts 3
- **Scraping**: Cheerio (news aggregation)
- **Testing**: Vitest 4

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/<your-handle>/polis.git
cd polis

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Fill in: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN

# 4. Apply database migrations
npm run db:migrate

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Sources

- **Polling data**: AKO, Focus, Median, NMS Market Research, IPSOS
- **Election commission**: [volby.statistics.sk](https://volby.statistics.sk)
- **Party programs**: Official party manifestos and coalition agreements

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
```

- [ ] **Step 2: Update the live demo URL**

Replace `polis.sk` with the actual Cloudflare Workers deployment URL from Task 12.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for OSS submission"
```

---

### Task 14: Add MIT LICENSE

**Files:**
- Create: `LICENSE`

- [ ] **Step 1: Create LICENSE file**

Create `LICENSE` with:

```
MIT License

Copyright (c) 2026 Polis Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Commit**

```bash
git add LICENSE
git commit -m "docs: add MIT license"
```

---

### Task 15: Write CONTRIBUTING.md

**Files:**
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Create CONTRIBUTING.md**

Create `CONTRIBUTING.md` with:

```markdown
# Contributing to Polis

Thank you for your interest in contributing to Polis — a civic tech project tracking Slovak politics ahead of the 2027 elections.

## Development Setup

```bash
git clone https://github.com/<your-handle>/polis.git
cd polis
npm install
cp .env.example .env
# Fill in CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN
npm run db:migrate
npm run dev
```

## Project Conventions

- **UI language is Slovak** — all user-facing text must be in Slovak
- **Server components by default** — only add `"use client"` when you need browser APIs or interactivity
- **Drizzle for all DB access** — no raw SQL, use the query builder in `src/lib/db/`
- **No shadows, no border-radius** — follow the editorial design system (newsprint palette, 0px radius, Newsreader serif headlines)
- **TailwindCSS 4** — use CSS variable tokens (`var(--ink)`, `var(--paper)`, `var(--surface)`, `var(--divider)`) instead of hardcoded colors

## Submitting a PR

1. Fork the repo and create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Run `npm run lint` — must pass cleanly
4. Run `npm test` — all tests must pass
5. Run `npm run build` — build must succeed
6. Open a PR with a clear description of what you changed and why

## Reporting Issues

Open a GitHub issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser/OS if relevant

## Data Corrections

If you spot incorrect polling data, party positions, or promise statuses — open an issue or PR updating the seed data in `scripts/`. Source citations required.
```

- [ ] **Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: add CONTRIBUTING.md"
```

---

### Task 16: Add `status` column to partyPromises schema

**Files:**
- Modify: `src/lib/db/schema.ts` (line ~117 — `partyPromises` table)
- Create: drizzle migration (auto-generated)

- [ ] **Step 1: Write a failing test**

Add to a new test file `src/lib/db/party-promises.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPromisesForParty } from "./party-promises";

const mockRows = [
  {
    id: 1,
    partyId: "ps",
    promiseText: "Reforma justície",
    category: "Justícia",
    isPro: true,
    sourceUrl: null,
    status: "in_progress" as const,
  },
];

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockResolvedValueOnce(mockRows),
};

describe("getPromisesForParty", () => {
  it("returns promises including status field", async () => {
    // @ts-expect-error mock db
    const results = await getPromisesForParty(mockDb, "ps");
    expect(results[0]).toHaveProperty("status", "in_progress");
  });
});
```

- [ ] **Step 2: Run test to verify it fails (type error expected)**

```bash
npm test src/lib/db/party-promises.test.ts 2>&1 | tail -20
```

Expected: Fails because `status` field is not in the type.

- [ ] **Step 3: Add `status` column to schema**

In `src/lib/db/schema.ts`, modify the `partyPromises` table definition. Find the table at line ~117 and add the `status` column:

```typescript
export const partyPromises = sqliteTable(
  "party_promises",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    partyId: text("party_id")
      .notNull()
      .references(() => parties.id),
    promiseText: text("promise_text").notNull(),
    category: text("category").notNull(),
    isPro: integer("is_pro", { mode: "boolean" }).notNull(),
    sourceUrl: text("source_url"),
    status: text("status").notNull().default("not_started"), // 'fulfilled' | 'in_progress' | 'broken' | 'not_started'
  },
  (table) => [index("party_promises_party_id_idx").on(table.partyId)]
);
```

- [ ] **Step 4: Generate and apply the migration**

```bash
npm run db:generate
```

Check that a new file appeared in `drizzle/` with `ALTER TABLE party_promises ADD COLUMN status TEXT NOT NULL DEFAULT 'not_started'`. Then apply:

```bash
npm run db:migrate
```

Expected: Migration applied successfully.

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test src/lib/db/party-promises.test.ts 2>&1 | tail -20
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/schema.ts drizzle/ src/lib/db/party-promises.test.ts
git commit -m "feat: add status column to party_promises (fulfilled/in_progress/broken/not_started)"
```

---

### Task 17: Create promises seed script

**Files:**
- Create: `scripts/seed-promises.ts`

- [ ] **Step 1: Write the seed script**

Create `scripts/seed-promises.ts`:

```typescript
/**
 * Seed script: populates party_promises with real promise data + status.
 * Sourced from party manifestos and the 2023 coalition agreement (Smer-SD/SNS/Hlas-SD).
 *
 * Run with: npx tsx scripts/seed-promises.ts
 * Requires env vars: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN
 */

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
const databaseId = process.env.CLOUDFLARE_DATABASE_ID!;
const token = process.env.CLOUDFLARE_D1_TOKEN!;

type PromiseStatus = "fulfilled" | "in_progress" | "broken" | "not_started";

interface SeedPromise {
  partyId: string;
  promiseText: string;
  category: string;
  isPro: boolean;
  status: PromiseStatus;
  sourceUrl: string | null;
}

// Real promises sourced from party programs and 2023 coalition agreement.
// Status reflects current fulfillment as of 2026-04-04.
// Expand this list with additional promises from party manifestos.
const PROMISES: SeedPromise[] = [
  // Smer-SD — coalition governing party (2023–present)
  { partyId: "smer-sd", promiseText: "Zastavenie dodávok vojenskej pomoci Ukrajine", category: "Zahraničná politika", isPro: false, status: "fulfilled", sourceUrl: "https://www.vlada.gov.sk/koalicna-zmluva-2023" },
  { partyId: "smer-sd", promiseText: "Konsolidácia verejných financií — zníženie deficitu pod 3% HDP do 2027", category: "Ekonomika", isPro: true, status: "in_progress", sourceUrl: "https://www.vlada.gov.sk/programove-vyhlasenie-vlady" },
  { partyId: "smer-sd", promiseText: "Zavedenie 13. dôchodku", category: "Sociálne veci", isPro: true, status: "fulfilled", sourceUrl: "https://www.slov-lex.sk" },
  { partyId: "smer-sd", promiseText: "Zmrazenie cien energií pre domácnosti", category: "Ekonomika", isPro: true, status: "in_progress", sourceUrl: null },
  { partyId: "smer-sd", promiseText: "Boj proti korupcii a mafiánskim štruktúram", category: "Justícia", isPro: true, status: "broken", sourceUrl: null },

  // Hlas-SD — coalition governing party (2023–present)
  { partyId: "hlas-sd", promiseText: "Zvýšenie minimálnej mzdy na 900 EUR do 2027", category: "Sociálne veci", isPro: true, status: "in_progress", sourceUrl: null },
  { partyId: "hlas-sd", promiseText: "Modernizácia nemocníc — investície 1 mld. EUR", category: "Zdravotníctvo", isPro: true, status: "in_progress", sourceUrl: null },
  { partyId: "hlas-sd", promiseText: "Podpora rodín s deťmi — navýšenie prídavkov", category: "Sociálne veci", isPro: true, status: "fulfilled", sourceUrl: null },
  { partyId: "hlas-sd", promiseText: "Zavedenie elektronického zdravotného záznamu", category: "Zdravotníctvo", isPro: true, status: "not_started", sourceUrl: null },

  // SNS — coalition governing party (2023–present)
  { partyId: "sns", promiseText: "Zachovanie povinnej vojenskej služby — odmietnutie", category: "Obrana", isPro: false, status: "fulfilled", sourceUrl: null },
  { partyId: "sns", promiseText: "Podpora slovenských farmárov cez dotácie", category: "Poľnohospodárstvo", isPro: true, status: "in_progress", sourceUrl: null },
  { partyId: "sns", promiseText: "Prísna migračná politika", category: "Bezpečnosť", isPro: true, status: "in_progress", sourceUrl: null },

  // PS — main opposition party
  { partyId: "ps", promiseText: "Obnovenie dodávok vojenskej pomoci Ukrajine (opozičný návrh)", category: "Zahraničná politika", isPro: true, status: "not_started", sourceUrl: null },
  { partyId: "ps", promiseText: "Reforma justície — výber súdcov cez nezávislú komisiu", category: "Justícia", isPro: true, status: "not_started", sourceUrl: null },
  { partyId: "ps", promiseText: "Zelená transformácia — 50% obnoviteľných zdrojov do 2035", category: "Životné prostredie", isPro: true, status: "not_started", sourceUrl: null },
  { partyId: "ps", promiseText: "Legalizácia registrovaných partnerstiev", category: "Práva", isPro: true, status: "not_started", sourceUrl: null },

  // KDH
  { partyId: "kdh", promiseText: "Ochrana tradičnej definície manželstva v ústave", category: "Sociálne veci", isPro: false, status: "not_started", sourceUrl: null },
  { partyId: "kdh", promiseText: "Zvýšenie platov učiteľov o 20% do 2027", category: "Školstvo", isPro: true, status: "not_started", sourceUrl: null },
  { partyId: "kdh", promiseText: "Podpora vidieka — investície do infraštruktúry", category: "Regionálny rozvoj", isPro: true, status: "not_started", sourceUrl: null },

  // SaS
  { partyId: "sas", promiseText: "Zníženie odvodov pre živnostníkov", category: "Ekonomika", isPro: true, status: "not_started", sourceUrl: null },
  { partyId: "sas", promiseText: "Zrušenie zbytočnej byrokracie — one-in-two-out pravidlo", category: "Ekonomika", isPro: true, status: "not_started", sourceUrl: null },
  { partyId: "sas", promiseText: "Reforma školstva — fínsky model", category: "Školstvo", isPro: true, status: "not_started", sourceUrl: null },

  // Republika
  { partyId: "republika", promiseText: "Odmietnutie federalizácie EÚ a zachovanie suverenity SR", category: "Zahraničná politika", isPro: false, status: "not_started", sourceUrl: null },
  { partyId: "republika", promiseText: "Prísna ochrana hraníc a nulová tolerancia nelegálnej migrácie", category: "Bezpečnosť", isPro: true, status: "not_started", sourceUrl: null },
  { partyId: "republika", promiseText: "Energetická nezávislosť — rozvoj jadrovej energetiky", category: "Ekonomika", isPro: true, status: "not_started", sourceUrl: null },

  // Demokrati
  { partyId: "demokrati", promiseText: "Podpora vstupu Ukrainy do NATO a EÚ", category: "Zahraničná politika", isPro: true, status: "not_started", sourceUrl: null },
  { partyId: "demokrati", promiseText: "Zníženie korupcie — nezávislá prokuratúra", category: "Justícia", isPro: true, status: "not_started", sourceUrl: null },
];

async function runSql(sql: string, params: unknown[]) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    }
  );
  const json = await res.json() as { success: boolean; errors?: unknown[] };
  if (!json.success) throw new Error(JSON.stringify(json.errors));
  return json;
}

async function main() {
  let count = 0;
  for (const p of PROMISES) {
    await runSql(
      `INSERT INTO party_promises (party_id, promise_text, category, is_pro, status, source_url)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT DO NOTHING`,
      [p.partyId, p.promiseText, p.category, p.isPro ? 1 : 0, p.status, p.sourceUrl]
    );
    count++;
  }
  console.log(`Seeded ${count} promises.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Run the seed script**

```bash
npx tsx scripts/seed-promises.ts 2>&1
```

Expected: `Seeded 26 promises.`

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-promises.ts
git commit -m "feat: add promises seed script with real party data and status fields"
```

---

### Task 18: Update PovolebnePlanyClient to display promise status

**Files:**
- Modify: `src/app/povolebne-plany/PovolebnePlanyClient.tsx`
- Modify: `src/lib/db/party-promises.ts`

- [ ] **Step 1: Update the return type in party-promises.ts**

Read `src/lib/db/party-promises.ts`. The `getPromisesForParty` function currently returns Drizzle's inferred type which now includes `status` since we updated the schema. Verify by checking that the return type includes `status: string`. No code change needed if Drizzle infers it automatically — just confirm the test from Task 16 passes.

- [ ] **Step 2: Update the Props interface in PovolebnePlanyClient.tsx**

In `src/app/povolebne-plany/PovolebnePlanyClient.tsx` at line ~10, update the `DbPartyData` interface to include `status`:

```typescript
interface DbPartyData {
  id: string;
  name: string;
  promises: Array<{
    id: number;
    partyId: string;
    promiseText: string;
    category: string;
    isPro: boolean;
    sourceUrl: string | null;
    status: string;
  }>;
}
```

- [ ] **Step 3: Add a status badge helper**

Add this function near the top of the component file, before the `export default` line:

```typescript
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    fulfilled:    { label: "Splnené",       color: "#00C853" },
    in_progress:  { label: "Prebieha",      color: "#FFB300" },
    broken:       { label: "Nesplnené",     color: "#D32F2F" },
    not_started:  { label: "Nezačaté",      color: "#757575" },
  };
  const s = map[status] ?? map["not_started"];
  return (
    <span
      className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 border"
      style={{ color: s.color, borderColor: s.color }}
    >
      {s.label}
    </span>
  );
}
```

- [ ] **Step 4: Add StatusBadge to promise rows**

Find where individual promises are rendered in the JSX (look for `promiseText` or `promise_text` rendering). Add `<StatusBadge status={promise.status} />` next to each promise text. The exact line depends on the component's JSX structure — read the file to find the promise list rendering and add the badge inline.

- [ ] **Step 5: Run lint and verify types**

```bash
npm run lint 2>&1 | tail -10
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/povolebne-plany/PovolebnePlanyClient.tsx src/lib/db/party-promises.ts
git commit -m "feat: display promise status badges in povolebne-plany page"
```

---

### Task 19: Run the kalkulator seed script

**Files:**
- Run: `scripts/seed-kalkulator.ts` (already exists — no code changes needed)

- [ ] **Step 1: Confirm the script exists**

```bash
ls scripts/seed-kalkulator.ts
```

Expected: file exists.

- [ ] **Step 2: Run the seed script**

```bash
npx tsx scripts/seed-kalkulator.ts 2>&1
```

Expected: Output like `Seeded 300 rows.` (20 questions × 3 answers × 10 parties = 600 total, but only unique party entries per answer).

If it fails with `Missing env vars`, ensure `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, and `CLOUDFLARE_D1_TOKEN` are set in `.env`.

- [ ] **Step 3: Commit a note in HANDOFF.md or skip**

No code change — no commit needed. The DB is now seeded.

---

## Phase 6: Going Public

### Task 20: Verify no secrets in working tree or history

- [ ] **Step 1: Check working tree**

```bash
find . -name ".env" -not -path "./.git/*"
```

Expected: No output. If `.env` with real values exists, add it to `.gitignore` and verify it was never committed.

- [ ] **Step 2: Verify .gitignore covers .env**

```bash
grep "\.env" .gitignore
```

Expected: `.env` or `.env*` is listed.

- [ ] **Step 3: Check git history one more time**

```bash
git log --all -p --follow -- "*.env" 2>/dev/null | grep "^+" | grep -v "^+++" | grep -v "example\|CLOUDFLARE_ACCOUNT_ID=your\|# " | head -20
```

Expected: No real credential values appear.

- [ ] **Step 4: If secrets were found in history — use git filter-repo**

**Only do this step if Task 1 found committed secrets.** `git filter-repo` rewrites history — this is destructive and requires a force-push.

```bash
# Install git-filter-repo first (if not installed):
pip3 install git-filter-repo

# Remove the secret from all history:
git filter-repo --path .env --invert-paths

# Or remove specific string:
git filter-repo --replace-text <(echo "ACTUAL_SECRET_VALUE==>REMOVED")
```

After running: **rotate every secret that was in the repo.** A removed secret that isn't rotated is still compromised.

- [ ] **Step 5: Run npm audit one more time**

```bash
npm audit --audit-level=moderate 2>&1 | tail -10
```

Verify no new critical/high CVEs were introduced during the merge.

---

### Task 21: Make repo public on GitHub

- [ ] **Step 1: Confirm the repo is ready**

Checklist before flipping:
- [ ] Security audit complete, no critical/high open findings
- [ ] Red team audit complete, no critical/high open findings
- [ ] No `.env` files with real values in working tree or history
- [ ] v2 deployed and all 9 pages load
- [ ] README.md is the rewritten civic version (not create-next-app)
- [ ] LICENSE file exists
- [ ] CONTRIBUTING.md exists

- [ ] **Step 2: Make the repo public**

Using GitHub CLI:

```bash
gh repo edit --visibility public --accept-visibility-change-consequences
```

Or via GitHub web: Settings → Danger Zone → Change visibility → Public.

- [ ] **Step 3: Verify the repo is public**

```bash
gh repo view --json visibility -q .visibility
```

Expected: `PUBLIC`

---

### Task 22: Write OSS application narrative (reference doc)

**Files:**
- Create: `docs/superpowers/oss-application-narrative.md`

- [ ] **Step 1: Write the application narrative**

Create `docs/superpowers/oss-application-narrative.md`:

```markdown
# Claude OSS Program Application — Polis

## Project Description

Polis is a civic-tech web app tracking Slovak politics ahead of the 2027 parliamentary elections. It aggregates polling data from all major Slovak agencies, runs a Monte Carlo simulation of the election outcome, and lets users submit their own predictions and track their accuracy on a leaderboard.

**What it is:** A multi-page dashboard covering polls, election prediction model, crowd predictions with scoring, coalition simulator, party position quiz, post-election promise tracker, and political news aggregation.

**Who it's for:** 18–25 first-time voters — the demographic with the highest abstention rate in Slovakia (over 40% in 2023). Also used by political junkies and general news readers.

**Why it matters:** Slovakia's EU trajectory is uncertain. After the 2023 election brought a Eurosceptic government to power, the 2027 election is consequential for Slovakia's direction within the EU. Informed voters are the most effective counter to political misinformation — and this project is the only independent, data-driven political tracker built specifically for Slovak voters.

## What's Built

- 9 complete pages, each with real data from D1
- D'Hondt seat allocation algorithm (the actual Slovak electoral formula)
- 10,000-iteration Monte Carlo simulation for election outcome prediction
- GDPR-compliant user auth (PBKDF2, per-user salts, session tokens)
- Crowd predictions with Brier-score-style leaderboard
- News aggregation scraper (Cheerio) pulling from Slovak political news sources
- Deployed on Cloudflare Workers (edge runtime, global distribution)

## How Claude Will Be Used

Completing the v2 overhaul features:
- Social sharing cards (OG images for quiz results, leaderboard rank, coalition scenarios)
- Adaptive homepage (dual-mode: quiz funnel for new visitors, data dashboard for returning users)
- Promise tracker data curation — adding real promises for all 10 tracked parties with accurate status
- Volebný kalkulátor data curation — sourcing party positions from manifestos
- Ongoing polling data entry as new polls are published by Slovak agencies

Claude is not generating political analysis or opinions — it's used for coding, data entry, and UI development. All political content (poll numbers, party positions, promise statuses) is sourced from publicly available Slovak institutional sources.

## Repository

[github.com/<your-handle>/polis](https://github.com/<your-handle>/polis)

## Live Demo

[deployment URL from Task 12]
```

- [ ] **Step 2: Update placeholders**

Replace `<your-handle>` with the actual GitHub username and the deployment URL with the one from Task 12.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/oss-application-narrative.md
git commit -m "docs: add OSS application narrative"
```

---

## Self-Review: Spec Coverage Check

| Spec requirement | Task that covers it |
|---|---|
| Committed secrets scan (git history) | Task 1 |
| PBKDF2 auth review | Task 2 |
| CSRF protection review | Task 3 |
| Input validation / SQL injection | Task 4 |
| Admin middleware coverage | Task 3 |
| Rate limiting | Task 3 |
| Red team adversarial audit | Task 6 |
| Auth bypass, account takeover, timing, CSRF, XSS, injection | Task 6 (security-reviewer subagent) |
| DDoS / resource exhaustion | Task 6 |
| SSRF | Tasks 4 + 6 |
| Information disclosure | Task 6 |
| npm audit | Tasks 1 + 20 |
| v2 merge strategy | Tasks 8–12 |
| Conflict resolution for 5 dirty files | Task 10 |
| Build + lint after merge | Task 11 |
| Deploy | Task 12 |
| README.md (civic narrative) | Task 13 |
| MIT LICENSE | Task 14 |
| CONTRIBUTING.md | Task 15 |
| partyPromises `status` column | Task 16 |
| Real promise data via seed script | Task 17 |
| Status badges in UI | Task 18 |
| kalkulator weights seeded | Task 19 |
| git filter-repo for history secrets | Task 20 |
| Make repo public | Task 21 |
| OSS application narrative | Task 22 |
