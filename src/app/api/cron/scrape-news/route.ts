import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { scrapeNews } from "@/lib/scraper/news";
import { upsertNewsItems } from "@/lib/db/news";
import { isCronAuthed } from "@/lib/cron-auth";

export async function GET(req: NextRequest) {
  if (!(await isCronAuthed(req))) {
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
