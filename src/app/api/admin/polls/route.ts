import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

function isAdminAuthed(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session")?.value;
  return !!session && session === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as {
    agency?: string;
    publishedDate?: string;
    results?: Record<string, number>;
  } | null;

  if (!body?.agency || !body?.publishedDate || !body?.results) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const now = new Date().toISOString();

  // Use raw SQL (same pattern as scraper worker) — D1 .returning() is unreliable
  const insertResult = await env.DB.prepare(
    "INSERT INTO polls (agency, published_date, created_at) VALUES (?, ?, ?)"
  )
    .bind(body.agency, body.publishedDate, now)
    .run();

  const pollId = insertResult.meta.last_row_id;

  for (const [partyId, pct] of Object.entries(body.results)) {
    if (typeof pct === "number" && pct > 0) {
      await env.DB.prepare(
        "INSERT INTO poll_results (poll_id, party_id, percentage) VALUES (?, ?, ?)"
      )
        .bind(pollId, partyId, pct)
        .run();
    }
  }

  return NextResponse.json({ ok: true, pollId });
}
