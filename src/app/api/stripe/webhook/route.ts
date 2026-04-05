import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { apiKeys } from "@/lib/db/schema";

async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = Object.fromEntries(
    signature.split(",").map((p) => p.split("=") as [string, string])
  );
  const timestamp = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp || !v1) return false;

  const signedPayload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expected === v1;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  const valid = await verifyStripeSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  if (!valid) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body) as { type: string; data: { object: Record<string, unknown> } };
  const db = getDb();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = (session["metadata"] as Record<string, string>)?.["userId"];
    const subscriptionId = session["subscription"] as string;
    if (userId && subscriptionId) {
      const keys = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.userId, userId))
        .all();
      const active = keys.filter((k) => !k.revokedAt).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      if (active.length > 0) {
        await db
          .update(apiKeys)
          .set({ tier: "paid", stripeSubscriptionId: subscriptionId })
          .where(eq(apiKeys.id, active[0].id))
          .run();
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const subscriptionId = sub["id"] as string;
    await db
      .update(apiKeys)
      .set({ tier: "free" })
      .where(eq(apiKeys.stripeSubscriptionId, subscriptionId))
      .run();
  }

  return new NextResponse("ok", { status: 200 });
}
