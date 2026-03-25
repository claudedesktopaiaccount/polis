import { describe, it, expect, vi } from "vitest";
import { getKalkulatorWeights, upsertKalkulatorWeight } from "./kalkulator";

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  all: vi.fn(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  onConflictDoUpdate: vi.fn().mockReturnThis(),
  run: vi.fn(),
};

describe("getKalkulatorWeights", () => {
  it("returns all weight rows", async () => {
    mockDb.all.mockResolvedValueOnce([
      { questionId: 1, answerIndex: 0, partyId: "ps", weight: 2, sourceUrl: null, updatedAt: "2026-01-01" },
    ]);
    // @ts-expect-error mock db
    const rows = await getKalkulatorWeights(mockDb);
    expect(rows).toHaveLength(1);
    expect(rows[0].partyId).toBe("ps");
  });
});

describe("upsertKalkulatorWeight", () => {
  it("calls insert with values", async () => {
    mockDb.run.mockResolvedValueOnce({});
    // @ts-expect-error mock db
    await upsertKalkulatorWeight(mockDb, {
      questionId: 1, answerIndex: 0, partyId: "ps", weight: 2, sourceUrl: null,
    });
    expect(mockDb.insert).toHaveBeenCalled();
  });
});
