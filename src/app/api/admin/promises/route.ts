import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { partyPromises } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAdminAuthed } from "@/lib/admin-auth";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const rows = await db.select().from(partyPromises).orderBy(partyPromises.partyId);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null) as { partyId?: string; promiseText?: string; category?: string; isPro?: boolean; sourceUrl?: string } | null;
  if (!body?.partyId || !body?.promiseText || !body?.category) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  await db.insert(partyPromises).values({
    partyId: body.partyId,
    promiseText: body.promiseText,
    category: body.category,
    isPro: body.isPro ?? true,
    sourceUrl: body.sourceUrl ?? null,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = (await req.json().catch(() => ({}))) as { id?: number };
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  await db.delete(partyPromises).where(eq(partyPromises.id, id));
  return NextResponse.json({ ok: true });
}
