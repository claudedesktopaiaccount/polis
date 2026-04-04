import { describe, it, expect, vi } from "vitest";
import { getPromisesForParty } from "./party-promises";

const mockRows = [
  {
    id: 1,
    partyId: "ps",
    promiseText: "Reforma justície",
    category: "Justícia",
    isPro: true,
    sourceUrl: null,
    status: "in_progress" as const,
  },
];

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockResolvedValueOnce(mockRows),
};

describe("getPromisesForParty", () => {
  it("returns promises including status field", async () => {
    // @ts-expect-error mock db
    const results = await getPromisesForParty(mockDb, "ps");
    expect(results[0]).toHaveProperty("status", "in_progress");
  });
});
