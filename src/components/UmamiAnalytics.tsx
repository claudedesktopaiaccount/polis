"use client";

import { useEffect, useCallback } from "react";
import { hasConsent } from "@/lib/consent";

const SCRIPT_ID = "umami-analytics";

function injectUmami() {
  if (document.getElementById(SCRIPT_ID)) return;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!websiteId) return;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://cloud.umami.is/script.js";
  script.defer = true;
  script.dataset.websiteId = websiteId;
  document.head.appendChild(script);
}

function removeUmami() {
  const script = document.getElementById(SCRIPT_ID);
  if (script) script.remove();
  delete (window as unknown as Record<string, unknown>).umami;
}

export default function UmamiAnalytics() {
  const handleConsentChange = useCallback((e: Event) => {
    const status = (e as CustomEvent).detail;
    if (status === "accepted") {
      injectUmami();
    } else {
      removeUmami();
    }
  }, []);

  useEffect(() => {
    if (hasConsent()) {
      injectUmami();
    }

    window.addEventListener("consent-change", handleConsentChange);
    return () => {
      window.removeEventListener("consent-change", handleConsentChange);
    };
  }, [handleConsentChange]);

  return null;
}
