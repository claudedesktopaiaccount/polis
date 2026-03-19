import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb, type Database } from "@/lib/db";
import { parties, userPredictions, crowdAggregates } from "@/lib/db/schema";
import { eq, or, count } from "drizzle-orm";
import { seedParties } from "@/lib/db/seed";

export const runtime = "edge";

async function ensureSeeded(db: Database) {
  const result = await db.select({ c: count() }).from(parties);
  if (result[0].c === 0) {
    await seedParties(db);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      selectedWinner: string;
      fingerprint?: string;
    };
    const { selectedWinner, fingerprint } = body;

    if (!selectedWinner) {
      return NextResponse.json({ error: "Missing selectedWinner" }, { status: 400 });
    }

    let visitorId = request.cookies.get("pt_visitor")?.value;
    const isNewVisitor = !visitorId;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    await ensureSeeded(db);

    // Check duplicate: by cookie (visitorId) OR by fingerprint
    const conditions = [eq(userPredictions.visitorId, visitorId)];
    if (fingerprint) {
      conditions.push(eq(userPredictions.region, fingerprint));
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

    // Record the individual vote (store fingerprint in 'region' field)
    await db.insert(userPredictions).values({
      id: crypto.randomUUID(),
      visitorId,
      partyId: selectedWinner,
      createdAt: now,
      region: fingerprint || null,
    });

    // Update crowd aggregate
    const existing = await db
      .select()
      .from(crowdAggregates)
      .where(eq(crowdAggregates.partyId, selectedWinner))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(crowdAggregates)
        .set({
          totalBets: existing[0].totalBets + 1,
          computedAt: now,
        })
        .where(eq(crowdAggregates.partyId, selectedWinner));
    } else {
      await db.insert(crowdAggregates).values({
        partyId: selectedWinner,
        totalBets: 1,
        computedAt: now,
      });
    }

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
