# Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Remove the two biggest acquisition blockers — mock data and zero distribution — by shipping a newsletter signup, D1-backed news on the homepage, a sourced party programs page, and a lightweight admin panel.

**Architecture:** Four independent work streams: (1) newsletter subscribers table + Resend API + signup UI, (2) homepage reads news from D1 cache instead of live scraping, (3) party program data moved to D1 `party_promises` with real sourced content, (4) password-protected `/admin` CRUD for promises and manual poll entry. All persist to Cloudflare D1 via Drizzle ORM.

**Tech Stack:** Next.js 16 App Router, TypeScript, Drizzle ORM + Cloudflare D1, TailwindCSS 4, Vitest 4, Playwright, Resend (email), Cloudflare Access (admin auth)

---

## File Map

**New files:**
- `src/lib/db/newsletter.ts` — newsletter subscribe/unsubscribe DB helpers
- `src/app/api/newsletter/subscribe/route.ts` — POST endpoint
- `src/components/NewsletterSignup.tsx` — reusable signup form component
- `src/app/newsletter/page.tsx` — dedicated newsletter landing page
- `src/lib/db/news.ts` — `getLatestNews(db)` helper reading from D1
- `src/lib/db/party-promises.ts` — `getPromisesForParty(db, partyId)` helper
- `src/app/admin/page.tsx` — admin dashboard index
- `src/app/admin/promises/page.tsx` — party promises CRUD
- `src/app/admin/polls/page.tsx` — manual poll entry
- `src/app/admin/layout.tsx` — admin layout with auth gate
- `drizzle/XXXX_add_newsletter_subscribers.sql` — migration (auto-generated)

**Modified files:**
- `src/lib/db/schema.ts` — add `newsletterSubscribers` table
- `src/app/page.tsx` — read news from D1 via `getLatestNews()` instead of `scrapeNews()`
- `src/app/povolebne-plany/page.tsx` — fetch promises from D1, pass to client
- `src/app/povolebne-plany/PovolebnePlanyClient.tsx` — accept DB-sourced data as props
- `src/components/ui/Footer.tsx` — add inline newsletter signup
- `workers/scraper/wrangler.toml` — change cron from `0 */6 * * *` to `0 * * * *` (hourly)
- `.env.example` — add `RESEND_API_KEY`, `ADMIN_SECRET`
- `wrangler.jsonc` — add `ADMIN_SECRET` var

---

## Task 1: Newsletter Subscribers — Schema + Migration

**Files:**
- Modify: `src/lib/db/schema.ts`
- Generate: `drizzle/XXXX_add_newsletter_subscribers.sql`

- [x] **Step 1: Add table to schema**

In `src/lib/db/schema.ts`, append:

```typescript
// ─── Newsletter Subscribers ───────────────────────────────

export const newsletterSubscribers = sqliteTable(
  "newsletter_subscribers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    createdAt: text("created_at").notNull(),
    confirmedAt: text("confirmed_at"),
    unsubscribedAt: text("unsubscribed_at"),
    source: text("source").default("web"), // 'web' | 'homepage' | 'footer'
  },
  (table) => [
    uniqueIndex("newsletter_subscribers_email_unique").on(table.email),
  ]
);
```

- [x] **Step 2: Generate migration**

```bash
npm run db:generate
```

Expected: new file in `drizzle/` with the newsletter_subscribers table CREATE statement.

- [x] **Step 3: Verify migration file looks correct**

Open the generated migration file. Should contain:
```sql
CREATE TABLE `newsletter_subscribers` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `created_at` text NOT NULL,
  ...
```

- [x] **Step 4: Apply migration locally**

```bash
npm run db:migrate
```

- [x] **Step 5: Write unit test for schema shape**

Create `src/lib/db/__tests__/schema.test.ts` if it doesn't exist:

```typescript
import { describe, it, expect } from "vitest";
import { newsletterSubscribers } from "../schema";

describe("newsletterSubscribers schema", () => {
  it("has required columns", () => {
    const cols = Object.keys(newsletterSubscribers);
    expect(cols).toContain("email");
    expect(cols).toContain("createdAt");
    expect(cols).toContain("source");
  });
});
```

- [x] **Step 6: Run test**

```bash
npm test src/lib/db/__tests__/schema.test.ts
```

Expected: PASS

- [x] **Step 7: Commit**

```bash
git add src/lib/db/schema.ts drizzle/ src/lib/db/__tests__/schema.test.ts
git commit -m "feat: add newsletter_subscribers table"
```

---

## Task 2: Newsletter DB Helpers

**Files:**
- Create: `src/lib/db/newsletter.ts`
- Test: `src/lib/db/__tests__/newsletter.test.ts`

- [x] **Step 1: Write failing tests**

