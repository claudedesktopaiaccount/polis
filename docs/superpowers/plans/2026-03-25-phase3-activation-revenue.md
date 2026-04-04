# Phase 3: Activation & First Revenue — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Turn the Phase 2 audience into engaged, retained, and paying users — weekly newsletter digest, per-user email notifications, API freemium tier with Stripe billing, and real sourced data replacing hardcoded weights in the volebný kalkulátor.

**Architecture:** Three parallel streams after a shared schema task. Stream A (newsletter + notifications) uses Resend API and Cloudflare cron routes. Stream B (API freemium) adds API key management + Stripe Checkout on top of the existing `/api/v1/polls` endpoint. Stream C (kalkulátor) extracts hardcoded question weights to a shared data file, seeds D1, and wires the page to read from the database.

**Tech Stack:** Next.js 16 App Router, TypeScript, Drizzle ORM + Cloudflare D1, TailwindCSS 4, Vitest 4, Resend (email), Stripe (payments), Web Crypto API

---

## Dependency Graph

```
Task 3 (Email infra) ──────────────────────────────────────────── (independent, start immediately)
                      └──> Task 4 (Newsletter cron, needs Task 1) [Stream A]
                      └──> Task 5 (Notifications, needs Task 1)   [Stream A]

Task 1 (Schema) ──┬──> Task 2 (Kalkulátor real data)             [Stream C]
                  ├──> Task 4 (Newsletter cron)                   [Stream A]
                  ├──> Task 5 (Notifications)                     [Stream A]
                  └──> Task 6 (API keys + rate limit) ──> Task 7  [Stream B]
```

**Task 3 is independent** — pure utility functions with no DB. Start it alongside Task 1.
**Tasks 4, 5, 6** all require Task 1. **Task 7** requires Task 6. **Task 2** requires Task 1.

---

## File Map

**New files:**
- `src/lib/kalkulator/questions.ts` — QUESTIONS data extracted from client (pure TS, no React)
- `src/lib/db/kalkulator.ts` — `getKalkulatorWeights(db)`, `upsertKalkulatorWeight(db, row)`
- `src/lib/db/kalkulator.test.ts`
- `scripts/seed-kalkulator.ts` — one-time seeder (run with `npx tsx`)
- `src/lib/email/resend.ts` — thin Resend wrapper: `sendEmail(to, subject, html, text, env)`
- `src/lib/email/digest.ts` — `buildDigestHtml(polls, subscribers)` — newsletter HTML builder
- `src/lib/email/digest.test.ts`
- `src/lib/email/tokens.ts` — `generateUnsubToken(email, secret)`, `verifyUnsubToken(token, email, secret)`
- `src/lib/email/tokens.test.ts`
- `src/lib/api-keys/keys.ts` — `createApiKey(userId, db)`, `lookupApiKey(rawKey, db)`
- `src/lib/api-keys/rate-limit.ts` — `checkAndIncrement(keyId, tier, db)` → `{ allowed: boolean }`
- `src/lib/api-keys/rate-limit.test.ts`
- `src/app/api/cron/newsletter/route.ts` — GET, weekly digest sender
- `src/app/api/cron/notifications/route.ts` — GET, hourly notification sender
- `src/app/api/newsletter/unsubscribe/route.ts` — GET with `?token=&email=`
- `src/app/api/keys/route.ts` — GET (list user's keys), POST (create free key)
- `src/app/api/stripe/checkout/route.ts` — POST, creates Stripe Checkout session
- `src/app/api/stripe/webhook/route.ts` — POST, handles subscription events
- `src/app/api-pristup/page.tsx` — API access landing page (server component)
- `src/app/api-pristup/ApiPristupClient.tsx` — key management UI
- `src/app/admin/kalkulator/page.tsx` — admin stance editor

**Modified files:**
- `src/lib/db/schema.ts` — add 5 tables: kalkulatorWeights, userNotificationPrefs, notificationLog, apiKeys, apiUsage
- `src/app/volebny-kalkulator/VolebnyKalkulatorClient.tsx` — import QUESTIONS from `src/lib/kalkulator/questions.ts` instead of inline
- `src/app/volebny-kalkulator/page.tsx` — fetch weights from D1, reconstruct Question[], pass as prop
- `src/app/profil/ProfilClient.tsx` — add notification prefs section
- `src/app/api/v1/polls/route.ts` — require API key, enforce rate limit
- `src/app/sitemap.ts` — add `/api-pristup`
- `wrangler.jsonc` — add cron triggers, `CRON_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
- `.env.example` — add Stripe + cron vars

---

## Task 1: Database Schema Extension

**Files:**
- Modify: `src/lib/db/schema.ts`
- Generate: `drizzle/XXXX_phase3.sql`

- [x] **Step 1: Add five new tables to schema**

Open `src/lib/db/schema.ts`. After the last existing table, append:

```typescript
// ─── Kalkulator Weights ──────────────────────────────────
// Stores per-answer party weights for volebný kalkulátor.
// questionId: 1-20, answerIndex: 0-2, partyId: e.g. "ps"

export const kalkulatorWeights = sqliteTable(
  "kalkulator_weights",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    questionId: integer("question_id").notNull(),
    answerIndex: integer("answer_index").notNull(),
    partyId: text("party_id").notNull(),
    weight: real("weight").notNull().default(0),
    sourceUrl: text("source_url"),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("kalkulator_q_a_p_unique").on(table.questionId, table.answerIndex, table.partyId),
    index("kalkulator_question_idx").on(table.questionId),
  ]
);

// ─── User Notification Prefs ─────────────────────────────

export const userNotificationPrefs = sqliteTable("user_notification_prefs", {
  userId: text("user_id").primaryKey().references(() => users.id),
  onNewPoll: integer("on_new_poll").notNull().default(0), // 0 | 1
  onScoreChange: integer("on_score_change").notNull().default(0),
  updatedAt: text("updated_at").notNull(),
});

// ─── Notification Log ─────────────────────────────────────
// Tracks sent notifications for rate-limiting (max 1/user/day).

export const notificationLog = sqliteTable(
  "notification_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().references(() => users.id),
    type: text("type").notNull(), // 'new_poll' | 'score_change' | 'digest'
    sentAt: text("sent_at").notNull(),
  },
  (table) => [
    index("notif_log_user_idx").on(table.userId),
    index("notif_log_sent_idx").on(table.sentAt),
  ]
);

// ─── API Keys ─────────────────────────────────────────────

export const apiKeys = sqliteTable(
  "api_keys",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id").references(() => users.id),
    keyHash: text("key_hash").notNull(), // SHA-256 hex of raw key
    tier: text("tier").notNull().default("free"), // 'free' | 'paid'
    stripeSubscriptionId: text("stripe_subscription_id"),
    createdAt: text("created_at").notNull(),
    revokedAt: text("revoked_at"),
  },
  (table) => [
    uniqueIndex("api_keys_hash_unique").on(table.keyHash),
    index("api_keys_user_idx").on(table.userId),
  ]
);

// ─── API Usage ────────────────────────────────────────────
// Tracks daily request count per key for free-tier rate limiting.

