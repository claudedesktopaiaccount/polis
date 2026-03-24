import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { subscribeEmail } from "@/lib/db/newsletter";

export const runtime = "edge";

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

  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

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
