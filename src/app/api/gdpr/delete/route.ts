import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { userPredictions, crowdAggregates, gdprAuditLog, users, userSessions } from "@/lib/db/schema";
import { eq, count, or } from "drizzle-orm";
import { hashString } from "@/lib/hash";
import { createSentry, captureException } from "@/lib/sentry";
import { validateSession, SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    // CSRF validation
    const csrfCookie = request.cookies.get("pt_csrf")?.value;
    const csrfHeader = request.headers.get("x-csrf-token");
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
    }

    const visitorId = request.cookies.get("pt_visitor")?.value;
    const db = getDb();

    // Check for authenticated user
    let userId: string | null = null;
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
    if (sessionToken) {
      const session = await validateSession(sessionToken, db);
      if (session) userId = session.userId;
    }

    if (!visitorId && !userId) {
      return NextResponse.json({ error: "No visitor data found" }, { status: 404 });
    }

    // Find affected parties before deletion — by visitorId OR userId
    const deleteConditions = [];
    if (visitorId) deleteConditions.push(eq(userPredictions.visitorId, visitorId));
    if (userId) deleteConditions.push(eq(userPredictions.userId, userId));

    const votes = await db
      .select({ partyId: userPredictions.partyId })
      .from(userPredictions)
      .where(or(...deleteConditions));

    // Delete votes
    await db
      .delete(userPredictions)
      .where(or(...deleteConditions));

    // If authenticated, delete user account and sessions
    let accountDeleted = false;
    if (userId) {
      await db.delete(userSessions).where(eq(userSessions.userId, userId));
      await db.delete(users).where(eq(users.id, userId));
      accountDeleted = true;
    }

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

    // Audit log (GDPR Article 5(2) accountability)
    const auditHash = visitorId ? await hashString(visitorId) : await hashString(userId!);
    await db.insert(gdprAuditLog).values({
      action: "delete",
      visitorIdHash: auditHash,
      timestamp: new Date().toISOString(),
      recordsAffected: votes.length + (accountDeleted ? 1 : 0),
    });

    const response = NextResponse.json({ success: true, accountDeleted });
    response.cookies.delete("pt_visitor");
    if (accountDeleted) {
      response.cookies.delete(SESSION_COOKIE);
    }

    return response;
  } catch (e) {
    console.error("GDPR delete error:", e);
    captureException(createSentry(request, { SENTRY_DSN: process.env.SENTRY_DSN }), e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
