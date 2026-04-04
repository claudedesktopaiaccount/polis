# Security Audit — Findings

**Date:** 2026-04-04
**Reviewer:** Claude security-reviewer subagent (code review pass)

## Critical

None found in this pass.

## High

### H1 — Real credentials present in working tree `.env` file

- **File:** `.env` (not committed, correctly gitignored)
- **What:** `.env` contains a live `CLOUDFLARE_D1_TOKEN` (`cfut_GErvv2lxhPMbJr78KFYh0nP9qIVNt9i0jAYtAZxKe77f787a`), `CLOUDFLARE_ACCOUNT_ID` (`96b9ed9fcd23630dabe9cd0dd16fdc8c`), and `CLOUDFLARE_DATABASE_ID`.
- **Risk:** If the repo is made public while `.env` exists in the working tree _and_ `.gitignore` is bypassed (e.g., `git add -f .env` or IDE accident), live credentials would be exposed instantly.
- **Git history verdict:** CLEAN — the file was never committed; `git ls-files .env` and `git log --all -- .env` both return empty. The credential values themselves do not appear in any commit.
- **Action required before going public:** Rotate the `CLOUDFLARE_D1_TOKEN` as a precaution (it exists in plaintext on disk), confirm `.env` remains untracked (`git status`), and add a pre-commit hook or CI check (e.g., `gitleaks` or `truffleHog`) to block future accidental commits of secrets.

### H2 — npm audit: 8 high-severity CVEs in `undici` via `wrangler`/`miniflare`

- **Packages affected:** `undici` 7.0.0–7.23.0 → `miniflare` 4.20250906.1–4.20260312.1 → `wrangler` ≤4.74.0
- **CVEs:**
  - GHSA-f269-vfmq-vjvj — Malicious WebSocket 64-bit length overflows parser (crash/DoS)
  - GHSA-2mjp-6q6p-2qxm — HTTP Request/Response Smuggling
  - GHSA-vrm6-8vpv-qv8q — Unbounded memory in WebSocket permessage-deflate decompression (DoS)
  - GHSA-v9p9-hfj2-hcw8 — Unhandled exception in WebSocket client (DoS)
  - GHSA-4992-7rv2-5pvq — CRLF Injection via `upgrade` option
  - GHSA-phc3-fgpg-7m6h — Unbounded memory in DeduplicationHandler (DoS)
  - (2 additional high-severity undici advisories)
- **Context:** `wrangler` is a dev/build-only dependency — these CVEs are not reachable at runtime in the deployed Workers environment. However, they affect the local dev server and CI pipeline.
- **Fix:** `npm audit fix` resolves these without breaking changes (per audit output).

## Medium

### M1 — npm audit: 7 moderate-severity CVEs in `yaml`

- **Package:** `yaml` 2.0.0–2.8.2
- **CVE:** GHSA-48c2-rrv3-qjmp — Stack overflow via deeply nested YAML collections
- **Context:** Dev-time tooling dependency. Not reachable via user input in production.
- **Fix:** `npm audit fix` resolves without breaking changes.

## Low

### L1 — No `.env.example` value masking enforcement

- `.env.example` exists and masks values with placeholders (`your_token_here` style). This is correct. However, there is no automated check that prevents a developer from accidentally copying a real value into `.env.example` when updating it.
- **Action:** Low risk; note for contributor guidelines.

## Clean Areas

| Area | Status |
|---|---|
| `.env` in git history | CLEAN — never committed |
| `CLOUDFLARE_D1_TOKEN` in git history | CLEAN — not found in any commit |
| `CLOUDFLARE_ACCOUNT_ID` in git history (non-example values) | CLEAN — only found in plan docs (no real value) |
| OpenAI / `sk-*` API keys in git history | CLEAN — no hits |
| `Bearer ` tokens in git history | CLEAN — only hits were in plan/docs markdown (no real tokens) |
| Plaintext `password` literals in git history (non-hash contexts) | CLEAN — no hits outside hash/PBKDF2 contexts |
| `.gitignore` coverage of `.env*` | CLEAN — `.env*` is ignored, `.env.example` explicitly exempted |

---

*Git history scan, .env check, and npm audit complete. Auth/CSRF/input validation review to follow in Tasks 2–4.*

---

## Task 2 — Auth Implementation Review

