import { drizzle } from "drizzle-orm/d1";

interface Env {
  DB: D1Database;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) {
    const db = drizzle(env.DB);
    console.log(`Scraper cron triggered: ${controller.cron} at ${new Date(controller.scheduledTime).toISOString()}`);
    ctx.waitUntil(scrapeAndStore(db));
  },
};

async function scrapeAndStore(db: ReturnType<typeof drizzle>) {
  // TODO: Phase 3 — implement Wikipedia poll scraper
  // TODO: Phase 3 — implement news headline scrapers
  // TODO: Phase 5 — run prediction engine after scraping
  console.log("Scraper executed — implementation pending");
}
