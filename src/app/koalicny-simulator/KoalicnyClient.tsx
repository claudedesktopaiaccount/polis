"use client";

import { useState } from "react";
import { PARTIES, PARTY_LIST, COALITIONS } from "@/lib/parties";
import { allocateSeats } from "@/lib/prediction/dhondt";

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
      {/* Presets */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => applyPreset(COALITIONS.progressive)}
          className="px-4 py-2 text-sm font-medium bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
        >
          Progresívna koalícia
        </button>
        <button
          onClick={() => applyPreset(COALITIONS.fico)}
          className="px-4 py-2 text-sm font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
        >
          Koalícia Fico
        </button>
        <button
          onClick={() => setSelected(new Set())}
          className="px-4 py-2 text-sm font-medium bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Vymazať
        </button>
      </div>

      {/* Party selector grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {PARTY_LIST.map((party) => {
          const seats = seatMap[party.id] ?? 0;
          const isSelected = selected.has(party.id);
          const isInParliament = inParliament.includes(party.id);

          return (
            <button
              key={party.id}
              onClick={() => isInParliament && toggleParty(party.id)}
              disabled={!isInParliament}
              className={`relative rounded-xl p-4 border-2 transition-all duration-200 text-left ${
                !isInParliament
                  ? "opacity-40 cursor-not-allowed border-neutral-200 bg-neutral-50"
                  : isSelected
                    ? "border-current shadow-md scale-[1.02]"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
              }`}
              style={
                isSelected
                  ? {
                      borderColor: party.color,
                      backgroundColor: party.color + "10",
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: party.color }}
                />
                <span className="font-semibold text-sm">{party.abbreviation}</span>
              </div>
              <p
                className="text-2xl font-bold tabular-nums"
                style={{
                  color: isInParliament ? party.color : undefined,
                }}
              >
                {seats}
              </p>
              <p className="text-xs text-neutral-500">mandátov</p>
              {!isInParliament && (
                <p className="text-xs text-red-500 mt-1">Pod 5% prahom</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Coalition result */}
      <div
        className={`rounded-2xl p-6 border-2 transition-all duration-300 ${
          selected.size === 0
            ? "border-neutral-200 bg-neutral-50"
            : hasMajority
              ? "border-green-300 bg-green-50"
              : "border-red-300 bg-red-50"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              {selected.size === 0
                ? "Vyberte strany"
                : hasMajority
                  ? "Väčšinová koalícia"
                  : "Menšinová koalícia"}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              {selected.size > 0 && (
                <>
                  {Array.from(selected)
                    .map((id) => PARTIES[id]?.abbreviation)
                    .join(" + ")}
                </>
              )}
            </p>
          </div>

          <div className="text-center">
            <p
              className={`text-5xl font-extrabold tabular-nums ${
                selected.size === 0
                  ? "text-neutral-300"
                  : hasMajority
                    ? "text-green-600"
                    : "text-red-600"
              }`}
            >
              {coalitionSeats}
            </p>
            <p className="text-sm text-neutral-500">z {MAJORITY} potrebných</p>
          </div>
        </div>

        {/* Seat bar */}
        {selected.size > 0 && (
          <div className="mt-4">
            <div className="h-6 bg-neutral-200 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  hasMajority ? "bg-green-500" : "bg-red-400"
                }`}
                style={{
                  width: `${Math.min(100, (coalitionSeats / 150) * 100)}%`,
                }}
              />
              {/* Majority line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-neutral-800"
                style={{ left: `${(MAJORITY / 150) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-neutral-500">
              <span>0</span>
              <span className="font-medium">76 (väčšina)</span>
              <span>150</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
