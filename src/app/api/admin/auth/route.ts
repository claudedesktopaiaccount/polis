import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { secret?: string };
  const { secret } = body;
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // Generate opaque session token instead of storing raw secret in cookie
  const sessionToken = crypto.randomUUID();
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  // Store token in a signed cookie so layout can verify without DB
  // We HMAC the token with the secret so only someone with the secret can forge it
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(process.env.ADMIN_SECRET!),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(sessionToken));
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  res.cookies.set("admin_sig", sigHex, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return res;
}
