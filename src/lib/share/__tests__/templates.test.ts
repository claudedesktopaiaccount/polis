import { describe, it, expect } from "vitest";
import { generateQuizCard, generateScoreCard } from "../templates";

describe("Share card templates", () => {
  it("generates valid SVG for quiz results", () => {
    const svg = generateQuizCard({
      topParty: "Progresívne Slovensko",
      topScore: 78,
      partyColor: "#00BDFF",
    });
    expect(svg).toContain("<svg");
    expect(svg).toContain("Progresívne Slovensko");
    expect(svg).toContain("78%");
    expect(svg).toContain("#00BDFF");
  });

  it("generates valid SVG for score card", () => {
    const svg = generateScoreCard({
      score: 847,
      rank: 47,
      totalUsers: 1200,
    });
    expect(svg).toContain("<svg");
    expect(svg).toContain("847");
    expect(svg).toContain("#47");
  });

  it("escapes HTML entities in party names", () => {
    const svg = generateQuizCard({
      topParty: "Smer <script>",
      topScore: 50,
      partyColor: "#D82222",
    });
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });
});