export const apiUsage = sqliteTable(
  "api_usage",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    keyId: text("key_id").notNull().references(() => apiKeys.id),
    date: text("date").notNull(), // YYYY-MM-DD UTC
    count: integer("count").notNull().default(0),
  },
  (table) => [
    uniqueIndex("api_usage_key_date_unique").on(table.keyId, table.date),
    index("api_usage_key_idx").on(table.keyId),
  ]
);
```

- [x] **Step 2: Generate migration**

```bash
npm run db:generate
```

Expected: new file created in `drizzle/` e.g. `0004_phase3_tables.sql`.

- [x] **Step 3: Verify migration file**

Open the generated SQL file. Should contain `CREATE TABLE kalkulator_weights`, `CREATE TABLE user_notification_prefs`, `CREATE TABLE notification_log`, `CREATE TABLE api_keys`, `CREATE TABLE api_usage`.

- [x] **Step 4: Apply migration locally**

```bash
npm run db:migrate
```

- [x] **Step 5: Commit**

```bash
git add src/lib/db/schema.ts drizzle/
git commit -m "feat: add kalkulator_weights, notification, api_keys tables for Phase 3"
```

---

## Task 2: Volebný Kalkulátor — Real Data

**Dependency:** Task 1 (kalkulatorWeights table).

**Files:**
- Create: `src/lib/kalkulator/questions.ts`
- Create: `src/lib/db/kalkulator.ts`
- Create: `src/lib/db/kalkulator.test.ts`
- Create: `scripts/seed-kalkulator.ts`
- Create: `src/app/admin/kalkulator/page.tsx`
- Modify: `src/app/volebny-kalkulator/VolebnyKalkulatorClient.tsx`
- Modify: `src/app/volebny-kalkulator/page.tsx`

- [x] **Step 1: Extract QUESTIONS to shared data file**

Create `src/lib/kalkulator/questions.ts`. Cut the entire `QUESTIONS` array and `Question` interface from `VolebnyKalkulatorClient.tsx` and paste here. Add export:

```typescript
export interface Question {
  id: number;
  text: string;
  answers: {
    label: string;
    weights: Record<string, number>;
  }[];
}

export const QUESTIONS: Question[] = [
  // paste the full QUESTIONS array from VolebnyKalkulatorClient.tsx here
  // All 20 questions with their answers and weights
];
```

- [x] **Step 2: Update VolebnyKalkulatorClient to import from shared file**

At the top of `src/app/volebny-kalkulator/VolebnyKalkulatorClient.tsx`, replace the inline `Question` interface and `QUESTIONS` constant with:

```typescript
import { QUESTIONS } from "@/lib/kalkulator/questions";
import type { Question } from "@/lib/kalkulator/questions";
```

- [x] **Step 3: Run build to verify no regressions**

```bash
npm run build
```

Expected: builds cleanly, no type errors.

- [x] **Step 4: Write DB helper tests**

Create `src/lib/db/kalkulator.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getKalkulatorWeights, upsertKalkulatorWeight } from "./kalkulator";

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  onConflictDoUpdate: vi.fn().mockReturnThis(),
  all: vi.fn(),
  run: vi.fn(),
};

describe("getKalkulatorWeights", () => {
  it("returns all weight rows", async () => {
    mockDb.all.mockResolvedValueOnce([
      { questionId: 1, answerIndex: 0, partyId: "ps", weight: 2, sourceUrl: null, updatedAt: "2026-01-01" },
    ]);
    // @ts-expect-error mock db
    const rows = await getKalkulatorWeights(mockDb);
    expect(rows).toHaveLength(1);
    expect(rows[0].partyId).toBe("ps");
  });
});

describe("upsertKalkulatorWeight", () => {
  it("calls insert with correct values", async () => {
    mockDb.run.mockResolvedValueOnce({});
    // @ts-expect-error mock db
    await upsertKalkulatorWeight(mockDb, {
      questionId: 1,
      answerIndex: 0,
      partyId: "ps",
      weight: 2,
      sourceUrl: null,
    });
    expect(mockDb.insert).toHaveBeenCalled();
  });
});
```

- [x] **Step 5: Run tests to verify they fail**

```bash
npm test -- kalkulator.test.ts
```

Expected: FAIL — `getKalkulatorWeights` not defined.

- [x] **Step 6: Implement DB helper**

Create `src/lib/db/kalkulator.ts`:

```typescript
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { kalkulatorWeights } from "./schema";

export type KalkulatorWeightRow = typeof kalkulatorWeights.$inferSelect;

export async function getKalkulatorWeights(
  db: DrizzleD1Database
): Promise<KalkulatorWeightRow[]> {
  return db.select().from(kalkulatorWeights).all();
}

export async function upsertKalkulatorWeight(
  db: DrizzleD1Database,
  row: {
    questionId: number;
    answerIndex: number;
    partyId: string;
    weight: number;
    sourceUrl: string | null;
  }
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .insert(kalkulatorWeights)
    .values({ ...row, updatedAt: now })
    .onConflictDoUpdate({
      target: [
        kalkulatorWeights.questionId,
        kalkulatorWeights.answerIndex,
        kalkulatorWeights.partyId,
      ],
      set: { weight: row.weight, sourceUrl: row.sourceUrl, updatedAt: now },
    })
    .run();
}
```

- [x] **Step 7: Run tests to verify they pass**

```bash
npm test -- kalkulator.test.ts
```

Expected: PASS.

- [x] **Step 8: Write seeder script**

Create `scripts/seed-kalkulator.ts`:

```typescript
/**
 * One-time seeder: populates kalkulator_weights from the QUESTIONS array.
 * Run with: npx tsx scripts/seed-kalkulator.ts
 *
 * Requires env vars: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN
 */
import { QUESTIONS } from "../src/lib/kalkulator/questions";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
const databaseId = process.env.CLOUDFLARE_DATABASE_ID!;
const token = process.env.CLOUDFLARE_D1_TOKEN!;

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
  const json = await res.json();
  if (!json.success) throw new Error(JSON.stringify(json.errors));
  return json;
}

async function main() {
  const now = new Date().toISOString();
  let count = 0;

  for (const question of QUESTIONS) {
    for (let answerIndex = 0; answerIndex < question.answers.length; answerIndex++) {
      const answer = question.answers[answerIndex];
      for (const [partyId, weight] of Object.entries(answer.weights)) {
        await runSql(
          `INSERT INTO kalkulator_weights (question_id, answer_index, party_id, weight, source_url, updated_at)
           VALUES (?, ?, ?, ?, NULL, ?)
           ON CONFLICT(question_id, answer_index, party_id) DO UPDATE SET
             weight = excluded.weight, updated_at = excluded.updated_at`,
          [question.id, answerIndex, partyId, weight, now]
        );
        count++;
      }
    }
  }

  console.log(`Seeded ${count} rows.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [x] **Step 9: Run seeder against local D1**

```bash
npx tsx scripts/seed-kalkulator.ts
```

Expected: `Seeded 600 rows.`

- [x] **Step 10: Update volebny-kalkulator page to read from D1**

Replace `src/app/volebny-kalkulator/page.tsx` with:

```typescript
import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import VolebnyKalkulatorClient from "./VolebnyKalkulatorClient";
import { getKalkulatorWeights } from "@/lib/db/kalkulator";
import { QUESTIONS } from "@/lib/kalkulator/questions";
import type { Question } from "@/lib/kalkulator/questions";

export const revalidate = 86400; // 24h — weights change rarely

export const metadata: Metadata = {
  title: "Koho voliť?",
  description: "Volebný kalkulátor — odpovedzte na 20 otázok a zistite, ktorá slovenská politická strana vám je najbližšia.",
  openGraph: {
    title: "Koho voliť? | Polis",
    description: "Volebný kalkulátor — zistite, ktorá strana vám je najbližšia.",
  },
};

export default async function VolebnyKalkulatorPage() {
  let questions: Question[] = QUESTIONS; // fallback to static data

  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = drizzle(env.DB);
    const rows = await getKalkulatorWeights(db);

    if (rows.length > 0) {
      // Reconstruct Question[] from flat DB rows
      questions = QUESTIONS.map((q) => ({
        ...q,
        answers: q.answers.map((answer, answerIndex) => {
          const weights: Record<string, number> = { ...answer.weights };
          // Override with DB values
          for (const row of rows) {
            if (row.questionId === q.id && row.answerIndex === answerIndex) {
              weights[row.partyId] = row.weight;
            }
          }
          return { ...answer, weights };
        }),
      }));
    }
  } catch {
    // DB unavailable during static build — use static fallback
  }

  return <VolebnyKalkulatorClient questions={questions} />;
}
```

- [x] **Step 11: Update VolebnyKalkulatorClient to accept questions prop**

In `src/app/volebny-kalkulator/VolebnyKalkulatorClient.tsx`, add a props interface and use the prop instead of the module-level constant:

```typescript
interface Props {
  questions?: Question[];
}

export default function VolebnyKalkulatorClient({ questions: questionsProp }: Props) {
  const questions = questionsProp ?? QUESTIONS;
  // replace all references to the module-level QUESTIONS with the local `questions` variable
  ...
}
```

- [x] **Step 12: Create admin kalkulator editor**

Create `src/app/admin/kalkulator/page.tsx`:

```typescript
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getKalkulatorWeights, upsertKalkulatorWeight } from "@/lib/db/kalkulator";
import { QUESTIONS } from "@/lib/kalkulator/questions";
import { redirect } from "next/navigation";

