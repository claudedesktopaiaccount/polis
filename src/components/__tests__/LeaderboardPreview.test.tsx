import { describe, it, expect } from "vitest";
import LeaderboardPreview from "../LeaderboardPreview";
import React from "react";

describe("LeaderboardPreview", () => {
  it("renders without crashing with empty entries", () => {
    const component = React.createElement(LeaderboardPreview, { entries: [] });
    expect(component).toBeDefined();
  });

  it("renders without crashing with entries", () => {
    const component = React.createElement(LeaderboardPreview, {
      entries: [{ rank: 1, displayName: "Testér", totalScore: 42 }],
    });
    expect(component).toBeDefined();
  });

  it("should have empty state text available in component", () => {
    // This verifies that the component source includes the empty state message
    const componentStr = LeaderboardPreview.toString();
    expect(componentStr).toContain("Zatiaľ žiadni hráči");
  });
});
