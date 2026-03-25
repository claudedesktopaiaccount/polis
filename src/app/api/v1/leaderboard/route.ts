import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { predictionScores, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "edge";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const electionId = req.nextUrl.searchParams.get("electionId");
  if (!electionId) {
    return NextResponse.json(
      { error: "electionId is required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const rows = await db
    .select({
      totalScore: predictionScores.totalScore,
      winnerScore: predictionScores.winnerScore,
      percentageScore: predictionScores.percentageScore,
      coalitionScore: predictionScores.coalitionScore,
      userId: predictionScores.userId,
      displayName: users.displayName,
    })
    .from(predictionScores)
    .leftJoin(users, eq(predictionScores.userId, users.id))
    .where(eq(predictionScores.electionId, electionId))
    .orderBy(desc(predictionScores.totalScore))
    .limit(50);

  const leaderboard = rows.map((row, i) => ({
    rank: i + 1,
    displayName: row.displayName || null,
    userId: row.userId || null,
    totalScore: row.totalScore,
    winnerScore: row.winnerScore,
    percentageScore: row.percentageScore,
    coalitionScore: row.coalitionScore,
  }));

  return NextResponse.json(
    { leaderboard },
    {
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
