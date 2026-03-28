import { test, expect } from "@playwright/test";

test.describe("Volebný kalkulátor", () => {
  test("renders first question", async ({ page }) => {
    await page.goto("/volebny-kalkulator");

    // Should show quiz title
    const pageText = await page.textContent("body");
    expect(pageText).toContain("Koho voliť?");

    // Should show question progress (1 of 20)
    await expect(page.getByText(/Otázka 1 z 20/i)).toBeVisible();

    // Should show answer buttons
    const answerButtons = page.locator('[aria-label*="Odpoveď"]');
    const buttonCount = await answerButtons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(2);
  });

  test("can navigate through questions", async ({ page }) => {
    await page.goto("/volebny-kalkulator");

    // Answer question 1
    const firstAnswer = page.locator('[aria-label*="Odpoveď"]').first();
    await firstAnswer.click();

    // Should advance to question 2
    await expect(page.getByText(/Otázka 2 z 20/i)).toBeVisible();

    // Back button should now be visible
    const backButton = page.getByRole("button", {
      name: /predchádzajúca/i,
    });
    await expect(backButton).toBeVisible();

    // Click back
    await backButton.click();
    await expect(page.getByText(/Otázka 1 z 20/i)).toBeVisible();
  });

  test("completing all 20 questions shows results", async ({ page }) => {
    await page.goto("/volebny-kalkulator");

    // Answer all 20 questions by clicking the first answer each time
    for (let q = 1; q <= 20; q++) {
      // Verify we're on the right question
      await expect(page.getByText(`Otázka ${q} z 20`)).toBeVisible({
        timeout: 5_000,
      });

      // Click first answer
      const answer = page.locator('[aria-label*="Odpoveď"]').first();
      await answer.click();
    }

    // After 20 questions, results should be displayed
    // Look for party names or "zhoda" (match) in results
    const resultsText = await page.textContent("body");
    const hasResults =
      resultsText?.includes("zhoda") ||
      resultsText?.includes("Skúsiť znova") ||
      resultsText?.includes("výsledk") ||
      resultsText?.includes("%");
    expect(hasResults).toBeTruthy();
  });

  test("restart button works after completing quiz", async ({ page }) => {
    await page.goto("/volebny-kalkulator");

    // Complete all 20 questions
    for (let q = 1; q <= 20; q++) {
      await expect(page.getByText(`Otázka ${q} z 20`)).toBeVisible({
        timeout: 5_000,
      });
      const answer = page.locator('[aria-label*="Odpoveď"]').first();
      await answer.click();
    }

    // Click restart button
    const restartButton = page.getByRole("button", { name: /skúsiť znova/i });
    await expect(restartButton).toBeVisible();
    await restartButton.click();

    // Should be back at question 1
    await expect(page.getByText(/Otázka 1 z 20/i)).toBeVisible();
  });
});
