import Link from "next/link";
import type { ContractRow } from "@/lib/db/mps";

const fmt = new Intl.NumberFormat("sk-SK", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

interface Props {
  contracts: ContractRow[];
  total: number;
  totalAmount: number;
  page: number;
  mpSlug: string;
  activeTab: string;
}

export default function ContractsTab({ contracts, total, totalAmount, page, mpSlug }: Props) {
  const totalPages = Math.ceil(total / 20);

  function href(p: number) {
    return `/poslanci/${mpSlug}?tab=zmluvy&page=${p}`;
  }

  return (
    <div>
      <div className="flex items-baseline gap-4 mb-3">
        <p className="text-xs font-mono text-muted">
          {total === 0 ? "Žiadne zmluvy" : `Celkom ${total} zmlúv`}
        </p>
        {total > 0 && (
          <p className="text-xs font-mono text-ink font-bold">
            Celková hodnota: {fmt.format(totalAmount)}
          </p>
        )}
      </div>

      {contracts.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center text-muted text-sm">
          Žiadne zmluvy.
        </div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 pr-4 font-medium w-24">
                Dátum
              </th>
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 pr-4 font-medium">
                Popis
              </th>
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 pr-4 font-medium w-36 hidden sm:table-cell">
                Dodávateľ
              </th>
              <th className="text-right text-xs text-muted uppercase tracking-wide py-2 font-medium w-28">
                Suma
              </th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-b border-divider hover:bg-hover">
                <td className="py-2 pr-4 text-xs font-mono text-muted align-top">
                  {c.signedDate}
                </td>
                <td className="py-2 pr-4 align-top">
                  <span className="line-clamp-2 text-ink text-sm leading-snug">
                    {c.titleSk}
                  </span>
                </td>
                <td className="py-2 pr-4 text-xs text-muted align-top hidden sm:table-cell">
                  {c.supplierName}
                </td>
                <td className="py-2 text-right text-sm font-mono text-ink align-top">
                  {fmt.format(c.amountEur)}
                </td>
              </tr>
            ))}
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
