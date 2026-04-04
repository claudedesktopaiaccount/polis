# Red Team Audit — Findings

**Date:** 2026-04-04
**Reviewer:** security-reviewer subagent (adversarial pass)

---

## Critical

### CRIT-01: D1 Database ID and CRON_SECRET placeholder committed to version control
**File:** `/wrangler.jsonc` lines 13–14
**Vector:** The `wrangler.jsonc` contains the live D1 `database_id` (`3988aa54-17b6-4286-b815-eac8ff6ab636`) in plaintext, plus `"CRON_SECRET": "replace-with-random-secret"`. If this value is never replaced before deploy, any external party who sends `GET /api/cron/newsletter` or `GET /api/cron/notifications` with the header `x-cron-secret: replace-with-random-secret` will bypass the cron guard, triggering mass newsletter dispatch to all subscribers and querying all opted-in user email addresses. The D1 database ID, combined with a leaked `CLOUDFLARE_D1_TOKEN`, is sufficient to make direct D1 HTTP API calls against the live database.
**Exploit steps:**
1. Clone/read the public repo, extract `CRON_SECRET` value.
2. `GET https://polis.sk/api/cron/newsletter` with `x-cron-secret: replace-with-random-secret`.
3. All active newsletter subscribers receive email; subscriber count and email addresses are indirectly enumerable through repeated calls.
**Fix:** Replace `CRON_SECRET` with a wrangler secret (`npx wrangler secret put CRON_SECRET`); remove the `vars` entry entirely.

---

### CRIT-02: Reflected XSS via unsanitized `email` parameter in unsubscribe confirmation page
**File:** `/src/app/api/newsletter/unsubscribe/route.ts` lines 33–36
**Vector:** The `email` query parameter is interpolated directly into an HTML response body with no escaping: `<strong>${email}</strong>`. An attacker crafts a link such as:
```
/api/newsletter/unsubscribe?email=<img src=x onerror=alert(1)>&token=<valid-or-bogus>
```
The token check at line 20 runs first, but even a failed token check returns a 400 with plaintext — the injection occurs only on successful unsubscription (status 200). However, a valid token for an attacker-controlled address is trivially obtained by subscribing and receiving the digest email containing a real unsubscribe link. The attacker can then substitute any `email` value because `verifyUnsubToken` signs against `(token, email)` — but the attacker controls *their own* email, so the signed link they receive is only valid for their address. The XSS fires in their own browser, not a victim's, unless the attacker tricks a victim into clicking a crafted unsubscribe URL for a different email address where the token validates. The more direct risk: the attacker can craft a link for *any* email address they want to unsubscribe (social engineering vector), and the HTML confirmation page reflects that address unescaped. If a victim clicks such a link and token validation passes for their address, they see the injected payload.
**Severity rationale:** Reflected XSS in an HTML-generating API endpoint with a real exploit path via phishing.
**Fix:** HTML-encode the `email` value before interpolation (replace `<` `>` `"` `&`).

---

## High

### HIGH-01: Rate limit table shared across endpoints — rate limit poisoning
**Files:** `/src/app/api/auth/login/route.ts`, `/src/app/api/auth/register/route.ts`, `/src/app/api/tipovanie/route.ts`
**Vector:** All three endpoints insert rows into the same `rate_limits` table keyed only by `ipHash`. An attacker can intentionally trigger 10 requests to `/api/tipovanie` (the cheapest endpoint) from a target IP to exhaust the rate limit bucket for that IP before the victim attempts login. This is a denial-of-service against a specific user's login ability by pre-flooding the shared bucket from the same IP (e.g., from a shared corporate NAT or IPv6 /64 prefix). Each endpoint uses different `RATE_LIMIT` / `RATE_WINDOW_S` constants but the same table, so the count rows from one endpoint do not bleed into another because they check `count()` within the window for their own rows — however the cleanup (`delete where createdAt < cutoff`) runs globally for all IP rows regardless of endpoint, so a slow-endpoint cleanup can delete rows belonging to a different endpoint mid-flight. This is a TOCTOU race rather than a cross-endpoint count leak.

