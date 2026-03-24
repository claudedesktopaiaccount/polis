import { test, expect } from "@playwright/test";

test("newsletter signup — success flow", async ({ page }) => {
  await page.goto("/newsletter");
  await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
  await page.click('button[type="submit"]');
  await expect(page.locator("text=Prihlásili ste sa")).toBeVisible({ timeout: 5000 });
});

test("newsletter signup — duplicate detection", async ({ page }) => {
  const email = `dup-${Date.now()}@example.com`;
  await page.goto("/newsletter");
  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');
  await expect(page.locator("text=Prihlásili ste sa")).toBeVisible();

  await page.goto("/");
  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');
  await expect(page.locator("text=Táto adresa je už prihlásená")).toBeVisible({ timeout: 5000 });
});
