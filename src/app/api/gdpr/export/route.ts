import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { userPredictions, gdprAuditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashString } from "@/lib/hash";
import { createSentry, captureException } from "@/lib/sentry";

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

    const votes = await db
      .select({
        partyId: userPredictions.partyId,
        predictedPct: userPredictions.predictedPct,
        fingerprint: userPredictions.fingerprint,
        createdAt: userPredictions.createdAt,
      })
      .from(userPredictions)
      .where(eq(userPredictions.visitorId, visitorId));

    // Audit log (GDPR Article 15 access request)
    await db.insert(gdprAuditLog).values({
      action: "export",
      visitorIdHash: await hashString(visitorId),
      timestamp: new Date().toISOString(),
      recordsAffected: votes.length,
    });

    return NextResponse.json({
      visitorId,
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
