"use client";

import { useState } from "react";
import { PARTIES, PARTY_LIST, COALITIONS } from "@/lib/parties";
import { allocateSeats } from "@/lib/prediction/dhondt";
import Hemicycle from "@/components/charts/Hemicycle";

const MAJORITY = 76;

interface KoalicnyClientProps {
  pollResults: { partyId: string; percentage: number }[];
}

export default function KoalicnyClient({ pollResults }: KoalicnyClientProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSeats = allocateSeats(pollResults);

  const seatMap: Record<string, number> = {};
  allSeats.forEach((s) => (seatMap[s.partyId] = s.seats));

  const coalitionSeats = Array.from(selected).reduce(
    (sum, id) => sum + (seatMap[id] ?? 0),
    0
  );
  const hasMajority = coalitionSeats >= MAJORITY;
  const inParliament = allSeats.map((s) => s.partyId);

  function toggleParty(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyPreset(partyIds: readonly string[]) {
    setSelected(new Set(partyIds.filter((id) => inParliament.includes(id))));
  }

  return (
    <>
      {/* Top section: hemicycle + result */}
      <div className="border border-divider bg-surface p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Seat count */}
          <div className="text-center md:text-left shrink-0">
            <p className="text-xs font-medium uppercase tracking-widest text-text/50 mb-1">
              Zloženie parlamentu
            </p>
            <p className="text-ink">
              <span className="text-6xl font-bold tabular-nums">{coalitionSeats}</span>
              <span className="text-2xl text-text/40">/{MAJORITY}</span>
            </p>
            {selected.size > 0 && hasMajority && (
              <div className="mt-3 border-2 border-ink px-4 py-2 inline-block">
                <span className="font-serif text-2xl font-bold text-ink tracking-tight">
                  VÄČŠINA
                </span>
              </div>
            )}
            {selected.size > 0 && !hasMajority && (
              <p className="mt-3 text-sm text-danger font-medium">
                Chýba {MAJORITY - coalitionSeats} mandátov
              </p>
            )}
          </div>

          {/* Hemicycle */}
          <div className="flex-1 w-full max-w-md">
            <Hemicycle seats={allSeats} selectedParties={selected} />
          </div>
        </div>

        {/* Preset buttons */}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-divider pt-4">
          <button
            onClick={() => applyPreset(COALITIONS.progressive)}
            className="px-4 py-2 text-sm font-medium border border-divider text-text hover:bg-hover transition-colors"
          >
            Progresívna koalícia
          </button>
          <button
            onClick={() => applyPreset(COALITIONS.fico)}
            className="px-4 py-2 text-sm font-medium border border-divider text-text hover:bg-hover transition-colors"
          >
            Koalícia Fico
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="px-4 py-2 text-sm font-medium border border-divider text-text/50 hover:bg-hover transition-colors"
          >
            Zmazať výber
          </button>
        </div>
      </div>

      {/* Party table with checkboxes */}
      <div className="border border-divider bg-surface p-6" role="group" aria-label="Výber strán pre koalíciu">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="text-left py-2 px-2 w-10"></th>
                <th className="text-left py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                  Strana
                </th>
                <th className="text-right py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                  %
                </th>
                <th className="text-right py-2 px-2 font-semibold text-ink text-xs uppercase tracking-wider">
                  Mandáty
                </th>
              </tr>
            </thead>
            <tbody>
              {PARTY_LIST.map((party) => {
                const seats = seatMap[party.id] ?? 0;
                const isSelected = selected.has(party.id);
                const isInParliament = inParliament.includes(party.id);
                const pct = pollResults.find((p) => p.partyId === party.id)?.percentage ?? 0;

                return (
                  <tr
                    key={party.id}
                    className={`border-b border-divider transition-colors cursor-pointer ${
                      !isInParliament
                        ? "opacity-40"
                        : isSelected
                          ? "bg-hover"
                          : "hover:bg-hover"
                    }`}
                    onClick={() => isInParliament && toggleParty(party.id)}
                  >
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isInParliament}
                        onChange={() => {}}
                        aria-pressed={isSelected}
                        aria-label={`${party.name}, ${seats} mandátov`}
                        className="accent-ink w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 shrink-0"
                          style={{ backgroundColor: party.color }}
                        />
                        <span className="font-medium text-ink">{party.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 tabular-nums text-text/60">
                      {pct.toFixed(1)}%
                    </td>
                    <td className="text-right py-3 px-2 tabular-nums font-bold text-ink">
                      {seats}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