### HIGH-02: X-Forwarded-For IP spoofing bypasses rate limiting on all endpoints
**Files:** `/src/app/api/auth/login/route.ts` line 38–40, `/src/app/api/auth/register/route.ts` lines 53–56, `/src/app/api/tipovanie/route.ts` lines 106–108
**Vector:** All rate limit IP resolution falls back to `x-forwarded-for` if `cf-connecting-ip` is absent. In a local/preview/non-Cloudflare environment, or any environment where the edge strips `cf-connecting-ip`, an attacker sets `X-Forwarded-For: 1.2.3.4` per request, cycling through arbitrary IPs to get unlimited login attempts, registrations, or prediction submissions. In production behind Cloudflare proper, `cf-connecting-ip` cannot be spoofed — but the fallback is triggered in Wrangler local preview (`npm run preview`), staging, or any misconfigured proxy in front of the Workers.
**Fix:** In production, reject requests lacking `cf-connecting-ip` outright, or treat the fallback path as `unknown` (a single shared bucket) rather than trusting the header.

### HIGH-03: `POST /api/auth/link-predictions` — missing CSRF check allows cross-site prediction takeover
**File:** `/src/app/api/auth/link-predictions/route.ts`
**Vector:** This endpoint has no CSRF validation (`pt_csrf` cookie / `x-csrf-token` header check). Every other state-mutating endpoint (`/api/tipovanie`, `/api/auth/login`, `/api/gdpr/delete`) validates CSRF. An attacker hosts a page with:
```html
<form method="POST" action="https://polis.sk/api/auth/link-predictions">
  <input type="submit">
</form>
```
When a logged-in victim visits that page and submits (or it auto-submits), the victim's `polis_session` cookie is included by the browser (SameSite=lax allows cross-site POSTs from top-level navigations). The endpoint then links *all anonymous predictions associated with the victim's `pt_visitor` cookie* to the victim's account. This could overwrite a victim's existing prediction link or, more dangerously, link attacker-pre-seeded visitor cookies to the victim's account. The practical harm is limited but the CSRF bypass is a structural flaw.
**Note:** SameSite=lax provides partial mitigation for `fetch()`-based CSRF, but not for classic form POST navigation.

### HIGH-04: `GET /api/scrape` — unauthenticated external trigger of Wikipedia scraper
**File:** `/src/app/api/scrape/route.ts`
**Vector:** The scrape endpoint has no authentication, no CSRF, and no rate limiting. Any external party can call `GET /api/scrape` to force the Worker to make outbound HTTP requests to Wikipedia. At a D1 edge Worker cost level this could be abused to: (a) exhaust the D1 write quota by repeatedly triggering poll inserts, (b) burn Cloudflare Worker CPU time (charged per ms), (c) use Polis as a low-attribution HTTP client toward Wikipedia. The endpoint is documented as a "test endpoint" but is deployed to production.
**Fix:** Guard with `isAdminAuthed()` or remove from production build.

### HIGH-05: Leaderboard exposes internal `userId` UUIDs to any caller
**File:** `/src/app/api/v1/leaderboard/route.ts` lines 46–54
**Vector:** The leaderboard response includes `userId` (a UUID) for every entry alongside display names. This is a public, unauthenticated, CORS `*` endpoint. An attacker can enumerate all users who have submitted predictions, correlate `userId` with `displayName`, and use those UUIDs in any future attack (session fixation, GDPR-export fishing if they can get a session as that user). Internal identifiers should not be in public API responses.

### HIGH-06: Stripe webhook signature comparison is non-constant-time
**File:** `/src/app/api/stripe/webhook/route.ts` lines 33–34
**Vector:** The signature comparison uses JavaScript's `===` operator (`return expected === v1`). String equality in V8/SpiderMonkey is not guaranteed to be constant-time; a timing oracle against this endpoint could leak the expected HMAC byte-by-byte. While attacking a Cloudflare edge Worker with timing precision is difficult, it is not impossible from a co-located attacker. The standard fix is to use `crypto.subtle.timingSafeEqual()`.

---

## Medium

### MED-01: Admin session token stored as bare UUID in cookie — no session binding to IP or User-Agent
**File:** `/src/lib/admin-auth.ts`
**Vector:** The admin HMAC scheme verifies that `admin_sig` is a valid HMAC of `admin_session` under `ADMIN_SECRET`. But there is no binding of the session to a client IP, User-Agent, or any per-request nonce. If an attacker steals both cookies (e.g., via XSS on any page, or network interception on a non-HTTPS dev environment), they have a fully valid admin session for 8 hours with no revocation mechanism. There is no session store; the token cannot be invalidated server-side without rotating `ADMIN_SECRET`.

