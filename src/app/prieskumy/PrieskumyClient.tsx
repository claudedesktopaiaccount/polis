"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import ShareButtons from "@/components/ShareButtons";

const PollTrendChart = dynamic(
  () => import("@/components/charts/PollTrendChart"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-surface animate-pulse flex items-center justify-center">
        <span className="text-xs text-text/40">Načítavam graf…</span>
      </div>
    ),
  }
);

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

const TIME_RANGES = [
  { label: "6 mesiacov", months: 6 },
  { label: "1 rok", months: 12 },
  { label: "Všetko", months: 0 },
] as const;

export default function PrieskumyClient({
  chartData,
  partyBars,
  agencies,
  partyMeta,
}: PrieskumyClientProps) {
  const allAgencyNames = useMemo(
    () => [...new Set(chartData.map((d) => String(d.agency)))],
    [chartData]
  );

  const [selectedAgencies, setSelectedAgencies] = useState<Set<string>>(
    new Set(allAgencyNames)
  );
  const [timeRange, setTimeRange] = useState(12);
  const [showTable, setShowTable] = useState(false);

  const toggleAgency = (name: string) => {
    setSelectedAgencies((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const filteredData = useMemo(() => {
    let data = chartData.filter((d) => selectedAgencies.has(String(d.agency)));
    if (timeRange > 0) {
      data = data.slice(-timeRange * 3);
    }
    return data;
  }, [chartData, selectedAgencies, timeRange]);

  const exportCSV = () => {
    const headers = ["Dátum", "Agentúra", ...partyBars.map((p) => p.abbreviation)];
    const rows = filteredData.map((row) =>
      [row.date, row.agency, ...partyBars.map((p) => row[p.id] ?? "")].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prieskumy.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-8">
      {/* Filter sidebar */}
      <aside className="mb-8 lg:mb-0">
        <div className="mb-6">
          <h4 className="text-xs font-medium uppercase tracking-widest text-text/50 mb-3">
            Agentúry
          </h4>
          <div className="space-y-2">
            {allAgencyNames.map((name) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer text-sm text-text hover:text-ink">
                <input
                  type="checkbox"
                  checked={selectedAgencies.has(name)}
                  onChange={() => toggleAgency(name)}
                  className="accent-ink w-4 h-4"
                />
                {name}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-xs font-medium uppercase tracking-widest text-text/50 mb-3">
            Časové obdobie
          </h4>
          <div className="space-y-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.months}
                onClick={() => setTimeRange(range.months)}
                className={`block w-full text-left px-3 py-1.5 text-sm transition-colors ${
                  timeRange === range.months
                    ? "bg-ink text-paper font-semibold"
                    : "text-text hover:bg-hover"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 text-sm text-text/60 hover:text-ink transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </aside>

      {/* Main content */}
      <div>
        {/* Trend chart */}
        <div className="border border-divider bg-surface p-6 mb-8">
          <h3 className="font-serif text-xl font-bold text-ink mb-1">
            Vývoj volebných preferencií
          </h3>
          <p className="text-xs text-text/50 mb-4">
            Agregované dáta z agentúr. Hrubé čiary označujú hlavné strany.
          </p>
          <PollTrendChart data={filteredData} parties={partyMeta} />
          <ShareButtons
            url={typeof window !== "undefined" ? window.location.href : "/prieskumy"}
            title="Prieskumy verejnej mienky | Polis"
            description="Aktuálne volebné prieskumy a trendy pre slovenské parlamentné voľby."
          />
        </div>

        {/* Raw data table */}
        <div className="border border-divider bg-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl font-bold text-ink">Surové dáta</h3>
            <button
              onClick={() => setShowTable(!showTable)}
              className="text-xs font-medium text-text/50 hover:text-ink underline underline-offset-4 transition-colors"
            >
              {showTable ? "Skryť tabuľku" : "Zobraziť všetky dáta"}
            </button>
          </div>

          {showTable && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th className="text-left py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                      Dátum
                    </th>
                    <th className="text-left py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                      Agentúra
                    </th>
                    {partyBars.map((p) => (
                      <th
                        key={p.id}
                        className="text-right py-2 px-2 font-semibold text-xs uppercase tracking-wider"
                        style={{ color: p.color }}
                      >
                        {p.abbreviation}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...filteredData].reverse().map((row, i) => (
                    <tr key={i} className="border-b border-divider hover:bg-hover">
                      <td className="py-2 px-2 text-text tabular-nums text-xs">
                        {row.date}
                      </td>
                      <td className="py-2 px-2 text-text/60 text-xs">{row.agency}</td>
                      {partyBars.map((p) => {
                        const val = row[p.id];
                        const pct = typeof val === "number" ? val : undefined;
                        return (
                          <td
                            key={p.id}
                            className={`text-right py-2 px-2 tabular-nums text-xs ${
                              pct !== undefined && pct < 5 ? "text-danger" : "text-text"
                            }`}
                          >
                            {pct !== undefined ? pct.toFixed(1) : "–"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Agency comparison */}
          <div className="mt-8">
            <h4 className="text-xs font-medium uppercase tracking-widest text-text/50 mb-3">
              Porovnanie agentúr (najnovší prieskum)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th className="text-left py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                      Strana
                    </th>
                    {agencies.map((a) => (
                      <th
                        key={a.name}
                        className="text-right py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider"
                      >
                        {a.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {partyBars.map((party) => (
                    <tr key={party.id} className="border-b border-divider hover:bg-hover">
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 shrink-0"
                            style={{ backgroundColor: party.color }}
                          />
                          <span className="font-medium text-ink text-xs">{party.abbreviation}</span>
                        </div>
                      </td>
                      {agencies.map((a) => {
                        const pct = a.results[party.id];
                        return (
                          <td
                            key={a.name}
                            className={`text-right py-2 px-2 tabular-nums text-xs ${
                              pct !== undefined && pct < 5 ? "text-danger" : "text-text"
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
            <p className="mt-3 text-[10px] text-text/40">
              Hodnoty pod 5% sú zvýraznené červenou — prah pre vstup do parlamentu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
