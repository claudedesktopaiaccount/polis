"use client";

import { PARTIES } from "@/lib/parties";
import type { SimulationResult } from "@/lib/prediction/monte-carlo";
import type { SeatAllocation } from "@/lib/prediction/dhondt";
import ParliamentGrid from "@/components/charts/ParliamentGrid";

interface PredikciaClientProps {
  simulation: SimulationResult[];
  currentSeats: SeatAllocation[];
  latestAgency: string;
  latestDate: string;
}

export default function PredikciaClient({
  simulation,
  currentSeats,
  latestAgency,
  latestDate,
}: PredikciaClientProps) {
  const seatMap: Record<string, number> = {};
  currentSeats.forEach((s) => (seatMap[s.partyId] = s.seats));

  const sorted = [...simulation].sort((a, b) => b.winProbability - a.winProbability);
  const maxWin = Math.max(...sorted.map((s) => s.winProbability), 0.01);

  return (
    <>
      {/* Split layout: probabilities left, grid right */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-12 mb-12">
        {/* Win probability bars */}
        <div>
          <h3 className="font-serif text-xl font-bold text-ink mb-6">
            Pravdepodobnosť výhry
          </h3>
          <div className="space-y-4">
            {sorted.map((result) => {
              const party = PARTIES[result.partyId];
              const pct = result.winProbability * 100;
              const barWidth = (result.winProbability / maxWin) * 100;
              const seats = seatMap[result.partyId] ?? 0;

              return (
                <div key={result.partyId}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-medium text-ink">
                      {party?.abbreviation}
                    </span>
                    <span
                      className="text-2xl font-bold tabular-nums"
                      style={{ color: party?.color }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-8 bg-hover overflow-hidden">
                    <div
                      className="h-full flex items-center px-3 transition-all duration-500"
                      style={{
                        width: `${Math.max(barWidth, 2)}%`,
                        backgroundColor: party?.color,
                      }}
                    >
                      {barWidth > 15 && (
                        <span className="text-xs font-bold text-white">
                          {seats > 0 ? `${seats} mandátov` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-text/40 tabular-nums">
                      {seats > 0 ? `Odhadované mandáty: ${seats}` : "Pod prahom"}
                    </span>
                    <span className="text-[10px] text-text/40 tabular-nums">
                      ±{((result.upperBound - result.lowerBound) / 2).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Parliament grid */}
        <div className="mt-10 lg:mt-0">
          <ParliamentGrid seats={currentSeats} />
        </div>
      </div>

      {/* Detailed table */}
      <div className="border border-divider bg-surface p-6">
        <h3 className="font-serif text-xl font-bold text-ink mb-4">
          Podrobná predikcia
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="text-left py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                  Strana
                </th>
                <th className="text-right py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                  Priemer
                </th>
                <th className="text-right py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                  Interval
                </th>
                <th className="text-right py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                  Mandáty
                </th>
                <th className="text-right py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                  V parlamente
                </th>
                <th className="text-right py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                  Výhra
                </th>
              </tr>
            </thead>
            <tbody>
              {[...simulation]
                .sort((a, b) => b.meanPct - a.meanPct)
                .map((result) => {
                  const party = PARTIES[result.partyId];
                  return (
                    <tr
                      key={result.partyId}
                      className="border-b border-divider hover:bg-hover"
                    >
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 shrink-0"
                            style={{ backgroundColor: party?.color }}
                          />
                          <span className="font-medium text-ink">{party?.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-2 px-2 tabular-nums font-semibold text-ink">
                        {result.meanPct.toFixed(1)}%
                      </td>
                      <td className="text-right py-2 px-2 tabular-nums text-text/60">
                        {result.lowerBound.toFixed(1)} – {result.upperBound.toFixed(1)}%
                      </td>
                      <td className="text-right py-2 px-2 tabular-nums font-semibold text-ink">
                        {seatMap[result.partyId] ?? 0}
                      </td>
                      <td className="text-right py-2 px-2">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium ${
                            result.parliamentProbability > 0.9
                              ? "bg-emerald-600/10 text-emerald-700"
                              : result.parliamentProbability > 0.5
                                ? "bg-amber-500/10 text-amber-700"
                                : "bg-red-500/10 text-red-700"
                          }`}
                        >
                          {(result.parliamentProbability * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td
                        className="text-right py-2 px-2 tabular-nums font-bold"
                        style={{ color: party?.color }}
                      >
                        {(result.winProbability * 100).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[10px] text-text/40">
          Na základe prieskumu: {latestAgency}, {latestDate}. Maximálna odchýlka ±2.5%.
        </p>
      </div>
    </>
  );
}
