"use client";

import { useState } from "react";
import { getCsrfToken } from "@/lib/csrf";
import { useToggleSet } from "@/hooks/useToggleSet";
import { PARTIES } from "@/lib/parties";
import { getFingerprint } from "@/lib/fingerprint";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import VotingPanel from "@/components/tipovanie/VotingPanel";
import CommunityResults from "@/components/tipovanie/CommunityResults";

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
  const coalitionPick = useToggleSet<string>();

  async function handleSubmit() {
    if (!selectedWinner) return;
    setSubmitting(true);

    try {
      const fingerprint = await getFingerprint();
      const csrfToken = getCsrfToken();

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
            ? {
                predictedPercentages: Object.fromEntries(
                  Object.entries(predictedPcts)
                    .filter(([, v]) => v !== "")
                    .map(([k, v]) => [k, parseFloat(v)])
                ),
              }
            : {}),
          ...(showAdvanced && coalitionPick.set.size > 0
            ? { coalitionPick: [...coalitionPick.set] }
            : {}),
        }),
      });

      const data = (await res.json()) as { error?: string; partyId?: string };

      if (res.status === 409 && data.error === "already_voted") {
        setAlreadyVotedParty(data.partyId ?? null);
        setSelectedWinner(data.partyId ?? null);
        setSubmitted(true);
        const crowdRes = await fetch("/api/tipovanie");
        if (crowdRes.ok) {
          const crowd = (await crowdRes.json()) as { aggregates: CrowdData[]; totalBets: number };
          setCrowdData(crowd.aggregates);
          setTotalBets(crowd.totalBets);
        }
        return;
      }

      if (!res.ok) throw new Error("Submit failed");

      const crowdRes = await fetch("/api/tipovanie");
      if (crowdRes.ok) {
        const crowd = (await crowdRes.json()) as { aggregates: CrowdData[]; totalBets: number };
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

  return (
    <>
      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <VotingPanel
          selectedWinner={selectedWinner}
          setSelectedWinner={setSelectedWinner}
          submitted={submitted}
          submitting={submitting}
          alreadyVotedParty={alreadyVotedParty}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
          predictedPcts={predictedPcts}
          setPredictedPcts={setPredictedPcts}
          coalitionPickSet={coalitionPick.set}
          toggleCoalitionPick={coalitionPick.toggle}
          onSubmit={handleSubmit}
        />
        <CommunityResults
          crowdData={crowdData}
          totalBets={totalBets}
          submitted={submitted}
          selectedWinner={selectedWinner}
        />
      </div>

      {/* Leaderboard section — full width below grid */}
      {leaderboard.length > 0 && (
        <section className="mt-8 border-t border-border pt-6">
          <h2 className="text-[20px] font-bold text-ink mb-1">Rebríček prediktorov</h2>
          <p className="text-[12px] text-muted mb-4">Kto najlepšie predpovedá voľby?</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink text-left">
                  <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-secondary">#</th>
                  <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-secondary">Meno</th>
                  <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-secondary text-right">Víťaz</th>
                  <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-secondary text-right">Percentá</th>
                  <th className="py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-secondary text-right">Koalícia</th>
                  <th className="py-2 text-[11px] font-semibold uppercase tracking-wider text-secondary text-right">Celkom</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((e) => (
                  <tr key={e.rank} className="border-b border-border hover:bg-[#faf9f7] transition-colors">
                    <td className="py-2.5 pr-3 text-[12px] font-mono text-muted">{e.rank}.</td>
                    <td className="py-2.5 pr-3 text-[13px] text-ink">{e.displayName}</td>
                    <td className="py-2.5 pr-3 text-[12px] tabular-nums text-right text-secondary">{e.winnerScore.toFixed(0)}</td>
                    <td className="py-2.5 pr-3 text-[12px] tabular-nums text-right text-secondary">{e.percentageScore.toFixed(0)}</td>
                    <td className="py-2.5 pr-3 text-[12px] tabular-nums text-right text-secondary">{e.coalitionScore.toFixed(0)}</td>
                    <td className="py-2.5 text-[12px] tabular-nums text-right font-bold text-ink">{e.totalScore.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!user && (
            <div className="mt-4 p-3 rounded-lg bg-[#faf9f7] border border-border text-[13px] text-center">
              <Link href="/registracia" className="text-accent font-medium hover:underline">
                Zaregistruj sa
              </Link>{" "}
              a sleduj svoje skóre v rebríčku.
            </div>
          )}
        </section>
      )}

      {/* Crowd consensus — avg predicted percentages */}
      {crowdData.some((c) => (c.avgPct ?? 0) > 0) && (
        <section className="mt-8 border-t border-border pt-6">
          <h2 className="text-[18px] font-bold text-ink mb-4">Čo tipuje dav?</h2>
          <div className="space-y-3">
            {[...crowdData]
              .filter((c) => (c.avgPct ?? 0) > 0)
              .sort((a, b) => (b.avgPct ?? 0) - (a.avgPct ?? 0))
              .map((c) => {
                const party = PARTIES[c.partyId];
                if (!party) return null;
                return (
                  <div key={c.partyId} className="flex items-center gap-3">
                    <span className="w-12 text-[12px] font-semibold text-secondary">{party.abbreviation}</span>
                    <div className="flex-1 h-[7px] bg-[#eeeeee] rounded-[4px] overflow-hidden">
                      <div
                        className="h-full rounded-[4px] transition-all duration-500"
                        style={{
                          width: `${Math.min(((c.avgPct ?? 0) / 30) * 100, 100)}%`,
                          backgroundColor: party.color,
                        }}
                      />
                    </div>
                    <span className="text-[12px] font-bold tabular-nums w-14 text-right text-ink">
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