Create `src/lib/db/__tests__/newsletter.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { subscribeEmail, isAlreadySubscribed } from "../newsletter";

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

describe("subscribeEmail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts a new subscriber", async () => {
    mockDb.limit.mockResolvedValue([]);
    mockDb.values.mockResolvedValue(undefined);
    // integration-style test via DB mock — verifies function calls correct methods
    await expect(subscribeEmail(mockDb as any, "test@example.com", "homepage")).resolves.not.toThrow();
  });

  it("throws if email already subscribed", async () => {
    mockDb.limit.mockResolvedValue([{ id: 1 }]);
    await expect(subscribeEmail(mockDb as any, "existing@example.com")).rejects.toThrow("already_subscribed");
  });
});

describe("isAlreadySubscribed", () => {
  it("returns true when subscriber exists", async () => {
    mockDb.limit.mockResolvedValue([{ id: 1 }]);
    const result = await isAlreadySubscribed(mockDb as any, "user@example.com");
    expect(result).toBe(true);
  });

  it("returns false when subscriber does not exist", async () => {
    mockDb.limit.mockResolvedValue([]);
    const result = await isAlreadySubscribed(mockDb as any, "new@example.com");
    expect(result).toBe(false);
  });
});
```

- [x] **Step 2: Run tests to confirm they fail**

```bash
npm test src/lib/db/__tests__/newsletter.test.ts
```

Expected: FAIL — `subscribeEmail` not found.

- [x] **Step 3: Implement helpers**

Create `src/lib/db/newsletter.ts`:

```typescript
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { newsletterSubscribers } from "./schema";

export async function isAlreadySubscribed(
  db: DrizzleD1Database,
  email: string
): Promise<boolean> {
  const rows = await db
    .select({ id: newsletterSubscribers.id })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email.toLowerCase().trim()))
    .limit(1);
  return rows.length > 0;
}

export async function subscribeEmail(
  db: DrizzleD1Database,
  email: string,
  source: string = "web"
): Promise<void> {
  const alreadyExists = await isAlreadySubscribed(db, email);
  if (alreadyExists) throw new Error("already_subscribed");

  await db.insert(newsletterSubscribers).values({
    email: email.toLowerCase().trim(),
    createdAt: new Date().toISOString(),
    source,
  });
}
```

- [x] **Step 4: Run tests**

```bash
npm test src/lib/db/__tests__/newsletter.test.ts
```

Expected: PASS (4 tests).

- [x] **Step 5: Commit**

```bash
git add src/lib/db/newsletter.ts src/lib/db/__tests__/newsletter.test.ts
git commit -m "feat: newsletter subscribe/check DB helpers"
```

---

## Task 3: Newsletter Subscribe API Route

**Files:**
- Create: `src/app/api/newsletter/subscribe/route.ts`
- Test: via Playwright or manual curl test in step 4

- [x] **Step 1: Write the route**

Create `src/app/api/newsletter/subscribe/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { subscribeEmail } from "@/lib/db/newsletter";

export const runtime = "edge";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  let body: { email?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  try {
    await subscribeEmail(db, email, body.source ?? "web");
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "already_subscribed") {
      return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
    }
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
```

- [x] **Step 2: Write unit test for email validation**

Create `src/app/api/newsletter/__tests__/validate.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("a.b+c@mail.co.uk")).toBe(true);
  });
  it("rejects invalid emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("@nodomain")).toBe(false);
  });
});
```

- [x] **Step 3: Run unit tests**

```bash
npm test src/app/api/newsletter/__tests__/validate.test.ts
```

Expected: PASS (5 tests).

- [x] **Step 4: Manual smoke test**

> **Note:** This route uses `getCloudflareContext({ async: true })`, which only works in the Wrangler runtime — not `npm run dev`. Use `npm run preview` for this test.

```bash
npm run preview
# In another terminal:
curl -X POST http://localhost:8787/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","source":"homepage"}'
```

Expected: `{"ok":true}`

Re-send same email:
```bash
curl -X POST http://localhost:8787/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
```

Expected: `{"error":"already_subscribed"}` with status 409.

- [x] **Step 5: Commit**

```bash
git add src/app/api/newsletter/ src/app/api/newsletter/__tests__/
git commit -m "feat: POST /api/newsletter/subscribe with duplicate detection"
```

---

## Task 4: Newsletter Signup UI + Integration

**Files:**
- Create: `src/components/NewsletterSignup.tsx`
- Create: `src/app/newsletter/page.tsx`
- Modify: `src/components/ui/Footer.tsx` (add inline signup)
- Modify: `src/app/page.tsx` (add signup section after party cards)

- [x] **Step 1: Build the signup component**

Create `src/components/NewsletterSignup.tsx`:

