/**
 * SHA-256 hash a string and return its hex representation.
 * Works in both Cloudflare Workers and browser environments.
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
