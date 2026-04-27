const PRIVATE_RANGES_V4 = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
];

const PRIVATE_RANGES_V6 = [/^::1$/, /^fc/i, /^fe80/i];

export class SafeFetchError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "SafeFetchError";
  }
}

function isPrivate(addr: string): boolean {
  if (addr.includes(":")) {
    return PRIVATE_RANGES_V6.some((r) => r.test(addr));
  }
  return PRIVATE_RANGES_V4.some((r) => r.test(addr));
}

export async function safeFetch(
  url: string,
  opts?: { maxBytes?: number; timeoutMs?: number }
): Promise<string> {
  const { maxBytes = 5 * 1024 * 1024, timeoutMs = 30_000 } = opts ?? {};

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new SafeFetchError("INVALID_URL", "URL neplatná");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new SafeFetchError("INVALID_SCHEME", "Len http/https povolené");
  }

  // SSRF: resolve hostname, block private ranges
  try {
    const { resolve4, resolve6 } = await import("dns/promises");
    const addresses: string[] = [];
    try {
      addresses.push(...(await resolve4(parsed.hostname)));
    } catch {}
    try {
      addresses.push(...(await resolve6(parsed.hostname)));
    } catch {}
    for (const addr of addresses) {
      if (isPrivate(addr)) {
        throw new SafeFetchError("SSRF_BLOCKED", "Privátna adresa odmietnutá");
      }
    }
  } catch (e) {
    if (e instanceof SafeFetchError) throw e;
    throw new SafeFetchError("DNS_FAILED", "DNS zlyhal");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal, redirect: "follow" });
  } catch {
    clearTimeout(timer);
    throw new SafeFetchError("FETCH_FAILED", "Fetch zlyhal");
  }
  clearTimeout(timer);

  if (!response.ok) {
    throw new SafeFetchError("HTTP_ERROR", `HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new SafeFetchError("NO_BODY", "Prázdna odpoveď");

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.length;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new SafeFetchError("TOO_LARGE", "Zdroj príliš veľký");
    }
    chunks.push(value);
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(combined);
}
