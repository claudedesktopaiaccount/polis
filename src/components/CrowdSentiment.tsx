interface CrowdSentimentProps {
  parties: { partyId: string; abbreviation: string; color: string; avgPct: number }[];
  totalBets: number;
}

export default function CrowdSentiment({ parties, totalBets }: CrowdSentimentProps) {
  const top2 = parties.slice(0, 2);

  return (
    <div className="p-4 border-b border-divider">
      <p className="micro-label mb-2">
        Tipovanie · {totalBets.toLocaleString("sk-SK")} hlasov
      </p>
      <div className="space-y-2">
        {top2.map((p) => (
          <div key={p.partyId}>
            <div className="flex justify-between text-xs mb-1">
              <span>Dav: {p.abbreviation} víťazí</span>
              <span className="data-value font-bold">{p.avgPct.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-divider overflow-hidden">
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${p.avgPct}%`, backgroundColor: p.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
