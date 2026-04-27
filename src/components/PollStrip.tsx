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
    <div className="bg-card border-b border-border">
      <div className="max-w-content mx-auto px-6 pt-4 pb-1">
        <span className="text-[10px] text-xfaint tracking-[0.12em] font-semibold uppercase">
          AKTUÁLNE PRIESKUMY
        </span>
      </div>
      <div className="max-w-content mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
        {visible.map((p) => (
          <div
            key={p.partyId}
            className="flex items-center gap-3.5 border border-border px-3 py-2"
          >
            <div
              className="w-9 h-9 shrink-0 flex items-center justify-center"
              style={{ background: p.color }}
            >
              <span
                className="font-bold text-white leading-none text-center"
                style={{ fontSize: (p.abbreviation ?? p.partyId).length > 3 ? "8px" : "10px" }}
              >
                {p.abbreviation ?? p.partyId}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-[16px] font-bold text-ink leading-none">
                {p.percentage.toFixed(1)}%
              </div>
              <div className="flex items-center gap-0.5">
                {p.trend !== undefined && (
                  <span
                    className="text-[11px]"
                    style={{
                      color: p.trend > 0 ? "#16a34a" : p.trend < 0 ? "#dc2626" : "#aaaaaa",
                    }}
                  >
                    {p.trend > 0 ? "↑" : p.trend < 0 ? "↓" : "→"}
                  </span>
                )}
                <span className="text-[11px] text-muted">
                  {p.abbreviation ?? p.partyId}
                </span>
              </div>
            </div>
          </div>
        ))}
        <a
          href="/prieskumy"
          className="ml-auto text-[13px] font-semibold text-accent shrink-0"
        >
          Všetky strany →
        </a>
      </div>
      <div className="max-w-content mx-auto px-6 pb-2">
        <span className="text-[11px] text-faint">
          Zdroj: {agency} · {date}
        </span>
      </div>
    </div>
  );
}