export default async function AdminKalkulatorPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { env } = await getCloudflareContext({ async: true });
  if (!isAdminAuthed(env)) redirect("/admin/login");

  const db = drizzle(env.DB);
  const weights = await getKalkulatorWeights(db);

  // Build lookup: [questionId][answerIndex][partyId] = weight
  const lookup: Record<number, Record<number, Record<string, number>>> = {};
  for (const row of weights) {
    lookup[row.questionId] ??= {};
    lookup[row.questionId][row.answerIndex] ??= {};
    lookup[row.questionId][row.answerIndex][row.partyId] = row.weight;
  }

  async function saveWeights(formData: FormData) {
    "use server";
    const { env: serverEnv } = await getCloudflareContext({ async: true });
    const serverDb = drizzle(serverEnv.DB);
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      // key format: "q{questionId}_a{answerIndex}_{partyId}"
      const match = key.match(/^q(\d+)_a(\d+)_(.+)$/);
      if (!match) continue;
      await upsertKalkulatorWeight(serverDb, {
        questionId: parseInt(match[1]),
        answerIndex: parseInt(match[2]),
        partyId: match[3],
        weight: parseFloat(value as string) || 0,
        sourceUrl: null,
      });
    }
    redirect("/admin/kalkulator?saved=1");
  }

  const partyIds = ["ps", "demokrati", "sas", "kdh", "hlas-sd", "smer-sd", "sns", "republika", "aliancia", "slovensko"];
  const { saved } = await searchParams;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="font-newsreader text-2xl font-bold mb-2">Volebný kalkulátor — váhy</h1>
      {saved && <p className="text-green-700 mb-4">Uložené.</p>}
      <form action={saveWeights}>
        {QUESTIONS.map((q) => (
          <div key={q.id} className="mb-8 border-t border-divider pt-4">
            <p className="font-semibold mb-3">{q.id}. {q.text}</p>
            {q.answers.map((answer, ai) => (
              <div key={ai} className="mb-4">
                <p className="text-sm text-ink/60 mb-1">{answer.label}</p>
                <div className="grid grid-cols-5 gap-2">
                  {partyIds.map((partyId) => (
                    <label key={partyId} className="text-xs">
                      <span className="block text-ink/50 mb-0.5">{partyId}</span>
                      <input
                        type="number"
                        name={`q${q.id}_a${ai}_${partyId}`}
                        step="0.5"
                        min="-2"
                        max="2"
                        defaultValue={lookup[q.id]?.[ai]?.[partyId] ?? answer.weights[partyId] ?? 0}
                        className="w-full border border-divider px-1 py-0.5 text-xs"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
        <button type="submit" className="bg-ink text-surface px-6 py-2 text-sm">
          Uložiť zmeny
        </button>
      </form>
    </div>
  );
}
```

- [x] **Step 13: Run build + tests**

```bash
npm run build && npm test
```

Expected: build succeeds, all tests pass.

- [x] **Step 14: Commit**

```bash
git add src/lib/kalkulator/ src/lib/db/kalkulator.ts src/lib/db/kalkulator.test.ts \
  scripts/seed-kalkulator.ts src/app/volebny-kalkulator/ src/app/admin/kalkulator/
git commit -m "feat: volebny kalkulator reads weights from D1 with admin editor"
```

---

## Task 3: Email Infrastructure (Resend wrapper + templates)

**Dependency:** None (parallel with Tasks 2, 6).

**Files:**
- Create: `src/lib/email/resend.ts`
- Create: `src/lib/email/tokens.ts`
- Create: `src/lib/email/tokens.test.ts`
- Create: `src/lib/email/digest.ts`
- Create: `src/lib/email/digest.test.ts`

- [x] **Step 1: Write token tests**

Create `src/lib/email/tokens.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { generateUnsubToken, verifyUnsubToken } from "./tokens";

const SECRET = "test-secret-key";

describe("generateUnsubToken / verifyUnsubToken", () => {
  it("round-trip: generated token verifies correctly", async () => {
    const token = await generateUnsubToken("user@example.com", SECRET);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);
    const valid = await verifyUnsubToken(token, "user@example.com", SECRET);
    expect(valid).toBe(true);
  });

  it("fails with wrong email", async () => {
    const token = await generateUnsubToken("user@example.com", SECRET);
    const valid = await verifyUnsubToken(token, "other@example.com", SECRET);
    expect(valid).toBe(false);
  });

  it("fails with tampered token", async () => {
    const token = await generateUnsubToken("user@example.com", SECRET);
    const valid = await verifyUnsubToken(token + "x", "user@example.com", SECRET);
    expect(valid).toBe(false);
  });
});
```

- [x] **Step 2: Run token tests to verify they fail**

```bash
npm test -- tokens.test.ts
```

Expected: FAIL — `generateUnsubToken` not defined.

- [x] **Step 3: Implement tokens.ts**

Create `src/lib/email/tokens.ts`:

```typescript
/**
 * HMAC-SHA256 unsubscribe tokens.
 * Format: base64url(hmac) where hmac = HMAC(email, secret)
 * Stateless — no DB lookup required.
 */

async function hmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function generateUnsubToken(email: string, secret: string): Promise<string> {
  return hmac(email.toLowerCase().trim(), secret);
}

export async function verifyUnsubToken(
  token: string,
  email: string,
  secret: string
): Promise<boolean> {
  const expected = await generateUnsubToken(email, secret);
  // Constant-time comparison to prevent timing attacks
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
```

- [x] **Step 4: Run token tests to verify they pass**

```bash
npm test -- tokens.test.ts
```

Expected: PASS.

- [x] **Step 5: Write digest tests**

Create `src/lib/email/digest.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildDigestHtml, buildDigestText } from "./digest";

const mockPolls = [
  { agency: "Focus", publishedDate: "2026-03-20", results: { ps: 24.8, "smer-sd": 21.3 } },
];

describe("buildDigestHtml", () => {
  it("contains agency name", () => {
    const html = buildDigestHtml(mockPolls, "https://polis.sk");
    expect(html).toContain("Focus");
  });

  it("contains poll percentage", () => {
    const html = buildDigestHtml(mockPolls, "https://polis.sk");
    expect(html).toContain("24.8");
  });

  it("contains unsubscribe link placeholder", () => {
    const html = buildDigestHtml(mockPolls, "https://polis.sk");
    expect(html).toContain("unsubscribe");
  });
});

describe("buildDigestText", () => {
  it("returns plain text with agency", () => {
    const text = buildDigestText(mockPolls, "https://polis.sk");
    expect(text).toContain("Focus");
  });
});
```

- [x] **Step 6: Run digest tests to verify they fail**

```bash
npm test -- digest.test.ts
```

Expected: FAIL.

- [x] **Step 7: Implement digest.ts**

Create `src/lib/email/digest.ts`:

```typescript
export interface PollSummary {
  agency: string;
  publishedDate: string;
  results: Record<string, number>;
}

const PARTY_NAMES: Record<string, string> = {
  ps: "Progresívne Slovensko",
  "smer-sd": "SMER-SD",
  "hlas-sd": "HLAS-SD",
  kdh: "KDH",
  sas: "SaS",
  demokrati: "Demokrati",
  sns: "SNS",
  republika: "Republika",
  aliancia: "Aliancia",
  slovensko: "Slovensko",
};

export function buildDigestHtml(polls: PollSummary[], siteUrl: string): string {
  const pollRows = polls
    .slice(0, 5)
    .map(
      (p) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #D6D5CF">${p.agency}</td>
        <td style="padding:8px;border-bottom:1px solid #D6D5CF">${p.publishedDate}</td>
        <td style="padding:8px;border-bottom:1px solid #D6D5CF">
          ${Object.entries(p.results)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([id, pct]) => `${PARTY_NAMES[id] ?? id}: <strong>${pct}%</strong>`)
            .join(" &nbsp;|&nbsp; ")}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="utf-8"><title>Polis Týždenník</title></head>
<body style="font-family:Georgia,serif;background:#F4F3EE;color:#111110;margin:0;padding:0">
  <div style="max-width:600px;margin:40px auto;background:#fff;border:1px solid #D6D5CF;padding:40px">
    <h1 style="font-size:24px;margin:0 0 8px">Polis Týždenník</h1>
    <p style="color:#666;margin:0 0 32px;font-size:13px">Prehľad politického diania za uplynulý týždeň</p>

    <h2 style="font-size:16px;border-bottom:3px solid #111;padding-bottom:8px">Najnovšie prieskumy</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:32px">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;background:#F4F3EE">Agentúra</th>
          <th style="text-align:left;padding:8px;background:#F4F3EE">Dátum</th>
          <th style="text-align:left;padding:8px;background:#F4F3EE">Výsledky</th>
        </tr>
      </thead>
      <tbody>${pollRows}</tbody>
    </table>

    <p style="font-size:13px">
      <a href="${siteUrl}/prieskumy" style="color:#111;font-weight:bold">Zobraziť všetky prieskumy →</a>
    </p>

    <hr style="border:none;border-top:1px solid #D6D5CF;margin:32px 0">
    <p style="font-size:11px;color:#999">
      Dostávate tento email, pretože ste sa prihlásili na odber na <a href="${siteUrl}" style="color:#999">polis.sk</a>.<br>
      <a href="{{UNSUB_URL}}" style="color:#999">Odhlásiť sa z odberu</a>
    </p>
  </div>
</body>
</html>`;
}

export function buildDigestText(polls: PollSummary[], siteUrl: string): string {
  const lines = [
    "POLIS TÝŽDENNÍK",
    "================",
    "",
    "Najnovšie prieskumy:",
    "",
    ...polls.slice(0, 5).map((p) => {
      const top = Object.entries(p.results)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([id, pct]) => `${PARTY_NAMES[id] ?? id}: ${pct}%`)
        .join(", ");
      return `${p.agency} (${p.publishedDate}): ${top}`;
    }),
    "",
    `Všetky prieskumy: ${siteUrl}/prieskumy`,
    "",
    "---",
    "Odhlásiť sa: {{UNSUB_URL}}",
  ];
  return lines.join("\n");
}
```

- [x] **Step 8: Run digest tests to verify they pass**

```bash
npm test -- digest.test.ts
```

Expected: PASS.

- [x] **Step 9: Implement Resend wrapper**

Create `src/lib/email/resend.ts`:

```typescript
/**
 * Thin wrapper around the Resend REST API.
 * Does NOT use the Resend SDK — avoids Node.js dependencies incompatible with Workers.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

interface Env {
  RESEND_API_KEY: string;
}

export async function sendEmail(params: SendEmailParams, env: Env): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from ?? "Polis <newsletter@polis.sk>",
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}
```

- [x] **Step 10: Add RESEND_API_KEY to .env.example if missing**

Open `.env.example`. Add if not already present:

```
RESEND_API_KEY=re_xxxxxxxxxxxx
CRON_SECRET=your-random-secret-here
```

- [x] **Step 11: Commit**

```bash
git add src/lib/email/
git commit -m "feat: email infrastructure — Resend wrapper, digest templates, unsub tokens"
```

---

## Task 4: Newsletter Digest Cron

**Dependency:** Task 1 (schema), Task 3 (email infra).

**Files:**
- Create: `src/app/api/cron/newsletter/route.ts`
- Create: `src/app/api/newsletter/unsubscribe/route.ts`
- Modify: `wrangler.jsonc`

- [x] **Step 1: Create newsletter cron route**

Create `src/app/api/cron/newsletter/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, isNull } from "drizzle-orm";
import { newsletterSubscribers, polls, pollResults } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email/resend";
import { buildDigestHtml, buildDigestText, type PollSummary } from "@/lib/email/digest";
import { generateUnsubToken } from "@/lib/email/tokens";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });

  // Verify cron secret to block external calls
  const secret = req.headers.get("x-cron-secret");
  if (secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = drizzle(env.DB);

  // Fetch active subscribers
  const subscribers = await db
    .select()
    .from(newsletterSubscribers)
    .where(isNull(newsletterSubscribers.unsubscribedAt))
    .all();

  if (subscribers.length === 0) {
    return NextResponse.json({ sent: 0, message: "No active subscribers" });
  }

  // Fetch last 5 polls with results
  const recentPolls = await db
    .select()
    .from(polls)
    .orderBy(polls.publishedDate)
    .limit(5)
    .all();

  const pollSummaries: PollSummary[] = await Promise.all(
    recentPolls.map(async (poll) => {
      const results = await db
        .select()
        .from(pollResults)
        .where(eq(pollResults.pollId, poll.id))
        .all();
      const resultsMap: Record<string, number> = {};
      for (const r of results) resultsMap[r.partyId] = r.percentage;
      return {
        agency: poll.agency,
        publishedDate: poll.publishedDate,
        results: resultsMap,
      };
    })
  );

  const siteUrl = "https://polis.sk";
  let sent = 0;
  let errors = 0;

  for (const subscriber of subscribers) {
    try {
      const unsubToken = await generateUnsubToken(subscriber.email, env.RESEND_API_KEY);
      const unsubUrl = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${unsubToken}`;

      const html = buildDigestHtml(pollSummaries, siteUrl).replace("{{UNSUB_URL}}", unsubUrl);
      const text = buildDigestText(pollSummaries, siteUrl).replace("{{UNSUB_URL}}", unsubUrl);

      await sendEmail(
        {
          to: subscriber.email,
          subject: `Polis Týždenník — ${new Date().toLocaleDateString("sk-SK")}`,
          html,
          text,
        },
        env
      );
      sent++;
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ sent, errors });
}
```

- [x] **Step 2: Create unsubscribe route**

Create `src/app/api/newsletter/unsubscribe/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { newsletterSubscribers } from "@/lib/db/schema";
import { verifyUnsubToken } from "@/lib/email/tokens";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const email = req.nextUrl.searchParams.get("email");
  const token = req.nextUrl.searchParams.get("token");

  if (!email || !token) {
    return new NextResponse("Neplatný odkaz.", { status: 400 });
  }

  const valid = await verifyUnsubToken(token, email, env.RESEND_API_KEY);
  if (!valid) {
    return new NextResponse("Neplatný alebo expirovaný odkaz.", { status: 400 });
  }

  const db = drizzle(env.DB);
  await db
    .update(newsletterSubscribers)
    .set({ unsubscribedAt: new Date().toISOString() })
    .where(eq(newsletterSubscribers.email, email.toLowerCase()))
    .run();

  return new NextResponse(
    `<!DOCTYPE html><html lang="sk"><body style="font-family:Georgia,serif;padding:40px;max-width:600px;margin:auto">
      <h1>Odhlásenie úspešné</h1>
      <p>Vaša adresa <strong>${email}</strong> bola odhlásená z odberu newslettera Polis.</p>
      <p><a href="https://polis.sk">Späť na Polis</a></p>
    </body></html>`,
    { headers: { "Content-Type": "text/html;charset=utf-8" } }
  );
}
```

- [x] **Step 3: Add cron trigger to wrangler.jsonc**

Open `wrangler.jsonc`. Add a `triggers` section (or append to existing):

```jsonc
"triggers": {
  "crons": [
    "0 9 * * 1",   // Monday 9am UTC — weekly newsletter digest → /api/cron/newsletter
    "0 * * * *"    // Every hour — notification check → /api/cron/notifications
  ]
}
```

Also add the env var declarations:

```jsonc
"vars": {
  // ...existing vars...
  "CRON_SECRET": "replace-with-random-secret"
}
```

- [x] **Step 4: Add CRON_SECRET to Cloudflare dashboard**

In the Cloudflare Workers dashboard for this project, add a secret `CRON_SECRET` with a strong random value. This matches `env.CRON_SECRET` used in the cron route.

- [x] **Step 5: Run build**

```bash
npm run build
```

Expected: no errors.

- [x] **Step 6: Commit**

```bash
git add src/app/api/cron/newsletter/ src/app/api/newsletter/ wrangler.jsonc .env.example
git commit -m "feat: weekly newsletter digest cron + unsubscribe endpoint"
```

---

## Task 5: Email Notification Prefs + Cron

**Dependency:** Task 1 (schema), Task 3 (email infra).

**Files:**
- Create: `src/app/api/user/notification-prefs/route.ts`
- Create: `src/app/api/cron/notifications/route.ts`
- Modify: `src/app/profil/ProfilClient.tsx`

- [x] **Step 1: Create notification prefs API**

Create `src/app/api/user/notification-prefs/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { userNotificationPrefs, userSessions } from "@/lib/db/schema";
import { validateSession } from "@/lib/auth/session";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB);
  const sessionToken = req.cookies.get("polis_session")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await validateSession(sessionToken, db);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prefs = await db
    .select()
    .from(userNotificationPrefs)
    .where(eq(userNotificationPrefs.userId, userId))
    .all();

  if (prefs.length === 0) {
    return NextResponse.json({ onNewPoll: false, onScoreChange: false });
  }
  return NextResponse.json({
    onNewPoll: prefs[0].onNewPoll === 1,
    onScoreChange: prefs[0].onScoreChange === 1,
  });
}

export async function POST(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB);
  const sessionToken = req.cookies.get("polis_session")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await validateSession(sessionToken, db);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { onNewPoll: boolean; onScoreChange: boolean };
  const now = new Date().toISOString();

  await db
    .insert(userNotificationPrefs)
    .values({
      userId,
      onNewPoll: body.onNewPoll ? 1 : 0,
      onScoreChange: body.onScoreChange ? 1 : 0,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [userNotificationPrefs.userId],
      set: {
        onNewPoll: body.onNewPoll ? 1 : 0,
        onScoreChange: body.onScoreChange ? 1 : 0,
        updatedAt: now,
      },
    })
    .run();

  return NextResponse.json({ ok: true });
}
```

- [x] **Step 2: Create notification cron route**

Create `src/app/api/cron/notifications/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, gte } from "drizzle-orm";
import {
  polls,
  pollResults,
  userNotificationPrefs,
  notificationLog,
  users,
} from "@/lib/db/schema";
import { sendEmail } from "@/lib/email/resend";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const secret = req.headers.get("x-cron-secret");
  if (secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = drizzle(env.DB);
  const oneDayAgo = new Date(Date.now() - 86400_000).toISOString();
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();

  // Find polls published in the last hour
  const newPolls = await db
    .select()
    .from(polls)
    .where(gte(polls.createdAt, oneHourAgo))
    .all();

  if (newPolls.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no new polls" });
  }

  // Find users opted into new poll notifications
  const optedIn = await db
    .select({ userId: userNotificationPrefs.userId })
    .from(userNotificationPrefs)
    .where(eq(userNotificationPrefs.onNewPoll, 1))
    .all();

  let sent = 0;
  const siteUrl = "https://polis.sk";

  for (const { userId } of optedIn) {
    // Rate limit: max 1 notification/user/day
    const recentLog = await db
      .select()
      .from(notificationLog)
      .where(eq(notificationLog.userId, userId))
      .all();
    const sentToday = recentLog.some((l) => l.sentAt >= oneDayAgo && l.type === "new_poll");
    if (sentToday) continue;

    const [user] = await db
      .select({ email: users.email, displayName: users.displayName })
      .from(users)
      .where(eq(users.id, userId))
      .all();
    if (!user) continue;

    const poll = newPolls[0];
    try {
      await sendEmail(
        {
          to: user.email,
          subject: `Nový prieskum — ${poll.agency}, ${poll.publishedDate}`,
          html: `<p>Bol zverejnený nový prieskum od agentúry <strong>${poll.agency}</strong>.</p>
                 <p><a href="${siteUrl}/prieskumy">Zobraziť prieskumy →</a></p>
                 <p style="font-size:11px;color:#999">Odhlásenie z notifikácií: <a href="${siteUrl}/profil">Váš profil</a></p>`,
          text: `Nový prieskum — ${poll.agency}, ${poll.publishedDate}\n\n${siteUrl}/prieskumy`,
        },
        env
      );

      await db
        .insert(notificationLog)
        .values({ userId, type: "new_poll", sentAt: new Date().toISOString() })
        .run();

      sent++;
    } catch {
      // continue on error
    }
  }

  return NextResponse.json({ sent });
}
```

- [x] **Step 3: Add notification prefs UI to profile page**

In `src/app/profil/ProfilClient.tsx`, add a notification preferences section. Find where the profile content renders and insert after the account info section:

```typescript
// Add to component state
const [notifPrefs, setNotifPrefs] = useState({ onNewPoll: false, onScoreChange: false });
const [notifLoading, setNotifLoading] = useState(true);

