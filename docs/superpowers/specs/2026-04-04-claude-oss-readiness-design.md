# Claude OSS Readiness — Design Spec

**Date**: 2026-04-04
**Goal**: Bring the Polis project to a state where it can be made public and submitted to the Anthropic Claude for Open Source Program (6 months Claude Max 20x)
**Sequence**: Security audit → Red team → v2 merge → Gap filling → Go public → Apply

---

## 1. Security Audit (Code Review)

A systematic review of the codebase for credentials and security patterns — from a code reviewer's perspective.

**Scope:**

- **Committed secrets scan** — grep git history for API keys, tokens, passwords, `.env` values that may have been committed in prior sessions. Any found must be removed from history (not just deleted) and rotated.
- **Auth implementation** — verify PBKDF2 password hashing is correctly implemented (correct iteration count, salt per-user, constant-time comparison). Verify session token generation uses cryptographically secure randomness.
- **CSRF protection** — verify the double-submit cookie pattern covers all state-changing endpoints (prediction submission, user registration, score updates, admin endpoints).
- **Input validation** — verify all user-supplied input is validated at system boundaries before hitting D1. Confirm Drizzle ORM parameterization is used throughout (no raw SQL string interpolation).
- **Auth middleware coverage** — verify all `/admin/*` endpoints and authenticated routes are protected. Check for any routes that assume auth without enforcing it.
- **Rate limiting** — verify the `rate_limits` table is enforced on all public-facing mutation endpoints.

**Output**: A findings list with severity (critical / high / medium / low) and recommended fix. Criticals block going public.

---

## 1b. Red Team Audit (Adversarial)

A dedicated agent that approaches the site as an attacker — actively trying to break, corrupt, or exfiltrate. Reads the codebase to find real attack paths, not just bad patterns.

**Attack surface:**

### Auth & Access Control
- **Auth bypass** — access `/admin/*` endpoints without credentials; forge or replay session cookies; bypass PBKDF2 auth
- **Account takeover / user impersonation** — log in as another user by manipulating session tokens or user IDs in requests; access or overwrite another user's prediction history by changing an ID parameter (horizontal privilege escalation); check if leaderboard exposes enough info (username + score) to enumerate valid accounts for targeted attacks
- **Timing attacks** — does the login endpoint respond faster for valid usernames than invalid ones? (username enumeration via response timing)
- **Open redirect** — any `?redirect=` or `?next=` params that could send users to a malicious site post-login

### Injection & Data Corruption
- **D1 injection** — find any raw SQL paths that bypass Drizzle's parameterization
- **XSS (stored)** — can a username or any user-submitted field store a `<script>` tag that executes in another user's browser?
- **XSS (reflected)** — do query params like `?parties=` in the coalition simulator reflect unsanitized content into the page? Can malformed values cause crashes or inject content?
- **Parameter pollution** — duplicate or malformed query params causing crashes or bypassing validation

### Session & CSRF
- **CSRF bypass** — find gaps in the double-submit pattern; can a cross-site request trigger prediction submissions or leaderboard score manipulation?
- **Cookie poisoning** — can `polis_engaged=1` be set externally to skip the onboarding funnel in unintended ways?

### Privilege & Business Logic
- **Leaderboard manipulation** — submit predictions repeatedly, backdate them, or inflate scores via direct API calls
- **Rate limit evasion** — bypass the `rate_limits` table by rotating IPs or forging `X-Forwarded-For` headers
- **API key theft** — enumerate other users' API keys via the `/keys` endpoint

### Infrastructure & Availability
- **DDoS / resource exhaustion** — hammer expensive endpoints (Monte Carlo simulation, D1 queries) to exhaust Cloudflare Workers CPU limits or D1 read unit quota; determine if one user can knock the site offline
- **Scraping endpoint abuse** — trigger the news aggregation cron externally or hammer it to cause D1 quota exhaustion
- **SSRF** — the news scraper fetches external URLs; can an attacker manipulate it to fetch Cloudflare internal metadata or private endpoints?
- **Clickjacking** — embed the site in an `<iframe>` and trick users into unintended actions (e.g., submitting a prediction)

### Information Disclosure
- **Error page leakage** — do error pages expose stack traces, DB schema, or internal file paths?
- **API over-exposure** — do API responses include more fields than needed (e.g., password hashes, internal IDs)?
- **Dependency vulnerabilities** — `npm audit` scan for known CVEs in installed packages

**Output**: Findings report with severity (critical / high / medium / low), attack vector description, and recommended fix. Criticals block going public. All high-severity issues should be fixed before submission.

