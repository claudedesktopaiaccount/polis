"use client";

import { useState } from "react";
import { PARTY_LIST, PARTIES } from "@/lib/parties";
import ShareButtons from "@/components/ShareButtons";
import { getFingerprint } from "@/lib/fingerprint";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export interface CrowdData {
  partyId: string;
  totalBets: number;
  avgPct?: number;
}

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalScore: number;
  winnerScore: number;
  percentageScore: number;
  coalitionScore: number;
}

interface Props {
  initialCrowd: CrowdData[];
  initialTotalBets: number;
  leaderboard?: LeaderboardEntry[];
}

export default function TipovanieClient({ initialCrowd, initialTotalBets, leaderboard = [] }: Props) {
  const { user } = useAuth();
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyVotedParty, setAlreadyVotedParty] = useState<string | null>(null);
  const [crowdData, setCrowdData] = useState<CrowdData[]>(initialCrowd);
  const [totalBets, setTotalBets] = useState(initialTotalBets);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [predictedPcts, setPredictedPcts] = useState<Record<string, string>>({});
  const [coalitionPick, setCoalitionPick] = useState<Set<string>>(new Set());

  async function handleSubmit() {
    if (!selectedWinner) return;
    setSubmitting(true);

    try {
      const fingerprint = await getFingerprint();
      const csrfToken = document.cookie
        .split("; ")
        .find((c) => c.startsWith("pt_csrf="))
        ?.split("=")[1] ?? "";

      const res = await fetch("/api/tipovanie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          selectedWinner,
          fingerprint,
          ...(showAdvanced && Object.keys(predictedPcts).length > 0
            ? { predictedPercentages: Object.fromEntries(
                Object.entries(predictedPcts)
                  .filter(([, v]) => v !== "")
                  .map(([k, v]) => [k, parseFloat(v)])
              ) }
            : {}),
          ...(showAdvanced && coalitionPick.size > 0
            ? { coalitionPick: [...coalitionPick] }
            : {}),
        }),
      });

      const data = await res.json() as { error?: string; partyId?: string };

      if (res.status === 409 && data.error === "already_voted") {
        setAlreadyVotedParty(data.partyId ?? null);
        setSelectedWinner(data.partyId ?? null);
        setSubmitted(true);
        const crowdRes = await fetch("/api/tipovanie");
        if (crowdRes.ok) {
          const crowd = await crowdRes.json() as { aggregates: CrowdData[]; totalBets: number };
          setCrowdData(crowd.aggregates);
          setTotalBets(crowd.totalBets);
        }
        return;
      }

      if (!res.ok) throw new Error("Submit failed");

      const crowdRes = await fetch("/api/tipovanie");
      if (crowdRes.ok) {
        const crowd = await crowdRes.json() as { aggregates: CrowdData[]; totalBets: number };
        setCrowdData(crowd.aggregates);
        setTotalBets(crowd.totalBets);
      }

      setSubmitted(true);
    } catch (e) {
      console.error("Submit error:", e);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedParty = selectedWinner ? PARTIES[selectedWinner] : null;

  return (
    <>
    <div className="lg:grid lg:grid-cols-2 lg:gap-8">
      {/* Left: Voting */}
      <div>
        {!submitted ? (
          <>
            {/* Selected party preview */}
            {selectedParty && (
              <div className="border border-divider bg-surface p-6 mb-6 text-center">
                <p className="text-xs font-medium uppercase tracking-widest text-text/50 mb-2">
                  Váš tip na víťaza
                </p>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div
                    className="w-4 h-4 shrink-0"
                    style={{ backgroundColor: selectedParty.color }}
                  />
                  <h3 className="font-serif text-2xl font-bold text-ink">
                    {selectedParty.name}
                  </h3>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-ink text-paper font-semibold text-sm hover:bg-transparent hover:text-ink border border-ink transition-colors"
                  >
                    {submitting ? "Odosielam..." : "Odoslať tip"}
                  </button>
                  <button
                    onClick={() => setSelectedWinner(null)}
                    className="px-6 py-2.5 border border-divider text-text text-sm font-medium hover:bg-hover transition-colors"
                  >
                    Zmeniť
                  </button>
                </div>
              </div>
            )}

            {/* Advanced predictions toggle */}
            {selectedWinner && (
              <div className="mb-6">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-text/50 hover:text-ink underline transition-colors"
                >
                  {showAdvanced ? "Skryť rozšírené tipovanie" : "Rozšírené tipovanie (percentá, koalícia)"}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4">
                    {/* Percentage predictions */}
                    <div className="border border-divider bg-surface p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-ink mb-3">
                        Tipnite percentá strán
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {PARTY_LIST.map((party) => (
                          <div key={party.id} className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 shrink-0"
                              style={{ backgroundColor: party.color }}
                            />
                            <span className="text-xs text-text truncate flex-1">
                              {party.abbreviation}
                            </span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="—"
                              value={predictedPcts[party.id] ?? ""}
                              onChange={(e) =>
                                setPredictedPcts((prev) => ({
                                  ...prev,
                                  [party.id]: e.target.value,
                                }))
                              }
                              className="w-16 px-2 py-1 text-xs text-right border border-divider bg-transparent tabular-nums focus:border-ink focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coalition prediction */}
                    <div className="border border-divider bg-surface p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-ink mb-3">
                        Tipnite koalíciu
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {PARTY_LIST.map((party) => {
                          const isInCoalition = coalitionPick.has(party.id);
                          return (
                            <button
                              key={party.id}
                              onClick={() => {
                                setCoalitionPick((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(party.id)) next.delete(party.id);
                                  else next.add(party.id);
                                  return next;
                                });
                              }}
                              className={`px-3 py-1.5 text-xs border transition-colors ${
                                isInCoalition
                                  ? "border-ink bg-ink text-paper font-medium"
                                  : "border-divider text-text hover:border-ink"
                              }`}
                            >
                              {party.abbreviation}
                            </button>
                          );
                        })}
                      </div>
                      {coalitionPick.size > 0 && (
                        <p className="text-xs text-text/40 mt-2">
                          {coalitionPick.size} {coalitionPick.size === 1 ? "strana" : coalitionPick.size < 5 ? "strany" : "strán"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Party list */}
            <div className="border border-divider bg-surface p-6 mb-6 lg:mb-0">
              <h3 className="font-serif text-xl font-bold text-ink mb-1">
                Kto vyhrá voľby?
              </h3>
              <p className="text-xs text-text/50 mb-4">
                Vyberte stranu, ktorá podľa vás vyhrá najbližšie parlamentné voľby
              </p>
              <div className="divide-y divide-divider">
                {PARTY_LIST.map((party) => {
                  const isSelected = selectedWinner === party.id;
                  return (
                    <button
                      key={party.id}
                      onClick={() => setSelectedWinner(party.id)}
                      aria-pressed={isSelected}
                      aria-label={`Tipovať ${party.name}`}
                      className={`w-full flex items-center gap-3 py-3 px-2 text-left transition-colors ${
                        isSelected ? "bg-hover" : "hover:bg-hover"
                      }`}
                    >
                      <div
                        className="w-3 h-3 shrink-0"
                        style={{ backgroundColor: party.color }}
                      />
                      <span className={`flex-1 text-sm ${isSelected ? "font-bold text-ink" : "text-text"}`}>
                        {party.name}
                      </span>
                      <span className="text-xs text-text/40">{party.leader}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-ink" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              {!selectedWinner && (
                <div className="mt-4 pt-4 border-t border-divider">
                  <button
                    disabled
                    className="w-full py-3 border border-divider text-text/30 font-semibold text-sm cursor-not-allowed"
                  >
                    Vyberte stranu
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Success state */
          <div className="border border-divider bg-surface p-6 mb-8 lg:mb-0 text-center">
            <div className="mb-3">
              <svg className="w-10 h-10 mx-auto text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-ink mb-1">
              {alreadyVotedParty ? "Už ste hlasovali" : "Tip prijatý!"}
            </h3>
            <p className="text-sm text-text/60">
              Tipujete výhru: <strong style={{ color: selectedParty?.color }}>{selectedParty?.name}</strong>
            </p>
            {user ? (
              <p className="text-xs text-text/40 mt-2">Prihlásený ako {user.displayName}</p>
            ) : (
              <p className="text-xs text-text/50 mt-3">
                <Link href="/prihlasenie" className="underline hover:text-ink">
                  Prihláste sa
                </Link>{" "}
                pre uloženie tipu naprieč zariadeniami
              </p>
            )}
            <ShareButtons
              url={typeof window !== "undefined" ? window.location.href : "/tipovanie"}
              title="Tipujem voľby na Polis"
              description="Tipnite si víťaza slovenských parlamentných volieb."
            />
            <Link
              href="/tipovanie/rebricek"
              className="inline-block mt-3 text-sm text-muted hover:text-ink underline"
            >
              Pozrite si rebríček predpovedí →
            </Link>
          </div>
        )}
      </div>

      {/* Right: Crowd results + avg percentages */}
      <div>
        {totalBets > 0 ? (
          <div className="border border-divider bg-surface p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-ink">Hlas ľudu</h3>
              <span className="text-xs text-text/40 tabular-nums">
                {totalBets.toLocaleString("sk-SK")} tipov
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th className="text-left py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                      #
                    </th>
                    <th className="text-left py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                      Strana
                    </th>
                    <th className="text-right py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                      Tipy
                    </th>
                    <th className="text-right py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider w-1/3">
                      Podiel
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...crowdData]
                    .sort((a, b) => b.totalBets - a.totalBets)
                    .map((item, i) => {
                      const party = PARTIES[item.partyId];
                      const pct = totalBets > 0 ? (item.totalBets / totalBets) * 100 : 0;
                      const maxBets = Math.max(...crowdData.map((d) => d.totalBets), 1);
                      const barWidth = (item.totalBets / maxBets) * 100;

                      return (
                        <tr key={item.partyId} className="border-b border-divider hover:bg-hover">
                          <td className="py-2.5 px-2 tabular-nums text-text/40 text-xs">
                            {i + 1}.
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 shrink-0"
                                style={{ backgroundColor: party?.color }}
                              />
                              <span className="font-medium text-ink text-xs">
                                {party?.abbreviation}
                              </span>
                            </div>
                          </td>
                          <td className="text-right py-2.5 px-2 tabular-nums text-text/60 text-xs">
                            {item.totalBets}
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-4 bg-hover overflow-hidden">
                                <div
                                  className="h-full transition-all duration-500"
                                  style={{
                                    width: `${barWidth}%`,
                                    backgroundColor: party?.color,
                                  }}
                                />
                              </div>
                              <span
                                className="text-xs font-bold tabular-nums w-12 text-right"
                                style={{ color: party?.color }}
                              >
                                {pct.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border border-divider bg-surface p-6 text-center">
            <h3 className="font-serif text-xl font-bold text-ink mb-2">Hlas ľudu</h3>
            <p className="text-sm text-text/50">Zatiaľ žiadne tipy. Buďte prvý!</p>
          </div>
        )}
      </div>
    </div>

    {/* Leaderboard section — full width below grid */}
    {leaderboard.length > 0 && (
      <section className="mt-8 border-t border-divider pt-6">
        <h2 className="font-serif text-2xl font-bold mb-1">Rebríček prediktorov</h2>
        <p className="text-sm text-text/50 mb-4">Kto najlepšie predpovedá voľby?</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink text-left">
                <th className="py-2 pr-3 font-semibold">#</th>
                <th className="py-2 pr-3 font-semibold">Meno</th>
                <th className="py-2 pr-3 font-semibold text-right">Víťaz</th>
                <th className="py-2 pr-3 font-semibold text-right">Percentá</th>
                <th className="py-2 pr-3 font-semibold text-right">Koalícia</th>
                <th className="py-2 font-semibold text-right">Celkom</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((e) => (
                <tr key={e.rank} className="border-b border-divider hover:bg-hover transition-colors">
                  <td className="py-2 pr-3 font-mono">{e.rank}.</td>
                  <td className="py-2 pr-3">{e.displayName}</td>
                  <td className="py-2 pr-3 text-right data-value">{e.winnerScore.toFixed(0)}</td>
                  <td className="py-2 pr-3 text-right data-value">{e.percentageScore.toFixed(0)}</td>
                  <td className="py-2 pr-3 text-right data-value">{e.coalitionScore.toFixed(0)}</td>
                  <td className="py-2 text-right data-value font-bold">{e.totalScore.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!user && (
          <div className="mt-4 p-3 bg-hover/50 border border-divider text-sm text-center">
            <Link href="/registracia" className="text-info font-medium hover:underline">
              Zaregistruj sa
            </Link>
            {" "}a sleduj svoje skóre v rebríčku.
          </div>
        )}
      </section>
    )}

    {/* Crowd consensus — avg predicted percentages */}
    {crowdData.some((c) => (c.avgPct ?? 0) > 0) && (
      <section className="mt-8 border-t border-divider pt-6">
        <h2 className="font-serif text-xl font-bold mb-4">Čo tipuje dav?</h2>
        <div className="space-y-2">
          {[...crowdData]
            .filter((c) => (c.avgPct ?? 0) > 0)
            .sort((a, b) => (b.avgPct ?? 0) - (a.avgPct ?? 0))
            .map((c) => {
              const party = PARTIES[c.partyId];
              if (!party) return null;
              return (
                <div key={c.partyId} className="flex items-center gap-3">
                  <span className="w-12 text-xs font-semibold">{party.abbreviation}</span>
                  <div className="flex-1 h-5 bg-divider/30 relative">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${Math.min(((c.avgPct ?? 0) / 30) * 100, 100)}%`,
                        backgroundColor: party.color,
                      }}
                    />
                  </div>
                  <span className="data-value text-sm font-bold w-14 text-right">
                    {(c.avgPct ?? 0).toFixed(1)}%
                  </span>
                </div>
              );
            })}
        </div>
      </section>
    )}
    </>
  );
}