// Add to useEffect (after fetching user)
fetch("/api/user/notification-prefs")
  .then((r) => r.json())
  .then((data) => { setNotifPrefs(data); setNotifLoading(false); });

// Add save handler
async function saveNotifPrefs() {
  await fetch("/api/user/notification-prefs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notifPrefs),
  });
}

// Add JSX section
<section className="border-t border-divider pt-6 mt-6">
  <h2 className="font-newsreader text-lg font-semibold mb-4">Emailové notifikácie</h2>
  {notifLoading ? (
    <p className="text-sm text-ink/50">Načítava sa...</p>
  ) : (
    <div className="space-y-3">
      <label className="flex items-center gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={notifPrefs.onNewPoll}
          onChange={(e) => setNotifPrefs({ ...notifPrefs, onNewPoll: e.target.checked })}
        />
        Nový prieskum zverejnený
      </label>
      <label className="flex items-center gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={notifPrefs.onScoreChange}
          onChange={(e) => setNotifPrefs({ ...notifPrefs, onScoreChange: e.target.checked })}
        />
        Zmena skóre vo vašej predikcii
      </label>
      <button
        onClick={saveNotifPrefs}
        className="mt-2 border border-ink px-4 py-1.5 text-sm hover:bg-hover"
      >
        Uložiť
      </button>
    </div>
  )}