---

## 2. v2 Merge Strategy

Merge the `feature/v2-overhaul` branch (in `.worktrees/v2-overhaul/`) into `main` and deploy.

**Steps:**

1. Run the v2 worktree build locally to confirm it compiles clean
2. Merge `feature/v2-overhaul` → `main` via standard git merge (not rebase — preserve history)
3. Resolve any conflicts (the 5 files currently modified on `main` are the likely conflict points: `KoalicnyClient.tsx`, `loading.tsx`, `PrieskumyClient.tsx`, `HeroBanner.tsx`, `NewsHeadlines.tsx`)
4. Run `npm run build` to verify clean build on merged result
5. Run `npm run lint` to verify no lint errors
6. Deploy to Cloudflare Workers — produces a live URL for the OSS application

**Risk**: The 5 dirty files on `main` may have diverged from v2. Manual conflict resolution required — do not auto-accept either side without reviewing.

---

## 3. Gap Filling

Make the repo look like a real, maintained open-source civic tech project.

### README
A compelling `README.md` at the repo root covering:
- Project description with civic narrative (Slovak democracy tracker, 18-25 new voters, 2027 elections)
- Live demo URL
- Feature list (9 pages: polls, predictions, coalition simulator, election calculator, crowd predictions, promise tracker, news aggregation)
- Tech stack badge strip
- Local setup instructions (`npm install` → env vars → `npm run dev`)
- Data sources (polling agencies, election commission)
- Contributing link
- License

Tone: authoritative and mission-driven, not just a dev tool. This is the first thing OSS reviewers see.

### MIT License
Add `LICENSE` file to the repo root. MIT is the standard permissive license expected by OSS programs.

### Real Data for Mock Pages
Two pages currently have hardcoded/mocked data that needs replacing with real curated content:

- **`/volebny-kalkulator`** — party policy weights are hardcoded. Replace with real curated positions sourced from party manifestos.
- **`/povolebne-plany`** — promise data for 10 parties is mocked. Replace with real promises sourced from coalition agreements and party programs, with proper status fields (fulfilled / in_progress / broken / not_started).

This data should be added to the D1 database via seed scripts, not hardcoded in components.

### CONTRIBUTING.md
One-page contributor guide covering: how to set up the dev environment, how to submit a PR, coding conventions (Slovak UI text, server components by default, Drizzle for all DB access), and how to report issues. Makes the project look actively maintained — OSS reviewers notice this.

---

## 4. Going Public

### Remove Secrets from Git History
If the security audit finds credentials in git history, use `git filter-repo` (not `git filter-branch`) to remove them. All affected secrets must be rotated after removal — a removed secret that isn't rotated is still compromised.

### Make Repo Public on GitHub
After audit, gap-filling, and v2 deployment are complete. The repo should be presentable on its own before the application is submitted. Verify no `.env` files or secrets are present in the working tree or history before flipping to public.

### Deploy v2
Cloudflare Workers deployment produces the live URL needed for the application. Verify all 9 pages load correctly on the deployed URL.

### Application Narrative
The Claude OSS application asks for a project description. Key points:

- **What it is**: Civic tech web app tracking Slovak politics ahead of the 2027 parliamentary elections. Covers polls, a Monte Carlo election prediction model, coalition simulation, crowd predictions leaderboard, election calculator, and post-election promise tracking.
- **Who it's for**: 18-25 new voters (highest abstention demographic in Slovakia), plus political junkies and general news readers.
- **Why it matters**: Slovakia's EU trajectory is uncertain. Informed voters are the best counter to misinformation ahead of a consequential election.
- **What's built**: 9 complete pages, real D'Hondt seat allocation algorithm, 10k-iteration Monte Carlo simulation, GDPR-compliant auth, crowd predictions with leaderboard scoring.
- **How Claude will be used**: Completing v2 overhaul features — social sharing cards, leaderboard UI, adaptive homepage, promise tracker data entry, and ongoing data curation.

Tone: honest and specific. Do not oversell. The project is real, functional, and civic — that's the pitch.

---

## Execution Order

1. Security audit (code review) + red team audit → fix criticals
2. Merge v2 → `main` → deploy
3. Fill gaps (README, LICENSE, real data, CONTRIBUTING.md)
4. Remove any history secrets → make repo public
5. Write and submit OSS application

Steps 1 and 2 can partially overlap (audit while v2 merge is being prepared), but the repo must not go public until both are complete and criticals are resolved.