**Date:** 2026-04-04
**Files reviewed:**
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/lib/auth/password.ts`
- `src/lib/auth/session.ts`

### Findings

#### Medium

### [Medium] A1: CSRF double-submit comparison uses `===` (non-constant-time string compare)

**File:** `src/app/api/auth/login/route.ts:20`, `src/app/api/auth/register/route.ts:21`
**Finding:** The CSRF token comparison `csrfCookie !== csrfHeader` uses JavaScript's built-in `!==` operator, which is not a constant-time comparison. In theory, a timing oracle could be used to brute-force a valid CSRF token character-by-character. The practical exploitability is very low given CSRF tokens are typically long random values and network jitter dominates timing, but it is a deviation from best practice.
**Fix:** Use a constant-time comparison for the CSRF check (e.g., implement a `timingSafeEqual`-style loop over the two strings, similar to the approach already used in `verifyPassword`).

### [Medium] A2: Session token is a bare `crypto.randomUUID()` (122 bits of entropy, stored as plain UUID in DB)

**File:** `src/lib/auth/session.ts:12`
**Finding:** Session tokens are `crypto.randomUUID()` values (Version 4 UUID, ~122 bits of entropy). The token is stored directly as the primary key in `userSessions` and sent to the client as a cookie value. While 122 bits is adequate entropy, UUIDs have a well-known format (`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`) that slightly reduces the search space and is recognisable in logs. More importantly, if the `userSessions` table is ever read by an attacker (e.g., via a SQL injection elsewhere), all session tokens are immediately usable with no additional hashing layer.
**Fix:** Store a SHA-256 hash of the session token in the DB and compare hashes on lookup, sending the raw token only to the client. This is the same defence-in-depth pattern used for password hashes.

#### Clean Areas (Auth)

| Check | Status |
|---|---|
| PBKDF2 iterations | CLEAN — `ITERATIONS = 100_000` (meets OWASP minimum) |
| PBKDF2 salt | CLEAN — per-user random 128-bit salt via `crypto.getRandomValues` |
| Password comparison timing safety | CLEAN — manual XOR loop (constant-time), not `===` or `crypto.timingSafeEqual` |
| Username enumeration via distinct error messages | CLEAN — both "user not found" and "wrong password" return identical `401` with same message |
| Dummy password hash run on missing user (timing equalisation) | CLEAN — `verifyPassword` is called even when user doesn't exist |
| UUID generated with `crypto.randomUUID()` | CLEAN — not `Math.random()` |
| Input validation before DB insert (register) | CLEAN — `validateEmail`, `validatePassword`, `validateDisplayName` called before any DB access |
| Session validated against DB (not just decoded) | CLEAN — `validateSession` queries `userSessions` table and checks `expiresAt` |
| Session expiry enforced | CLEAN — server-side expiry check with automatic deletion of stale session row |
| Session cookie flags | CLEAN — `httpOnly: true`, `secure: true`, `sameSite: "lax"` |
| Rate limiting on login | CLEAN — 10 attempts / 15 min per IP |
| Rate limiting on register | CLEAN — 5 attempts / 1 hr per IP |

*Auth review complete. CSRF, rate limiting, and input validation review continues in Task 3.*

---

## Task 3: CSRF / Rate Limiting / Admin Auth

**Date:** 2026-04-04
**Files reviewed:**
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/tipovanie/route.ts`
- `src/app/api/admin/auth/route.ts`
- `src/app/api/admin/promises/route.ts`
- `src/app/api/admin/polls/route.ts`
- `src/app/api/admin/score-predictions/route.ts`
- `src/lib/admin-auth.ts`

---

### Findings

#### [Medium] T1: Rate limiting on `/api/tipovanie` inserts before checking — small write amplification window

**File:** `src/app/api/tipovanie/route.ts:25–36`
**Finding:** The `isRateLimited()` function always inserts a row into `rate_limits` *before* checking the count. This means an attacker sending 1,000 concurrent requests will cause 1,000 DB inserts before any requests are blocked. Under normal load this is fine; under a coordinated burst it creates unnecessary DB write pressure. The same pattern exists in login/register (lines 45 and 61 respectively), but tipovanie is the highest-traffic public endpoint.
**Fix:** Consider checking the count first, then inserting only if below the limit. Alternatively, accept the pattern as-is (it does prevent race-condition bypasses) but add Cloudflare WAF rate-limiting rules as a first-line defence to cap raw request volume before it reaches the Worker.

