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

[polis.pages.dev](https://polis.pages.dev) *(replace with actual deployment URL after deploy)*

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