```typescript
"use client";

import { useState } from "react";

interface Props {
  source?: string;
  compact?: boolean; // compact=true for footer inline version
}

export default function NewsletterSignup({ source = "web", compact = false }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
    });

    if (res.ok) {
      setStatus("success");
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus(data.error === "already_subscribed" ? "duplicate" : "error");
    }
  }

  if (status === "success") {
    return (
      <p className={`font-medium ${compact ? "text-sm" : "text-base"}`}>
        ✓ Prihlásili ste sa. Ďakujeme!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "flex gap-2" : "flex flex-col sm:flex-row gap-3 max-w-md"}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="váš@email.sk"
        required
        disabled={status === "loading"}
        className={`flex-1 border border-divider bg-surface px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-ink ${compact ? "" : "rounded-none"}`}
      />
      <button
        type="submit"
        disabled={status === "loading" || !email}
        className="bg-ink text-surface px-4 py-2 text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50 whitespace-nowrap"
      >
        {status === "loading" ? "..." : "Odoberať"}
      </button>
      {status === "duplicate" && (
        <p className="text-xs text-muted mt-1 w-full">Táto adresa je už prihlásená.</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-600 mt-1 w-full">Chyba. Skúste znova.</p>
      )}
    </form>
  );
}
```

- [x] **Step 2: Create /newsletter landing page**

Create `src/app/newsletter/page.tsx`:

```typescript
import type { Metadata } from "next";
import NewsletterSignup from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Polis Týždenník — týždenný prehľad slovenských politických prieskumov a predikcií. Zadarmo, každý piatok.",
};

export default function NewsletterPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl font-bold text-ink mb-4">Polis Týždenník</h1>
      <p className="text-text mb-2 leading-relaxed">
        Každý piatok: prehľad zmien v prieskumoch, čo hovoria predikcie, a jeden editorial uhol pohľadu na slovenské politické dianie.
      </p>
      <p className="text-muted text-sm mb-8">Zadarmo. Odhlásenie kedykoľvek.</p>
      <NewsletterSignup source="newsletter-page" />
    </main>
  );
}
```

- [x] **Step 3: Add signup section to homepage**

In `src/app/page.tsx`, import `NewsletterSignup` and add a section after the party cards block (before the closing `</div>` of the left column):

```typescript
import NewsletterSignup from "@/components/NewsletterSignup";

// Inside the JSX, after the party cards <div> and CTA link:
<div className="mt-10 pt-8 border-t border-divider">
  <p className="font-serif text-lg font-semibold text-ink mb-1">Polis Týždenník</p>
  <p className="text-sm text-muted mb-4">Týždenný prehľad prieskumov a predikcií. Zadarmo.</p>
  <NewsletterSignup source="homepage" />
</div>
```

- [x] **Step 4: Add compact signup to footer**

In `src/components/ui/Footer.tsx`, import `NewsletterSignup` and add before the footer credits:

```typescript
import NewsletterSignup from "@/components/NewsletterSignup";

// Add inside footer, above the copyright line:
<div className="border-t border-divider pt-6 pb-4">
  <p className="text-xs text-muted mb-2 font-semibold uppercase tracking-widest">Newsletter</p>
  <NewsletterSignup source="footer" compact />
</div>
```

- [x] **Step 5: Write E2E test for signup flow**

Create `e2e/newsletter.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test("newsletter signup — success flow", async ({ page }) => {
  await page.goto("/newsletter");
  await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
  await page.click('button[type="submit"]');
  await expect(page.locator("text=Prihlásili ste sa")).toBeVisible({ timeout: 5000 });
});

test("newsletter signup — duplicate detection", async ({ page }) => {
  const email = `dup-${Date.now()}@example.com`;
  // First signup
  await page.goto("/newsletter");
  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');
  await expect(page.locator("text=Prihlásili ste sa")).toBeVisible();

  // Second signup on homepage
  await page.goto("/");
  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');
  await expect(page.locator("text=Táto adresa je už prihlásená")).toBeVisible({ timeout: 5000 });
});
```

- [x] **Step 6: Run E2E tests**

```bash
npm run test:e2e e2e/newsletter.spec.ts
```

Expected: PASS (2 tests).

- [x] **Step 7: Add /newsletter to sitemap**

In `src/app/sitemap.ts`, add an entry for the newsletter page alongside existing routes:

```typescript
{ url: `${SITE_URL}/newsletter`, lastModified: new Date(), priority: 0.7, changeFrequency: "monthly" },
```

- [x] **Step 8: Commit**

```bash
git add src/components/NewsletterSignup.tsx src/app/newsletter/ src/app/page.tsx src/components/ui/Footer.tsx src/app/sitemap.ts e2e/newsletter.spec.ts
git commit -m "feat: newsletter signup — landing page, homepage + footer integration, sitemap"
```

---

## Task 5: Homepage — Read News from D1 Cache

The scraper worker already writes news to D1 every 6h. The homepage calls `scrapeNews()` live on every render. Fix: read from cache, cut scraper interval to 60 min.

