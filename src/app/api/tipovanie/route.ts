import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb, type Database } from "@/lib/db";
import { parties, userPredictions, crowdAggregates, rateLimits } from "@/lib/db/schema";
import { eq, or, count, sql, lt, and, gte } from "drizzle-orm";
import { seedParties } from "@/lib/db/seed";
import { PARTY_LIST } from "@/lib/parties";

export const runtime = "edge";

const VALID_PARTY_IDS = new Set(PARTY_LIST.map((p) => p.id));

const RATE_LIMIT = 10;
const RATE_WINDOW_S = 60;

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(ip));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function isRateLimited(db: Database, ip: string): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - RATE_WINDOW_S;
  const ipHash = await hashIp(ip);

  // Insert first to avoid race where concurrent requests all pass the count
  await db.insert(rateLimits).values({ ipHash, createdAt: now });

  // Count recent requests (includes the row we just inserted)
  const result = await db
    .select({ c: count() })
    .from(rateLimits)
    .where(and(eq(rateLimits.ipHash, ipHash), gte(rateLimits.createdAt, cutoff)));

  // Clean up old entries (best-effort, non-critical)
  await db.delete(rateLimits).where(lt(rateLimits.createdAt, cutoff));

  return result[0].c > RATE_LIMIT;
}

async function ensureSeeded(db: Database) {
  const result = await db.select({ c: count() }).from(parties);
  if (result[0].c === 0) {
    await seedParties(db);
  }
}

export async function POST(request: NextRequest) {
  try {
    // CSRF validation: double-submit cookie pattern
    const csrfCookie = request.cookies.get("pt_csrf")?.value;
    const csrfHeader = request.headers.get("x-csrf-token");
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
    }

    const body = (await request.json()) as {
      selectedWinner: string;
      fingerprint?: string;
    };
    const { selectedWinner, fingerprint } = body;

    if (!selectedWinner || typeof selectedWinner !== "string" || !VALID_PARTY_IDS.has(selectedWinner)) {
      return NextResponse.json({ error: "Invalid party" }, { status: 400 });
    }

    if (fingerprint && (typeof fingerprint !== "string" || fingerprint.length > 128)) {
      return NextResponse.json({ error: "Invalid fingerprint" }, { status: 400 });
    }

    let visitorId = request.cookies.get("pt_visitor")?.value;
    const isNewVisitor = !visitorId;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    await ensureSeeded(db);

    // D1-based rate limiting (persists across isolate restarts)
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
    if (await isRateLimited(db, ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Check duplicate: by cookie (visitorId) OR by fingerprint
    const conditions = [eq(userPredictions.visitorId, visitorId)];
    if (fingerprint) {
      conditions.push(eq(userPredictions.fingerprint, fingerprint));
    }

    const existingVote = await db
      .select()
      .from(userPredictions)
      .where(or(...conditions))
      .limit(1);

    if (existingVote.length > 0) {
      return NextResponse.json(
        { error: "already_voted", partyId: existingVote[0].partyId },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    // Record the individual vote (UNIQUE index on visitor_id catches races)
    try {
      await db.insert(userPredictions).values({
        id: crypto.randomUUID(),
        visitorId,
        partyId: selectedWinner,
        createdAt: now,
        fingerprint: fingerprint || null,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("UNIQUE constraint failed")) {
        return NextResponse.json(
          { error: "already_voted" },
          { status: 409 }
        );
      }
      throw e;
    }

    // Update crowd aggregate atomically
    await db
      .insert(crowdAggregates)
      .values({
        partyId: selectedWinner,
        totalBets: 1,
        computedAt: now,
      })
      .onConflictDoUpdate({
        target: crowdAggregates.partyId,
        set: {
          totalBets: sql`${crowdAggregates.totalBets} + 1`,
          computedAt: now,
        },
      });

    const response = NextResponse.json({ success: true, visitorId });

    if (isNewVisitor) {
      response.cookies.set("pt_visitor", visitorId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
      });
    }

    return response;
  } catch (e) {
    console.error("POST /api/tipovanie error:", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);

    const aggregates = await db.select().from(crowdAggregates);
    const totalBets = aggregates.reduce((s, a) => s + a.totalBets, 0);

    return NextResponse.json({
      aggregates: aggregates.map((a) => ({
        partyId: a.partyId,
        totalBets: a.totalBets,
      })),
      totalBets,
    });
  } catch (e) {
    console.error("GET /api/tipovanie error:", e);
    return NextResponse.json({ aggregates: [], totalBets: 0 });
  }
}
