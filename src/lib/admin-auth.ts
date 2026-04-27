import { cookies } from "next/headers";
import { NextRequest } from "next/server";

async function verifyHmacSession(sessionToken: string, sigHex: string): Promise<boolean> {
  if (!process.env.ADMIN_SECRET) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(process.env.ADMIN_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  );
  const sigBytes = new Uint8Array(sigHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(sessionToken));
}

/**
 * Verify admin session from Next.js cookies() — use inside server actions and RSC.
 */
export async function isAdminAuthedFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  const sigHex = cookieStore.get("admin_sig")?.value;
  if (!sessionToken || !sigHex) return false;
  return verifyHmacSession(sessionToken, sigHex);
}

/**
 * Verify admin session from a NextRequest — use inside API route handlers.
 */
export async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const sessionToken = req.cookies.get("admin_session")?.value;
  const sigHex = req.cookies.get("admin_sig")?.value;
  if (!sessionToken || !sigHex) return false;
  return verifyHmacSession(sessionToken, sigHex);
}
