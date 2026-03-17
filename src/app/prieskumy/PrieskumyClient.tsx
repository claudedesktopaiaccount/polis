"use client";

import PollTrendChart from "@/components/charts/PollTrendChart";

interface PartyBar {
  id: string;
  abbreviation: string;
  color: string;
  percentage: number;
  trend: number;
}

interface Agency {
  name: string;
  results: Record<string, number>;
}

interface PartyMeta {
  id: string;
  abbreviation: string;
  color: string;
}

interface PrieskumyClientProps {
  chartData: Record<string, string | number>[];
  partyBars: PartyBar[];
  agencies: Agency[];
  partyMeta: PartyMeta[];
}

export default function PrieskumyClient({
  chartData,
  partyBars,
  agencies,
  partyMeta,
}: PrieskumyClientProps) {
  // Max percentage for scaling bars
  const maxPct = Math.max(...partyBars.map((p) => p.percentage), 1);

  return (
    <>
      {/* Trend chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Vývoj preferencií
        </h3>
        <PollTrendChart data={chartData} parties={partyMeta} />
      </div>

      {/* Bar comparison */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Aktuálne preferencie
        </h3>
        <div className="space-y-3">
          {partyBars.map((party) => (
            <div key={party.id} className="flex items-center gap-3">
              <span className="w-20 text-sm font-medium text-neutral-700 truncate">
                {party.abbreviation}
              </span>
              <div className="flex-1 h-8 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                  style={{
                    width: `${Math.min(100, (party.percentage / maxPct) * 100)}%`,
                    backgroundColor: party.color,
                  }}
                >
                  <span className="text-xs font-bold text-white drop-shadow-sm">
                    {party.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <span
                className={`text-xs font-medium w-14 text-right ${
                  party.trend > 0
                    ? "text-green-600"
                    : party.trend < 0
                      ? "text-red-600"
                      : "text-neutral-400"
                }`}
              >
                {party.trend > 0 ? "+" : ""}
                {party.trend.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
        {/* 5% threshold note */}
        <p className="mt-4 text-xs text-neutral-400">
          Červená čiara v grafe = 5% prah potrebný na vstup do parlamentu
        </p>
      </div>

      {/* Agency comparison table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Porovnanie agentúr
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-2 font-semibold text-neutral-600">
                  Strana
                </th>
                {agencies.map((a) => (
                  <th
                    key={a.name}
                    className="text-right py-3 px-2 font-semibold text-neutral-600"
                  >
                    {a.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partyBars.map((party) => (
                <tr
                  key={party.id}
                  className="border-b border-neutral-50 hover:bg-neutral-50"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: party.color }}
                      />
                      <span className="font-medium">{party.abbreviation}</span>
                    </div>
                  </td>
                  {agencies.map((a) => {
                    const pct = a.results[party.id];
                    const isBelow5 = pct !== undefined && pct < 5;
                    return (
                      <td
                        key={a.name}
                        className={`text-right py-3 px-2 tabular-nums ${
                          isBelow5 ? "text-red-500" : ""
                        }`}
                      >
                        {pct !== undefined ? `${pct.toFixed(1)}%` : "–"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-neutral-400">
          Zobrazený najnovší prieskum od každej agentúry. Hodnoty pod 5% sú
          zvýraznené červenou.
        </p>
      </div>
    </>
  );
}
