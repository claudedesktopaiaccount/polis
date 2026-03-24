"use client";

import { useState } from "react";
import { PARTY_LIST } from "@/lib/parties";

export default function AdminPolls() {
  const [agency, setAgency] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<Record<string, string>>(
    Object.fromEntries(PARTY_LIST.map(p => [p.id, ""]))
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const numericResults = Object.fromEntries(
      Object.entries(results)
        .filter(([, v]) => v !== "" && !isNaN(parseFloat(v)))
        .map(([k, v]) => [k, parseFloat(v)])
    );
    const res = await fetch("/api/admin/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agency, publishedDate: date, results: numericResults }),
    });
    setStatus(res.ok ? "saved" : "error");
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-2xl font-bold text-ink mb-6">Manuálny prieskum</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={agency}
          onChange={e => setAgency(e.target.value)}
          placeholder="Agentúra (napr. Focus)"
          required
          className="border border-divider px-3 py-2 text-sm bg-surface"
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          className="border border-divider px-3 py-2 text-sm bg-surface"
        />
        <div className="grid grid-cols-2 gap-2">
          {PARTY_LIST.map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <label className="text-xs font-mono w-20 text-muted">{p.abbreviation}</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={results[p.id]}
                onChange={e => setResults(r => ({ ...r, [p.id]: e.target.value }))}
                placeholder="%"
                className="flex-1 border border-divider px-2 py-1 text-sm bg-surface"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-ink text-surface px-4 py-2 text-sm font-semibold hover:opacity-80 disabled:opacity-50"
        >
          {status === "saving" ? "Ukladám..." : "Uložiť prieskum"}
        </button>
        {status === "saved" && <p className="text-sm text-green-700">Prieskum uložený.</p>}
        {status === "error" && <p className="text-sm text-red-600">Chyba. Skúste znova.</p>}
      </form>
    </div>
  );
}
