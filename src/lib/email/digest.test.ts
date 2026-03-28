import { describe, it, expect } from "vitest";
import { buildDigestHtml, buildDigestText } from "./digest";

const mockPolls = [
  { agency: "Focus", publishedDate: "2026-03-20", results: { ps: 24.8, "smer-sd": 21.3 } },
];

describe("buildDigestHtml", () => {
  it("contains agency name", () => {
    const html = buildDigestHtml(mockPolls, "https://polis.sk");
    expect(html).toContain("Focus");
  });

  it("contains poll percentage", () => {
    const html = buildDigestHtml(mockPolls, "https://polis.sk");
    expect(html).toContain("24.8");
  });

  it("contains unsubscribe link placeholder", () => {
    const html = buildDigestHtml(mockPolls, "https://polis.sk");
    expect(html).toContain("UNSUB_URL");
  });
});

describe("buildDigestText", () => {
  it("returns plain text with agency", () => {
    const text = buildDigestText(mockPolls, "https://polis.sk");
    expect(text).toContain("Focus");
  });
});
