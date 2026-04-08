import Link from "next/link";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalScore: number;
}

interface LeaderboardPreviewProps {
  entries: LeaderboardEntry[];
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPreview({ entries }: LeaderboardPreviewProps) {
  return (
    <div className="border-b border-divider p-4">
      <p className="micro-label mb-2">Rebríček · Top 5</p>
      {entries.length === 0 ? (
        <p className="text-xs text-text/40 py-2">Zatiaľ žiadni hráči. Buď prvý!</p>
      ) : (
        <div className="space-y-1 text-xs">
          {entries.slice(0, 5).map((e) => (
            <div key={e.rank} className="flex justify-between py-1 border-b border-divider/50 last:border-0">
              <span>
                {e.rank <= 3 ? RANK_MEDALS[e.rank - 1] : `${e.rank}.`}{" "}
                {e.displayName}
              </span>
              <span className="data-value font-bold">{e.totalScore}</span>
            </div>
          ))}
        </div>
      )}
      <Link href="/tipovanie" className="block text-xs text-info mt-2 hover:underline">
        Zobraziť celý rebríček →
      </Link>
    </div>
  );
}
