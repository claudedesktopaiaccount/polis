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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-neutral-200 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-neutral-600 flex-1">
          Táto stránka používa cookies a fingerprinting na zabránenie duplicitným hlasom v sekcii Tipovanie.
          Viac informácií nájdete na stránke{" "}
          <Link href="/sukromie" className="text-violet-600 underline hover:text-violet-700">
            Ochrana súkromia
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Odmietnuť
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Prijať
          </button>
        </div>
      </div>
    </div>
  );
}
