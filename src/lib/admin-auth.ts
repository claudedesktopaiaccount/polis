import { NextRequest } from "next/server";

/**
 * Verify admin session by checking HMAC signature of the session token.
 * Matches the verification logic in src/app/admin/layout.tsx.
 */
export async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const sessionToken = req.cookies.get("admin_session")?.value;
  const sigHex = req.cookies.get("admin_sig")?.value;
  if (!sessionToken || !sigHex || !process.env.ADMIN_SECRET) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(process.env.ADMIN_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  );
  const sigBytes = new Uint8Array(sigHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(sessionToken));
}
