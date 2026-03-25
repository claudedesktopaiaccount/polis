import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../password";

describe("hashPassword", () => {
  it("returns a string in salt:hash format", async () => {
    const hash = await hashPassword("mypassword123");
    expect(typeof hash).toBe("string");
    const parts = hash.split(":");
    expect(parts).toHaveLength(2);
    expect(parts[0]).toMatch(/^[0-9a-f]{32}$/); // 16-byte salt hex
    expect(parts[1]).toMatch(/^[0-9a-f]{64}$/); // 32-byte key hex
  });

  it("produces different hashes for the same password (random salt)", async () => {
    const hash1 = await hashPassword("same-password");
    const hash2 = await hashPassword("same-password");
    expect(hash1).not.toBe(hash2);
  });
});

describe("verifyPassword", () => {
  it("returns true for the correct password", async () => {
    const hash = await hashPassword("correct-horse-battery");
    const result = await verifyPassword("correct-horse-battery", hash);
    expect(result).toBe(true);
  });

  it("returns false for a wrong password", async () => {
    const hash = await hashPassword("correct-horse-battery");
    const result = await verifyPassword("wrong-password", hash);
    expect(result).toBe(false);
  });

  it("returns false for a malformed stored string", async () => {
    expect(await verifyPassword("any", "notvalidformat")).toBe(false);
    expect(await verifyPassword("any", "")).toBe(false);
    expect(await verifyPassword("any", ":")).toBe(false);
  });
});
