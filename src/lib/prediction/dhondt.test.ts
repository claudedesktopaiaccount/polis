import { describe, it, expect } from "vitest";
import { allocateSeats } from "./dhondt";

describe("allocateSeats", () => {
  it("allocates exactly 150 seats for parties above threshold", () => {
    const result = allocateSeats([
      { partyId: "ps", percentage: 25 },
      { partyId: "smer-sd", percentage: 22 },
      { partyId: "hlas-sd", percentage: 15 },
    ]);
    const total = result.reduce((s, r) => s + r.seats, 0);
    expect(total).toBe(150);
    expect(result).toHaveLength(3);
  });

  it("gives all 150 seats to single eligible party", () => {
    const result = allocateSeats([
      { partyId: "ps", percentage: 25 },
      { partyId: "a", percentage: 3 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].partyId).toBe("ps");
    expect(result[0].seats).toBe(150);
  });

  it("returns empty array when all parties below threshold", () => {
    const result = allocateSeats([
      { partyId: "a", percentage: 4.9 },
      { partyId: "b", percentage: 3.0 },
    ]);
    expect(result).toEqual([]);
  });

  it("includes party at exact 5.0% threshold", () => {
    const result = allocateSeats([
      { partyId: "ps", percentage: 25 },
      { partyId: "edge", percentage: 5.0 },
    ]);
    const edgeParty = result.find((r) => r.partyId === "edge");
    expect(edgeParty).toBeDefined();
    expect(edgeParty!.seats).toBeGreaterThan(0);
  });

  it("excludes party at 4.9%", () => {
    const result = allocateSeats([
      { partyId: "ps", percentage: 25 },
      { partyId: "below", percentage: 4.9 },
    ]);
    expect(result.find((r) => r.partyId === "below")).toBeUndefined();
  });

  it("splits seats equally between two equal parties", () => {
    const result = allocateSeats([
      { partyId: "a", percentage: 50 },
      { partyId: "b", percentage: 50 },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].seats).toBe(75);
    expect(result[1].seats).toBe(75);
  });

  it("is deterministic — same input produces same output", () => {
    const votes = [
      { partyId: "ps", percentage: 22 },
      { partyId: "smer-sd", percentage: 20 },
      { partyId: "hlas-sd", percentage: 14 },
      { partyId: "kdh", percentage: 8 },
    ];
    const r1 = allocateSeats(votes);
    const r2 = allocateSeats(votes);
    expect(r1).toEqual(r2);
  });

  it("normalizes percentages that don't sum to 100", () => {
    const result = allocateSeats([
      { partyId: "a", percentage: 10 },
      { partyId: "b", percentage: 8 },
      { partyId: "c", percentage: 6 },
    ]);
    const total = result.reduce((s, r) => s + r.seats, 0);
    expect(total).toBe(150);
  });
});
