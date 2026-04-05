import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOrGenerateNarrative } from "./narrative";
import type { AggregatedParty } from "@/lib/poll-aggregate";
import type { SimulationResult } from "./monte-carlo";

// Mock Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "Test narrative text." }],
      }),
    },
  })),
}));

import Anthropic from "@anthropic-ai/sdk";
const MockAnthropic = vi.mocked(Anthropic);

const AGGREGATED: AggregatedParty[] = [
  { partyId: "ps", meanPct: 25, stdDev: 2, pollCount: 5, oldestPollDate: "2026-01-01", newestPollDate: "2026-04-01" },
  { partyId: "smer-sd", meanPct: 22, stdDev: 2, pollCount: 5, oldestPollDate: "2026-01-01", newestPollDate: "2026-04-01" },
];

const SIMULATION: SimulationResult[] = [
  { partyId: "ps", meanPct: 25, medianPct: 25, lowerBound: 21, upperBound: 29, meanSeats: 42, winProbability: 0.6, parliamentProbability: 1.0 },
  { partyId: "smer-sd", meanPct: 22, medianPct: 22, lowerBound: 18, upperBound: 26, meanSeats: 36, winProbability: 0.4, parliamentProbability: 1.0 },
];

function makeDb(cachedRow: { inputHash: string; narrative: string } | null) {
  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(cachedRow ? [cachedRow] : []),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getOrGenerateNarrative", () => {
  it("returns cached narrative when hash matches — no API call", async () => {
    // Pre-compute the hash that will match AGGREGATED
    // (we test that Claude is NOT called, not the exact hash value)
    const { createHash } = await import("crypto");
    const hash = createHash("sha256").update(JSON.stringify(AGGREGATED)).digest("hex");

    const db = makeDb({ inputHash: hash, narrative: "Cached narrative." });
    const result = await getOrGenerateNarrative(db as never, AGGREGATED, SIMULATION, "key");

    expect(result).toBe("Cached narrative.");
    expect(MockAnthropic).not.toHaveBeenCalled();
  });

  it("calls Claude and upserts when hash differs", async () => {
    const db = makeDb({ inputHash: "old-hash", narrative: "Old narrative." });
    const result = await getOrGenerateNarrative(db as never, AGGREGATED, SIMULATION, "test-key");

    expect(result).toBe("Test narrative text.");
    expect(MockAnthropic).toHaveBeenCalledWith({ apiKey: "test-key" });
    expect(db.insert).toHaveBeenCalled();
  });

  it("calls Claude when no cached row exists", async () => {
    const db = makeDb(null);
    const result = await getOrGenerateNarrative(db as never, AGGREGATED, SIMULATION, "test-key");

    expect(result).toBe("Test narrative text.");
    expect(db.insert).toHaveBeenCalled();
  });

  it("returns stale narrative when Claude fails and cache exists", async () => {
    const db = makeDb({ inputHash: "old-hash", narrative: "Stale narrative." });
    const mockInstance = { messages: { create: vi.fn().mockRejectedValue(new Error("API down")) } };
    MockAnthropic.mockImplementationOnce(() => mockInstance as never);

    const result = await getOrGenerateNarrative(db as never, AGGREGATED, SIMULATION, "key");

    expect(result).toBe("Stale narrative.");
  });

  it("returns null when Claude fails and no cache exists", async () => {
    const db = makeDb(null);
    const mockInstance = { messages: { create: vi.fn().mockRejectedValue(new Error("API down")) } };
    MockAnthropic.mockImplementationOnce(() => mockInstance as never);

    const result = await getOrGenerateNarrative(db as never, AGGREGATED, SIMULATION, "key");

    expect(result).toBeNull();
  });

  it("returns null when no apiKey and no cache", async () => {
    const db = makeDb(null);
    const result = await getOrGenerateNarrative(db as never, AGGREGATED, SIMULATION, undefined);

    expect(result).toBeNull();
    expect(MockAnthropic).not.toHaveBeenCalled();
  });

  it("returns stale narrative when no apiKey but cache exists", async () => {
    const db = makeDb({ inputHash: "any-hash", narrative: "Stale narrative." });
    // hash will differ (no apiKey provided), falls back to stale
    const result = await getOrGenerateNarrative(db as never, AGGREGATED, SIMULATION, undefined);

    expect(result).toBe("Stale narrative.");
  });
});
