import { describe, it, expect } from "vitest";

interface TickerItem {
  partyId: string;
  abbreviation: string;
  percentage: number;
  delta: number;
  color: string;
}

function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta.toFixed(1)}`;
  if (delta < 0) return `${delta.toFixed(1)}`;
  return "0.0";
}

function getDeltaClass(delta: number): string {
  if (delta > 0) return "delta-positive";
  if (delta < 0) return "delta-negative";
  return "delta-neutral";
}

describe("TickerBar — delta formatting", () => {
  it("formats positive delta with + prefix", () => {
    expect(formatDelta(1.2)).toBe("+1.2");
  });

  it("formats negative delta with - prefix", () => {
    expect(formatDelta(-0.5)).toBe("-0.5");
  });

  it("formats zero delta", () => {
    expect(formatDelta(0)).toBe("0.0");
  });

  it("returns correct CSS class for positive delta", () => {
    expect(getDeltaClass(1.2)).toBe("delta-positive");
  });

  it("returns correct CSS class for negative delta", () => {
    expect(getDeltaClass(-0.5)).toBe("delta-negative");
  });

  it("returns correct CSS class for zero delta", () => {
    expect(getDeltaClass(0)).toBe("delta-neutral");
  });
});
