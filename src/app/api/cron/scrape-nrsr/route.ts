import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { scrapeMps, scrapeRecentVotes, scrapeRecentSpeeches } from "@/lib/scraper/nrsr";
import { upsertMps, upsertVotes, upsertSpeeches } from "@/lib/db/nrsr";
import { parties } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    // Build party abbreviation → id map
    const allParties = await db
      .select({ id: parties.id, abbreviation: parties.abbreviation })
      .from(parties);

    const partySlugToId: Record<string, string> = {};
    for (const p of allParties) {
      partySlugToId[p.abbreviation.toLowerCase()] = p.id;
    }

    // MPs
    const mpItems = await scrapeMps();
    const mpCount = await upsertMps(db, mpItems, partySlugToId);

    // Votes (last 100)
    const { votes: voteItems, records: recordItems } = await scrapeRecentVotes(100);
    const { votes: voteCount, records: recordCount } = await upsertVotes(db, voteItems, recordItems);

    // Speeches (last 50)
    const speechItems = await scrapeRecentSpeeches(50);
    const speechCount = await upsertSpeeches(db, speechItems);

    return NextResponse.json({
      ok: true,
      mps: { scraped: mpItems.length, upserted: mpCount },
      votes: { scraped: voteItems.length, upserted: voteCount },
      voteRecords: { scraped: recordItems.length, upserted: recordCount },
      speeches: { scraped: speechItems.length, upserted: speechCount },
    });
  } catch (error) {
    console.error("[cron] scrape-nrsr error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
