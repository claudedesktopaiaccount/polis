# Go-Live Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all blockers, trust damage, and polish gaps that prevent Polis from being a page someone would enjoy and trust visiting.

**Architecture:** 14 independent tasks grouped by severity. Tasks 1–4 fix silent production failures. Tasks 5–8 fix visible trust damage. Tasks 9–10 add the viral loop. Tasks 11–14 are polish. All tasks are independent — any order works after Task 1 (migration cleanup should go first).

**Tech Stack:** Next.js 16 App Router, TypeScript, TailwindCSS v4, Drizzle ORM + Cloudflare D1, Cloudflare Workers, Vitest, Resend (email), Stripe (payments)

---

## 🔴 Broken in production

### Task 1: Clean up dangling migration file

**Files:**
- Delete: `drizzle/0005_curvy_wild_child.sql`

The migration journal (`drizzle/meta/_journal.json`) tracks `0005_material_skrulls` as the current migration at index 5. `0005_curvy_wild_child.sql` exists on disk but is NOT in the journal — it was never applied or registered. Leaving it risks Drizzle picking it up on the next `db:generate` and creating a conflict.

- [ ] **Step 1: Confirm it's not in the journal**

```bash
cat drizzle/meta/_journal.json | python3 -c "import sys,json; j=json.load(sys.stdin); [print(e['tag']) for e in j['entries']]"
```

Expected output: `0005_curvy_wild_child` does NOT appear.

- [ ] **Step 2: Delete the dangling file**

```bash
rm drizzle/0005_curvy_wild_child.sql
```

- [ ] **Step 3: Verify no other orphan files**

```bash
ls drizzle/*.sql
```

Cross-reference each `.sql` file against the journal output from Step 1. Every file should have a matching journal entry.

- [ ] **Step 4: Commit**

```bash
git add -A drizzle/
git commit -m "chore: remove dangling migration 0005_curvy_wild_child not in journal"
```

---

### Task 2: Configure production Worker secrets

Polis uses three services that require secrets set on the Cloudflare Worker. They are not in `wrangler.jsonc` (correct — secrets are never in config files). They need to be uploaded manually.

**Services affected:**
- Newsletter: `RESEND_API_KEY` — without it, `sendEmail()` in `src/lib/email/resend.ts` throws and no emails are delivered despite subscribers seeing "Prihlásili ste sa"
- Stripe: `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID` — without them, `/api/stripe/checkout` returns 500 for anyone trying to subscribe to API access

- [ ] **Step 1: Obtain Resend API key**

Go to resend.com → API Keys → Create API Key with "Send access" for your sending domain. Copy the key.

- [ ] **Step 2: Set RESEND_API_KEY on the Worker**

```bash
npx wrangler secret put RESEND_API_KEY
```

Paste the key when prompted.

- [ ] **Step 3: Obtain Stripe keys**

Go to dashboard.stripe.com → Developers → API Keys. Copy the **Secret key** (starts with `sk_live_` for production or `sk_test_` for testing).

Go to Products → find or create your API access subscription product → copy the **Price ID** (starts with `price_`).

- [ ] **Step 4: Set Stripe secrets on the Worker**

```bash
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_PRICE_ID
```

- [ ] **Step 5: Update `.env.example` to document all required secrets**

Open `/.env.example` and add these lines if they are missing:

```bash
# Resend (newsletter delivery) — set via: npx wrangler secret put RESEND_API_KEY
RESEND_API_KEY=

# Stripe (API access payments) — set via: npx wrangler secret put STRIPE_SECRET_KEY / STRIPE_PRICE_ID
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

- [ ] **Step 6: Verify .dev.vars is gitignored**

```bash
grep "dev.vars" .gitignore
```

Expected: `.env*` rule covers it. If not, add `.dev.vars` explicitly.

- [ ] **Step 7: Commit .env.example update**

```bash
git add .env.example
git commit -m "docs: document required Worker secrets in .env.example"
```

---

### Task 3: Fix `/api/docs` dead link

`/pre-media` page links to `/api/docs` which returns 404. The API docs should live at a real route.

**Files:**
- Create: `src/app/api-docs/page.tsx`
- Modify: `src/app/pre-media/page.tsx` (update link href)
- Modify: `src/app/sitemap.ts` (add new route)

- [ ] **Step 1: Create `src/app/api-docs/page.tsx`**

```tsx
import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "API Dokumentácia",
  description: "Dokumentácia verejného Polis API pre novinárov a výskumníkov.",
};

