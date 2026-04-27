import { NextRequest } from "next/server";

/**
 * Constant-time string comparison using HMAC verification.
 * Avoids timing oracle attacks on === comparisons.
 */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  // Pad both to the same length to avoid length-leak before crypto
  const maxLen = Math.max(a.length, b.length);
  const aPadded = a.padEnd(maxLen, "\0");
  const bPadded = b.padEnd(maxLen, "\0");

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode("cron-auth-eq"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign("HMAC", key, enc.encode(aPadded)),
    crypto.subtle.sign("HMAC", key, enc.encode(bPadded)),
  ]);
  // Compare HMAC digests — same length, timing-safe via ArrayBuffer comparison
  const ua = new Uint8Array(sigA);
  const ub = new Uint8Array(sigB);
  let diff = 0;
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i];
  return diff === 0;
}

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
