import Link from "next/link";
import type { VoteRow } from "@/lib/db/mps";

const VOTE_LABELS: Record<string, { label: string; color: string }> = {
  za: { label: "Áno", color: "bg-green-600 text-white" },
  proti: { label: "Nie", color: "bg-red-600 text-white" },
  zdrzal_sa: { label: "Zdržal sa", color: "bg-amber-500 text-white" },
  nepritomny: { label: "Neprítomný", color: "bg-surface text-muted border border-border" },
  nehlasoval: { label: "Nehlasoval", color: "bg-surface text-muted border border-border" },
};

function choiceInfo(choice: string) {
  return VOTE_LABELS[choice] ?? { label: choice, color: "bg-surface text-muted border border-border" };
}

interface Props {
  records: VoteRow[];
  total: number;
  page: number;
  mpSlug: string;
  activeTab: string;
}

export default function VotingTab({ records, total, page, mpSlug }: Props) {
  const totalPages = Math.ceil(total / 20);

  function href(p: number) {
    return `/poslanci/${mpSlug}?tab=hlasovanie&page=${p}`;
  }

  return (
    <div>
      <p className="text-xs font-mono text-muted mb-3">
        {total === 0 ? "Žiadne hlasovanie" : `Celkom ${total} hlasovaní`}
      </p>

      {records.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center text-muted text-sm">
          Žiadne záznamy o hlasovaní.
        </div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 pr-4 font-medium w-24">
                Dátum
              </th>
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 pr-4 font-medium">
                Návrh
              </th>
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 pr-4 font-medium w-28 hidden sm:table-cell">
                Kategória
              </th>
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 font-medium w-28">
                Hlas
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const { label, color } = choiceInfo(r.choice);
              return (
                <tr key={r.id} className="border-b border-divider hover:bg-hover">
                  <td className="py-2 pr-4 text-xs font-mono text-muted align-top">
                    {r.date}
                  </td>
                  <td className="py-2 pr-4 align-top">
                    <span className="line-clamp-2 text-ink text-sm leading-snug">
                      {r.titleSk}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs text-muted align-top hidden sm:table-cell">
                    {r.topicCategory}
                  </td>
                  <td className="py-2 align-top">
                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold leading-none ${color}`}>
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-4 mt-6">
          {page > 1 ? (
            <Link href={href(page - 1)} className="border border-border bg-surface px-4 py-2 text-sm text-ink hover:bg-hover">
              ← Predchádzajúca
            </Link>
          ) : (
            <span className="border border-border bg-surface px-4 py-2 text-sm text-muted opacity-40 cursor-not-allowed">
              ← Predchádzajúca
            </span>
          )}
          <span className="text-xs font-mono text-muted">{page} / {totalPages}</span>
          {page < totalPages ? (
            <Link href={href(page + 1)} className="border border-border bg-surface px-4 py-2 text-sm text-ink hover:bg-hover">
              Ďalšia →
            </Link>
          ) : (
            <span className="border border-border bg-surface px-4 py-2 text-sm text-muted opacity-40 cursor-not-allowed">
              Ďalšia →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