</section>
```

- [x] **Step 4: Run build**

```bash
npm run build
```

Expected: no errors.

- [x] **Step 5: Commit**

```bash
git add src/app/api/cron/notifications/ src/app/api/user/ src/app/profil/
git commit -m "feat: email notifications opt-in with hourly cron and profile UI"
```

---

## Task 6: API Key Management + Rate Limiting

**Dependency:** Task 1 (schema).

**Files:**
- Create: `src/lib/api-keys/keys.ts`
- Create: `src/lib/api-keys/rate-limit.ts`
- Create: `src/lib/api-keys/rate-limit.test.ts`
- Create: `src/app/api/keys/route.ts`
- Modify: `src/app/api/v1/polls/route.ts`

- [x] **Step 1: Write rate limit tests**

Create `src/lib/api-keys/rate-limit.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { checkAndIncrement } from "./rate-limit";

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  all: vi.fn(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  onConflictDoUpdate: vi.fn().mockReturnThis(),
  run: vi.fn(),
};

describe("checkAndIncrement", () => {
  it("allows paid tier without count check", async () => {
    // @ts-expect-error mock
    const result = await checkAndIncrement("key-1", "paid", mockDb);
    expect(result.allowed).toBe(true);
    expect(mockDb.select).not.toHaveBeenCalled();
  });

  it("allows free tier under limit", async () => {
    mockDb.all.mockResolvedValueOnce([{ count: 50 }]);
    // @ts-expect-error mock
    const result = await checkAndIncrement("key-1", "free", mockDb);
    expect(result.allowed).toBe(true);
  });

  it("blocks free tier at limit", async () => {
    mockDb.all.mockResolvedValueOnce([{ count: 100 }]);
    // @ts-expect-error mock
    const result = await checkAndIncrement("key-1", "free", mockDb);
    expect(result.allowed).toBe(false);
  });

  it("allows free tier with no usage row yet", async () => {
    mockDb.all.mockResolvedValueOnce([]);
    // @ts-expect-error mock
    const result = await checkAndIncrement("key-1", "free", mockDb);
    expect(result.allowed).toBe(true);
  });
});
```

- [x] **Step 2: Run rate limit tests to verify they fail**

```bash
npm test -- rate-limit.test.ts
```

Expected: FAIL.

- [x] **Step 3: Implement rate-limit.ts**

Create `src/lib/api-keys/rate-limit.ts`:

```typescript
import { and, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { apiUsage } from "@/lib/db/schema";

const FREE_TIER_DAILY_LIMIT = 100;

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function checkAndIncrement(
  keyId: string,
  tier: string,
  db: DrizzleD1Database
): Promise<{ allowed: boolean; remaining?: number }> {
  if (tier === "paid") {
    return { allowed: true };
  }

  const date = todayUtc();
  const rows = await db
    .select({ count: apiUsage.count })
    .from(apiUsage)
    .where(and(eq(apiUsage.keyId, keyId), eq(apiUsage.date, date)))
    .all();

  const current = rows[0]?.count ?? 0;
  if (current >= FREE_TIER_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Upsert: insert or increment count
  await db
    .insert(apiUsage)
    .values({ keyId, date, count: 1 })
    .onConflictDoUpdate({
      target: [apiUsage.keyId, apiUsage.date],
      set: { count: current + 1 },
    })
    .run();

  return { allowed: true, remaining: FREE_TIER_DAILY_LIMIT - current - 1 };
}
```

- [x] **Step 4: Run rate limit tests to verify they pass**

```bash
npm test -- rate-limit.test.ts
```

Expected: PASS.

- [x] **Step 5: Implement keys.ts**

Create `src/lib/api-keys/keys.ts`:

```typescript
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { apiKeys } from "@/lib/db/schema";

export type ApiKeyRecord = typeof apiKeys.$inferSelect;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Creates a new free API key for a user.
 * Returns the raw key (shown once) and the stored record.
 */
export async function createApiKey(
  userId: string,
  db: DrizzleD1Database
): Promise<{ rawKey: string; record: ApiKeyRecord }> {
  const rawKey = `polis_${crypto.randomUUID().replace(/-/g, "")}`;
  const keyHash = await sha256Hex(rawKey);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .insert(apiKeys)
    .values({ id, userId, keyHash, tier: "free", createdAt: now })
    .run();

  const [record] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.id, id))
    .all();

  return { rawKey, record };
}

