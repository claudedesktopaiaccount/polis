import { describe, it, expect } from "vitest";
import { generateUnsubToken, verifyUnsubToken } from "./tokens";

const SECRET = "test-secret-key";

describe("generateUnsubToken / verifyUnsubToken", () => {
  it("round-trip: generated token verifies correctly", async () => {
    const token = await generateUnsubToken("user@example.com", SECRET);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);
    const valid = await verifyUnsubToken(token, "user@example.com", SECRET);
    expect(valid).toBe(true);
  });

  it("fails with wrong email", async () => {
    const token = await generateUnsubToken("user@example.com", SECRET);
    const valid = await verifyUnsubToken(token, "other@example.com", SECRET);
    expect(valid).toBe(false);
  });

  it("fails with tampered token (same length, different content)", async () => {
    const token = await generateUnsubToken("user@example.com", SECRET);
    // Flip the last character to a different base64url char (same length)
    const lastChar = token[token.length - 1];
    const flipped = lastChar === "A" ? "B" : "A";
    const tampered = token.slice(0, -1) + flipped;
    const valid = await verifyUnsubToken(tampered, "user@example.com", SECRET);
    expect(valid).toBe(false);
  });
});
