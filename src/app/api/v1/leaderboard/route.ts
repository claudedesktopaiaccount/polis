import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { predictionScores, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function GET(req: NextRequest) {
  const electionId = req.nextUrl.searchParams.get("electionId");
  if (!electionId) {
    return NextResponse.json(
      { error: "electionId is required" },
      { status: 400 }
    );
  }

  const db = getDb();

  const rows = await db
    .select({
      totalScore: predictionScores.totalScore,
      winnerScore: predictionScores.winnerScore,
      percentageScore: predictionScores.percentageScore,
      coalitionScore: predictionScores.coalitionScore,
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
    totalScore: row.totalScore,
    winnerScore: row.winnerScore,
    percentageScore: row.percentageScore,
    coalitionScore: row.coalitionScore,
  }));

  return NextResponse.json(
    { leaderboard },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
