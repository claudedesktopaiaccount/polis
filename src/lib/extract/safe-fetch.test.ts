import { describe, it, expect, vi, afterEach } from "vitest";
import { safeFetch, SafeFetchError } from "./safe-fetch";

// Mock dns/promises
vi.mock("dns/promises", () => ({
  resolve4: vi.fn(),
  resolve6: vi.fn(),
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

afterEach(() => {
  vi.clearAllMocks();
});

async function setupDns(ipv4: string[] = [], ipv6: string[] = []) {
  const dns = await import("dns/promises");
  vi.mocked(dns.resolve4).mockResolvedValue(ipv4 as never);
  vi.mocked(dns.resolve6).mockResolvedValue(ipv6 as never);
}

describe("safeFetch", () => {
  it("rejects non-http schemes", async () => {
    await expect(safeFetch("ftp://example.com")).rejects.toThrow(SafeFetchError);
    await expect(safeFetch("ftp://example.com")).rejects.toMatchObject({ code: "INVALID_SCHEME" });
  });

  it("rejects invalid URLs", async () => {
    await expect(safeFetch("not a url")).rejects.toMatchObject({ code: "INVALID_URL" });
  });

  it("rejects loopback IP (127.0.0.1)", async () => {
    await setupDns(["127.0.0.1"]);
    await expect(safeFetch("http://localhost/")).rejects.toMatchObject({ code: "SSRF_BLOCKED" });
  });

  it("rejects private class A (10.x.x.x)", async () => {
    await setupDns(["10.0.0.1"]);
    await expect(safeFetch("http://internal.corp/")).rejects.toMatchObject({ code: "SSRF_BLOCKED" });
  });

  it("rejects private class B (172.16.x.x)", async () => {
    await setupDns(["172.16.0.1"]);
    await expect(safeFetch("http://internal/")).rejects.toMatchObject({ code: "SSRF_BLOCKED" });
  });

  it("rejects private class C (192.168.x.x)", async () => {
    await setupDns(["192.168.1.1"]);
    await expect(safeFetch("http://router/")).rejects.toMatchObject({ code: "SSRF_BLOCKED" });
  });

  it("rejects link-local (169.254.x.x)", async () => {
    await setupDns(["169.254.169.254"]); // AWS metadata
    await expect(safeFetch("http://metadata/latest/")).rejects.toMatchObject({ code: "SSRF_BLOCKED" });
  });

  it("rejects IPv6 loopback (::1)", async () => {
    await setupDns([], ["::1"]);
    await expect(safeFetch("http://[::1]/")).rejects.toMatchObject({ code: "SSRF_BLOCKED" });
  });

  it("rejects private IPv6 fc00::/7", async () => {
    await setupDns([], ["fc00::1"]);
    await expect(safeFetch("http://internal6/")).rejects.toMatchObject({ code: "SSRF_BLOCKED" });
  });

  it("rejects HTTP 4xx response", async () => {
    await setupDns(["93.184.216.34"]);
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    await expect(safeFetch("http://example.com/notfound")).rejects.toMatchObject({ code: "HTTP_ERROR" });
  });

  it("throws TOO_LARGE when content exceeds maxBytes", async () => {
    await setupDns(["93.184.216.34"]);
    const bigChunk = new Uint8Array(6 * 1024 * 1024); // 6MB
    let calls = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (calls++ === 0) return Promise.resolve({ done: false, value: bigChunk });
        return Promise.resolve({ done: true, value: undefined });
      }),
      cancel: vi.fn().mockResolvedValue(undefined),
    };
    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    });
    await expect(safeFetch("http://example.com/big", { maxBytes: 5 * 1024 * 1024 })).rejects.toMatchObject({ code: "TOO_LARGE" });
  });

  it("returns text for valid public URL", async () => {
    await setupDns(["93.184.216.34"]);
    const encoder = new TextEncoder();
    const content = encoder.encode("hello world");
    let done = false;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (!done) { done = true; return Promise.resolve({ done: false, value: content }); }
        return Promise.resolve({ done: true, value: undefined });
      }),
      cancel: vi.fn(),
    };
    mockFetch.mockResolvedValue({ ok: true, body: { getReader: () => mockReader } });
    const result = await safeFetch("https://example.com/");
    expect(result).toBe("hello world");
  });
});
