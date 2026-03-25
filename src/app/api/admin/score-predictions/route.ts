import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { isAdminAuthed } from "@/lib/admin-auth";
import { userPredictions, predictionScores } from "@/lib/db/schema";
import {
  scoreWinnerPick,
  scorePercentage,
  scoreCoalition,
  computeTotalScore,
} from "@/lib/prediction/scoring";

export const runtime = "edge";

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

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const allPredictions = await db.select().from(userPredictions);
  const now = new Date().toISOString();
  let scored = 0;

  // Process in batches of 100
  for (let i = 0; i < allPredictions.length; i += 100) {
    const batch = allPredictions.slice(i, i + 100);

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
  }

  return NextResponse.json({ scored });
}
