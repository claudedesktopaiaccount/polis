import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { deleteSession, SESSION_COOKIE } from "@/lib/auth/session";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    if (token) {
      const { env } = await getCloudflareContext({ async: true });
      const db = getDb(env.DB);
      await deleteSession(token, db);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (e) {
    console.error("POST /api/auth/logout error:", e);
    return NextResponse.json({ error: "Odhlásenie zlyhalo" }, { status: 500 });
  }
}
