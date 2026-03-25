/**
 * HMAC-SHA256 unsubscribe tokens.
 * Format: base64url(HMAC(email, secret))
 * Stateless — no DB lookup required.
 * Comparison is constant-time at the byte level.
 */

async function hmacBytes(message: string, secret: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return new Uint8Array(sig);
}

function toBase64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function fromBase64url(str: string): Uint8Array | null {
  try {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    return new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

export async function generateUnsubToken(email: string, secret: string): Promise<string> {
  const bytes = await hmacBytes(email.toLowerCase().trim(), secret);
  return toBase64url(bytes);
}

export async function verifyUnsubToken(
  token: string,
  email: string,
  secret: string
): Promise<boolean> {
  const expected = await hmacBytes(email.toLowerCase().trim(), secret);
  const actual = fromBase64url(token);

  // Use a dummy buffer if parsing fails — ensures the XOR loop always runs
  const a = actual ?? new Uint8Array(32);
  const b = expected; // always 32 bytes (SHA-256 output)

  // Byte-level XOR — constant time for equal-length arrays
  let diff = 0;
  for (let i = 0; i < b.length; i++) {
    diff |= (a[i] ?? 0) ^ b[i];
  }
  // Separately flag length mismatch without short-circuiting
  diff |= a.length ^ b.length;

  return diff === 0 && actual !== null;
}
