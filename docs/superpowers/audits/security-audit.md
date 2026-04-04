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
