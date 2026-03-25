import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword, validateDisplayName } from "../validate";

describe("validateEmail", () => {
  it("accepts a valid email", () => {
    expect(validateEmail("user@example.com").valid).toBe(true);
    expect(validateEmail("user+tag@sub.domain.org").valid).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(validateEmail("").valid).toBe(false);
  });

  it("rejects a missing @ sign", () => {
    expect(validateEmail("notanemail").valid).toBe(false);
  });

  it("rejects email over 254 chars", () => {
    const long = "a".repeat(249) + "@x.com"; // 255 chars
    expect(long.length).toBeGreaterThan(254);
    expect(validateEmail(long).valid).toBe(false);
  });

  it("rejects email without domain", () => {
    expect(validateEmail("user@").valid).toBe(false);
  });
});

describe("validatePassword", () => {
  it("accepts a password of 8 characters", () => {
    expect(validatePassword("12345678").valid).toBe(true);
  });

  it("accepts a long password up to 128 chars", () => {
    expect(validatePassword("a".repeat(128)).valid).toBe(true);
  });

  it("rejects a password under 8 chars", () => {
    expect(validatePassword("short").valid).toBe(false);
    expect(validatePassword("1234567").valid).toBe(false);
  });

  it("rejects a password over 128 chars", () => {
    expect(validatePassword("a".repeat(129)).valid).toBe(false);
  });

  it("rejects empty password", () => {
    expect(validatePassword("").valid).toBe(false);
  });
});

describe("validateDisplayName", () => {
  it("accepts a valid name", () => {
    expect(validateDisplayName("Ján Novák").valid).toBe(true);
    expect(validateDisplayName("Ab").valid).toBe(true);
  });

  it("rejects a name under 2 chars", () => {
    expect(validateDisplayName("A").valid).toBe(false);
    expect(validateDisplayName("").valid).toBe(false);
  });

  it("rejects a name over 50 chars", () => {
    expect(validateDisplayName("a".repeat(51)).valid).toBe(false);
  });

  it("rejects a name containing HTML tags", () => {
    expect(validateDisplayName("<script>alert(1)</script>").valid).toBe(false);
    expect(validateDisplayName("Name <b>bold</b>").valid).toBe(false);
  });

  it("accepts names with spaces and diacritics", () => {
    expect(validateDisplayName("Ľubomír Šimko").valid).toBe(true);
  });
});
