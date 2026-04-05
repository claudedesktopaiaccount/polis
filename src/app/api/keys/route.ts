import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { apiKeys } from "@/lib/db/schema";
import { validateSession } from "@/lib/auth/session";
import { createApiKey } from "@/lib/api-keys/keys";

export async function GET(req: NextRequest) {
  const db = getDb();
  const sessionToken = req.cookies.get("polis_session")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await validateSession(sessionToken, db);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await db
    .select({
      id: apiKeys.id,
      tier: apiKeys.tier,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.userId));

  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const sessionToken = req.cookies.get("polis_session")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await validateSession(sessionToken, db);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Limit to 3 free keys per user
  const existing = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.userId));
  if (existing.filter((k) => !k.revokedAt).length >= 3) {
    return NextResponse.json({ error: "Limit 3 aktívnych kľúčov" }, { status: 400 });
  }

  const { rawKey, record } = await createApiKey(session.userId, db);

  // Return raw key once — never stored
  return NextResponse.json({ rawKey, id: record.id, tier: record.tier });
}