**Files:**
- Create: `src/lib/db/news.ts`
- Modify: `src/app/page.tsx`
- Modify: `workers/scraper/wrangler.toml`

- [x] **Step 1: Write failing test for getLatestNews**

Create `src/lib/db/__tests__/news.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { getLatestNews } from "../news";

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([
    { id: 1, title: "Test", url: "https://example.com", source: "SME", publishedAt: "2026-03-01", scrapedAt: "2026-03-01T10:00:00Z" },
  ]),
};

describe("getLatestNews", () => {
  it("returns an array of news items", async () => {
    const result = await getLatestNews(mockDb as any, 5);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("title");
    expect(result[0]).toHaveProperty("url");
  });

  it("uses default limit of 10", async () => {
    await getLatestNews(mockDb as any);
    expect(mockDb.limit).toHaveBeenCalledWith(10);
  });
});
```

- [x] **Step 2: Run tests to confirm they fail**

```bash
npm test src/lib/db/__tests__/news.test.ts
```

Expected: FAIL — `getLatestNews` not found.

- [x] **Step 3: Implement getLatestNews**

Create `src/lib/db/news.ts`:

```typescript
import { desc } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { newsItems } from "./schema";

export async function getLatestNews(
  db: DrizzleD1Database,
  limit: number = 10
) {
  return db
    .select({
      id: newsItems.id,
      title: newsItems.title,
      url: newsItems.url,
      source: newsItems.source,
      publishedAt: newsItems.publishedAt,
      scrapedAt: newsItems.scrapedAt,
    })
    .from(newsItems)
    .orderBy(desc(newsItems.scrapedAt))
    .limit(limit);
}
```

- [x] **Step 4: Run tests**

```bash
npm test src/lib/db/__tests__/news.test.ts
```

Expected: PASS (2 tests).

- [x] **Step 5: Update homepage to use D1 cache**

In `src/app/page.tsx`:
- Remove: `import { scrapeNews } from "@/lib/scraper/news";`
- Add: `import { getLatestNews } from "@/lib/db/news";`
- Change line `scrapeNews().catch(() => [])` to `getLatestNews(db, 10).catch(() => [])`

The `revalidate = 3600` already ensures fresh ISR — no change needed there.

- [x] **Step 6: Cut scraper cron to hourly**

In `workers/scraper/wrangler.toml`, change:
```toml
# Before:
crons = ["0 */6 * * *"]
# After:
crons = ["0 * * * *"]
```

- [x] **Step 7: Verify build passes**

```bash
npm run build
```

Expected: no TypeScript errors, build succeeds.

- [x] **Step 8: Commit**

```bash
git add src/lib/db/news.ts src/lib/db/__tests__/news.test.ts src/app/page.tsx workers/scraper/wrangler.toml
git commit -m "feat: homepage reads news from D1 cache, scraper cron hourly"
```

---

## Task 6: Party Programs — Move to D1 + Expand Content

Currently `PovolebnePlanyClient.tsx` has hardcoded programs (3–5 items per party) that were flagged as mock data. Move to D1 `party_promises` table and expand with real sourced content.

**Files:**
- Create: `src/lib/db/party-promises.ts`
- Create: `src/lib/db/seeds/party-programs-seed.ts`
- Modify: `src/app/povolebne-plany/page.tsx` — fetch from DB
- Modify: `src/app/povolebne-plany/PovolebnePlanyClient.tsx` — accept props

- [x] **Step 1: Write failing test for getPromisesForParty**

Create `src/lib/db/__tests__/party-promises.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { getPromisesForParty, getAllPartiesWithPromises } from "../party-promises";

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockResolvedValue([
    { id: 1, partyId: "ps", promiseText: "Ochrana demokracie", category: "Politika", isPro: true, sourceUrl: "https://ps.sk" },
  ]),
};

describe("getPromisesForParty", () => {
  it("returns promises for a party", async () => {
    const result = await getPromisesForParty(mockDb as any, "ps");
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("promiseText");
    expect(result[0]).toHaveProperty("category");
  });
});
```

- [x] **Step 2: Run test to confirm failure**

```bash
npm test src/lib/db/__tests__/party-promises.test.ts
```

Expected: FAIL.

- [x] **Step 3: Implement DB helper**

Create `src/lib/db/party-promises.ts`:

```typescript
import { eq, asc } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { partyPromises, parties } from "./schema";

export async function getPromisesForParty(
  db: DrizzleD1Database,
  partyId: string
) {
  return db
    .select()
    .from(partyPromises)
    .where(eq(partyPromises.partyId, partyId))
    .orderBy(asc(partyPromises.category));
}

export async function getAllPartiesWithPromises(db: DrizzleD1Database) {
  // Returns { partyId, promiseCount } for sidebar rendering
  const rows = await db.select({ id: parties.id, name: parties.name }).from(parties);
  const results = await Promise.all(
    rows.map(async (party) => {
      const promises = await getPromisesForParty(db, party.id);
      return { ...party, promises };
    })
  );
  return results.filter((p) => p.promises.length > 0);
}
```

