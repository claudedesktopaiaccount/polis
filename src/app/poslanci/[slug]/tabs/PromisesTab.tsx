import type { PromiseRow } from "@/lib/db/mps";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  fulfilled: { label: "Splnený", color: "bg-green-600 text-white" },
  in_progress: { label: "Prebieha", color: "bg-amber-500 text-white" },
  broken: { label: "Nesplnený", color: "bg-red-600 text-white" },
  not_started: { label: "Nezačatý", color: "bg-surface text-muted border border-border" },
};

function statusInfo(status: string) {
  return STATUS_MAP[status] ?? { label: status, color: "bg-surface text-muted border border-border" };
}

interface Props {
  promises: PromiseRow[];
  partyName: string | null;
}

export default function PromisesTab({ promises, partyName }: Props) {
  return (
    <div>
      {partyName && (
        <h2 className="text-sm font-semibold text-ink mb-3">
          Sľuby strany {partyName}
        </h2>
      )}
      <p className="text-xs font-mono text-muted mb-3">
        {promises.length === 0 ? "Žiadne sľuby" : `Celkom ${promises.length} sľubov`}
      </p>

      {promises.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center text-muted text-sm">
          Žiadne sľuby strany.
        </div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 pr-4 font-medium">
                Sľub
              </th>
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 pr-4 font-medium w-28 hidden sm:table-cell">
                Kategória
              </th>
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 font-medium w-28">
                Stav
              </th>
            </tr>
          </thead>
          <tbody>
            {promises.map((p) => {
              const { label, color } = statusInfo(p.status);
              return (
                <tr key={p.id} className="border-b border-divider hover:bg-hover">
                  <td className="py-2 pr-4 align-top text-ink leading-snug">
                    {p.promiseText}
                    {p.isPro && (
                      <span className="ml-1 text-[10px] font-bold text-muted uppercase">
                        [koalícia]
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-xs text-muted align-top hidden sm:table-cell">
                    {p.category}
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
    </div>
  );
}
