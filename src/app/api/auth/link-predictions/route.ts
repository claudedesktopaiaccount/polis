import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { userPredictions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { validateSession, SESSION_COOKIE } from "@/lib/auth/session";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // CSRF validation — double-submit cookie pattern
  const csrfCookie = req.cookies.get("pt_csrf")?.value;
  const csrfHeader = req.headers.get("x-csrf-token");
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const session = await validateSession(sessionToken, db);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const visitorId = req.cookies.get("pt_visitor")?.value;
  if (!visitorId) {
    return NextResponse.json({ linked: 0 });
  }

  // Link anonymous predictions to user account
  await db
    .update(userPredictions)
    .set({ userId: session.userId })
    .where(eq(userPredictions.visitorId, visitorId));

  return NextResponse.json({ linked: true });
}
