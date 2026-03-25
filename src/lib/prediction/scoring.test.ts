import { describe, it, expect } from "vitest";
import {
  scoreWinnerPick,
  scorePercentage,
  scoreCoalition,
  computeTotalScore,
} from "./scoring";

describe("scoreWinnerPick", () => {
  it("returns 100 for correct winner", () => {
    expect(scoreWinnerPick("ps", "ps")).toBe(100);
  });

  it("returns 0 for wrong winner", () => {
    expect(scoreWinnerPick("ps", "smer-sd")).toBe(0);
  });
});

describe("scorePercentage", () => {
  it("returns 50 for exact match", () => {
    expect(scorePercentage(25.0, 25.0)).toBe(50);
  });

  it("returns positive for small error", () => {
    expect(scorePercentage(25.0, 24.0)).toBe(49); // 50 - 1
  });

  it("returns 0 for large error (>7.07)", () => {
    expect(scorePercentage(30.0, 20.0)).toBe(0); // 50 - 100 = -50 → 0
  });

  it("clamps to 0, never negative", () => {
    expect(scorePercentage(0, 50)).toBe(0);
  });

  it("handles fractional values", () => {
    expect(scorePercentage(25.5, 25.0)).toBe(49.75); // 50 - 0.25
  });
});

describe("scoreCoalition", () => {
  it("returns 100 for exact match regardless of order", () => {
    expect(scoreCoalition(["ps", "sas", "kdh"], ["kdh", "ps", "sas"])).toBe(100);
  });

  it("returns 0 for completely wrong", () => {
    expect(scoreCoalition(["ps", "sas"], ["smer-sd", "sns"])).toBe(0);
  });

  it("returns partial credit for overlap", () => {
    // 2 correct out of 4 predicted = 50
    expect(scoreCoalition(["ps", "sas", "kdh", "demokrati"], ["ps", "sas", "smer-sd", "hlas"])).toBe(50);
  });

  it("caps at 100 even with many correct", () => {
    expect(scoreCoalition(["a", "b", "c", "d", "e"], ["a", "b", "c", "d", "e"])).toBe(100);
  });

  it("returns 100 for both empty", () => {
    expect(scoreCoalition([], [])).toBe(100);
  });

  it("returns 0 when predicted is empty but actual is not", () => {
    expect(scoreCoalition([], ["ps"])).toBe(0);
  });

  it("returns 25 for one correct out of many", () => {
    expect(scoreCoalition(["ps", "sas"], ["ps", "smer-sd"])).toBe(25);
  });
});

describe("computeTotalScore", () => {
  it("sums all components", () => {
    expect(computeTotalScore(100, 45, 75)).toBe(220);
  });

  it("handles all zeros", () => {
    expect(computeTotalScore(0, 0, 0)).toBe(0);
  });
});
