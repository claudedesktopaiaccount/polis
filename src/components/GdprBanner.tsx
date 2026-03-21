"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getConsentStatus, setConsent } from "@/lib/consent";

export default function GdprBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsentStatus() === null) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function handleAccept() {
    setConsent("accepted");
    setVisible(false);
  }

  function handleReject() {
    setConsent("rejected");
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-surface border-t border-divider">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-text flex-1">
          Táto stránka používa cookies a fingerprinting na zabránenie duplicitným hlasom v sekcii Tipovanie.
          Viac informácií nájdete na stránke{" "}
          <Link href="/sukromie" className="text-ink underline underline-offset-2 hover:text-text transition-colors">
            Ochrana súkromia
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-medium text-text border border-divider hover:bg-hover transition-colors"
          >
            Odmietnuť
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-semibold bg-ink text-paper border border-ink hover:bg-transparent hover:text-ink transition-colors"
          >
            Prijať
          </button>
        </div>
      </div>
    </div>
  );
}
