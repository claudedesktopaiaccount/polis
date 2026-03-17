"use client";

import { PARTIES } from "@/lib/parties";
import type { SimulationResult } from "@/lib/prediction/monte-carlo";
import type { SeatAllocation } from "@/lib/prediction/dhondt";

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

  return (
    <>
      {/* Win probability cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {simulation
          .sort((a, b) => b.winProbability - a.winProbability)
          .slice(0, 5)
          .map((result) => {
            const party = PARTIES[result.partyId];
            return (
              <div
                key={result.partyId}
                className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 text-center"
              >
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: party?.color }}
                >
                  {party?.abbreviation}
                </div>
                <p
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: party?.color }}
                >
                  {(result.winProbability * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-neutral-500 mt-1">šanca na výhru</p>
              </div>
            );
          })}
      </div>

      {/* Detailed predictions table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Podrobná predikcia
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-2 font-semibold text-neutral-600">
                  Strana
                </th>
                <th className="text-right py-3 px-2 font-semibold text-neutral-600">
                  Priemer %
                </th>
                <th className="text-right py-3 px-2 font-semibold text-neutral-600">
                  Interval
                </th>
                <th className="text-right py-3 px-2 font-semibold text-neutral-600">
                  Mandáty
                </th>
                <th className="text-right py-3 px-2 font-semibold text-neutral-600">
                  V parlamente
                </th>
                <th className="text-right py-3 px-2 font-semibold text-neutral-600">
                  Výhra
                </th>
              </tr>
            </thead>
            <tbody>
              {simulation
                .sort((a, b) => b.meanPct - a.meanPct)
                .map((result) => {
                  const party = PARTIES[result.partyId];
                  return (
                    <tr
                      key={result.partyId}
                      className="border-b border-neutral-50 hover:bg-neutral-50"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: party?.color }}
                          />
                          <span className="font-medium">{party?.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 tabular-nums font-semibold">
                        {result.meanPct.toFixed(1)}%
                      </td>
                      <td className="text-right py-3 px-2 tabular-nums text-neutral-500">
                        {result.lowerBound.toFixed(1)} – {result.upperBound.toFixed(1)}%
                      </td>
                      <td className="text-right py-3 px-2 tabular-nums font-semibold">
                        {seatMap[result.partyId] ?? 0}
                      </td>
                      <td className="text-right py-3 px-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            result.parliamentProbability > 0.9
                              ? "bg-green-50 text-green-700"
                              : result.parliamentProbability > 0.5
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {(result.parliamentProbability * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td
                        className="text-right py-3 px-2 tabular-nums font-bold"
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
      </div>

      {/* Parliament visualization */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Rozloženie mandátov (150 kresiel)
        </h3>
        <div className="flex gap-0.5 h-12 rounded-xl overflow-hidden">
          {currentSeats
            .sort((a, b) => b.seats - a.seats)
            .map((s) => {
              const party = PARTIES[s.partyId];
              return (
                <div
                  key={s.partyId}
                  className="flex items-center justify-center text-white text-xs font-bold transition-all duration-300"
                  style={{
                    backgroundColor: party?.color,
                    width: `${(s.seats / 150) * 100}%`,
                  }}
                  title={`${party?.abbreviation}: ${s.seats} mandátov`}
                >
                  {s.seats > 8 && <span>{s.seats}</span>}
                </div>
              );
            })}
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {currentSeats
            .sort((a, b) => b.seats - a.seats)
            .map((s) => {
              const party = PARTIES[s.partyId];
              return (
                <span
                  key={s.partyId}
                  className="flex items-center gap-1.5 text-xs text-neutral-600"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: party?.color }}
                  />
                  {party?.abbreviation} ({s.seats})
                </span>
              );
            })}
        </div>
        <p className="mt-4 text-xs text-neutral-400">
          Na základe posledného prieskumu: {latestAgency}, {latestDate}
        </p>
      </div>
    </>
  );
}
