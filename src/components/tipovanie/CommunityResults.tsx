import { PARTIES } from "@/lib/parties";

export interface CrowdData {
  partyId: string;
  totalBets: number;
  avgPct?: number;
}

interface Props {
  crowdData: CrowdData[];
  totalBets: number;
  submitted: boolean;
  selectedWinner: string | null;
}

export default function CommunityResults({ crowdData, totalBets, submitted, selectedWinner }: Props) {
  const sortedCrowd = [...crowdData].sort((a, b) => b.totalBets - a.totalBets);

  return (
    <div className="bg-card border border-border rounded-[12px] p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-secondary">Hlas ľudu</h2>
        {totalBets > 0 && (
          <span className="text-[11px] text-faint tabular-nums">
            {totalBets.toLocaleString("sk-SK")} tipov
          </span>
        )}
      </div>

      {totalBets === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="23" stroke="#e8e3db" strokeWidth="2" />
            <circle cx="17" cy="21" r="3" fill="#d0cbc3" />
            <circle cx="31" cy="21" r="3" fill="#d0cbc3" />
            <path d="M16 32c2-3 14-3 16 0" stroke="#d0cbc3" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-[13px] text-muted text-center">
            Najprv tipnite, potom uvidíte výsledky komunity.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCrowd.map((item) => {
            const party = PARTIES[item.partyId];
            if (!party) return null;
            const pct = totalBets > 0 ? (item.totalBets / totalBets) * 100 : 0;
            const isMyVote = submitted && selectedWinner === item.partyId;
            return (
              <div key={item.partyId} className="flex items-center gap-3">
                <span className="text-[12px] text-secondary w-12 shrink-0">{party.abbreviation}</span>
                <div className="flex-1 h-[7px] bg-[#eeeeee] rounded-[4px] overflow-hidden">
                  <div
                    className="h-full rounded-[4px] transition-all duration-500"
                    style={{ width: `${pct}%`, background: party.color, opacity: isMyVote ? 1 : 0.5 }}
                  />
                </div>
                <span className="text-[12px] font-semibold text-ink w-10 text-right tabular-nums">
                  {pct.toFixed(1)}%
                </span>
                {isMyVote && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] text-white shrink-0"
                    style={{ background: party.color }}
                  >
                    VÁŠ TIP
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
