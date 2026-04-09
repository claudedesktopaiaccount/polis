import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { scrapeNews } from "@/lib/scraper/news";
import { upsertNewsItems } from "@/lib/db/news";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const items = await scrapeNews();
    const inserted = await upsertNewsItems(db, items);
    return NextResponse.json({ ok: true, scraped: items.length, inserted });
  } catch (error) {
    console.error("News scrape error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
