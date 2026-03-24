"use client";

import { useState } from "react";

interface Props {
  source?: string;
  compact?: boolean;
}

export default function NewsletterSignup({ source = "web", compact = false }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
    });

    if (res.ok) {
      setStatus("success");
    } else {
      const data = await res.json().catch(() => ({}) as Record<string, unknown>);
      setStatus((data as Record<string, unknown>).error === "already_subscribed" ? "duplicate" : "error");
    }
  }

  if (status === "success") {
    return (
      <p className={`font-medium ${compact ? "text-sm" : "text-base"}`}>
        ✓ Prihlásili ste sa. Ďakujeme!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "flex gap-2" : "flex flex-col sm:flex-row gap-3 max-w-md"}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="váš@email.sk"
        required
        disabled={status === "loading"}
        className={`flex-1 border border-divider bg-surface px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-ink ${compact ? "" : "rounded-none"}`}
      />
      <button
        type="submit"
        disabled={status === "loading" || !email}
        className="bg-ink text-surface px-4 py-2 text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50 whitespace-nowrap"
      >
        {status === "loading" ? "..." : "Odoberať"}
      </button>
      {status === "duplicate" && (
        <p className="text-xs text-muted mt-1 w-full">Táto adresa je už prihlásená.</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-600 mt-1 w-full">Chyba. Skúste znova.</p>
      )}
    </form>
  );
}