export default function ApiDocsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading title="API Dokumentácia" subtitle="Verejné REST API bez autentifikácie" />

      <div className="space-y-8 text-text">
        <section>
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Základná URL</h2>
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 border border-divider font-mono text-sm">
            https://polis.sk/api/v1
          </div>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Endpointy</h2>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 font-mono">GET</span>
                <code className="text-sm font-mono">/api/v1/polls</code>
              </div>
              <p className="text-sm text-text/70 mb-3">Vráti zoznam všetkých volebných prieskumov s výsledkami strán.</p>
              <div className="bg-zinc-100 dark:bg-zinc-800 p-4 border border-divider font-mono text-xs whitespace-pre">{`{
  "polls": [
    {
      "id": 1,
      "agency": "AKO",
      "publishedDate": "2026-03-15",
      "results": {
        "ps": 23.4,
        "smer-sd": 21.1,
        ...
      }
    }
  ]
}`}</div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 font-mono">GET</span>
                <code className="text-sm font-mono">/api/v1/leaderboard</code>
              </div>
              <p className="text-sm text-text/70">Vráti rebríček tipovateľov s celkovým skóre.</p>
            </div>
          </div>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Podmienky použitia</h2>
          <p className="text-sm">
            API je bezplatné pre novinárov, výskumníkov a vývojárov. Prosíme o uvedenie zdroja{" "}
            <strong>polis.sk</strong> pri publikovaní. Pre komerčné použitie nás kontaktujte na{" "}
            <a href="mailto:redakcia@polis.sk" className="text-ink underline underline-offset-2">
              redakcia@polis.sk
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Fix the dead link in `/pre-media`**

In `src/app/pre-media/page.tsx`, find:
```tsx
<a href="/api/docs" className="text-ink underline underline-offset-2 hover:text-text transition-colors">
  stránke dokumentácie API
</a>
```

Replace with:
```tsx
<a href="/api-docs" className="text-ink underline underline-offset-2 hover:text-text transition-colors">
  stránke dokumentácie API
</a>
```

- [ ] **Step 3: Add to sitemap**

In `src/app/sitemap.ts`, add `"/api-docs"` to the routes array alongside the other static pages.

- [ ] **Step 4: Verify locally**

```bash
npm run dev
```

Visit `http://localhost:3000/api-docs`. Confirm page renders, no 404.
Visit `http://localhost:3000/pre-media`. Click "stránke dokumentácie API" link, confirm it lands on the new page.

- [ ] **Step 5: Commit**

```bash
git add src/app/api-docs/page.tsx src/app/pre-media/page.tsx src/app/sitemap.ts
git commit -m "feat: add /api-docs page and fix dead link from /pre-media"
```

---

## 🟡 Visible trust damage

### Task 4: Fix leaderboard empty state

`LeaderboardPreview` renders an empty list when there are no scored users yet. Looks like a broken component. Should show a friendly empty state instead.

**Files:**
- Modify: `src/components/LeaderboardPreview.tsx`

- [ ] **Step 1: Write failing test**

