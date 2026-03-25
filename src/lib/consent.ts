/**
 * GDPR consent helpers — checks localStorage for fingerprinting consent.
 */

const CONSENT_KEY = "gdpr_consent";

export type ConsentStatus = "accepted" | "rejected" | null;

export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

export function hasConsent(): boolean {
  return getConsentStatus() === "accepted";
}

export function setConsent(status: "accepted" | "rejected"): void {
  localStorage.setItem(CONSENT_KEY, status);
  window.dispatchEvent(new CustomEvent("consent-change", { detail: status }));
}