#### [Low] T2: Admin login endpoint (`/api/admin/auth`) has no rate limiting

**File:** `src/app/api/admin/auth/route.ts:5–38`
**Finding:** The admin login route accepts unlimited POST attempts with no rate limiting on IP or any other identifier. An attacker who knows (or guesses) the endpoint URL can brute-force `ADMIN_SECRET` without restriction at the application layer.
**Fix:** Add D1-based rate limiting (e.g., 5 attempts per IP per 15 minutes) consistent with the pattern used in `/api/auth/login`. Also consider adding CSRF protection to this endpoint — it currently accepts requests without any CSRF check, though the `sameSite: "strict"` session cookie mitigates cross-site request forgery for state changes requiring the existing session.

#### [Low] T3: Admin session token stored stateless — no server-side revocation possible

**File:** `src/lib/admin-auth.ts`, `src/app/api/admin/auth/route.ts:12–36`
**Finding:** The admin session is verified purely by HMAC signature of a random UUID against `ADMIN_SECRET`. There is no DB record of active sessions. Once an `admin_session` + `admin_sig` cookie pair is issued, it cannot be revoked server-side for the full 8-hour `maxAge` window without rotating `ADMIN_SECRET` (which would invalidate all current admin sessions globally). If the cookies are stolen (e.g., via XSS in the admin UI), the attacker has 8 hours of unrevocable access.
**Fix:** Store session tokens in a DB table (e.g., reuse the `userSessions` table with an `isAdmin` flag, or a separate `admin_sessions` table) so individual sessions can be invalidated. Alternatively, accept the current design explicitly and document the 8-hour window as a known limitation.

---

### Clean Areas (Task 3)

| Area | Status |
|---|---|
| CSRF on `/api/auth/login` (POST) | CLEAN — double-submit cookie (`pt_csrf` cookie vs `x-csrf-token` header) enforced before DB access |
| CSRF on `/api/auth/register` (POST) | CLEAN — same double-submit pattern, enforced as first check |
| CSRF on `/api/tipovanie` (POST) | CLEAN — double-submit cookie enforced at line 51 before any DB access |
| Rate limiting on `/api/auth/login` | CLEAN — 10 attempts / 15 min per hashed IP via `rate_limits` table |
| Rate limiting on `/api/auth/register` | CLEAN — 5 attempts / 1 hr per hashed IP via `rate_limits` table |
| Rate limiting on `/api/tipovanie` | CLEAN — 10 requests / 60 s per hashed IP via `rate_limits` table |
| Admin auth on `/api/admin/promises` (GET, POST, DELETE) | CLEAN — `isAdminAuthed()` called as first statement in every handler |
| Admin auth on `/api/admin/polls` (POST) | CLEAN — `isAdminAuthed()` called before any body parsing or DB access |
| Admin auth on `/api/admin/score-predictions` (POST) | CLEAN — `isAdminAuthed()` called as first check |
| HMAC verification in `isAdminAuthed` | CLEAN — uses `crypto.subtle.verify` (constant-time HMAC comparison), not string equality |
| Admin session cookie flags | CLEAN — `httpOnly: true`, `secure: true` (in production), `sameSite: "strict"`, 8 h `maxAge` |
| Raw `ADMIN_SECRET` stored in cookie | CLEAN — only an opaque UUID token is stored; `ADMIN_SECRET` is used only for HMAC signing/verification and never leaves the server |
| Tipovanie duplicate vote protection | CLEAN — UNIQUE DB constraint + pre-check via `or()` across visitorId, fingerprint, userId |
| Tipovanie input validation (party ID, fingerprint, percentages, coalition) | CLEAN — all fields validated against allowlist before DB writes |

---

## Task 4: Input Validation / SQL Injection / SSRF

**Date:** 2026-04-04
**Files reviewed:**
- `src/app/api/tipovanie/route.ts`
- `src/app/api/newsletter/subscribe/route.ts`
- `src/app/api/v1/polls/route.ts`
- `src/app/api/cron/newsletter/route.ts`
- `src/app/api/cron/notifications/route.ts`
- `src/app/api/scrape/route.ts`
- `src/lib/scraper/wikipedia.ts`
- `src/lib/scraper/news.ts`
- `src/lib/db/newsletter.ts`
- `src/components/NewsHeadlines.tsx`

---

### Findings

### [Medium] IV1: `/api/scrape` has no authentication — open to unauthenticated triggering