In `src/components/__tests__/LeaderboardPreview.test.tsx` (create if it doesn't exist):

```tsx
import { render, screen } from "@testing-library/react";
import LeaderboardPreview from "../LeaderboardPreview";

describe("LeaderboardPreview", () => {
  it("shows empty state when entries is empty", () => {
    render(<LeaderboardPreview entries={[]} />);
    expect(screen.getByText(/Zatiaľ žiadni hráči/i)).toBeInTheDocument();
  });

  it("renders entries when present", () => {
    render(
      <LeaderboardPreview
        entries={[{ rank: 1, displayName: "Testér", totalScore: 42 }]}
      />
    );
    expect(screen.getByText("Testér")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- LeaderboardPreview
```

Expected: FAIL — "Unable to find an element with the text: Zatiaľ žiadni hráči"

- [ ] **Step 3: Add empty state to component**

In `src/components/LeaderboardPreview.tsx`, after the `<p className="micro-label mb-2">` line and before `<div className="space-y-1 text-xs">`, add a guard:

```tsx
export default function LeaderboardPreview({ entries }: LeaderboardPreviewProps) {
  return (
    <div className="border-b border-divider p-4">
      <p className="micro-label mb-2">Rebríček · Top 5</p>
      {entries.length === 0 ? (
        <p className="text-xs text-text/40 py-2">Zatiaľ žiadni hráči. Buď prvý!</p>
      ) : (
        <div className="space-y-1 text-xs">
          {entries.slice(0, 5).map((e) => (
            <div key={e.rank} className="flex justify-between py-1 border-b border-divider/50 last:border-0">
              <span>
                {e.rank <= 3 ? RANK_MEDALS[e.rank - 1] : `${e.rank}.`}{" "}
                {e.displayName}
              </span>
              <span className="data-value font-bold">{e.totalScore}</span>
            </div>
          ))}
        </div>
      )}
      <Link href="/tipovanie" className="block text-xs text-info mt-2 hover:underline">
        Zobraziť celý rebríček →
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- LeaderboardPreview
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/LeaderboardPreview.tsx src/components/__tests__/LeaderboardPreview.test.tsx
git commit -m "fix: show empty state in LeaderboardPreview when no scored users yet"
```

---

### Task 5: Add electoral calculator disclaimer

The volebný kalkulátor produces party matches based on hardcoded editorial weights — not derived from actual party manifestos. This is fine, but a politically-engaged user who notices it without any disclaimer will feel deceived. A single honest sentence fixes this.

**Files:**
- Modify: `src/app/volebny-kalkulator/page.tsx` (add subtitle text)

- [ ] **Step 1: Open the page and find the SectionHeading**

In `src/app/volebny-kalkulator/page.tsx`, find the `<SectionHeading>` call.

- [ ] **Step 2: Update the subtitle**

Change the subtitle to include a disclaimer. Find the current subtitle text and replace it:

```tsx
<SectionHeading
  title="Volebný kalkulátor"
  subtitle="20 otázok · 2 minúty · Váhy strán sú redakčné odhady, nie z oficiálnych programov"
/>
```

If the `SectionHeading` component only accepts a `subtitle` prop as a string, this text is sufficient. If you need to add a separate disclaimer line below the heading, add this directly after the `<SectionHeading>` component:

```tsx
<p className="text-xs text-text/40 mt-1 mb-6">
  Zarovnanie strán je vypočítané na základe redakčných odhadov pozícií strán, nie z ich oficálnych volebných programov.
</p>
```

- [ ] **Step 3: Verify locally**

```bash
npm run dev
```

Visit `http://localhost:3000/volebny-kalkulator`. Confirm the disclaimer is visible before starting the quiz.

- [ ] **Step 4: Commit**

```bash
git add src/app/volebny-kalkulator/page.tsx
git commit -m "fix: add editorial disclaimer to volebny kalkulator"
```

---

### Task 6: Fix thin data on Povolebné plány

The page currently shows:
- PS: real content (PS_PROMISES + KNK_PROMISES from `src/lib/ps-promises.ts`)
- Smer: 5 generic bullet points
- Hlas: 3 generic bullet points
- Most other parties: similarly sparse

Options: fill the data, or add an honest "data coming" notice. This task does the latter — marks stub-only parties clearly so visitors understand the page is a work in progress, not broken.

**Files:**
- Modify: `src/app/povolebne-plany/PovolebnePlanyClient.tsx`

The `PARTY_PROGRAMS` constant in that file has hardcoded stub data for most parties. Parties with only generic filler (Smer, Hlas, KDH, etc.) need an `isStub: true` flag so the UI can render a "Programové body sa dopĺňajú" notice instead of pretending the data is real.

- [ ] **Step 1: Add `isStub` flag to stub programs**

In `src/app/povolebne-plany/PovolebnePlanyClient.tsx`, update the `ProgramData` interface and all stub entries:

```tsx
interface ProgramData {
  name: string;
  promises: PartyPromise[];
  isStub?: boolean;
}
```

Then mark all parties with placeholder data:

```tsx
"smer-sd": [{ name: "", promises: [...], isStub: true }],
"hlas-sd": [{ name: "", promises: [...], isStub: true }],
"kdh":     [{ name: "", promises: [...], isStub: true }],
// ... repeat for all parties that have fewer than 10 real promises
```

PS stays without `isStub` since it has real content.

- [ ] **Step 2: Add stub notice in the render**

Find where each party's promises are rendered. After the program name / before the promise list, add:

```tsx
{program.isStub && (
  <div className="border border-divider bg-hover px-4 py-3 mb-4">
    <p className="text-xs text-text/50">
      Programové body tejto strany sa dopĺňajú. Vráťte sa neskôr.
    </p>
  </div>
)}
```

- [ ] **Step 3: Verify locally**

```bash
npm run dev
```

Visit `http://localhost:3000/povolebne-plany`. Confirm stub parties show the notice. PS should not show it.

- [ ] **Step 4: Commit**

```bash
git add src/app/povolebne-plany/PovolebnePlanyClient.tsx
git commit -m "fix: mark stub party programs with honest 'coming soon' notice"
```

---

### Task 7: Add impressum page

Required by EU law (Telemediengesetz / Slovak eCommerce Act §5): the operator of a website must publish their name, address, and contact information. Absence is a legal gap and damages trust with journalists/researchers.

**Files:**
- Create: `src/app/impressum/page.tsx`
- Modify: `src/app/podmienky/page.tsx` or layout footer — add link to `/impressum`
- Modify: `src/app/sitemap.ts` — add `/impressum`

- [ ] **Step 1: Create `src/app/impressum/page.tsx`**

Fill in the actual operator details (name/address/contact). Replace the placeholder values:

```tsx
import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Informácie o prevádzkovateľovi stránky Polis podľa §5 zákona o elektronickom obchode.",
};

export default function ImpressumPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading title="Impressum" subtitle="Informácie o prevádzkovateľovi" />

      <div className="space-y-6 text-text text-sm">
        <section>
          <h2 className="font-serif text-base font-bold text-ink mb-2">Prevádzkovateľ</h2>
          <p>[Meno a priezvisko / Názov spoločnosti]</p>
          <p>[Adresa]</p>
          <p>[Mesto, PSČ]</p>
          <p>Slovenská republika</p>
        </section>

        <section>
          <h2 className="font-serif text-base font-bold text-ink mb-2">Kontakt</h2>
          <p>
            E-mail:{" "}
            <a href="mailto:redakcia@polis.sk" className="text-ink underline underline-offset-2">
              redakcia@polis.sk
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-base font-bold text-ink mb-2">Obsah</h2>
          <p className="text-text/70">
            Polis je nezávislý agregátor volebných prieskumov a predikcií. Stránka nie je
            napojená na žiadnu politickú stranu ani iné záujmové skupiny. Dáta pochádzajú z
            verejne dostupných prieskumov zverejnených na Wikipédii a od agentúr.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-base font-bold text-ink mb-2">Zodpovednosť za obsah</h2>
          <p className="text-text/70">
            Predikcie a simulácie na tejto stránke sú štatistické modely určené na informačné
            účely a nepredstavujú volebné výsledky. Prevádzkovateľ nezodpovedá za prípadné
            nepresnosti v dátach tretích strán.
          </p>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add impressum link to the footer**

Find the footer in the root layout (`src/app/layout.tsx`) or a `Footer` component. Add:

```tsx
<Link href="/impressum" className="text-xs text-text/40 hover:text-text/60 transition-colors">
  Impressum
</Link>
```

Place it next to existing legal links (Súkromie, Podmienky).

- [ ] **Step 3: Add to sitemap**

In `src/app/sitemap.ts`, add `"/impressum"` to the routes array.

- [ ] **Step 4: Verify locally**

```bash
npm run dev
```

Visit `http://localhost:3000/impressum`. Confirm page renders with operator details. Confirm footer link is present.

- [ ] **Step 5: Commit**

```bash
git add src/app/impressum/page.tsx src/app/layout.tsx src/app/sitemap.ts
git commit -m "feat: add impressum page with operator information"
```

---

## 🟠 Missing viral loop

### Task 8: Wire up quiz share button

The share card API already exists at `/api/share/quiz?party=...&score=...&color=...` and returns an SVG image. There is no share button in the UI. This is the single highest-leverage growth action — a personalized result card is the most shareable thing on the site.

**Files:**
- Modify: `src/app/volebny-kalkulator/VolebnyKalkulatorClient.tsx`

- [ ] **Step 1: Add share handler to the results section**

In `VolebnyKalkulatorClient.tsx`, find the results block (the `if (showResults)` branch, around line 65). After the top-match card and before the full results table, add a share button:

```tsx
{/* Share button */}
<div className="flex justify-center mb-6">
  <button
    onClick={() => {
      const url = `/api/share/quiz?party=${encodeURIComponent(top.party?.name ?? "")}&score=${top.score}&color=${encodeURIComponent(top.party?.color ?? "#111110")}`;
      const shareText = `Môj výsledok volebnej kalkulačky: ${top.score}% zhoda s ${top.party?.name} — polis.sk`;
      if (navigator.share) {
        navigator.share({ title: "Volebný kalkulátor · Polis", text: shareText, url: `https://polis.sk/volebny-kalkulator` })
          .catch(() => {/* user cancelled */});
      } else {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, "_blank", "noopener");
      }
    }}
    className="flex items-center gap-2 border border-divider bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:bg-hover transition-colors"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
    Zdieľať môj výsledok
  </button>
