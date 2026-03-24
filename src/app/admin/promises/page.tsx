"use client";

import { useEffect, useState } from "react";
import { PARTY_LIST } from "@/lib/parties";

interface Promise { id: number; partyId: string; promiseText: string; category: string; isPro: boolean; sourceUrl: string | null }

export default function AdminPromises() {
  const [promises, setPromises] = useState<Promise[]>([]);
  const [form, setForm] = useState({ partyId: "ps", promiseText: "", category: "", isPro: true, sourceUrl: "" });

  async function load() {
    const res = await fetch("/api/admin/promises");
    if (res.ok) setPromises(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/promises", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ partyId: "ps", promiseText: "", category: "", isPro: true, sourceUrl: "" });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Zmazať tento sľub?")) return;
    await fetch("/api/admin/promises", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-ink mb-6">Programové sľuby</h1>

      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 p-4 border border-divider">
        <select value={form.partyId} onChange={e => setForm(f => ({ ...f, partyId: e.target.value }))} className="border border-divider px-2 py-2 text-sm bg-surface">
          {PARTY_LIST.map(p => <option key={p.id} value={p.id}>{p.abbreviation}</option>)}
        </select>
        <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Kategória" className="border border-divider px-2 py-2 text-sm bg-surface" required />
        <textarea value={form.promiseText} onChange={e => setForm(f => ({ ...f, promiseText: e.target.value }))} placeholder="Text sľubu" className="border border-divider px-2 py-2 text-sm bg-surface sm:col-span-2" required />
        <input value={form.sourceUrl} onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))} placeholder="URL zdroja (voliteľné)" className="border border-divider px-2 py-2 text-sm bg-surface sm:col-span-2" />
        <button type="submit" className="bg-ink text-surface px-4 py-2 text-sm font-semibold sm:col-span-2 hover:opacity-80">Pridať sľub</button>
      </form>

      <table className="w-full text-sm border-collapse">
        <thead><tr className="border-b border-divider text-left">
          <th className="py-2 pr-4 font-semibold text-muted text-xs uppercase tracking-wide">Strana</th>
          <th className="py-2 pr-4 font-semibold text-muted text-xs uppercase tracking-wide">Sľub</th>
          <th className="py-2 pr-4 font-semibold text-muted text-xs uppercase tracking-wide">Kategória</th>
          <th className="py-2"></th>
        </tr></thead>
        <tbody>
          {promises.map(p => (
            <tr key={p.id} className="border-b border-divider">
              <td className="py-2 pr-4 font-mono text-xs">{p.partyId}</td>
              <td className="py-2 pr-4">{p.promiseText}</td>
              <td className="py-2 pr-4 text-muted">{p.category}</td>
              <td className="py-2"><button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-700">Zmazať</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
