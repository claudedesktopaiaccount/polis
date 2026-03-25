import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { userNotificationPrefs } from "@/lib/db/schema";
import { validateSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const sessionToken = req.cookies.get("polis_session")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await validateSession(sessionToken, db);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { userId } = session;

  const rows = await db
    .select()
    .from(userNotificationPrefs)
    .where(eq(userNotificationPrefs.userId, userId))
    .all();

  if (rows.length === 0) {
    return NextResponse.json({ onNewPoll: false, onScoreChange: false });
  }
  return NextResponse.json({
    onNewPoll: rows[0].onNewPoll === 1,
    onScoreChange: rows[0].onScoreChange === 1,
  });
}

export async function POST(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const sessionToken = req.cookies.get("polis_session")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await validateSession(sessionToken, db);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { userId } = session;

  const body = await req.json() as { onNewPoll: unknown; onScoreChange: unknown };
  if (typeof body.onNewPoll !== "boolean" || typeof body.onScoreChange !== "boolean") {
    return NextResponse.json({ error: "onNewPoll and onScoreChange must be booleans" }, { status: 400 });
  }
  const now = new Date().toISOString();

  await db
    .insert(userNotificationPrefs)
    .values({
      userId,
      onNewPoll: body.onNewPoll ? 1 : 0,
      onScoreChange: body.onScoreChange ? 1 : 0,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [userNotificationPrefs.userId],
      set: {
        onNewPoll: body.onNewPoll ? 1 : 0,
        onScoreChange: body.onScoreChange ? 1 : 0,
        updatedAt: now,
      },
    })
    .run();

  return NextResponse.json({ ok: true });
}
