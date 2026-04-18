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

  const sortedCrowd = [...crowdData].sort((a, b) => b.totalBets - a.totalBets);

  return (
    <>
      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Left: Voting panel */}
        <div className="bg-white border border-[#e8e3db] rounded-[12px] p-5">
          <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-4">Kto vyhrá voľby?</h2>

          {!submitted ? (
            <>
              <div className="space-y-2">
                {PARTY_LIST.map((party) => {
                  const isSelected = selectedWinner === party.id;
                  return (
                    <button
                      key={party.id}
                      onClick={() => setSelectedWinner(party.id)}
                      aria-pressed={isSelected}
                      aria-label={`Tipovať ${party.name}`}
                      className="w-full flex items-center gap-3 rounded-[8px] border transition-all"
                      style={{
                        padding: "10px 12px",
                        background: isSelected ? `${party.color}15` : "#fff",
                        borderColor: isSelected ? party.color : "#e8e3db",
                        borderWidth: isSelected ? "2px" : "1px",
                      }}
                    >
                      <div className="w-2.5 h-2.5 rounded-[2px] shrink-0" style={{ background: party.color }} />
                      <span className="text-[14px] font-medium text-[#1a1a1a] flex-1 text-left">{party.name}</span>
                      <span className="text-[11px] text-[#aaaaaa]">{party.leader}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 shrink-0" style={{ color: party.color }} fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.15" />
                          <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedWinner && (
                <div className="mt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-2.5 rounded-[8px] text-[14px] font-semibold transition-colors"
                    style={{
                      background: selectedParty?.color ?? "#1a1a1a",
                      color: "#fff",
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? "Odosielam..." : "Odoslať tip"}
                  </button>

                  {/* Advanced predictions toggle */}
                  <div className="mt-3">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-[11px] text-[#888888] hover:text-[#1a1a1a] underline transition-colors"
                    >
                      {showAdvanced ? "Skryť rozšírené tipovanie" : "Rozšírené tipovanie (percentá, koalícia)"}
                    </button>

                    {showAdvanced && (
                      <div className="mt-4 space-y-4">
                        {/* Percentage predictions */}
                        <div className="border border-[#e8e3db] rounded-[8px] p-4">
                          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#444444] mb-3">
                            Tipnite percentá strán
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {PARTY_LIST.map((party) => (
                              <div key={party.id} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-[2px] shrink-0" style={{ backgroundColor: party.color }} />
                                <span className="text-[11px] text-[#666666] truncate flex-1">{party.abbreviation}</span>
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
                                  className="w-16 px-2 py-1 text-[11px] text-right border border-[#e8e3db] rounded-[4px] bg-transparent tabular-nums focus:border-[#1a1a1a] focus:outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Coalition prediction */}
                        <div className="border border-[#e8e3db] rounded-[8px] p-4">
                          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#444444] mb-3">
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
                                  className="px-3 py-1.5 text-[11px] rounded-[6px] border transition-colors"
                                  style={{
                                    borderColor: isInCoalition ? party.color : "#e8e3db",
                                    background: isInCoalition ? `${party.color}15` : "#fff",
                                    color: isInCoalition ? party.color : "#666666",
                                    fontWeight: isInCoalition ? 600 : 400,
                                  }}
                                >
                                  {party.abbreviation}
                                </button>
                              );
                            })}
                          </div>
                          {coalitionPick.size > 0 && (
                            <p className="text-[11px] text-[#aaaaaa] mt-2">
                              {coalitionPick.size} {coalitionPick.size === 1 ? "strana" : coalitionPick.size < 5 ? "strany" : "strán"}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Success state */
            <div>
              <div className="mt-4 p-3 rounded-[8px] bg-[#f0fdf4] border border-[#bbf7d0] text-[13px] text-[#16a34a] flex items-center justify-between">
                <span>{alreadyVotedParty ? "Už ste tipovali." : "Váš tip bol zaznamenaný."}</span>
              </div>
              <div className="mt-4 text-center">
                <p className="text-[13px] text-[#444444]">
                  Tipujete výhru:{" "}
                  <strong style={{ color: selectedParty?.color }}>{selectedParty?.name}</strong>
                </p>
                {user ? (
                  <p className="text-[11px] text-[#aaaaaa] mt-2">Prihlásený ako {user.displayName}</p>
                ) : (
                  <p className="text-[11px] text-[#888888] mt-3">
                    <Link href="/prihlasenie" className="underline hover:text-[#1a1a1a]">
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
                  className="inline-block mt-3 text-[12px] text-[#888888] hover:text-[#1a1a1a] underline"
                >
                  Pozrite si rebríček predpovedí →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right: Community results */}
        <div className="bg-white border border-[#e8e3db] rounded-[12px] p-5">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-[#444444]">Hlas ľudu</h2>
            {totalBets > 0 && (
              <span className="text-[11px] text-[#aaaaaa] tabular-nums">
                {totalBets.toLocaleString("sk-SK")} tipov
              </span>
            )}
          </div>

          {totalBets === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="23" stroke="#e8e3db" strokeWidth="2" />
                <circle cx="17" cy="21" r="3" fill="#d0cbc3" />
                <circle cx="31" cy="21" r="3" fill="#d0cbc3" />
                <path d="M16 32c2-3 14-3 16 0" stroke="#d0cbc3" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-[13px] text-[#888888] text-center">Najprv tipnite, potom uvidíte výsledky komunity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedCrowd.map((item) => {
                const party = PARTIES[item.partyId];
                if (!party) return null;
                const pct = totalBets > 0 ? (item.totalBets / totalBets) * 100 : 0;
                const isMyVote = submitted && selectedWinner === item.partyId;
                return (
                  <div key={item.partyId} className="flex items-center gap-3">
                    <span className="text-[12px] text-[#444444] w-12 shrink-0">{party.abbreviation}</span>
                    <div className="flex-1 h-[7px] bg-[#eeeeee] rounded-[4px] overflow-hidden">
                      <div
                        className="h-full rounded-[4px] transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: party.color,
                          opacity: isMyVote ? 1 : 0.5,
                        }}
                      />
                    </div>
                    <span className="text-[12px] font-semibold text-[#1a1a1a] w-10 text-right tabular-nums">
                      {pct.toFixed(1)}%
                    </span>
                    {isMyVote && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] text-white shrink-0"
                        style={{ background: party.color }}
                      >
                        VÁŠ TIP
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard section — full width below grid */}
      {leaderboard.length > 0 && (
        <section className="mt-8 border-t border-[#e8e3db] pt-6">
          <h2 className="text-[20px] font-bold text-[#1a1a1a] mb-1">Rebríček prediktorov</h2>
          <p className="text-[12px] text-[#888888] mb-4">Kto najlepšie predpovedá voľby?</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#1a1a1a] text-left">
                  <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-[#444444]">#</th>
                  <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-[#444444]">Meno</th>
                  <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-[#444444] text-right">Víťaz</th>
                  <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-[#444444] text-right">Percentá</th>
                  <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-[#444444] text-right">Koalícia</th>
                  <th className="py-2 text-[11px] font-semibold uppercase tracking-wider text-[#444444] text-right">Celkom</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((e) => (
                  <tr key={e.rank} className="border-b border-[#e8e3db] hover:bg-[#faf9f7] transition-colors">
                    <td className="py-2.5 pr-3 text-[12px] font-mono text-[#888888]">{e.rank}.</td>
                    <td className="py-2.5 pr-3 text-[13px] text-[#1a1a1a]">{e.displayName}</td>
                    <td className="py-2.5 pr-3 text-[12px] tabular-nums text-right text-[#444444]">{e.winnerScore.toFixed(0)}</td>
                    <td className="py-2.5 pr-3 text-[12px] tabular-nums text-right text-[#444444]">{e.percentageScore.toFixed(0)}</td>
                    <td className="py-2.5 pr-3 text-[12px] tabular-nums text-right text-[#444444]">{e.coalitionScore.toFixed(0)}</td>
                    <td className="py-2.5 text-[12px] tabular-nums text-right font-bold text-[#1a1a1a]">{e.totalScore.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!user && (
            <div className="mt-4 p-3 rounded-[8px] bg-[#faf9f7] border border-[#e8e3db] text-[13px] text-center">
              <Link href="/registracia" className="text-[#1a6ef5] font-medium hover:underline">
                Zaregistruj sa
              </Link>
              {" "}a sleduj svoje skóre v rebríčku.
            </div>
          )}
        </section>
      )}

      {/* Crowd consensus — avg predicted percentages */}
      {crowdData.some((c) => (c.avgPct ?? 0) > 0) && (
        <section className="mt-8 border-t border-[#e8e3db] pt-6">
          <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-4">Čo tipuje dav?</h2>
          <div className="space-y-3">
            {[...crowdData]
              .filter((c) => (c.avgPct ?? 0) > 0)
              .sort((a, b) => (b.avgPct ?? 0) - (a.avgPct ?? 0))
              .map((c) => {
                const party = PARTIES[c.partyId];
                if (!party) return null;
                return (
                  <div key={c.partyId} className="flex items-center gap-3">
                    <span className="w-12 text-[12px] font-semibold text-[#444444]">{party.abbreviation}</span>
                    <div className="flex-1 h-[7px] bg-[#eeeeee] rounded-[4px] overflow-hidden">
                      <div
                        className="h-full rounded-[4px] transition-all duration-500"
                        style={{
                          width: `${Math.min(((c.avgPct ?? 0) / 30) * 100, 100)}%`,
                          backgroundColor: party.color,
                        }}
                      />
                    </div>
                    <span className="text-[12px] font-bold tabular-nums w-14 text-right text-[#1a1a1a]">
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
