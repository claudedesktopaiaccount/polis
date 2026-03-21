import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { userPredictions, crowdAggregates } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    // CSRF validation
    const csrfCookie = request.cookies.get("pt_csrf")?.value;
    const csrfHeader = request.headers.get("x-csrf-token");
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
    }

    const visitorId = request.cookies.get("pt_visitor")?.value;
    if (!visitorId) {
      return NextResponse.json({ error: "No visitor data found" }, { status: 404 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    // Find affected parties before deletion
    const votes = await db
      .select({ partyId: userPredictions.partyId })
      .from(userPredictions)
      .where(eq(userPredictions.visitorId, visitorId));

    // Delete votes first (idempotent — safe if process crashes and retries)
    await db
      .delete(userPredictions)
      .where(eq(userPredictions.visitorId, visitorId));

    // Recompute aggregates from remaining data (crash-safe)
    for (const vote of votes) {
      const result = await db
        .select({ c: count() })
        .from(userPredictions)
        .where(eq(userPredictions.partyId, vote.partyId));

      await db
        .update(crowdAggregates)
        .set({
          totalBets: result[0].c,
          computedAt: new Date().toISOString(),
        })
        .where(eq(crowdAggregates.partyId, vote.partyId));
    }

    // Clear the visitor cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete("pt_visitor");

    return response;
  } catch (e) {
    console.error("GDPR delete error:", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
