import { describe, it, expect } from "vitest";
import { parseClaudeResponse } from "../route";

describe("parseClaudeResponse", () => {
  it("parses plain JSON array", () => {
    const raw = JSON.stringify([
      { text: "Zvýšenie mzdy", category: "Sociálne veci", isPro: true },
      { text: "Zníženie daní", category: "Ekonomika", isPro: true },
    ]);
    const result = parseClaudeResponse(raw);
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe("Zvýšenie mzdy");
    expect(result[0].isPro).toBe(true);
  });

  it("strips markdown fences from Claude response", () => {
    const raw = "```json\n[{\"text\":\"Test\",\"category\":\"Ekonomika\",\"isPro\":true}]\n```";
    const result = parseClaudeResponse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Test");
  });

  it("defaults isPro to true when missing", () => {
    const raw = JSON.stringify([{ text: "Test", category: "Ekonomika" }]);
    const result = parseClaudeResponse(raw);
    expect(result[0].isPro).toBe(true);
  });

  it("throws on non-array response", () => {
    expect(() => parseClaudeResponse('{"text": "bad"}')).toThrow("Expected array");
  });

  it("throws on missing required fields", () => {
    expect(() => parseClaudeResponse('[{"isPro": true}]')).toThrow("Invalid promise shape");
  });
});