/**
 * Looks up an API key by raw value. Returns null if not found or revoked.
 */
export async function lookupApiKey(
  rawKey: string,
  db: DrizzleD1Database
): Promise<ApiKeyRecord | null> {
  const keyHash = await sha256Hex(rawKey);
  const rows = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .all();

  if (rows.length === 0 || rows[0].revokedAt !== null) return null;
  return rows[0];
}
```

- [x] **Step 6: Create keys API route**

Create `src/app/api/keys/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { apiKeys } from "@/lib/db/schema";
import { validateSession } from "@/lib/auth/session";
import { createApiKey } from "@/lib/api-keys/keys";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB);
  const sessionToken = req.cookies.get("polis_session")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await validateSession(sessionToken, db);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await db
    .select({
      id: apiKeys.id,
      tier: apiKeys.tier,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .all();

  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB);
  const sessionToken = req.cookies.get("polis_session")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await validateSession(sessionToken, db);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Limit to 3 free keys per user
  const existing = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .all();
  if (existing.filter((k) => !k.revokedAt).length >= 3) {
    return NextResponse.json({ error: "Limit 3 aktívnych kľúčov" }, { status: 400 });
  }

  const { rawKey, record } = await createApiKey(userId, db);

  // Return raw key once — never stored
  return NextResponse.json({ rawKey, id: record.id, tier: record.tier });
}
```

- [x] **Step 7: Protect /api/v1/polls with API key requirement**

Open `src/app/api/v1/polls/route.ts`. At the start of the GET handler, add key validation:

```typescript
import { lookupApiKey } from "@/lib/api-keys/keys";
import { checkAndIncrement } from "@/lib/api-keys/rate-limit";

