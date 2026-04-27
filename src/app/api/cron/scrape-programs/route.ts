import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { scrapePartyPrograms } from "@/lib/scraper/programs";
import { extractPromisesFromProgram } from "@/lib/scraper/promise-extractor";
import { upsertPromises } from "@/lib/db/programs";
import { isCronAuthed } from "@/lib/cron-auth";

export async function GET(req: NextRequest) {
  if (!(await isCronAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const programs = await scrapePartyPrograms();

    let promisesExtracted = 0;
    const allPromises = [];
    for (const program of programs) {
      const extracted = extractPromisesFromProgram(program);
      promisesExtracted += extracted.length;
      allPromises.push(...extracted);
    }

    const promisesInserted = await upsertPromises(db, allPromises);

    return NextResponse.json({
      ok: true,
      programsScraped: programs.length,
      promisesExtracted,
      promisesInserted,
    });
  } catch (error) {
    console.error("[cron/scrape-programs] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