</div>
```

- [ ] **Step 2: Verify locally**

```bash
npm run dev
```

Complete the quiz at `http://localhost:3000/volebny-kalkulator`. On the results screen, confirm the "Zdieľať môj výsledok" button appears below the top match card. Click it:
- On mobile: verify native share sheet opens
- On desktop: verify Twitter intent URL opens in new tab with correct party name and score

- [ ] **Step 3: Commit**

```bash
git add src/app/volebny-kalkulator/VolebnyKalkulatorClient.tsx
git commit -m "feat: add share button to volebny kalkulator results"
```

---

## 🟢 Polish

### Task 9: Add cookie policy page

The GDPR banner exists and links to the privacy policy. But there is no page specifically listing all cookies and their purpose. Polis sets 6 cookies: `polis_session`, `pt_visitor`, `pt_csrf`, `polis_engaged`, `polis_score`, `polis_theme`. GDPR requires this list to be accessible.

**Files:**
- Create: `src/app/cookies/page.tsx`
- Modify: `src/components/GdprBanner.tsx` — add link to `/cookies`
- Modify: `src/app/sitemap.ts` — add `/cookies`

- [ ] **Step 1: Create `src/app/cookies/page.tsx`**

```tsx
import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Prehľad cookies používaných na stránke Polis.",
};

export default function CookiesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading title="Zásady cookies" subtitle="Aké cookies používame a prečo" />

      <div className="text-sm text-text space-y-6">
        <p>
          Polis používa nasledujúce cookies. Funkčné cookies sú nevyhnutné na prevádzku stránky
          a nemožno ich vypnúť. Analytické cookies sú voliteľné a aktivujú sa len s vaším súhlasom.
        </p>

        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="text-left py-2 pr-4 font-semibold text-ink">Cookie</th>
              <th className="text-left py-2 pr-4 font-semibold text-ink">Účel</th>
              <th className="text-left py-2 pr-4 font-semibold text-ink">Platnosť</th>
              <th className="text-left py-2 font-semibold text-ink">Typ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            <tr>
              <td className="py-2 pr-4 font-mono">polis_session</td>
              <td className="py-2 pr-4 text-text/70">Prihlásenie — identifikácia prihláseného používateľa</td>
              <td className="py-2 pr-4 text-text/70">7 dní</td>
              <td className="py-2 text-text/70">Funkčné</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">pt_visitor</td>
              <td className="py-2 pr-4 text-text/70">Tipovanie — anonymná identifikácia pre detekciu duplicitných tipov</td>
              <td className="py-2 pr-4 text-text/70">1 rok</td>
              <td className="py-2 text-text/70">Funkčné</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">pt_csrf</td>
              <td className="py-2 pr-4 text-text/70">Bezpečnosť — ochrana formulárov pred CSRF útokmi</td>
              <td className="py-2 pr-4 text-text/70">Relácia</td>
              <td className="py-2 text-text/70">Funkčné</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">polis_engaged</td>
              <td className="py-2 pr-4 text-text/70">UI — pamätá si, či ste prešli úvodnou obrazovkou</td>
              <td className="py-2 pr-4 text-text/70">1 rok</td>
              <td className="py-2 text-text/70">Funkčné</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">polis_score</td>
              <td className="py-2 pr-4 text-text/70">Tipovanie — cachuje vaše skóre pre zobrazenie v navigácii</td>
              <td className="py-2 pr-4 text-text/70">7 dní</td>
              <td className="py-2 text-text/70">Funkčné</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">polis_theme</td>
              <td className="py-2 pr-4 text-text/70">UI — pamätá si vašu voľbu svetlého/tmavého režimu</td>
              <td className="py-2 pr-4 text-text/70">1 rok</td>
              <td className="py-2 text-text/70">Funkčné</td>
            </tr>
          </tbody>
        </table>

        <section>
          <h2 className="font-serif text-base font-bold text-ink mb-2">Ako odmietnuť cookies</h2>
          <p className="text-text/70">
            Analytické cookies (Umami) môžete odmietnuť cez banner pri prvej návšteve alebo kedykoľvek
            v nastaveniach súhlasu na stránke{" "}
            <a href="/sukromie" className="text-ink underline underline-offset-2">Súkromie</a>.
            Funkčné cookies nie je možné vypnúť — sú nevyhnutné na základnú prevádzku stránky.
          </p>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add link in GDPR banner**

In `src/components/GdprBanner.tsx`, add a "Viac o cookies" link:

```tsx
<a href="/cookies" className="underline text-text/70 hover:text-text transition-colors">
  Viac o cookies
