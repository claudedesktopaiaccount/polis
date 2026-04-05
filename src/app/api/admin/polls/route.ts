import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db";
import { isAdminAuthed } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as {
    agency?: string;
    publishedDate?: string;
    results?: Record<string, number>;
  } | null;

  if (!body?.agency || !body?.publishedDate || !body?.results) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const d1 = getD1();
  const now = new Date().toISOString();

  const insertResult = await d1
    .prepare("INSERT INTO polls (agency, published_date, created_at) VALUES (?, ?, ?)")
    .bind(body.agency, body.publishedDate, now)
    .run();

  const pollId = insertResult.meta.last_row_id;

  for (const [partyId, pct] of Object.entries(body.results)) {
    if (typeof pct === "number" && pct > 0) {
      await d1
        .prepare("INSERT INTO poll_results (poll_id, party_id, percentage) VALUES (?, ?, ?)")
        .bind(pollId, partyId, pct)
        .run();
    }
  }

  return NextResponse.json({ ok: true, pollId });
}
