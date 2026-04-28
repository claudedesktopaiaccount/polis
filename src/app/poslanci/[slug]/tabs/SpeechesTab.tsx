import Link from "next/link";
import type { SpeechRow } from "@/lib/db/mps";

interface Props {
  speeches: SpeechRow[];
  total: number;
  page: number;
  mpSlug: string;
  activeTab: string;
}

export default function SpeechesTab({ speeches, total, page, mpSlug }: Props) {
  const totalPages = Math.ceil(total / 10);

  function href(p: number) {
    return `/poslanci/${mpSlug}?tab=reci&page=${p}`;
  }

  return (
    <div>
      <p className="text-xs font-mono text-muted mb-3">
        {total === 0 ? "Žiadne reči" : `Celkom ${total} rečí`}
      </p>

      {speeches.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center text-muted text-sm">
          Žiadne záznamy o rečiach.
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {speeches.map((s) => (
            <div key={s.id} className="border-b border-divider py-4 hover:bg-hover px-1">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-xs font-mono text-muted shrink-0">{s.date}</span>
                <span className="text-sm font-medium text-ink">
                  {s.titleSk ?? "Prejav"}
                </span>
              </div>
              {s.excerpt && (
                <p className="text-sm text-text leading-relaxed mt-1 line-clamp-3">
                  {s.excerpt}
                  {s.excerpt.length >= 300 && (
                    <span className="text-muted ml-1 text-xs">… (skrátené)</span>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
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
