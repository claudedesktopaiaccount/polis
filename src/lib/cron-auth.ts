import { NextRequest } from "next/server";
import { timingSafeEqual } from "@/lib/hash";

/**
 * Validate an incoming cron request against CRON_SECRET.
 * Accepts the secret via x-cron-secret header or Authorization: Bearer <secret>.
 */
export async function isCronAuthed(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const xSecret = req.headers.get("x-cron-secret");
  if (xSecret) return timingSafeEqual(xSecret, secret);

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return timingSafeEqual(auth.slice(7), secret);

  return false;
}
