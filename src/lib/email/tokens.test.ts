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

  it("fails with tampered token", async () => {
    const token = await generateUnsubToken("user@example.com", SECRET);
    const valid = await verifyUnsubToken(token + "x", "user@example.com", SECRET);
    expect(valid).toBe(false);
  });
});
