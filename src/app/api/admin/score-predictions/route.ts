import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthed } from "@/lib/admin-auth";
import { userPredictions, predictionScores } from "@/lib/db/schema";
import {
  scoreWinnerPick,
  scorePercentage,
  scoreCoalition,
  computeTotalScore,
} from "@/lib/prediction/scoring";
import { asc } from "drizzle-orm";

const PAGE_SIZE = 100;

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    electionId?: string;
    winnerId?: string;
    results?: Record<string, number>;
    coalition?: string[];
  } | null;
  if (!body?.electionId || !body?.winnerId || !body?.results) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { electionId, winnerId, results, coalition } = body;

  const db = getDb();
  const now = new Date().toISOString();
  let scored = 0;
  let offset = 0;

  // Paginate to avoid loading all rows into memory at once
  while (true) {
    const batch = await db
      .select()
      .from(userPredictions)
      .orderBy(asc(userPredictions.id))
      .limit(PAGE_SIZE)
      .offset(offset);

    if (batch.length === 0) break;

    for (const pred of batch) {
      const winner = scoreWinnerPick(pred.partyId, winnerId);
      const pct =
        pred.predictedPct != null && results[pred.partyId] != null
          ? scorePercentage(pred.predictedPct, results[pred.partyId])
          : 0;
      const coal = pred.coalitionPick
        ? scoreCoalition(
            JSON.parse(pred.coalitionPick) as string[],
            coalition || []
          )
        : 0;
      const total = computeTotalScore(winner, pct, coal);

      await db.insert(predictionScores).values({
        userId: pred.userId || null,
        visitorId: pred.visitorId,
        electionId,
        winnerScore: winner,
        percentageScore: pct,
        coalitionScore: coal,
        totalScore: total,
        scoredAt: now,
      });
      scored++;
    }

    if (batch.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return NextResponse.json({ scored });
}