### MED-02: `POST /api/report-error` — unauthenticated Sentry event injection
**File:** `/src/app/api/report-error/route.ts`
**Vector:** Any unauthenticated caller can POST arbitrary `message` and `stack` strings to this endpoint, which forwards them directly to Sentry as captured exceptions. An attacker can flood Sentry with noise events, exhaust the Sentry quota, or inject misleading events to cover real errors. There is no rate limiting and no authentication.

### MED-03: `POST /api/newsletter/subscribe` — no rate limiting enables subscriber list bombing
**File:** `/src/app/api/newsletter/subscribe/route.ts`
**Vector:** There is no rate limiting on the subscribe endpoint. An attacker can submit thousands of unique email addresses, filling the subscriber table. The next newsletter run sends email to all of them, resulting in a large spam blast billed to the Resend account and potential sender reputation damage. The `already_subscribed` guard helps for repeated same-email, but does not protect against distinct addresses at volume.

### MED-04: Prediction deduplication race condition — TOCTOU between existence check and insert
**File:** `/src/app/api/tipovanie/route.ts` lines 120–156
**Vector:** The duplicate check (`SELECT … WHERE visitor_id = ?`) and the subsequent `INSERT` are two separate D1 operations. Under concurrent requests from the same visitor (e.g., double-click or parallel tab), both requests can pass the existence check before either insert completes. The UNIQUE constraint on `visitor_id` at line 160 of schema.ts will cause one insert to fail with a constraint error, which is caught and returned as `already_voted`. However, the `crowdAggregates` counter at lines 159–172 uses an atomic upsert and is safe. The risk is that the error path (line 147–154) silently swallows the duplicate rather than returning the `partyId` of the existing vote, which breaks the client's ability to show the correct "you already voted for X" UI state.

### MED-05: `link-predictions` endpoint updates all rows matching `visitorId` without checking for conflicting existing `userId`
**File:** `/src/app/api/auth/link-predictions/route.ts` line 29–33
**Vector:** If user A logs in on device 1 (visitorId=X) and then user B logs in on device 1 (visitorId=X, same cookie), calling `link-predictions` as user B will overwrite `userId` on user A's prediction rows to user B. Predictions are then credited to user B in scoring and leaderboard. This is a prediction ownership takeover via shared device/cookie.

### MED-06: `wrangler.jsonc` exposes live D1 `database_id` in version-controlled file
**File:** `/wrangler.jsonc` line 26
**Vector:** The D1 `database_id` (`3988aa54-17b6-4286-b815-eac8ff6ab636`) is committed. By itself this is not exploitable — D1 HTTP API requires an API token. However, combined with a leaked `CLOUDFLARE_D1_TOKEN` (from `.env`, CI logs, or git history), an attacker can make arbitrary SQL queries against the live database using the D1 REST API without deploying any Worker.

### MED-07: API rate-limit counter has a read-then-write race (non-atomic increment)
**File:** `/src/lib/api-keys/rate-limit.ts` lines 27–39
**Vector:** The code reads `current = rows[0]?.count`, checks against `FREE_TIER_DAILY_LIMIT`, then sets `count: current + 1` in the upsert. Under concurrent requests, two requests can both read `current = 99` (one below limit), both write `100`, and both be allowed — effectively granting two requests when only one should pass. The `onConflictDoUpdate` does not use `sql\`${apiUsage.count} + 1\`` (atomic increment), it uses the JavaScript-computed `current + 1`, so the race is real.

---

## Low

### LOW-01: Session token is a bare UUID — low entropy compared to cryptographic random bytes
**File:** `/src/lib/auth/session.ts` line 10
**Vector:** `crypto.randomUUID()` produces 122 bits of entropy, which is sufficient but is a UUID (structured format, version 4 marker reduces it slightly). Using `crypto.getRandomValues(new Uint8Array(32))` encoded as hex gives 256 bits of unstructured entropy with no format leakage.

### LOW-02: No `X-Frame-Options` or `Content-Security-Policy: frame-ancestors` header
**Vector:** No evidence of clickjacking protection headers in middleware, `next.config`, or route handlers. The prediction submission page (`/tipovanie`) can be iframed by a third-party site to perform UI redressing attacks, tricking users into submitting predictions.