// Inside GET handler, before existing logic:
const rawKey =
  req.headers.get("authorization")?.replace("Bearer ", "") ??
  req.nextUrl.searchParams.get("key");

if (!rawKey) {
  return NextResponse.json(
    { error: "API kľúč je povinný. Získajte ho na polis.sk/api-pristup" },
    { status: 401 }
  );
}

const { env } = await getCloudflareContext({ async: true });
const db = drizzle(env.DB);
const keyRecord = await lookupApiKey(rawKey, db);

if (!keyRecord) {
  return NextResponse.json({ error: "Neplatný API kľúč" }, { status: 401 });
}

const { allowed, remaining } = await checkAndIncrement(keyRecord.id, keyRecord.tier, db);
if (!allowed) {
  return NextResponse.json(
    { error: "Denný limit 100 požiadaviek vyčerpaný. Prejdite na platenú verziu." },
    { status: 429 }
  );
}

// Add rate limit header to response
// (set headers on the existing response at return time)
```

Also add `X-RateLimit-Remaining` header to the response:

```typescript
const response = NextResponse.json({ polls, parties, generatedAt });
if (remaining !== undefined) {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Limit", "100");
}
return response;
```

- [x] **Step 8: Run build + tests**

```bash
npm run build && npm test
```

Expected: builds cleanly, all tests pass.

- [x] **Step 9: Commit**

```bash
git add src/lib/api-keys/ src/app/api/keys/ src/app/api/v1/polls/
git commit -m "feat: API key management with SHA-256 hashing and free-tier rate limiting"
```

---

## Task 7: Stripe Freemium Tier + API Access Page

**Dependency:** Task 6 (API keys).

**Files:**
- Create: `src/app/api/stripe/checkout/route.ts`
- Create: `src/app/api/stripe/webhook/route.ts`
- Create: `src/app/api-pristup/page.tsx`
- Create: `src/app/api-pristup/ApiPristupClient.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `wrangler.jsonc`
- Modify: `.env.example`

- [x] **Step 1: Add Stripe env vars**

Open `.env.example`, add:

```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxx
```

Open `wrangler.jsonc`, add to `vars`:

```jsonc
"STRIPE_SECRET_KEY": "",
"STRIPE_WEBHOOK_SECRET": "",
"STRIPE_PRICE_ID": ""
```

These must also be set as Cloudflare secrets (`wrangler secret put STRIPE_SECRET_KEY` etc).

- [x] **Step 2: Create Stripe Checkout route**

Create `src/app/api/stripe/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { validateSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB);

  const sessionToken = req.cookies.get("polis_session")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await validateSession(sessionToken, db);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .all();

  const siteUrl = "https://polis.sk";

  // Create Stripe Checkout session via REST (no SDK — Workers compatible)
  const params = new URLSearchParams({
    "line_items[0][price]": env.STRIPE_PRICE_ID,
    "line_items[0][quantity]": "1",
    mode: "subscription",
    success_url: `${siteUrl}/api-pristup?upgraded=1`,
    cancel_url: `${siteUrl}/api-pristup`,
    customer_email: user.email,
    "metadata[userId]": userId,
    "subscription_data[metadata][userId]": userId,
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: "Stripe error", detail: err }, { status: 500 });
  }

  const session = await res.json() as { url: string };
  return NextResponse.json({ url: session.url });
}
```

- [x] **Step 3: Create Stripe webhook route**

Create `src/app/api/stripe/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { apiKeys } from "@/lib/db/schema";

export const runtime = "edge";

async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // Stripe signature: t=timestamp,v1=hash
  const parts = Object.fromEntries(
    signature.split(",").map((p) => p.split("=") as [string, string])
  );
  const timestamp = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp || !v1) return false;

  const signedPayload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expected === v1;
}

export async function POST(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  const valid = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body) as { type: string; data: { object: Record<string, unknown> } };
  const db = drizzle(env.DB);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = (session["metadata"] as Record<string, string>)?.["userId"];
    const subscriptionId = session["subscription"] as string;
    if (userId && subscriptionId) {
      // Upgrade the user's most recently created active key to paid
      const keys = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.userId, userId))
        .all();
      const active = keys.filter((k) => !k.revokedAt).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      if (active.length > 0) {
        await db
          .update(apiKeys)
          .set({ tier: "paid", stripeSubscriptionId: subscriptionId })
          .where(eq(apiKeys.id, active[0].id))
          .run();
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const subscriptionId = sub["id"] as string;
    await db
      .update(apiKeys)
      .set({ tier: "free" })
      .where(eq(apiKeys.stripeSubscriptionId, subscriptionId))
      .run();
  }

  return new NextResponse("ok", { status: 200 });
}
```

- [x] **Step 4: Create API access page (server component)**

Create `src/app/api-pristup/page.tsx`:

```typescript
import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { validateSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { apiKeys } from "@/lib/db/schema";
import { cookies } from "next/headers";
import ApiPristupClient from "./ApiPristupClient";

export const metadata: Metadata = {
  title: "API prístup",
  description: "Získajte prístup k Polis API pre vývojárov, novinárov a výskumníkov.",
};

export default async function ApiPristupPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  let userKeys: typeof apiKeys.$inferSelect[] = [];
  let userId: string | null = null;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = drizzle(env.DB);
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("polis_session")?.value;
    if (sessionToken) {
      userId = await validateSession(sessionToken, db);
      if (userId) {
        userKeys = await db
          .select()
          .from(apiKeys)
          .where(eq(apiKeys.userId, userId))
          .all();
      }
    }
  } catch {
    // static build
  }

  const { upgraded } = await searchParams;
  return (
    <ApiPristupClient
      userKeys={userKeys}
      isLoggedIn={!!userId}
      justUpgraded={upgraded === "1"}
    />
  );
}
```

- [x] **Step 5: Create ApiPristupClient**

Create `src/app/api-pristup/ApiPristupClient.tsx`:

