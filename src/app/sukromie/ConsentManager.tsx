"use client";

import { useState, useEffect } from "react";
import { getConsentStatus, setConsent, type ConsentStatus } from "@/lib/consent";

export default function ConsentManager() {
  const [status, setStatus] = useState<ConsentStatus>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStatus(getConsentStatus());
    setMounted(true);
  }, []);

  function handleChange(newStatus: "accepted" | "rejected") {
    setConsent(newStatus);
    setStatus(newStatus);
  }

  if (!mounted) return null;

  return (
    <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-800">Fingerprinting súhlas</span>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            status === "accepted"
              ? "bg-green-100 text-green-700"
              : status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {status === "accepted" ? "Povolený" : status === "rejected" ? "Odmietnutý" : "Nerozhodnuté"}
        </span>
      </div>
      <p className="text-sm text-neutral-600">
        Fingerprinting sa používa výhradne na zabránenie duplicitným hlasom v sekcii Tipovanie.
      </p>
      <div className="flex gap-3">
        {status !== "rejected" && (
          <button
            onClick={() => handleChange("rejected")}
            className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Odmietnuť
          </button>
        )}
        {status !== "accepted" && (
          <button
            onClick={() => handleChange("accepted")}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Povoliť
          </button>
        )}
      </div>
    </div>
  );
}
