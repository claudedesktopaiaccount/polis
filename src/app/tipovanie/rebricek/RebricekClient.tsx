"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

interface LeaderboardEntry {
  rank: number;
  displayName: string | null;
  userId: string | null;
  totalScore: number;
  winnerScore: number | null;
  percentageScore: number | null;
  coalitionScore: number | null;
}

export default function RebricekClient() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/leaderboard?electionId=sr-2027")
      .then((r) => r.json() as Promise<{ leaderboard: LeaderboardEntry[] }>)
      .then((data) => {
        setEntries(data.leaderboard || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-ink mb-2">
        Rebríček predpovedí
      </h1>
      <p className="text-sm text-text/60 mb-8">
        Najlepšie predpovede slovenských parlamentných volieb. Skóre sa
        vyhodnotí po voľbách.
      </p>

      {loading ? (
        <p className="text-sm text-text/50">Načítava sa…</p>
      ) : entries.length === 0 ? (
        <div className="border border-divider bg-surface p-8 text-center">
          <p className="text-sm text-text/50">
            Zatiaľ žiadne výsledky. Rebríček sa vyhodnotí po voľbách.
          </p>
          <Link
            href="/tipovanie"
            className="inline-block mt-4 text-sm text-ink underline hover:no-underline"
          >
            Tipovať výsledok →
          </Link>
        </div>
      ) : (
        <div className="border border-divider overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="text-left py-2 px-3 font-semibold text-ink text-xs uppercase tracking-wider">
                  #
                </th>
                <th className="text-left py-2 px-3 font-semibold text-ink text-xs uppercase tracking-wider">
                  Meno
                </th>
                <th className="text-right py-2 px-3 font-semibold text-ink text-xs uppercase tracking-wider">
                  Celkové
                </th>
                <th className="text-right py-2 px-3 font-semibold text-ink text-xs uppercase tracking-wider hidden sm:table-cell">
                  Víťaz
                </th>
                <th className="text-right py-2 px-3 font-semibold text-ink text-xs uppercase tracking-wider hidden sm:table-cell">
                  Percentá
                </th>
                <th className="text-right py-2 px-3 font-semibold text-ink text-xs uppercase tracking-wider hidden sm:table-cell">
                  Koalícia
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const isCurrentUser =
                  user && entry.userId && user.id === entry.userId;
                return (
                  <tr
                    key={entry.rank}
                    className={`border-b border-divider ${
                      isCurrentUser ? "bg-hover font-medium" : "hover:bg-hover"
                    }`}
                  >
                    <td className="py-2.5 px-3 tabular-nums text-text/50 text-xs">
                      {entry.rank}.
                    </td>
                    <td className="py-2.5 px-3 text-ink">
                      {entry.displayName || "Anonym"}
                      {isCurrentUser && (
                        <span className="ml-1 text-xs text-text/40">(vy)</span>
                      )}
                    </td>
                    <td className="text-right py-2.5 px-3 tabular-nums font-bold text-ink">
                      {entry.totalScore.toFixed(1)}
                    </td>
                    <td className="text-right py-2.5 px-3 tabular-nums text-text/60 hidden sm:table-cell">
                      {entry.winnerScore ?? "–"}
                    </td>
                    <td className="text-right py-2.5 px-3 tabular-nums text-text/60 hidden sm:table-cell">
                      {entry.percentageScore?.toFixed(1) ?? "–"}
                    </td>
                    <td className="text-right py-2.5 px-3 tabular-nums text-text/60 hidden sm:table-cell">
                      {entry.coalitionScore ?? "–"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
