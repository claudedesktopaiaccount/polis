"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError(true);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-32 px-4">
      <h1 className="font-serif text-2xl font-bold text-ink mb-6">Admin prístup</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Admin heslo"
          className="border border-divider px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:border-ink"
        />
        <button type="submit" className="bg-ink text-surface px-4 py-2 text-sm font-semibold hover:opacity-80">
          Prihlásiť
        </button>
        {error && <p className="text-xs text-red-600">Nesprávne heslo.</p>}
      </form>
    </div>
  );
}
