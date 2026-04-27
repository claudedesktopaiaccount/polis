import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { rateLimits } from "@/lib/db/schema";
import { subscribeEmail } from "@/lib/db/newsletter";
import { hashString } from "@/lib/hash";
import { count, and, eq, gte, lt } from "drizzle-orm";

const RATE_LIMIT = 5;
const RATE_WINDOW_S = 60 * 60; // 5 subscribes per IP per hour

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  let body: { email?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const db = getDb();

  // Rate limit by IP
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for") ||
    "unknown";
  const ipHash = await hashString(`newsletter:${ip}`);
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - RATE_WINDOW_S;

  const rateResult = await db
    .select({ c: count() })
    .from(rateLimits)
    .where(and(eq(rateLimits.ipHash, ipHash), gte(rateLimits.createdAt, cutoff)));

  if (rateResult[0].c >= RATE_LIMIT) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  await db.insert(rateLimits).values({ ipHash, createdAt: now });
  await db.delete(rateLimits).where(lt(rateLimits.createdAt, cutoff));

  try {
    await subscribeEmail(db, email, body.source ?? "web");
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "already_subscribed") {
      return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
    }
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