### LOW-03: `polis_engaged` cookie is client-readable and can be set by any script on the domain
**File:** `/src/lib/consent.ts` (cookie not `httpOnly`)
**Vector:** Any XSS on the domain can set `polis_engaged=1` to skip onboarding for all future visits. Conversely, it can be deleted to force onboarding to re-appear. Low impact but a symptom of missing `httpOnly` on a state cookie.

### LOW-04: CSRF token cookie `pt_csrf` uses `SameSite=lax` — double-submit pattern has limited protection against subdomain XSS
**Vector:** If any subdomain of `polis.sk` has XSS, an attacker can read or set the `pt_csrf` cookie (which is not `httpOnly`, by design for JS access) and forge the double-submit pattern. The protection holds only if there are no XSS vulnerabilities on the same origin.

### LOW-05: `POST /api/admin/polls` uses raw D1 `env.DB.prepare()` while other admin routes use Drizzle
**File:** `/src/app/api/admin/polls/route.ts` lines 24–38
**Vector:** The raw SQL path uses `?` parameterised binds correctly, so there is no injection. However, the `partyId` key from `body.results` (a `Record<string, number>`) is interpolated as a bind parameter for `party_id`, not validated against a known party list. An admin could insert poll results for a non-existent party ID, creating orphaned rows that may cause frontend rendering errors.

### LOW-06: Newsletter unsubscribe token uses RESEND_API_KEY as HMAC secret
**File:** `/src/lib/email/tokens.ts` (called from unsubscribe route)
**Vector:** Using an API key as a signing secret means rotating the Resend API key invalidates all outstanding unsubscribe links. Additionally, the RESEND_API_KEY may have different rotation/revocation cadence than a dedicated secret. Recommendation: use a separate `UNSUB_SECRET` env var.

### LOW-07: Leaderboard endpoint has `Cache-Control: public, s-maxage=300` with wildcard CORS — no Vary header
**File:** `/src/app/api/v1/leaderboard/route.ts` lines 57–62
**Vector:** A public CDN cache may serve the same leaderboard response to all users regardless of `electionId` if a caching proxy does not honour query string parameters. The `electionId` is a query param, not a path segment. Recommendation: add `Vary: Accept-Encoding` and ensure CDN is configured to cache per query string.

---

## Clean Areas

The following were checked and found to have no exploitable vulnerabilities:

- **SQL injection**: All Drizzle ORM queries use parameterised binds. The one raw SQL path (`/api/admin/polls`) also uses `?` bind parameters correctly.
- **Admin auth bypass**: `isAdminAuthed()` uses `crypto.subtle.verify()` (constant-time HMAC verification) and is applied consistently across all `/api/admin/*` routes.
- **Session fixation**: Sessions are created server-side with `crypto.randomUUID()` after credential verification; no client-supplied session token is accepted.
- **Horizontal prediction access**: The GDPR export and delete endpoints scope all queries to the authenticated user's `userId` or their own `pt_visitor` cookie; no user-supplied ID parameter controls whose data is fetched.
- **Password hashing**: PBKDF2 is used (confirmed by `hashPassword` in `/src/lib/auth/password.ts`); raw passwords are never stored or logged.
- **Timing attack on login**: The login endpoint always runs `verifyPassword()` regardless of whether the user exists (dummy hash path), mitigating user enumeration via timing.
- **API key secrecy**: Raw API keys are SHA-256 hashed before storage; the raw key is returned only once at creation. Lookup always hashes the input before comparing.
- **Stored XSS via displayName**: `validateDisplayName()` rejects strings containing HTML tags via `HTML_TAG_REGEX`.
- **Open redirect**: No `?redirect=` parameters exist in any login or auth flow.
- **SSRF via scraper**: The news scraper fetches only hardcoded URLs (`aktuality.sk`, `dennikn.sk`, `domov.sme.sk`); no user-controlled URL is ever fetched.
- **Cron endpoint auth**: Both cron endpoints (`/api/cron/newsletter`, `/api/cron/notifications`) check `x-cron-secret` against `env.CRON_SECRET` before any DB access — assuming the secret is properly set (see CRIT-01).
- **API key isolation**: `GET /api/keys` scopes the query to `session.userId`; users cannot enumerate other users' keys.
- **Stripe webhook integrity**: Signature is verified with HMAC-SHA256 before any DB mutation (with caveat in HIGH-06 about non-constant-time comparison).