</a>
```

Place it in the banner description text, near the existing privacy policy link.

- [ ] **Step 3: Add to sitemap**

In `src/app/sitemap.ts`, add `"/cookies"`.

- [ ] **Step 4: Verify locally**

```bash
npm run dev
```

Visit `http://localhost:3000/cookies`. Confirm all 6 cookies are listed. Confirm the GDPR banner shows the "Viac o cookies" link.

- [ ] **Step 5: Commit**

```bash
git add src/app/cookies/page.tsx src/components/GdprBanner.tsx src/app/sitemap.ts
git commit -m "feat: add cookie policy page and link from GDPR banner"
```

---

### Task 10: Cache news to D1

Currently `getLatestNews()` scrapes fresh on every request. If scraping fails or is slow, the homepage news section is blank or delayed. News should be persisted to D1 by the hourly cron and served from the database.

**Context:** The cron infrastructure already runs at `0 * * * *` (every hour) per `wrangler.jsonc`. There is already a `news_items` table in the schema and `getLatestNews(db)` in `src/lib/db/news.ts`. The homepage already calls `getLatestNews(db, 10)`. The gap is: news is not being written to D1 by the cron.

**Files:**
- Read first: `src/lib/db/news.ts` — understand `getLatestNews` and find/create `upsertNews`
- Read first: `src/app/api/cron/[...route]/route.ts` or equivalent cron handler — find where the hourly cron dispatches work
- Modify: cron handler to also scrape + persist news

