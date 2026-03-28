/** Read the CSRF token set by middleware from the `pt_csrf` cookie. */
export function getCsrfToken(): string {
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith("pt_csrf="))
      ?.split("=")[1] ?? ""
  );
}
