import Link from "next/link";

interface PersonalBarProps {
  score: number | null;
  rank: number | null;
  totalUsers: number | null;
}

export default function PersonalBar({ score, rank, totalUsers }: PersonalBarProps) {
  if (score === null) {
    return (
      <div className="bg-hover/50 px-4 py-2.5 border-b border-divider flex items-center justify-between text-xs">
        <span className="text-text/50">Ešte nemáš predikciu</span>
        <Link href="/tipovanie" className="text-info font-medium hover:underline">
          Tipni si →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-hover/50 px-4 py-2.5 border-b border-divider flex items-center justify-between text-xs">
      <div className="flex items-center gap-3">
        <span className="micro-label">Tvoje skóre</span>
        <span className="data-value font-bold text-base">{score}</span>
        {rank && totalUsers && (
          <span className="text-text/50">
            #{rank} z {totalUsers.toLocaleString("sk-SK")}
          </span>
        )}
      </div>
      <Link href="/tipovanie" className="text-info font-medium hover:underline">
        Aktualizovať predikciu →
      </Link>
    </div>
  );
}
