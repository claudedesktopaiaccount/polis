import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { polls, pollResults, parties } from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

export const runtime = "edge";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse limit (default 10, max 50)
    const rawLimit = parseInt(searchParams.get("limit") ?? "10", 10);
    const limit = isNaN(rawLimit) ? 10 : Math.min(Math.max(1, rawLimit), 50);

    // Optional partyId filter
    const partyIdFilter = searchParams.get("partyId");

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    // Fetch polls ordered by date desc
    const pollRows = await db
      .select()
      .from(polls)
      .orderBy(desc(polls.publishedDate))
      .limit(limit);

    if (pollRows.length === 0) {
      return NextResponse.json(
        { polls: [], parties: [], generatedAt: new Date().toISOString() },
        { headers: CORS_HEADERS }
      );
    }

    const pollIds = pollRows.map((p) => p.id);

    // Fetch all results for these polls
    const resultRows = await db
      .select()
      .from(pollResults)
      .where(inArray(pollResults.pollId, pollIds));

    // Fetch parties
    const partyRows = await db.select().from(parties);

    // Filter by partyId if provided
    const filteredParties = partyIdFilter
      ? partyRows.filter((p) => p.id === partyIdFilter)
      : partyRows;

    const validPartyIds = new Set(filteredParties.map((p) => p.id));

    // Build polls response
    const pollsResponse = pollRows.map((poll) => {
      const pollResultsForPoll = resultRows.filter((r) => r.pollId === poll.id);
      const results: Record<string, number> = {};
      for (const r of pollResultsForPoll) {
        if (validPartyIds.has(r.partyId)) {
          results[r.partyId] = r.percentage;
        }
      }
      return {
        id: poll.id,
        agency: poll.agency,
        publishedDate: poll.publishedDate,
        fieldworkStart: poll.fieldworkStart ?? null,
        fieldworkEnd: poll.fieldworkEnd ?? null,
        sampleSize: poll.sampleSize ?? null,
        sourceUrl: poll.sourceUrl ?? null,
        results,
      };
    });

    // Build parties response
    const partiesResponse = filteredParties.map((p) => ({
      id: p.id,
      name: p.name,
      abbreviation: p.abbreviation,
      color: p.color,
    }));

    return NextResponse.json(
      {
        polls: pollsResponse,
        parties: partiesResponse,
        generatedAt: new Date().toISOString(),
      },
      { headers: CORS_HEADERS }
    );
  } catch (e) {
    console.error("GET /api/v1/polls error:", e);
    return NextResponse.json(
      { error: "Interná chyba servera" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
