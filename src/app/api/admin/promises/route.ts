import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { partyPromises } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAdminAuthed } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDb();
  const rows = await db.select().from(partyPromises).orderBy(partyPromises.partyId);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null) as { partyId?: string; promiseText?: string; category?: string; isPro?: boolean; sourceUrl?: string } | null;
  if (!body?.partyId || !body?.promiseText || !body?.category) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const db = getDb();
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
  const db = getDb();
  await db.delete(partyPromises).where(eq(partyPromises.id, id));
  return NextResponse.json({ ok: true });
}
