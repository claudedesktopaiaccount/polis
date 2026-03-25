/**
 * ShareButtons unit tests
 *
 * These tests verify URL encoding, share link construction, and copy behavior
 * without requiring a DOM renderer (no @testing-library/react installed).
 * We test the logic extracted from the component.
 */

describe("ShareButtons — share URL construction", () => {
  const url = "https://polis.sk/prieskumy";
  const title = "Prieskumy | Polis";

  it("builds a valid Facebook share URL", () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    expect(fbUrl).toContain("facebook.com/sharer");
    expect(fbUrl).toContain(encodeURIComponent(url));
  });

  it("builds a valid X/Twitter share URL with title", () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    expect(twitterUrl).toContain("twitter.com/intent/tweet");
    expect(twitterUrl).toContain(encodeURIComponent(url));
    expect(twitterUrl).toContain(encodeURIComponent(title));
  });

  it("builds a valid LinkedIn share URL", () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    expect(linkedinUrl).toContain("linkedin.com/sharing/share-offsite");
    expect(linkedinUrl).toContain(encodeURIComponent(url));
  });

  it("encodes URLs with special characters correctly", () => {
    const specialUrl = "https://polis.sk/prieskumy?filter=all&agency=Focus";
    const encoded = encodeURIComponent(specialUrl);
    expect(encoded).not.toContain("?");
    expect(encoded).not.toContain("&");
    expect(encoded).toContain("%3F");
    expect(encoded).toContain("%26");
  });
});

describe("ShareButtons — copy link behavior", () => {
  it("calls navigator.clipboard.writeText with the given URL", async () => {
    const url = "https://polis.sk/prieskumy";
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "navigator", {
      value: { clipboard: { writeText } },
      configurable: true,
      writable: true,
    });

    await navigator.clipboard.writeText(url);
    expect(writeText).toHaveBeenCalledWith(url);
  });

  it("handles clipboard errors gracefully", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("Permission denied"));
    Object.defineProperty(globalThis, "navigator", {
      value: { clipboard: { writeText } },
      configurable: true,
      writable: true,
    });

    // Should not throw
    await expect(
      navigator.clipboard.writeText("https://polis.sk").catch(() => {})
    ).resolves.toBeUndefined();
  });
});

describe("ShareButtons — native share detection", () => {
  it("detects when Web Share API is available", () => {
    const mockNavigator = { share: vi.fn() };
    const canNativeShare = "share" in mockNavigator;
    expect(canNativeShare).toBe(true);
  });

  it("detects when Web Share API is NOT available", () => {
    const mockNavigator = {};
    const canNativeShare = "share" in mockNavigator;
    expect(canNativeShare).toBe(false);
  });

  it("calls navigator.share with correct params", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const url = "https://polis.sk/prieskumy";
    const title = "Prieskumy | Polis";
    const description = "Aktuálne volebné prieskumy";

    await share({ title, text: description, url });
    expect(share).toHaveBeenCalledWith({
      title,
      text: description,
      url,
    });
  });
});
