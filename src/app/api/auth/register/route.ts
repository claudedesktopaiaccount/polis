import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users, rateLimits } from "@/lib/db/schema";
import { eq, count, and, gte, lt } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { validateEmail, validatePassword, validateDisplayName } from "@/lib/auth/validate";
import { createSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth/session";
import { hashString } from "@/lib/hash";

const RATE_LIMIT = 5;
const RATE_WINDOW_S = 60 * 60; // 1 hour

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
      displayName?: string;
    };

    const emailValidation = validateEmail(body.email ?? "");
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    const passwordValidation = validatePassword(body.password ?? "");
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    const nameValidation = validateDisplayName(body.displayName ?? "");
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 });
    }

    const email = (body.email as string).trim().toLowerCase();
    const displayName = (body.displayName as string).trim();

    const db = getDb();

    // Rate limiting — 5 registrations per IP per hour
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

    // Check if email already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "E-mail je už zaregistrovaný" }, { status: 409 });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(body.password as string);
    const userId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Optionally link visitor fingerprint
    const visitorId = request.cookies.get("pt_visitor")?.value ?? null;

    await db.insert(users).values({
      id: userId,
      email,
      passwordHash,
      displayName,
      createdAt,
      visitorId,
    });

    // Create session
    const { token, expiresAt } = await createSession(userId, db);

    const response = NextResponse.json({
      success: true,
      user: { id: userId, email, displayName },
    });

    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));

    return response;
  } catch (e) {
    console.error("POST /api/auth/register error:", e);
    return NextResponse.json({ error: "Registrácia zlyhala" }, { status: 500 });
  }
}
