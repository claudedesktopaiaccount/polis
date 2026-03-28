/**
 * HMAC-SHA256 unsubscribe tokens.
 * Format: base64url(hmac) where hmac = HMAC(email, secret)
 * Stateless — no DB lookup required.
 */

async function hmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function generateUnsubToken(email: string, secret: string): Promise<string> {
  return hmac(email.toLowerCase().trim(), secret);
}

export async function verifyUnsubToken(
  token: string,
  email: string,
  secret: string
): Promise<boolean> {
  const expected = await generateUnsubToken(email, secret);
  // Constant-time comparison to prevent timing attacks
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
