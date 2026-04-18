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
  narrative: string | null;
  newestPollDate: string;
  pollCount: number;
}

export default function PredikciaClient({
  simulation,
  currentSeats,
  narrative,
  newestPollDate,
  pollCount,
}: PredikciaClientProps) {
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [showMethodology, setShowMethodology] = useState(false);

  const seatMap: Record<string, number> = {};
  currentSeats.forEach((s) => (seatMap[s.partyId] = s.seats));

  const sorted = [...simulation].sort((a, b) => b.winProbability - a.winProbability);

  return (
    <>
      {/* AI narrative pull-quote */}
      {narrative && (
        <div className="mb-6 pl-4 border-l-[3px] border-[#1a6eb5]">
          <p className="font-serif italic text-base text-[#1a1a1a] leading-relaxed">
            {narrative}
          </p>
        </div>
      )}

      {/* 2-col grid: party probability cards left, parliament arc right */}
      <div className="grid gap-7 mb-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Party probability cards */}
        <div className="space-y-3">
          {sorted.map((result) => {
            const party = PARTIES[result.partyId];
            const pct = result.winProbability * 100;
            const seats = seatMap[result.partyId] ?? 0;
            const adj = adjustments[result.partyId] ?? 0;
            const adjMeanPct = result.meanPct + adj;
            // bar width: scale meanPct so ~30% fills the bar fully
            const barWidth = Math.min((result.meanPct / 30) * 100, 100);

            return (
              <div
                key={result.partyId}
                className="border border-[#e8e3db] rounded-[8px]"
                style={{ padding: "12px 14px" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-semibold text-[#1a1a1a]">
                    {party?.abbreviation ?? party?.name}
                  </span>
                  <span
                    className="text-[18px] font-extrabold"
                    style={{ letterSpacing: "-0.5px", color: party?.color ?? "#1a6eb5" }}
                  >
                    {pct.toFixed(0)}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="relative h-5 bg-[#eeeeee] rounded-[4px] overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-[4px] flex items-center"
                    style={{
                      width: `${Math.max(barWidth, 2)}%`,
                      background: party?.color ?? "#1a6eb5",
                    }}
                  >
                    {barWidth > 18 && (
                      <span className="text-[11px] text-white font-semibold pl-2">
                        {seats > 0 ? seats : "—"}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-[#aaaaaa] mt-1">
                  Odhadované mandáty: {seats > 0 ? seats : "—"} · interval{" "}
                  {result.lowerBound.toFixed(1)}–{result.upperBound.toFixed(1)}%
                  {adj !== 0 && (
                    <span
                      className="ml-1"
                      style={{ color: adj > 0 ? "#16a34a" : "#dc2626" }}
                    >
                      ({adj > 0 ? "+" : ""}{adjMeanPct.toFixed(1)}%)
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        {/* Parliament arc */}
        <div className="bg-white border border-[#e8e3db] rounded-[10px] p-5">
          <ParliamentGrid seats={currentSeats} />
        </div>
      </div>

      {/* Full-width detail table */}
      <div className="bg-white border border-[#e8e3db] rounded-[10px] overflow-hidden mb-6">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e8e3db] bg-[#f8f5f0]">
          <h3 className="font-serif text-base font-bold text-[#1a1a1a]">
            Podrobná predikcia
          </h3>
          <button
            onClick={() => setShowMethodology(true)}
            className="w-5 h-5 border border-[#e8e3db] flex items-center justify-center text-[10px] font-bold text-[#888888] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors rounded-[3px]"
            aria-label="Metodológia výpočtu"
          >
            ?
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f8f5f0] border-b border-[#e8e3db]">
              <tr>
                {["Strana", "Priemer", "Interval", "Mandáty", "V parlamente", "Výhra", "Úprava"].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-[11px] text-[#888888] uppercase tracking-[0.08em] font-semibold"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...simulation]
                .sort((a, b) => b.meanPct - a.meanPct)
                .map((result) => {
                  const party = PARTIES[result.partyId];
                  const inParliament = result.parliamentProbability > 0.5;

                  return (
                    <tr
                      key={result.partyId}
                      className="border-b border-[#e8e3db] hover:bg-[#f8f5f0]"
                    >
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: party?.color }}
                          />
                          <span className="font-medium text-[#1a1a1a]">{party?.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4 tabular-nums font-semibold text-[#1a1a1a] text-right">
                        {result.meanPct.toFixed(1)}%
                      </td>
                      <td className="py-2 px-4 tabular-nums text-[#888888] text-right">
                        {result.lowerBound.toFixed(1)}–{result.upperBound.toFixed(1)}%
                      </td>
                      <td className="py-2 px-4 tabular-nums font-semibold text-[#1a1a1a] text-right">
                        {seatMap[result.partyId] ?? 0}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <span
                          className="px-2 py-0.5 text-[11px] font-semibold rounded-[20px]"
                          style={{
                            background: inParliament ? "#dcfce7" : "#fee2e2",
                            color: inParliament ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {inParliament ? "Áno" : "Nie"}
                        </span>
                      </td>
                      <td
                        className="py-2 px-4 tabular-nums font-bold text-right"
                        style={{ color: party?.color }}
                      >
                        {(result.winProbability * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 px-4 text-right">
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
                          <span className="text-[12px] text-[#888888] w-10 text-right tabular-nums">
                            {(adjustments[result.partyId] ?? 0) > 0 ? "+" : ""}
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
        <div className="px-4 py-3 border-t border-[#e8e3db]">
          <p className="text-[11px] text-[#aaaaaa]">
            Na základe {pollCount} prieskum{pollCount === 1 ? "u" : "ov"}{newestPollDate ? `, posledný ${newestPollDate}` : ""}.
          </p>
          <div className="mt-2">
            <ShareButtons
              url={typeof window !== "undefined" ? window.location.href : "/predikcia"}
              title="Predikcia volieb | Polis"
              description="Monte Carlo predikcia výsledkov slovenských parlamentných volieb."
            />
          </div>
        </div>
      </div>

      {/* Methodology modal */}
      {showMethodology && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowMethodology(false)}
        >
          <div
            className="bg-white border border-[#e8e3db] rounded-[10px] max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e8e3db]">
              <h4 className="font-serif text-lg font-bold text-[#1a1a1a]">Metodológia</h4>
              <button
                onClick={() => setShowMethodology(false)}
                className="text-[#888888] hover:text-[#1a1a1a] text-lg leading-none"
                aria-label="Zavrieť"
              >
                ×
              </button>
            </div>
            <dl className="space-y-3 text-sm text-[#555555]">
              <div>
                <dt className="font-semibold text-[#1a1a1a] mb-0.5">Agregácia prieskumov</dt>
                <dd>Exponenciálny pokles váhy podľa veku prieskumu (30-dňový polčas), okno 12 mesiacov. Staršie prieskumy majú menšiu váhu.</dd>
              </div>
              <div className="border-t border-[#e8e3db] pt-3">
                <dt className="font-semibold text-[#1a1a1a] mb-0.5">Monte Carlo simulácia</dt>
                <dd>10 000 iterácií, každá s náhodnou odchýlkou od priemeru podľa skutočného rozptylu medzi agentúrami.</dd>
              </div>
              <div className="border-t border-[#e8e3db] pt-3">
                <dt className="font-semibold text-[#1a1a1a] mb-0.5">Intervaly spoľahlivosti</dt>
                <dd>5. a 95. percentil výsledkov simulácií.</dd>
              </div>
              <div className="border-t border-[#e8e3db] pt-3">
                <dt className="font-semibold text-[#1a1a1a] mb-0.5">AI analýza</dt>
                <dd>Text generovaný modelom Claude (Anthropic), aktualizovaný pri zmene prieskumov.</dd>
              </div>
              <div className="border-t border-[#e8e3db] pt-3">
                <dt className="font-semibold text-[#1a1a1a] mb-0.5">Mandáty</dt>
                <dd>Metóda D&apos;Hondt, 150 mandátov, 5 % prah.</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
