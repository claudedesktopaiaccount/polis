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
