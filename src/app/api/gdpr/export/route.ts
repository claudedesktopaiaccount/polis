import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { userPredictions, gdprAuditLog, users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { hashString } from "@/lib/hash";
import { createSentry, captureException } from "@/lib/sentry";
import { validateSession, SESSION_COOKIE } from "@/lib/auth/session";

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
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    // Check for authenticated user
    let userId: string | null = null;
    let accountData: { email: string; displayName: string; createdAt: string } | null = null;
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
    if (sessionToken) {
      const session = await validateSession(sessionToken, db);
      if (session) {
        userId = session.userId;
        const userRows = await db
          .select({ email: users.email, displayName: users.displayName, createdAt: users.createdAt })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        if (userRows[0]) accountData = userRows[0];
      }
    }

    if (!visitorId && !userId) {
      return NextResponse.json({ error: "No visitor data found" }, { status: 404 });
    }

    // Query predictions by visitorId OR userId
    const conditions = [];
    if (visitorId) conditions.push(eq(userPredictions.visitorId, visitorId));
    if (userId) conditions.push(eq(userPredictions.userId, userId));

    const votes = await db
      .select({
        partyId: userPredictions.partyId,
        predictedPct: userPredictions.predictedPct,
        fingerprint: userPredictions.fingerprint,
        createdAt: userPredictions.createdAt,
      })
      .from(userPredictions)
      .where(or(...conditions));

    // Audit log (GDPR Article 15 access request)
    const auditHash = visitorId ? await hashString(visitorId) : await hashString(userId!);
    await db.insert(gdprAuditLog).values({
      action: "export",
      visitorIdHash: auditHash,
      timestamp: new Date().toISOString(),
      recordsAffected: votes.length,
    });

    return NextResponse.json({
      visitorId: visitorId || null,
      account: accountData,
      exportedAt: new Date().toISOString(),
      votes: votes.map((v) => ({
        partyId: v.partyId,
        predictedPct: v.predictedPct,
        fingerprint: v.fingerprint,
        createdAt: v.createdAt,
      })),
    });
  } catch (e) {
    console.error("GDPR export error:", e);
    const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: {} as Record<string, unknown> }));
    captureException(createSentry(request, env as { SENTRY_DSN?: string }), e);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