- [x] **Step 4: Run tests**

```bash
npm test src/lib/db/__tests__/party-promises.test.ts
```

Expected: PASS.

- [x] **Step 5: Create seed script with real sourced data**

Create `src/lib/db/seeds/party-programs-seed.ts`:

> **Content task:** Before running this seed, replace the placeholder promises below with real, sourced program commitments from official party websites (ps.sk, smer.sk, hlas.sk, kdh.sk, sas.sk, republika.sk, sns.sk, slovensko.sk, demokrati.sk, aliancia.sk). Each party should have 10–15 items across at least 4 categories. The structure is shown below — fill in real content.

```typescript
// Run with: npx tsx src/lib/db/seeds/party-programs-seed.ts
// Requires env vars: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN

import { drizzle } from "drizzle-orm/d1-http";
import { partyPromises } from "../schema";

// Replace these with real sourced party program data
const SEED_DATA: Array<{ partyId: string; promiseText: string; category: string; isPro: boolean; sourceUrl?: string }> = [
  // PS — Progresívne Slovensko (source: https://progresivne.sk)
  { partyId: "ps", promiseText: "Posilnenie nezávislosti súdnictva a prokuratúry", category: "Právny štát", isPro: true, sourceUrl: "https://progresivne.sk/program" },
  { partyId: "ps", promiseText: "Zavedenie registrovaných partnerstiev", category: "Ľudské práva", isPro: true, sourceUrl: "https://progresivne.sk/program" },
  { partyId: "ps", promiseText: "Zvýšenie výdavkov na vzdelávanie na 5% HDP", category: "Školstvo", isPro: true, sourceUrl: "https://progresivne.sk/program" },
  { partyId: "ps", promiseText: "Proeurópska zahraničná politika a podpora Ukrajiny", category: "Zahraničná politika", isPro: true, sourceUrl: "https://progresivne.sk/program" },
  { partyId: "ps", promiseText: "Zelená transformácia energetiky", category: "Životné prostredie", isPro: true, sourceUrl: "https://progresivne.sk/program" },
  // TODO: Add 10+ more for each party. See full party program sources in HANDOFF.md.

  // Smer-SD (source: https://smer.sk)
  { partyId: "smer-sd", promiseText: "Zachovanie sociálnych istôt a valorizácia dôchodkov", category: "Sociálne veci", isPro: true, sourceUrl: "https://smer.sk" },
  { partyId: "smer-sd", promiseText: "Odpor voči vojenskej pomoci Ukrajine", category: "Zahraničná politika", isPro: true, sourceUrl: "https://smer.sk" },
  { partyId: "smer-sd", promiseText: "Regulácia cien energií pre domácnosti", category: "Ekonomika", isPro: true, sourceUrl: "https://smer.sk" },
  // TODO: Add more
];

async function seed() {
  // Initialize drizzle with d1-http driver for remote D1
  const db = drizzle({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  });

  // Clear existing and re-seed
  await db.delete(partyPromises);
  await db.insert(partyPromises).values(SEED_DATA);
  console.log(`Seeded ${SEED_DATA.length} party promises`);
}

seed().catch(console.error);
```

- [x] **Step 6: Update PovolebnePlany page to fetch from DB**

In `src/app/povolebne-plany/page.tsx`, change from pure client component to server+client split:

```typescript
import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getAllPartiesWithPromises } from "@/lib/db/party-promises";
import PovolebnePlanyClient from "./PovolebnePlanyClient";

export const revalidate = 86400; // 24h — party programs don't change daily

export const metadata: Metadata = {
  title: "Povolebné plány",
  description: "Prehľad sľubov a programových bodov slovenských politických strán pred parlamentnými voľbami.",
};

export default async function PovolebnePlanyPage() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const partiesWithPromises = await getAllPartiesWithPromises(db).catch(() => []);
  return <PovolebnePlanyClient partiesData={partiesWithPromises} />;
}
```

- [x] **Step 7: Update PovolebnePlanyClient to accept props**

In `src/app/povolebne-plany/PovolebnePlanyClient.tsx`:
- Add `interface Props { partiesData: Array<{ id: string; name: string; promises: Array<{...}> }> }`
- Replace the hardcoded `PARTY_PROGRAMS` constant with `props.partiesData`
- Remove the import of `PS_PROMISES`, `KNK_PROMISES` etc. (data now comes from DB)
- Keep the existing UI rendering logic, just wire it to props

- [x] **Step 8: Verify build passes**

```bash
npm run build
```

