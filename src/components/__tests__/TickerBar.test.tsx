import { describe, it, expect } from "vitest";
import { formatDelta, getDeltaClass } from "../TickerBar";

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
