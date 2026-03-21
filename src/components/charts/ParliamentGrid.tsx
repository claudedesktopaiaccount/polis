"use client";

import { PARTIES } from "@/lib/parties";
import type { SeatAllocation } from "@/lib/prediction/dhondt";

interface ParliamentGridProps {
  seats: SeatAllocation[];
}

export default function ParliamentGrid({ seats }: ParliamentGridProps) {
  const sorted = [...seats].sort((a, b) => b.seats - a.seats);

  // Build flat array of 150 colored squares
  const grid: { partyId: string; color: string }[] = [];
  for (const s of sorted) {
    const party = PARTIES[s.partyId];
    for (let i = 0; i < s.seats; i++) {
      grid.push({ partyId: s.partyId, color: party?.color ?? "#ccc" });
    }
  }
  // Pad to 150 if needed
  while (grid.length < 150) {
    grid.push({ partyId: "empty", color: "var(--divider)" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-xl font-bold text-ink">Rozdelenie kresiel</h3>
        <span className="text-xs text-text/50 tabular-nums">150 mandátov</span>
      </div>

      {/* 10×15 grid */}
      <div className="grid grid-cols-15 gap-[3px]">
        {grid.map((cell, i) => (
          <div
            key={i}
            className="aspect-square transition-colors duration-200"
            style={{ backgroundColor: cell.color }}
            title={
              cell.partyId !== "empty"
                ? PARTIES[cell.partyId]?.abbreviation
                : undefined
            }
          />
        ))}
      </div>

      {/* Majority line indicator */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-divider" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-text/50">
          Väčšina = 76 kresiel
        </span>
        <div className="h-px flex-1 bg-divider" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {sorted.map((s) => {
          const party = PARTIES[s.partyId];
          return (
            <span
              key={s.partyId}
              className="flex items-center gap-1.5 text-xs text-text"
            >
              <span
                className="w-2.5 h-2.5 shrink-0"
                style={{ backgroundColor: party?.color }}
              />
              {party?.abbreviation} ({s.seats})
            </span>
          );
        })}
      </div>
    </div>
  );
}
