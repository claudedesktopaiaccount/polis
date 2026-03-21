"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    fetch("/api/report-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      }),
    }).catch(() => {});
  }, [error]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <p className="text-6xl font-bold text-danger">Chyba</p>
      <h1 className="mt-4 font-serif text-2xl font-bold text-ink">
        Niečo sa pokazilo
      </h1>
      <p className="mt-2 text-sm text-text/60">
        Nepodarilo sa načítať dáta. Skúste to znova.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 text-sm font-semibold border border-ink hover:bg-transparent hover:text-ink transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Skúsiť znova
      </button>
    </div>
  );
}