- [x] **Step 9: Fill in real party program content**

Open `src/lib/db/seeds/party-programs-seed.ts` and replace the `// TODO:` placeholders with real program data. Research sources:
- PS: https://progresivne.sk/program
- Smer-SD: https://smer.sk/program
- Hlas-SD: https://hlas.sk/program
- KDH: https://kdh.sk/volebny-program
- SaS: https://sas.sk/program
- Republika: https://republika.sk/program
- SNS: https://sns.sk/program
- Demokrati: https://demokrati.sk
- Slovensko: https://slovensko21.sk

Each party: minimum 10 items, minimum 4 categories, include `sourceUrl` for each.

- [x] **Step 10: Fill in real party program content (content task — do before committing)**

Open `src/lib/db/seeds/party-programs-seed.ts` and replace ALL `// TODO:` placeholders with real program data. Research sources:
- PS: https://progresivne.sk/program
- Smer-SD: https://smer.sk/program
- Hlas-SD: https://hlas.sk/program
- KDH: https://kdh.sk/volebny-program
- SaS: https://sas.sk/program
- Republika: https://republika.sk/program
- SNS: https://sns.sk/program
- Demokrati: https://demokrati.sk
- Slovensko: https://slovensko21.sk
- Aliancia: https://aliancia.sk

Each party: minimum 10 items, minimum 4 categories, include `sourceUrl` for each. Block 2–4 hours for this research. **Do not proceed to Step 11 until all parties have ≥10 items.**

- [x] **Step 11: Run seed against production D1**

```bash
npx tsx src/lib/db/seeds/party-programs-seed.ts
```

Expected: `Seeded N party promises` where N ≥ 100 (10 parties × 10 items minimum).

- [x] **Step 12: Commit**

```bash
git add src/lib/db/party-promises.ts src/lib/db/__tests__/party-promises.test.ts src/lib/db/seeds/ src/app/povolebne-plany/
git commit -m "feat: party programs from D1, seed script with real sourced data"
```

---

## Task 7: Admin Panel — Auth Gate

**Files:**
- Create: `src/app/admin/layout.tsx`
- Modify: `.env.example`, `wrangler.jsonc`

- [x] **Step 1: Add ADMIN_SECRET to env**

In `.env.example`, add:
```
# Admin panel
ADMIN_SECRET=change-me-in-production
```

In `wrangler.jsonc`, add to `vars`:
```json
"ADMIN_SECRET": "dev-secret-change-in-production"
```

- [x] **Step 2: Create admin layout with auth gate**

Create `src/app/admin/layout.tsx`:

```typescript
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

interface Props { children: ReactNode }

async function isAuthenticated(): Promise<boolean> {
  // Check for session cookie set by /admin/login
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  return sessionToken === process.env.ADMIN_SECRET;
}

export default async function AdminLayout({ children }: Props) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login");
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-divider">
        <span className="font-serif text-xl font-bold text-ink">Polis Admin</span>
        <a href="/admin/logout" className="text-sm text-muted hover:text-ink">Odhlásiť</a>
      </div>
      {children}
    </div>
  );
}
```

- [x] **Step 3: Create login page**

Create `src/app/admin/login/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError(true);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-32 px-4">
      <h1 className="font-serif text-2xl font-bold text-ink mb-6">Admin prístup</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Admin heslo"
          className="border border-divider px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:border-ink"
        />
        <button type="submit" className="bg-ink text-surface px-4 py-2 text-sm font-semibold hover:opacity-80">
          Prihlásiť
        </button>
        {error && <p className="text-xs text-red-600">Nesprávne heslo.</p>}
      </form>
    </div>
  );
}
```

- [x] **Step 4: Create auth API route**

Create `src/app/api/admin/auth/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { secret } = await req.json().catch(() => ({}));
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return res;
}
```

Create `src/app/admin/logout/route.ts`:

```typescript
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const res = NextResponse.redirect(new URL("/admin/login", origin));
  res.cookies.delete("admin_session");
  return res;
}
```

- [x] **Step 5: Create admin dashboard index**

Create `src/app/admin/page.tsx`:

```typescript
import Link from "next/link";

export default function AdminDashboard() {
  const sections = [
    { href: "/admin/promises", label: "Programové sľuby strán", desc: "Pridať, upraviť, zmazať" },
    { href: "/admin/polls", label: "Manuálne zadanie prieskumu", desc: "Pridať výsledky prieskumu" },
  ];
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-ink mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="block p-5 border border-divider hover:border-ink transition-colors">
            <div className="font-semibold text-ink mb-1">{s.label}</div>
            <div className="text-sm text-muted">{s.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [x] **Step 6: Test login flow manually**

```bash
npm run dev
# Visit http://localhost:3000/admin — should redirect to /admin/login
# Enter "dev-secret-change-in-production" (from wrangler.jsonc vars)
# Should redirect to /admin dashboard
```

- [x] **Step 7: Commit**

```bash
git add src/app/admin/ src/app/api/admin/ .env.example wrangler.jsonc
git commit -m "feat: admin panel auth gate (session cookie, ADMIN_SECRET)"
```

---

## Task 8: Admin Panel — Party Promises CRUD

**Files:**
- Create: `src/app/admin/promises/page.tsx`
- Create: `src/app/api/admin/promises/route.ts`

- [x] **Step 1: Create promises API route (GET + POST + DELETE)**

Create `src/app/api/admin/promises/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { partyPromises } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

