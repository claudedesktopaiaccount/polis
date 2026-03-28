import { test, expect } from "@playwright/test";

test.describe("Prieskumy (Polls)", () => {
  test("renders chart after dynamic import", async ({ page }) => {
    await page.goto("/prieskumy");

    // Wait for Recharts chart to load (dynamically imported with ssr: false)
    const chart = page.locator(".recharts-surface");
    await expect(chart).toBeVisible({ timeout: 15_000 });

    // Chart should contain SVG elements (lines/bars)
    const svgPaths = page.locator(".recharts-surface path");
    const pathCount = await svgPaths.count();
    expect(pathCount).toBeGreaterThan(0);
  });

  test("time range buttons work", async ({ page }) => {
    await page.goto("/prieskumy");

    // Wait for chart to load
    await page.locator(".recharts-surface").waitFor({ timeout: 15_000 });

    // Time range buttons should be visible
    const buttons = ["6 mesiacov", "1 rok", "Všetko"];
    for (const label of buttons) {
      const button = page.getByRole("button", { name: label });
      await expect(button).toBeVisible();
    }

    // Click each time range button — should not crash
    for (const label of buttons) {
      const button = page.getByRole("button", { name: label });
      await button.click();
      // Chart should still be visible after switching
      await expect(page.locator(".recharts-surface")).toBeVisible();
    }
  });

  test("shows party bars with percentage values", async ({ page }) => {
    await page.goto("/prieskumy");

    // Page should contain percentage values (e.g., "23.5 %")
    const pageText = await page.textContent("body");
    expect(pageText).toMatch(/\d+[.,]\d+\s*%/);
  });

  test("raw data table toggle works", async ({ page }) => {
    await page.goto("/prieskumy");

    // Look for the toggle button
    const toggleButton = page.getByRole("button", { name: /dáta|tabuľk/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Table should become visible with headers
      const table = page.locator("table");
      await expect(table.first()).toBeVisible();
    }
  });
});
