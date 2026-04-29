import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { getMps } from "@/lib/db/mps";
import { parties } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";
import MpFilters from "./MpFilters";

export const metadata: Metadata = {
  title: "Poslanci — VolímTo",
  description:
    "Kompletný prehľad slovenských poslancov NR SR — hlasovanie, reči, sľuby a firmy.",
};

export const revalidate = 3600;

const PAGE_SIZE = 24;

export default async function PoslanciPage({
  searchParams,
}: {
  searchParams: Promise<{ party?: string; search?: string; page?: string }>;
}) {
  const db = getDb();
  const params = await searchParams;
  const party = params.party ?? "";
  const search = params.search ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const [{ mps: mpList, total }, allParties] = await Promise.all([
    getMps(db, {
      party: party || undefined,
      search: search || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    db.select().from(parties).orderBy(asc(parties.abbreviation)),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-ink">Poslanci NR SR</h1>
        <p className="text-[11px] text-muted uppercase tracking-[0.1em] mt-1">
          HLASOVANIE · REČI · SĽUBY · FIRMY
        </p>
      </div>

      {/* Filters */}
      <MpFilters parties={allParties} />

      {/* Count */}
      <p className="text-xs text-muted font-mono mb-4">
        {total === 0
          ? "Žiadni poslanci"
          : `Zobrazených ${from}–${to} z ${total} poslancov`}
      </p>

      {/* Grid */}
      {mpList.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center text-muted text-sm">
          Žiadni poslanci nevyhovujú filtrom.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {mpList.map((mp) => (
            <MpCard key={mp.id} mp={mp} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-4 mt-8">
          {page > 1 ? (
            <Link
              href={buildPageHref(page - 1, party, search)}
              className="border border-border bg-surface px-4 py-2 text-sm text-ink hover:bg-hover"
            >
              ← Predchádzajúca
            </Link>
          ) : (
            <span className="border border-border bg-surface px-4 py-2 text-sm text-muted opacity-40 cursor-not-allowed">
              ← Predchádzajúca
            </span>
          )}

          <span className="text-xs font-mono text-muted">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={buildPageHref(page + 1, party, search)}
              className="border border-border bg-surface px-4 py-2 text-sm text-ink hover:bg-hover"
            >
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildPageHref(page: number, party: string, search: string): string {
  const p = new URLSearchParams();
  if (party) p.set("party", party);
  if (search) p.set("search", search);
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return qs ? `?${qs}` : "?";
}

// ─── MP Card ─────────────────────────────────────────────────────────────────

interface MpCardProps {
  mp: {
    id: number;
    slug: string;
    nameDisplay: string;
    partyAbbr: string | null;
    partyColor: string | null;
    constituency: string | null;
    role: string;
  };
}

function MpCard({ mp }: MpCardProps) {
  const initial = mp.nameDisplay.charAt(0).toUpperCase();

  return (
    <div className="bg-card border border-border p-3 flex flex-col gap-2">
      {/* Portrait / fallback */}
      <div className="flex items-center gap-2">
        <div
          className="w-12 h-12 shrink-0 bg-surface border border-border flex items-center justify-center text-muted font-mono text-sm font-bold overflow-hidden"
          aria-hidden
        >
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={`/poslanci/${mp.slug}`}
            className="font-medium text-sm text-ink hover:underline leading-tight block truncate"
          >
            {mp.nameDisplay}
          </Link>

          {mp.partyAbbr && (
            <span
              className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none"
              style={{ backgroundColor: mp.partyColor ?? "#555" }}
            >
              {mp.partyAbbr}
            </span>
          )}
        </div>
      </div>

      {/* Meta */}
      {mp.constituency && (
        <p className="text-xs text-muted truncate">{mp.constituency}</p>
      )}
      {mp.role && mp.role !== "poslanec" && (
        <p className="text-xs text-muted font-mono truncate">{mp.role}</p>
      )}
    </div>
  );
}
