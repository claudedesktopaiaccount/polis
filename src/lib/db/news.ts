import { desc } from "drizzle-orm";
import type { Database } from "./index";
import { newsItems } from "./schema";

export async function upsertNewsItems(
  db: Database,
  items: Array<{ title: string; url: string; source: string; publishedAt: string }>
): Promise<number> {
  let inserted = 0;
  const now = new Date().toISOString();
  for (const item of items) {
    const result = await db
      .insert(newsItems)
      .values({
        title: item.title,
        url: item.url,
        source: item.source,
        publishedAt: item.publishedAt,
        scrapedAt: now,
      })
      .onConflictDoNothing()
      .returning({ id: newsItems.id });
    if (result.length > 0) inserted++;
  }
  return inserted;
}

export async function getLatestNews(db: Database, limit: number = 10) {
  const raw = await db
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

  // Filter out items with null publishedAt to match NewsItem type
  return raw.filter((item) => item.publishedAt !== null) as Array<{
    id: number;
    title: string;
    url: string;
    source: string;
    publishedAt: string;
    scrapedAt: string;
  }>;
}
