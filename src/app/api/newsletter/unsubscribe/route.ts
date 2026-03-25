import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { newsletterSubscribers } from "@/lib/db/schema";
import { verifyUnsubToken } from "@/lib/email/tokens";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const email = req.nextUrl.searchParams.get("email");
  const token = req.nextUrl.searchParams.get("token");

  if (!email || !token) {
    return new NextResponse("Neplatný odkaz.", { status: 400 });
  }

  const valid = await verifyUnsubToken(token, email, env.RESEND_API_KEY);
  if (!valid) {
    return new NextResponse("Neplatný alebo expirovaný odkaz.", { status: 400 });
  }

  const db = drizzle(env.DB);
  await db
    .update(newsletterSubscribers)
    .set({ unsubscribedAt: new Date().toISOString() })
    .where(eq(newsletterSubscribers.email, email.toLowerCase()))
    .run();

  const safeEmail = email
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return new NextResponse(
    `<!DOCTYPE html><html lang="sk"><body style="font-family:Georgia,serif;padding:40px;max-width:600px;margin:auto">
      <h1>Odhlásenie úspešné</h1>
      <p>Vaša adresa <strong>${safeEmail}</strong> bola odhlásená z odberu newslettera Polis.</p>
      <p><a href="https://polis.sk">Späť na Polis</a></p>
    </body></html>`,
    { headers: { "Content-Type": "text/html;charset=utf-8" } }
  );
}
