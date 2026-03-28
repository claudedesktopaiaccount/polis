import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { newsletterSubscribers } from "@/lib/db/schema";
import { verifyUnsubToken } from "@/lib/email/tokens";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const email = req.nextUrl.searchParams.get("email");
  const token = req.nextUrl.searchParams.get("token");

  if (!email || !token) {
    return new NextResponse("Neplatn\u00fd odkaz.", { status: 400 });
  }

  const valid = await verifyUnsubToken(token, email, env.RESEND_API_KEY);
  if (!valid) {
    return new NextResponse("Neplatn\u00fd alebo expirovan\u00fd odkaz.", { status: 400 });
  }

  const db = getDb(env.DB);
  await db
    .update(newsletterSubscribers)
    .set({ unsubscribedAt: new Date().toISOString() })
    .where(eq(newsletterSubscribers.email, email.toLowerCase()))
    .run();

  return new NextResponse(
    `<!DOCTYPE html><html lang="sk"><body style="font-family:Georgia,serif;padding:40px;max-width:600px;margin:auto">
      <h1>Odhl\u00e1senie \u00faspe\u0161n\u00e9</h1>
      <p>Va\u0161a adresa <strong>${email}</strong> bola odhl\u00e1sen\u00e1 z odberu newslettera Polis.</p>
      <p><a href="https://polis.sk">Sp\u00e4\u0165 na Polis</a></p>
    </body></html>`,
    { headers: { "Content-Type": "text/html;charset=utf-8" } }
  );
}