- [ ] **Step 1: Read the cron handler**

Find the Cloudflare cron handler. It will be in `src/app/api/cron/` or the worker entry. Read it to understand what runs on the hourly cron tick.

```bash
find src -name "*.ts" | xargs grep -l "scheduled\|cron" | head -10
```

- [ ] **Step 2: Read `src/lib/db/news.ts`**

Check if an `upsertNews` / `saveNews` function already exists. If it does, use it in Step 4. If not, you'll add one.

- [ ] **Step 3: Add `upsertNews` if it doesn't exist**

In `src/lib/db/news.ts`, add:

```ts
export async function upsertNewsItems(
  db: DrizzleD1Database,
  items: Array<{ title: string; url: string; source: string; publishedAt: string; summary?: string }>
): Promise<void> {
  for (const item of items) {
    await db
      .insert(newsItems)
      .values({
        title: item.title,
        url: item.url,
        source: item.source,
        publishedAt: item.publishedAt,
        summary: item.summary ?? null,
        createdAt: new Date().toISOString(),
      })
      .onConflictDoNothing(); // url is unique — skip duplicates
  }
}
```

Adjust field names to match the actual `news_items` schema in `src/lib/db/schema.ts`.

- [ ] **Step 4: Wire scraping into the hourly cron**

In the cron handler, import and call the news scraper followed by `upsertNewsItems`. The scraper is at `src/lib/scraper/` — find the news scraping function (likely `scrapeNews()` or similar).

