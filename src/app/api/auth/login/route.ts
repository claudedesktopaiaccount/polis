import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users, rateLimits } from "@/lib/db/schema";
import { eq, count, and, gte, lt } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth/session";
import { hashString } from "@/lib/hash";

const RATE_LIMIT = 10;
const RATE_WINDOW_S = 15 * 60; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    // CSRF validation — double-submit cookie pattern
    const csrfCookie = request.cookies.get("pt_csrf")?.value;
    const csrfHeader = request.headers.get("x-csrf-token");
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
    }

    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!body.email || !body.password) {
      return NextResponse.json({ error: "E-mail a heslo sú povinné" }, { status: 400 });
    }

    const db = getDb();

    // Rate limiting — 10 login attempts per IP per 15 minutes
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      "unknown";
    const ipHash = await hashString(ip);
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - RATE_WINDOW_S;

    await db.insert(rateLimits).values({ ipHash, createdAt: now });

    const rateResult = await db
      .select({ c: count() })
      .from(rateLimits)
      .where(and(eq(rateLimits.ipHash, ipHash), gte(rateLimits.createdAt, cutoff)));

    await db.delete(rateLimits).where(lt(rateLimits.createdAt, cutoff));

    if (rateResult[0].c > RATE_LIMIT) {
      return NextResponse.json({ error: "Príliš veľa pokusov, skúste neskôr" }, { status: 429 });
    }

    const email = body.email.trim().toLowerCase();

    // Look up user
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = userRows[0];

    // Always run password verification to prevent timing attacks revealing user existence
    const passwordOk = user
      ? await verifyPassword(body.password, user.passwordHash)
      : await verifyPassword(body.password, "dummy:dummy").then(() => false);

    if (!user || !passwordOk) {
      return NextResponse.json({ error: "Nesprávny e-mail alebo heslo" }, { status: 401 });
    }

    // Link visitor fingerprint if not already linked
    const visitorId = request.cookies.get("pt_visitor")?.value;
    if (visitorId && !user.visitorId) {
      await db
        .update(users)
        .set({ visitorId })
        .where(eq(users.id, user.id));
    }

    // Create session
    const { token, expiresAt } = await createSession(user.id, db);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });

    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));

    return response;
  } catch (e) {
    console.error("POST /api/auth/login error:", e);
    return NextResponse.json({ error: "Prihlásenie zlyhalo" }, { status: 500 });
  }
}