```typescript
"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

interface ApiKey {
  id: string;
  tier: string;
  createdAt: string;
  revokedAt: string | null;
}

interface Props {
  userKeys: ApiKey[];
  isLoggedIn: boolean;
  justUpgraded: boolean;
}

export default function ApiPristupClient({ userKeys, isLoggedIn, justUpgraded }: Props) {
  const [keys, setKeys] = useState(userKeys);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeKeys = keys.filter((k) => !k.revokedAt);

  async function handleCreateKey() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/keys", { method: "POST" });
      const data = await res.json() as { rawKey?: string; error?: string };
      if (!res.ok) { setError(data.error ?? "Chyba"); return; }
      setNewRawKey(data.rawKey!);
      const keysRes = await fetch("/api/keys");
      const keysData = await keysRes.json() as { keys: ApiKey[] };
      setKeys(keysData.keys);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <SectionHeading>API prístup</SectionHeading>

      {justUpgraded && (
        <div className="border border-green-600 bg-green-50 p-4 mb-8 text-sm text-green-800">
          Platba prebehla úspešne. Váš kľúč bol povýšený na platenú verziu.
        </div>
      )}

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="border border-divider p-6">
          <h2 className="font-newsreader text-lg font-bold mb-1">Zadarmo</h2>
          <p className="text-2xl font-bold mb-3">€0</p>
          <ul className="text-sm space-y-1 text-ink/70 mb-4">
            <li>100 požiadaviek / deň</li>
            <li>Prístup k /api/v1/polls</li>
            <li>Bez registrácie platby</li>
          </ul>
        </div>
        <div className="border-2 border-ink p-6">
          <h2 className="font-newsreader text-lg font-bold mb-1">Platené</h2>
          <p className="text-2xl font-bold mb-3">€9 <span className="text-sm font-normal">/mesiac</span></p>
          <ul className="text-sm space-y-1 text-ink/70 mb-4">
            <li>Neobmedzené požiadavky</li>
            <li>Všetky endpointy</li>
            <li>Prioritná podpora</li>
          </ul>
          {isLoggedIn && (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-ink text-surface py-2 text-sm disabled:opacity-50"
            >
              {loading ? "Presmerovanie..." : "Prejsť na platené"}
            </button>
          )}
        </div>
      </div>

      {/* Key management */}
      {isLoggedIn ? (
        <section>
          <h2 className="font-newsreader text-lg font-semibold mb-4">Vaše API kľúče</h2>

          {newRawKey && (
            <div className="border border-ink bg-ink/5 p-4 mb-4 text-sm">
              <p className="font-semibold mb-1">Váš nový kľúč (zobrazí sa iba raz):</p>
              <code className="block font-mono text-xs bg-white border border-divider p-2 break-all">
                {newRawKey}
              </code>
              <p className="text-ink/50 mt-2 text-xs">Uložte si ho — znova ho nebudete môcť zobraziť.</p>
            </div>
          )}

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          {activeKeys.length === 0 ? (
            <p className="text-sm text-ink/60 mb-4">Nemáte žiadne aktívne kľúče.</p>
          ) : (
            <table className="w-full text-sm border-collapse mb-4">
              <thead>
                <tr className="border-b border-divider">
                  <th className="text-left py-2">ID kľúča</th>
                  <th className="text-left py-2">Tier</th>
                  <th className="text-left py-2">Vytvorený</th>
                </tr>
              </thead>
              <tbody>
                {activeKeys.map((k) => (
                  <tr key={k.id} className="border-b border-divider">
                    <td className="py-2 font-mono text-xs text-ink/60">{k.id.slice(0, 8)}…</td>
                    <td className="py-2">
                      <span className={k.tier === "paid" ? "text-green-700 font-semibold" : ""}>
                        {k.tier === "paid" ? "Platené" : "Zadarmo"}
                      </span>
                    </td>
                    <td className="py-2 text-ink/60">{new Date(k.createdAt).toLocaleDateString("sk-SK")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeKeys.length < 3 && (
            <button
              onClick={handleCreateKey}
              disabled={loading}
              className="border border-ink px-4 py-2 text-sm hover:bg-hover disabled:opacity-50"
            >
              {loading ? "Vytvára sa..." : "Vytvoriť nový kľúč"}
            </button>
          )}
        </section>
      ) : (
        <p className="text-sm text-ink/70">
          <a href="/prihlasenie" className="underline">Prihláste sa</a> pre správu API kľúčov.
        </p>
      )}

      {/* Docs */}
      <section className="mt-12 border-t border-divider pt-8">
        <h2 className="font-newsreader text-lg font-semibold mb-4">Dokumentácia</h2>
        <div className="text-sm space-y-4 font-mono">
          <div>
            <p className="font-sans font-semibold mb-1">GET /api/v1/polls</p>
            <code className="block bg-ink text-surface p-3 text-xs">
              curl https://polis.sk/api/v1/polls?key=YOUR_KEY
            </code>
          </div>
          <div>
            <p className="font-sans font-semibold mb-1">Hlavička Authorization (alternatíva)</p>
            <code className="block bg-ink text-surface p-3 text-xs">
              curl -H "Authorization: Bearer YOUR_KEY" https://polis.sk/api/v1/polls
            </code>
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [x] **Step 6: Add /api-pristup to sitemap**

Open `src/app/sitemap.ts`. Add to the routes array:

```typescript
{
  url: `${SITE_URL}/api-pristup`,
  lastModified: new Date(),
  priority: 0.6,
},
```

- [x] **Step 7: Run build + tests**

```bash
npm run build && npm test
```

Expected: all pass.

- [x] **Step 8: Commit**

```bash
git add src/app/api/stripe/ src/app/api-pristup/ src/app/sitemap.ts wrangler.jsonc .env.example
git commit -m "feat: Stripe freemium API tier with Checkout + webhook + api-pristup page"
```

---

## Phase 3 Completion Checklist

Before declaring Phase 3 done, verify:

- [x] `npm run build` succeeds
- [x] `npm test` passes (all existing + new tests)
- [x] Seeder ran: `npx tsx scripts/seed-kalkulator.ts` outputs `Seeded 600 rows`
- [x] Volebný kalkulátor page loads without errors and uses DB weights (check network tab — no inline QUESTIONS data in HTML)
- [x] Admin kalkulator at `/admin/kalkulator` shows grid of questions × answers × parties, saves correctly
- [x] Newsletter cron route returns 200 when called with correct `x-cron-secret` header
- [x] Unsubscribe link marks subscriber as unsubscribed (verify in D1)
- [x] Creating a free API key returns a `polis_...` raw key shown once
- [x] `/api/v1/polls` returns 401 without key, 200 with valid key
- [x] After 100 requests with a free key, returns 429 with helpful error message
- [x] Stripe Checkout redirects to Stripe for a logged-in user
- [x] Webhook endpoint verifies signature and rejects tampered payloads
- [x] `/api-pristup` page renders pricing table + key management for logged-in users
- [x] Notification prefs save and load correctly from profile page
- [x] All new routes added to sitemap

---

## Key Technical Decisions

1. **No Resend SDK** — Used fetch directly against the Resend REST API. The official SDK pulls in Node.js dependencies that crash in Cloudflare Workers runtime.

2. **HMAC unsubscribe tokens** — Stateless, no extra DB table. HMAC(email, RESEND_API_KEY) as the signing key means rotating the key auto-invalidates old links (intentional — broken links prompt re-subscription).

3. **SHA-256 API key hashing** — Raw key shown once, never stored. Same pattern as existing admin auth in `src/lib/admin-auth.ts`.

4. **Stripe REST, not SDK** — Same Workers compatibility reason as Resend. Checkout is creation via `application/x-www-form-urlencoded` POST, webhook signature via `crypto.subtle.sign`.

5. **Kalkulátor DB as overlay** — The static `QUESTIONS` data from `questions.ts` serves as the type skeleton and fallback; DB weights override per `(questionId, answerIndex, partyId)`. This means a partial DB state still produces a working calculator.

6. **Cron routes secured by shared secret** — Cloudflare Workers cron triggers call the route internally, but the routes are publicly accessible. `CRON_SECRET` header blocks external callers from triggering sends.

## Notes for Implementer

- **Do NOT** create `tailwind.config.ts` — project uses TailwindCSS v4 CSS config in `globals.css`
- **Do NOT** create `middleware.ts` — project uses `src/proxy.ts` (Next.js 16)
- Use `getCloudflareContext({ async: true })` for D1 access in all API routes
- All API routes must have `export const runtime = "edge"`
- All UI text in **Slovak**
- Follow editorial design tokens: newsprint colors (`bg-surface`, `text-ink`, `border-divider`), Newsreader font for headings, Inter/system for body, 0px border-radius, no shadows
- Stripe test mode keys start with `sk_test_` — use these in development, switch to `sk_live_` for production
- Create the Stripe product + price in the Stripe dashboard before running Task 7; copy the `price_...` ID into `STRIPE_PRICE_ID`
