"use client";

import { useState } from "react";

export default function DeleteDataButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleDelete() {
    if (!confirm("Naozaj chcete vymazať všetky vaše údaje? Táto akcia je nevratná.")) return;

    setStatus("loading");
    try {
      const csrfToken = document.cookie
        .split("; ")
        .find((c) => c.startsWith("pt_csrf="))
        ?.split("=")[1] ?? "";

      const res = await fetch("/api/gdpr/delete", {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (!res.ok) throw new Error("Delete failed");

      // Clear consent from localStorage
      localStorage.removeItem("gdpr_consent");

      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="text-ink font-medium">
        Vaše údaje boli úspešne vymazané.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={status === "loading"}
        className="px-6 py-3 bg-danger text-paper font-semibold text-sm border border-danger hover:bg-transparent hover:text-danger transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Mazanie..." : "Vymazať moje údaje"}
      </button>
      {status === "error" && (
        <p className="text-danger text-sm mt-2">Nastala chyba. Skúste to znova neskôr.</p>
      )}
    </div>
  );
}