Add after existing cron work:

```ts
try {
  const freshNews = await scrapeNews();
  await upsertNewsItems(db, freshNews);
} catch (err) {
  console.error("News scrape/persist error:", err);
  // non-fatal — cron continues
}
```

- [ ] **Step 5: Verify the homepage reads from DB**

The homepage already calls `getLatestNews(db, 10)` — once news is in D1, it will be served from there. Confirm `getLatestNews` queries the `news_items` table (read the function if unsure).

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/news.ts src/app/api/cron/
git commit -m "feat: persist news to D1 via hourly cron instead of scraping per-request"
```

---

### Task 11: Update README

The README is still the default `create-next-app` scaffold. Any developer or journalist who looks at the repo sees placeholder content, which undermines credibility.

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README content**

```markdown
# Polis

Nezávislý agregátor volebných prieskumov a predikcií slovenských parlamentných volieb.

**Live:** https://polis.sk

## Čo Polis robí

- Agreguje volebné prieskumy z Wikipedie (automatický scraper)
- Monte Carlo simulácia rozdelenia mandátov (10 000 iterácií)
- D'Hondt alokátor mandátov
- Koaličný simulátor
- Volebný kalkulátor (20 otázok)
- Crowd predictions (tipovanie) s D1 perzistenciou
- AI naratívny komentár (Claude API)
- Newsletter (Resend)
- GDPR-compliant s consent management

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** TailwindCSS v4 (CSS-based config, nie tailwind.config.ts)
- **Charts:** Recharts 3
- **Database:** Cloudflare D1 (SQLite) via Drizzle ORM
- **Deployment:** Cloudflare Workers via @opennextjs/cloudflare
- **Email:** Resend
- **Payments:** Stripe
- **Analytics:** Umami Cloud (GDPR consent-gated)

## Lokálny vývoj

```bash
npm install
npm run dev          # Next.js dev server → http://localhost:3000
npm run preview      # Cloudflare Workers preview (wrangler)
```

## Databáza

```bash
npm run db:generate  # Generuj Drizzle migrácie
npm run db:migrate   # Aplikuj migrácie na D1
npm run db:push      # Push schémy priamo (dev)
```

## Testy

```bash
npm test             # Vitest unit testy
npm run test:e2e     # Playwright E2E testy
```

## Potrebné Worker secrets

Nastav pred deploymentom:

```bash
npx wrangler secret put ADMIN_SECRET
npx wrangler secret put CRON_SECRET
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_PRICE_ID
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

Lokálny vývoj: skopíruj `.env.example` do `.dev.vars` a doplň hodnoty.

## Licencia

Súkromný projekt. Všetky práva vyhradené.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: replace default create-next-app README with Polis documentation"
```

---

## Execution order summary

| # | Task | Severity | Est. complexity |
|---|------|----------|-----------------|
| 1 | Clean up dangling migration | 🔴 Blocker | 5 min |
| 2 | Configure production secrets | 🔴 Blocker | 15 min (manual) |
| 3 | Fix /api/docs dead link | 🔴 Blocker | 20 min |
| 4 | Leaderboard empty state | 🟡 Trust | 15 min |
| 5 | Electoral calculator disclaimer | 🟡 Trust | 5 min |
| 6 | Plány thin data notice | 🟡 Trust | 20 min |
| 7 | Impressum page | 🟡 Trust | 25 min |
| 8 | Quiz share button | 🟠 Growth | 20 min |
| 9 | Cookie policy page | 🟢 Polish | 25 min |
| 10 | News caching to D1 | 🟢 Polish | 30 min |
| 11 | README update | 🟢 Polish | 10 min |
