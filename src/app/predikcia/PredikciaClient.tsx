"use client";

import { useState } from "react";
import { PARTIES } from "@/lib/parties";
import ShareButtons from "@/components/ShareButtons";
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
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [showMethodology, setShowMethodology] = useState(false);

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

              const adj = adjustments[result.partyId] ?? 0;
              const adjMeanPct = result.meanPct + adj;

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
                  {/* Bar with confidence interval overlay */}
                  <div className="h-8 bg-hover overflow-hidden relative">
                    {/* Confidence interval shading */}
                    <div
                      className="absolute top-0 h-full opacity-20"
                      style={{
                        left: `${Math.min((result.lowerBound / 35) * 100, 100)}%`,
                        width: `${Math.min(((result.upperBound - result.lowerBound) / 35) * 100, 100)}%`,
                        backgroundColor: party?.color,
                      }}
                    />
                    {/* Main bar */}
                    <div
                      className="h-full flex items-center px-3 transition-all duration-500 relative"
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
                      {adj !== 0 && (
                        <span className={adj > 0 ? "text-[#00E676] ml-1" : "text-[#FF5252] ml-1"}>
                          ({adj > 0 ? "+" : ""}{adjMeanPct.toFixed(1)}%)
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-text/40 tabular-nums">
                      {result.lowerBound.toFixed(1)}–{result.upperBound.toFixed(1)}%
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
                <th className="text-right py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                  Úprava
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
                      <td className="text-right py-2 px-2">
                        <div className="flex items-center gap-1 justify-end">
                          <input
                            type="range"
                            min={-3}
                            max={3}
                            step={0.1}
                            value={adjustments[result.partyId] ?? 0}
                            onChange={(e) =>
                              setAdjustments((prev) => ({
                                ...prev,
                                [result.partyId]: parseFloat(e.target.value),
                              }))
                            }
                            className="w-16"
                          />
                          <span className="data-value text-xs w-10 text-right">
                            {((adjustments[result.partyId] ?? 0) > 0 ? "+" : "")}
                            {(adjustments[result.partyId] ?? 0).toFixed(1)}
                          </span>
                        </div>
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
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="text-xs text-info hover:underline mt-6 block"
        >
          {showMethodology ? "Skryť metodológiu ▲" : "Ako funguje predikcia? ▼"}
        </button>
        {showMethodology && (
          <div className="mt-3 text-sm text-text/70 space-y-2 border-t border-divider pt-3">
            <p>Model spustí <strong>10 000 simulácií</strong> volieb. Každá simulácia náhodne upraví preferencie strán podľa historickej odchýlky prieskumov od reálnych výsledkov.</p>
            <p>Pre každú simuláciu sa rozdeľujú mandáty <strong>D&apos;Hondtovou metódou</strong> (rovnaká, akú používa slovenský parlament). Strany pod 5% sa do parlamentu nedostanú.</p>
            <p>Výsledky ukazujú, koľkokrát z 10 000 pokusov každá strana „vyhrala" alebo sa dostala do parlamentu. Čím širší interval spoľahlivosti, tým menej istý je výsledok.</p>
          </div>
        )}
        <ShareButtons
          url={typeof window !== "undefined" ? window.location.href : "/predikcia"}
          title="Predikcia volieb | Polis"
          description="Monte Carlo predikcia výsledkov slovenských parlamentných volieb."
        />
      </div>
    </>
  );
}
