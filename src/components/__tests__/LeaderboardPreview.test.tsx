import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LeaderboardPreview from "../LeaderboardPreview";

describe("LeaderboardPreview", () => {
  it("shows empty state when no entries", () => {
    render(<LeaderboardPreview entries={[]} />);
    expect(screen.getByText(/Zatiaľ žiadni hráči/)).toBeInTheDocument();
  });

  it("renders entries when provided", () => {
    render(
      <LeaderboardPreview
        entries={[{ rank: 1, displayName: "Testér", totalScore: 42 }]}
      />
    );
    expect(screen.getByText(/Testér/)).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("always shows the leaderboard link", () => {
    render(<LeaderboardPreview entries={[]} />);
    expect(screen.getByText(/Zobraziť celý rebríček/)).toBeInTheDocument();
  });
});
