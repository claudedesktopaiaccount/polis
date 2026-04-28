import type { CompanyRow } from "@/lib/db/mps";

interface Props {
  companies: CompanyRow[];
}

export default function CompaniesTab({ companies }: Props) {
  return (
    <div>
      <p className="text-xs font-mono text-muted mb-3">
        {companies.length === 0 ? "Žiadne prepojenia" : `Celkom ${companies.length} prepojení`}
      </p>

      {companies.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center text-muted text-sm">
          Žiadne prepojenia na firmy.
        </div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 pr-4 font-medium">
                Firma
              </th>
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 pr-4 font-medium w-28 hidden sm:table-cell">
                IČO
              </th>
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 pr-4 font-medium w-32">
                Vzťah
              </th>
              <th className="text-left text-xs text-muted uppercase tracking-wide py-2 font-medium w-40 hidden md:table-cell">
                Obdobie
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => {
              const period =
                c.startDate && c.endDate
                  ? `${c.startDate} – ${c.endDate}`
                  : c.startDate
                  ? `od ${c.startDate}`
                  : c.endDate
                  ? `do ${c.endDate}`
                  : "—";

              return (
                <tr key={c.id} className="border-b border-divider hover:bg-hover">
                  <td className="py-2 pr-4 text-ink align-top font-medium">
                    {c.name}
                  </td>
                  <td className="py-2 pr-4 text-xs font-mono text-muted align-top hidden sm:table-cell">
                    {c.ico}
                  </td>
                  <td className="py-2 pr-4 text-xs text-muted align-top">
                    {c.relationship}
                  </td>
                  <td className="py-2 text-xs font-mono text-muted align-top hidden md:table-cell">
                    {period}
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
