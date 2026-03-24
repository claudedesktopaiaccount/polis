import { desc } from "drizzle-orm";
import type { Database } from "./index";
import { newsItems } from "./schema";

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
