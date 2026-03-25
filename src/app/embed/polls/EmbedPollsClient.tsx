"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const PollTrendChart = dynamic(
  () => import("@/components/charts/PollTrendChart"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-surface animate-pulse flex items-center justify-center">
        <span className="text-xs text-text/40">Načítavam graf…</span>
      </div>
    ),
  }
);

interface PartyMeta {
  id: string;
  abbreviation: string;
  color: string;
}

interface EmbedPollsClientProps {
  chartData: Record<string, string | number>[];
  partyMeta: PartyMeta[];
}

export default function EmbedPollsClient({ chartData, partyMeta }: EmbedPollsClientProps) {
  const searchParams = useSearchParams();

  const theme = searchParams.get("theme") === "dark" ? "dark" : "light";
  const heightParam = parseInt(searchParams.get("height") ?? "400", 10);
  const height = isNaN(heightParam) ? 400 : Math.min(Math.max(200, heightParam), 800);
  const partiesParam = searchParams.get("parties");

  const filteredParties = useMemo(() => {
    if (!partiesParam) return partyMeta;
    const ids = new Set(partiesParam.split(",").map((s) => s.trim()).filter(Boolean));
    return partyMeta.filter((p) => ids.has(p.id));
  }, [partyMeta, partiesParam]);

  const filteredChartData = useMemo(() => {
    if (!partiesParam) return chartData;
    const ids = new Set(partiesParam.split(",").map((s) => s.trim()).filter(Boolean));
    return chartData.map((row) => {
      const filtered: Record<string, string | number> = { date: row.date, agency: row.agency };
      for (const id of ids) {
        if (row[id] !== undefined) filtered[id] = row[id];
      }
      return filtered;
    });
  }, [chartData, partiesParam]);

  return (
    <div className={theme} style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div className="flex-1 bg-paper p-3" style={{ minHeight: 0 }}>
        <div style={{ height: `${height}px` }}>
          <PollTrendChart data={filteredChartData} parties={filteredParties} />
        </div>
      </div>
      <div
        className="bg-surface border-t border-divider px-3 py-1.5 flex items-center justify-between"
        style={{ flexShrink: 0 }}
      >
        <span className="text-[10px] text-text/50">Vývoj volebných preferencií</span>
        <a
          href="https://polis.sk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-text/50 hover:text-ink transition-colors"
        >
          Zdroj: Polis | polis.sk
        </a>
      </div>
    </div>
  );
}
