"use client";

import { useState } from "react";

export default function ExportDataButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleExport() {
    setStatus("loading");
    try {
      const csrfToken = document.cookie
        .split("; ")
        .find((c) => c.startsWith("pt_csrf="))
        ?.split("=")[1] ?? "";

      const res = await fetch("/api/gdpr/export", {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (!res.ok) throw new Error("Export failed");

      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `progressive-tracker-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={status === "loading"}
        className="px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Exportujem..." : "Stiahnuť moje údaje (JSON)"}
      </button>
      {status === "error" && (
        <p className="text-red-600 text-sm mt-2">Nastala chyba. Skúste to znova neskôr.</p>
      )}
    </div>
  );
}
