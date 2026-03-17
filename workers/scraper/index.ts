import { scrapeWikipediaPolls } from "../../src/lib/scraper/wikipedia";
import { scrapeNews } from "../../src/lib/scraper/news";

interface Env {
  DB: D1Database;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runScrape(env));
  },

  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === "/run" && request.method === "POST") {
      await runScrape(env);
      return new Response("Scrape completed", { status: 200 });
    }
    return new Response("Scraper worker", { status: 200 });
  },
};

async function runScrape(env: Env) {
  const now = new Date().toISOString();

  // Scrape Wikipedia polls
  try {
    const polls = await scrapeWikipediaPolls();
    for (const poll of polls) {
      const existing = await env.DB.prepare(
        "SELECT id FROM polls WHERE agency = ? AND published_date = ?"
      )
        .bind(poll.agency, poll.publishedDate)
        .first<{ id: number }>();

      if (existing) continue;

      const result = await env.DB.prepare(
        "INSERT INTO polls (agency, published_date, created_at) VALUES (?, ?, ?)"
      )
        .bind(poll.agency, poll.publishedDate, now)
        .run();

      const pollId = result.meta.last_row_id;

      for (const [partyId, pct] of Object.entries(poll.results)) {
        await env.DB.prepare(
          "INSERT INTO poll_results (poll_id, party_id, percentage) VALUES (?, ?, ?)"
        )
          .bind(pollId, partyId, pct)
          .run();
      }
    }
    console.log(`Scraped ${polls.length} polls from Wikipedia`);
  } catch (e) {
    console.error("Wikipedia scrape failed:", e);
  }

  // Scrape news
  try {
    const news = await scrapeNews();
    for (const item of news) {
      await env.DB.prepare(
        "INSERT OR IGNORE INTO news_items (title, url, source, published_at, scraped_at) VALUES (?, ?, ?, ?, ?)"
      )
        .bind(item.title, item.url, item.source, item.publishedAt, now)
        .run();
    }
    console.log(`Scraped ${news.length} news items`);
  } catch (e) {
    console.error("News scrape failed:", e);
  }
}
