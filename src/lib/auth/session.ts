import { type Database } from "@/lib/db";
import { userSessions } from "@/lib/db/schema";
import { eq, lt } from "drizzle-orm";

export const SESSION_COOKIE = "polis_session";
const SESSION_DURATION_DAYS = 30;

export async function createSession(
  userId: string,
  db: Database
): Promise<{ token: string; expiresAt: string }> {
  const token = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(userSessions).values({
    id: token,
    userId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });

  return { token, expiresAt: expiresAt.toISOString() };
}

export async function validateSession(
  token: string,
  db: Database
): Promise<{ userId: string } | null> {
  if (!token) return null;

  const rows = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.id, token))
    .limit(1);

  const session = rows[0];
  if (!session) return null;

  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  if (expiresAt <= now) {
    // Clean up expired session
    await db.delete(userSessions).where(eq(userSessions.id, token));
    return null;
  }

  return { userId: session.userId };
}

export async function deleteSession(token: string, db: Database): Promise<void> {
  await db.delete(userSessions).where(eq(userSessions.id, token));
}

export async function deleteExpiredSessions(db: Database): Promise<void> {
  const now = new Date().toISOString();
  await db.delete(userSessions).where(lt(userSessions.expiresAt, now));
}

export function sessionCookieOptions(expiresAt: string) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: "/",
    expires: new Date(expiresAt),
  };
}