function isAdminAuthed(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session")?.value;
  return !!session && session === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const rows = await db.select().from(partyPromises).orderBy(partyPromises.partyId);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.partyId || !body?.promiseText || !body?.category) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  await db.insert(partyPromises).values({
    partyId: body.partyId,
    promiseText: body.promiseText,
    category: body.category,
    isPro: body.isPro ?? true,
    sourceUrl: body.sourceUrl ?? null,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  await db.delete(partyPromises).where(eq(partyPromises.id, id));
  return NextResponse.json({ ok: true });
}
```

- [x] **Step 2: Create admin promises page (list + add form)**

Create `src/app/admin/promises/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { PARTY_LIST } from "@/lib/parties";

interface Promise { id: number; partyId: string; promiseText: string; category: string; isPro: boolean; sourceUrl: string | null }

export default function AdminPromises() {
  const [promises, setPromises] = useState<Promise[]>([]);
  const [form, setForm] = useState({ partyId: "ps", promiseText: "", category: "", isPro: true, sourceUrl: "" });

  async function load() {
    const res = await fetch("/api/admin/promises");
    if (res.ok) setPromises(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/promises", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ partyId: "ps", promiseText: "", category: "", isPro: true, sourceUrl: "" });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Zmazať tento sľub?")) return;
    await fetch("/api/admin/promises", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-ink mb-6">Programové sľuby</h1>

      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 p-4 border border-divider">
        <select value={form.partyId} onChange={e => setForm(f => ({ ...f, partyId: e.target.value }))} className="border border-divider px-2 py-2 text-sm bg-surface">
          {PARTY_LIST.map(p => <option key={p.id} value={p.id}>{p.abbreviation}</option>)}
        </select>
        <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Kategória" className="border border-divider px-2 py-2 text-sm bg-surface" required />
        <textarea value={form.promiseText} onChange={e => setForm(f => ({ ...f, promiseText: e.target.value }))} placeholder="Text sľubu" className="border border-divider px-2 py-2 text-sm bg-surface sm:col-span-2" required />
        <input value={form.sourceUrl} onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))} placeholder="URL zdroja (voliteľné)" className="border border-divider px-2 py-2 text-sm bg-surface sm:col-span-2" />
        <button type="submit" className="bg-ink text-surface px-4 py-2 text-sm font-semibold sm:col-span-2 hover:opacity-80">Pridať sľub</button>
      </form>

      <table className="w-full text-sm border-collapse">
        <thead><tr className="border-b border-divider text-left">
          <th className="py-2 pr-4 font-semibold text-muted text-xs uppercase tracking-wide">Strana</th>
          <th className="py-2 pr-4 font-semibold text-muted text-xs uppercase tracking-wide">Sľub</th>
          <th className="py-2 pr-4 font-semibold text-muted text-xs uppercase tracking-wide">Kategória</th>
          <th className="py-2"></th>
        </tr></thead>
        <tbody>
          {promises.map(p => (
            <tr key={p.id} className="border-b border-divider">
              <td className="py-2 pr-4 font-mono text-xs">{p.partyId}</td>
              <td className="py-2 pr-4">{p.promiseText}</td>
              <td className="py-2 pr-4 text-muted">{p.category}</td>
              <td className="py-2"><button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-700">Zmazať</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [x] **Step 3: Verify page loads and CRUD works**

```bash
npm run dev
# Visit http://localhost:3000/admin/promises
# Add a test promise and verify it appears in the list
# Delete it and verify it's removed
```

- [x] **Step 4: Commit**

```bash
git add src/app/admin/promises/ src/app/api/admin/promises/
git commit -m "feat: admin promises CRUD"
```

---

## Task 9: Admin Panel — Manual Poll Entry

**Files:**
- Create: `src/app/admin/polls/page.tsx`
- Create: `src/app/api/admin/polls/route.ts`

- [x] **Step 1: Create polls admin API**

Create `src/app/api/admin/polls/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { polls, pollResults } from "@/lib/db/schema";

export const runtime = "edge";

function isAdminAuthed(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  // body: { agency, publishedDate, results: Record<partyId, percentage> }
  if (!body?.agency || !body?.publishedDate || !body?.results) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const now = new Date().toISOString();

  const inserted = await db.insert(polls).values({
    agency: body.agency,
    publishedDate: body.publishedDate,
    createdAt: now,
  }).returning({ id: polls.id });

  const pollId = inserted[0].id;
  for (const [partyId, pct] of Object.entries(body.results as Record<string, number>)) {
    await db.insert(pollResults).values({ pollId, partyId, percentage: pct });
  }

  return NextResponse.json({ ok: true, pollId });
}
```

- [x] **Step 2: Create polls admin page**

Create `src/app/admin/polls/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { PARTY_LIST } from "@/lib/parties";

export default function AdminPolls() {
  const [agency, setAgency] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<Record<string, string>>(
    Object.fromEntries(PARTY_LIST.map(p => [p.id, ""]))
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const numericResults = Object.fromEntries(
      Object.entries(results)
        .filter(([, v]) => v !== "" && !isNaN(parseFloat(v)))
        .map(([k, v]) => [k, parseFloat(v)])
    );
    const res = await fetch("/api/admin/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agency, publishedDate: date, results: numericResults }),
    });
    setStatus(res.ok ? "saved" : "error");
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-2xl font-bold text-ink mb-6">Manuálny prieskum</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input value={agency} onChange={e => setAgency(e.target.value)} placeholder="Agentúra (napr. Focus)" required className="border border-divider px-3 py-2 text-sm bg-surface" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="border border-divider px-3 py-2 text-sm bg-surface" />
        <div className="grid grid-cols-2 gap-2">
          {PARTY_LIST.map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <label className="text-xs font-mono w-20 text-muted">{p.abbreviation}</label>
              <input
                type="number" step="0.1" min="0" max="100"
                value={results[p.id]}
                onChange={e => setResults(r => ({ ...r, [p.id]: e.target.value }))}
                placeholder="%"
                className="flex-1 border border-divider px-2 py-1 text-sm bg-surface"
              />
            </div>
          ))}
        </div>
        <button type="submit" disabled={status === "saving"} className="bg-ink text-surface px-4 py-2 text-sm font-semibold hover:opacity-80 disabled:opacity-50">
          {status === "saving" ? "Ukladám..." : "Uložiť prieskum"}
        </button>
        {status === "saved" && <p className="text-sm text-green-700">Prieskum uložený.</p>}
        {status === "error" && <p className="text-sm text-red-600">Chyba. Skúste znova.</p>}
      </form>
    </div>
  );
}
```

- [x] **Step 3: Test manually**

```bash
npm run dev
# Visit http://localhost:3000/admin/polls
# Fill in agency "Focus", pick a date, enter percentages for 3-4 parties
# Submit and check that the homepage /prieskumy shows the new poll
```

- [x] **Step 4: Final build verification**

```bash
npm run build && npm test
```

Expected: build succeeds, all unit tests pass.

- [x] **Step 5: Commit**

```bash
git add src/app/admin/polls/ src/app/api/admin/polls/
git commit -m "feat: admin manual poll entry"
```

---

## Phase 1 Completion Checklist

Before declaring Phase 1 done, verify:

- [x] Newsletter signup works end-to-end (form → D1 row inserted)
- [x] `/newsletter` page exists and is in sitemap
- [x] Homepage news section loads from D1 (not live scraping) — check Network tab, no scraper fetch on page load
- [x] `/povolebne-plany` shows DB-sourced data with ≥10 items per major party
- [x] Seed script ran successfully against production D1
- [x] Admin panel login works with ADMIN_SECRET
- [x] Admin can add/delete party promises
- [x] Admin can manually enter a poll
- [x] `npm run build` succeeds
- [x] `npm test` passes (all existing + new unit tests)
- [x] `npm run test:e2e` passes (includes newsletter signup E2E test)
- [x] Scraper cron is set to hourly in `workers/scraper/wrangler.toml`
- [x] Add `.superpowers/` to `.gitignore` if not already there

---

## Notes for Implementer

- **Cloudflare D1 in dev:** `npm run dev` uses the local D1 emulation via Wrangler. If `getCloudflareContext` fails locally, run `npm run preview` (Wrangler local server) instead.
- **ADMIN_SECRET in production:** Set via Cloudflare Dashboard → Workers → Environment Variables, not in `wrangler.jsonc` (that file is committed).
- **Resend API key:** Not needed for Phase 1 (we only collect emails, we don't send yet). Add Resend integration in Phase 2 when the first newsletter sends.
- **Party programs content:** Task 6 Step 9 requires manual research. Block 2–4 hours for this. It's the most important content task in Phase 1.
- **Do NOT** create `tailwind.config.ts` — this project uses TailwindCSS v4 CSS-based config in `globals.css`.
- **Do NOT** create `middleware.ts` — this project uses `src/proxy.ts` (Next.js 16 proxy convention).
