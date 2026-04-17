import { describe, it, expect } from "vitest";
import { CATEGORIES, type Category } from "./categories";

describe("categories", () => {
  it("has exactly 10 values", () => {
    expect(CATEGORIES).toHaveLength(10);
  });

  it("contains all required values", () => {
    const required = [
      "Ekonomika",
      "Zdravotníctvo",
      "Školstvo",
      "Bezpečnosť",
      "Zahraničná politika",
      "Sociálne",
      "Životné prostredie",
      "Právny štát",
      "Doprava",
      "Iné",
    ] as const;
    for (const cat of required) {
      expect(CATEGORIES).toContain(cat);
    }
  });

  it("is readonly (as const)", () => {
    const cat: Category = "Ekonomika";
    expect(cat).toBe("Ekonomika");
  });
});
