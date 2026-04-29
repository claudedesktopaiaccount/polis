"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

interface ApiKey {
  id: string;
  tier: string;
  createdAt: string;
  revokedAt: string | null;
}

interface Props {
  userKeys: ApiKey[];
  isLoggedIn: boolean;
  justUpgraded: boolean;
}

export default function ApiPristupClient({ userKeys, isLoggedIn, justUpgraded }: Props) {
  const [keys, setKeys] = useState(userKeys);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeKeys = keys.filter((k) => !k.revokedAt);

  async function handleCreateKey() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/keys", { method: "POST" });
      const data = await res.json() as { rawKey?: string; error?: string };
      if (!res.ok) { setError(data.error ?? "Chyba"); return; }
      setNewRawKey(data.rawKey!);
      const keysRes = await fetch("/api/keys");
      const keysData = await keysRes.json() as { keys: ApiKey[] };
      setKeys(keysData.keys);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <SectionHeading title={"API pr\u00EDstup"} />

      {justUpgraded && (
        <div className="border border-green-600 bg-green-50 p-4 mb-8 text-sm text-green-800">
          {"Platba prebehla \u00FAspešne. V\u00E1š k\u013E\u00FA\u010D bol pov\u00FDšen\u00FD na platen\u00FA verziu."}
        </div>
      )}

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="border border-divider p-6">
          <h2 className="font-newsreader text-lg font-bold mb-1">Zadarmo</h2>
          <p className="text-2xl font-bold mb-3">&euro;0</p>
          <ul className="text-sm space-y-1 text-ink/70 mb-4">
            <li>{"100 požiadaviek / de\u0148"}</li>
            <li>{"Pr\u00EDstup k /api/v1/polls"}</li>
            <li>{"Bez registr\u00E1cie platby"}</li>
          </ul>
        </div>
        <div className="border-2 border-ink p-6">
          <h2 className="font-newsreader text-lg font-bold mb-1">{"Platen\u00E9"}</h2>
          <p className="text-2xl font-bold mb-3">&euro;9 <span className="text-sm font-normal">/mesiac</span></p>
          <ul className="text-sm space-y-1 text-ink/70 mb-4">
            <li>{"Neobmedzen\u00E9 požiadavky"}</li>
            <li>{"Všetky endpointy"}</li>
            <li>{"Prioritn\u00E1 podpora"}</li>
          </ul>
          {isLoggedIn && (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-ink text-surface py-2 text-sm disabled:opacity-50"
            >
              {loading ? "Presmerovanie..." : "Prejs\u0165 na platen\u00E9"}
            </button>
          )}
        </div>
      </div>

      {/* Key management */}
      {isLoggedIn ? (
        <section>
          <h2 className="font-newsreader text-lg font-semibold mb-4">{"Vaše API k\u013E\u00FA\u010De"}</h2>

          {newRawKey && (
            <div className="border border-ink bg-ink/5 p-4 mb-4 text-sm">
              <p className="font-semibold mb-1">{"V\u00E1š nov\u00FD k\u013E\u00FA\u010D (zobraz\u00ED sa iba raz):"}</p>
              <code className="block font-mono text-xs bg-card border border-divider p-2 break-all">
                {newRawKey}
              </code>
              <p className="text-ink/50 mt-2 text-xs">{"Uložte si ho \u2014 znova ho nebudete m\u00F4c\u0165 zobrazi\u0165."}</p>
            </div>
          )}

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          {activeKeys.length === 0 ? (
            <p className="text-sm text-ink/60 mb-4">{"Nem\u00E1te žiadne akt\u00EDvne k\u013E\u00FA\u010De."}</p>
          ) : (
            <table className="w-full text-sm border-collapse mb-4">
              <thead>
                <tr className="border-b border-divider">
                  <th className="text-left py-2">{"ID k\u013E\u00FA\u010Da"}</th>
                  <th className="text-left py-2">Tier</th>
                  <th className="text-left py-2">{"Vytvoren\u00FD"}</th>
                </tr>
              </thead>
              <tbody>
                {activeKeys.map((k) => (
                  <tr key={k.id} className="border-b border-divider">
                    <td className="py-2 font-mono text-xs text-ink/60">{k.id.slice(0, 8)}&hellip;</td>
                    <td className="py-2">
                      <span className={k.tier === "paid" ? "text-green-700 font-semibold" : ""}>
                        {k.tier === "paid" ? "Platen\u00E9" : "Zadarmo"}
                      </span>
                    </td>
                    <td className="py-2 text-ink/60">{new Date(k.createdAt).toLocaleDateString("sk-SK")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeKeys.length < 3 && (
            <button
              onClick={handleCreateKey}
              disabled={loading}
              className="border border-ink px-4 py-2 text-sm hover:bg-hover disabled:opacity-50"
            >
              {loading ? "Vytv\u00E1ra sa..." : "Vytvori\u0165 nov\u00FD k\u013E\u00FA\u010D"}
            </button>
          )}
        </section>
      ) : (
        <p className="text-sm text-ink/70">
          <a href="/prihlasenie" className="underline">{"Prihl\u00E1ste sa"}</a>{" pre spr\u00E1vu API k\u013E\u00FA\u010Dov."}
        </p>
      )}

      {/* Docs */}
      <section className="mt-12 border-t border-divider pt-8">
        <h2 className="font-newsreader text-lg font-semibold mb-4">{"Dokument\u00E1cia"}</h2>
        <div className="text-sm space-y-4 font-mono">
          <div>
            <p className="font-sans font-semibold mb-1">GET /api/v1/polls</p>
            <code className="block bg-ink text-surface p-3 text-xs">
              curl https://volimto.sk/api/v1/polls?key=YOUR_KEY
            </code>
          </div>
          <div>
            <p className="font-sans font-semibold mb-1">{"Hlavi\u010Dka Authorization (alternat\u00EDva)"}</p>
            <code className="block bg-ink text-surface p-3 text-xs">
              curl -H &quot;Authorization: Bearer YOUR_KEY&quot; https://volimto.sk/api/v1/polls
            </code>
          </div>
        </div>
      </section>
    </main>
  );
}
