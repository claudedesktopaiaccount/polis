import { describe, it, expect } from "vitest";
import { newsletterSubscribers } from "../schema";

describe("newsletterSubscribers schema", () => {
  it("has required columns", () => {
    const cols = Object.keys(newsletterSubscribers);
    expect(cols).toContain("email");
    expect(cols).toContain("createdAt");
    expect(cols).toContain("source");
  });
});