**File:** `src/app/api/scrape/route.ts:11–33`
**Finding:** The `GET /api/scrape` endpoint invokes the full Wikipedia scraper with no authentication check, no CSRF requirement, and no rate limiting. Any external party can hit this URL repeatedly to force excessive outbound fetches to Wikipedia, driving up egress, burning Worker CPU time, and potentially triggering Wikipedia's rate limits or IP bans for the `polis.sk` Worker IP. The comment acknowledges it is a "test endpoint" but it is deployed to production with no guard.
**Fix:** Add `x-cron-secret` header verification identical to `/api/cron/newsletter` and `/api/cron/notifications`, or remove the endpoint entirely if it is not needed outside of Wrangler cron scheduling.

### [Low] IV2: `newsletter/subscribe` — `source` field stored without length or allowlist validation

**File:** `src/app/api/newsletter/subscribe/route.ts:29`, `src/lib/db/newsletter.ts:23`
**Finding:** The `source` field from the request body is passed directly to `subscribeEmail()` and inserted into the `newsletter_subscribers` table with no validation. An attacker can store an arbitrarily long string (or a crafted value) in the `source` column. While this column is not rendered back to users in the UI, a future admin dashboard or CSV export could reflect it. The email is validated; `source` is not.
**Fix:** Restrict `source` to an allowlist (e.g., `["web", "footer", "modal", "api"]`) or at minimum enforce `typeof source === "string" && source.length <= 32` before passing it to the DB layer.

### [Low] IV3: `cron/notifications` — scraped `poll.agency` interpolated directly into HTML email body

**File:** `src/app/api/cron/notifications/route.ts:68`
**Finding:** The notification email HTML is built via template literal string interpolation with `poll.agency`. The `agency` value originates from the Wikipedia scraper (`src/lib/scraper/wikipedia.ts:270–273`), which strips `[...]` and `(...)` annotations but does not HTML-escape the result. If a Wikipedia editor changes an agency name to include raw HTML tags, the unescaped string would appear in the outbound email body. Email clients generally do not execute script tags, making this a cosmetic/layout risk rather than a code-execution risk, but it violates safe output encoding practice.
**Fix:** HTML-escape dynamic values before inserting them into email HTML templates (replace `<`, `>`, `&`, `"` with their HTML entities), or use a templating helper that auto-escapes all interpolated values.

---

### Clean Areas (Task 4)

| Area | Status |
|---|---|
| SQL injection surface — all queried routes | CLEAN — 100% Drizzle ORM parameterized queries; no raw SQL string interpolation found in any route |
| `sql` tagged template literals | CLEAN — only usage is `sql\`${crowdAggregates.totalBets} + 1\`` (Drizzle column reference, not user input) |
| SSRF — scraper URLs | CLEAN — all scrape targets hardcoded (`wikipedia.org`, `aktuality.sk`, `dennikn.sk`, `domov.sme.sk`); no user-supplied URLs |
| SSRF — Wikipedia scraper auth | CLEAN — URL is a module-level constant; not configurable at runtime |
| Stored XSS — `NewsHeadlines.tsx` rendering | CLEAN — `item.title` and `item.url` rendered via React JSX text nodes and `href` attribute; React auto-escapes text content; no raw HTML injection used |
| Input validation — `/api/tipovanie` POST | CLEAN — `selectedWinner` validated against `VALID_PARTY_IDS` Set; `fingerprint` length-checked (<=128); `predictedPercentages` range-checked (0–100) per party; `coalitionPick` allowlist-checked |
| Input validation — `/api/v1/polls` GET | CLEAN — `limit` clamped (1–50) with `isNaN` guard; `partyId` filter applied in-memory against DB rows (not in WHERE clause), no injection vector |
| Cron endpoints auth | CLEAN — both `/api/cron/newsletter` and `/api/cron/notifications` verify `x-cron-secret` header before any DB access |
| Newsletter email validation | CLEAN — regex enforced before DB insert; email lowercased and trimmed |
| API key lookup (`/api/v1/polls`) | CLEAN — `lookupApiKey` uses Drizzle `eq()` parameterized lookup; raw key never interpolated into SQL |

---
*Audit complete — Tasks 1–4 reviewed. No critical findings. Pre-public blockers: H1 (rotate D1 token), H2 (npm audit fix). All other findings are medium/low and do not block going public.*
