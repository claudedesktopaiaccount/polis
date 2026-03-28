import { describe, it, expect } from "vitest";
import { scrapeWikipediaPolls } from "./wikipedia";

const VALID_PARTY_IDS = new Set([
  "smer-sd",
  "ps",
  "hlas-sd",
  "kdh",
  "sas",
  "sns",
  "republika",
  "demokrati",
  "aliancia",
  "slovensko",
]);

/**
 * Integration test: fetches real Wikipedia polling data.
 * Skipped by default — run with: npm run test:integration
 *
 * Validates:
 * - At least 5 polls are returned
 * - Each poll has a valid agency name
 * - Each poll has a valid ISO date
 * - Each poll has recognized party IDs with sane percentages
 */
describe("Wikipedia scraper integration", () => {
  it("fetches and parses ≥5 polls with valid party IDs", { timeout: 30_000 }, async () => {
    const polls = await scrapeWikipediaPolls();

    // Must return a meaningful number of polls
    expect(polls.length).toBeGreaterThanOrEqual(5);

    for (const poll of polls) {
      // Agency should be non-empty
      expect(poll.agency).toBeTruthy();
      expect(poll.agency.length).toBeGreaterThan(0);

      // Date should be ISO format YYYY-MM-DD
      expect(poll.publishedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Should have at least 3 party results
      const partyIds = Object.keys(poll.results);
      expect(partyIds.length).toBeGreaterThanOrEqual(3);

      for (const [partyId, percentage] of Object.entries(poll.results)) {
        // Party ID should be recognized
        expect(VALID_PARTY_IDS).toContain(partyId);

        // Percentage should be sane (0-100, exclusive)
        expect(percentage).toBeGreaterThan(0);
        expect(percentage).toBeLessThan(100);
      }
    }
  });

  it("returns polls sorted by date (newest first)", { timeout: 30_000 }, async () => {
    const polls = await scrapeWikipediaPolls();

    for (let i = 1; i < polls.length; i++) {
      expect(polls[i - 1].publishedDate >= polls[i].publishedDate).toBe(true);
    }
  });
});
