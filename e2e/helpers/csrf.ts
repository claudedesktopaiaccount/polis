import { type Page } from "@playwright/test";

/**
 * Inject CSRF and visitor cookies into the Playwright browser context.
 * Bypasses the `secure: true` flag that middleware sets on pt_csrf,
 * which would otherwise block cookie setting on http://localhost.
 */
export async function injectCsrfCookie(page: Page, token?: string) {
  const csrfToken = token ?? crypto.randomUUID();
  await page.context().addCookies([
    {
      name: "pt_csrf",
      value: csrfToken,
      domain: "localhost",
      path: "/",
      sameSite: "Lax",
      httpOnly: false,
    },
  ]);
  return csrfToken;
}

export async function injectVisitorCookie(page: Page, visitorId?: string) {
  const id = visitorId ?? crypto.randomUUID();
  await page.context().addCookies([
    {
      name: "pt_visitor",
      value: id,
      domain: "localhost",
      path: "/",
      sameSite: "Lax",
      httpOnly: true,
    },
  ]);
  return id;
}

/**
 * Inject both CSRF and visitor cookies. Returns both values.
 */
export async function injectAuthCookies(page: Page) {
  const csrfToken = await injectCsrfCookie(page);
  const visitorId = await injectVisitorCookie(page);
  return { csrfToken, visitorId };
}
