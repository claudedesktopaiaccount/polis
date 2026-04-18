interface PollParty {
  partyId: string;
  name: string;
  percentage: number;
  color: string;
  trend?: number;
  abbreviation?: string;
}

interface PollStripProps {
  parties: PollParty[];
  agency: string;
  date: string;
}

export default function PollStrip({ parties, agency, date }: PollStripProps) {
  const visible = parties
    .filter((p) => p.percentage >= 5)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8);

  return (
    <div className="bg-white border-b border-[#e8e3db]">
      <div className="max-w-[1100px] mx-auto px-6 py-5 flex items-center gap-6 flex-wrap">
        <span className="text-[10px] text-[#bbbbbb] tracking-[0.12em] font-semibold uppercase shrink-0">
          AKTUÁLNE PRIESKUMY
        </span>
        <div className="flex items-center gap-5 flex-wrap">
          {visible.map((p) => (
            <div key={p.partyId} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-[5px] shrink-0"
                style={{ background: p.color }}
              />
              <div>
                <span className="text-[15px] font-semibold text-[#1a1a1a]">
                  {p.percentage.toFixed(1)}%
                </span>
                {p.trend !== undefined && (
                  <span
                    className="ml-1 text-[12px]"
                    style={{
                      color: p.trend > 0 ? "#16a34a" : p.trend < 0 ? "#dc2626" : "#aaaaaa",
                    }}
                  >
                    {p.trend > 0 ? "↑" : p.trend < 0 ? "↓" : "→"}
                  </span>
                )}
                <span className="ml-1 text-[12px] text-[#888888]">
                  {p.abbreviation ?? p.partyId}
                </span>
              </div>
            </div>
          ))}
        </div>
        <a
          href="/prieskumy"
          className="ml-auto text-[13px] font-semibold text-[#1a6eb5] shrink-0"
        >
          Všetky strany →
        </a>
      </div>
      <div className="max-w-[1100px] mx-auto px-6 pb-2">
        <span className="text-[11px] text-[#aaaaaa]">
          Zdroj: {agency} · {date}
        </span>
      </div>
    </div>
  );
}
