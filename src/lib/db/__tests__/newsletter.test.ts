import { describe, it, expect, vi, beforeEach } from "vitest";
import { subscribeEmail, isAlreadySubscribed } from "../newsletter";

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

describe("subscribeEmail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts a new subscriber", async () => {
    mockDb.limit.mockResolvedValue([]);
    mockDb.values.mockResolvedValue(undefined);
    await expect(subscribeEmail(mockDb as any, "test@example.com", "homepage")).resolves.not.toThrow();
  });

  it("throws if email already subscribed", async () => {
    mockDb.limit.mockResolvedValue([{ id: 1 }]);
    await expect(subscribeEmail(mockDb as any, "existing@example.com")).rejects.toThrow("already_subscribed");
  });
});

describe("isAlreadySubscribed", () => {
  it("returns true when subscriber exists", async () => {
    mockDb.limit.mockResolvedValue([{ id: 1 }]);
    const result = await isAlreadySubscribed(mockDb as any, "user@example.com");
    expect(result).toBe(true);
  });

  it("returns false when subscriber does not exist", async () => {
    mockDb.limit.mockResolvedValue([]);
    const result = await isAlreadySubscribed(mockDb as any, "new@example.com");
    expect(result).toBe(false);
  });
});
