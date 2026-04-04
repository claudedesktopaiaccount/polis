import { PARTIES } from "@/lib/parties";

interface CoalitionBadgeProps {
  partyIds: string[];
  seats: number;
  probability: number;
}

export default function CoalitionBadge({ partyIds, seats, probability }: CoalitionBadgeProps) {
  const MAJORITY = 76;
  const hasMajority = seats >= MAJORITY;

  return (
    <div className="border border-divider p-3">
      <div className="flex flex-wrap gap-1 mb-2">
        {partyIds.map((id) => {
          const party = PARTIES[id];
          if (!party) return null;
          return (
            <span
              key={id}
              className="px-1.5 py-0.5 text-[11px] font-semibold text-white"
              style={{ backgroundColor: party.color }}
            >
              {party.abbreviation}
            </span>
          );
        })}
      </div>
      <div className="text-sm">
        <span className="data-value font-bold">{seats} mandátov</span>
        <span className="text-xs opacity-50 ml-2">
          {hasMajority ? "✓ väčšina" : "✗ bez väčšiny"}
        </span>
      </div>
      <div className="data-value text-xs opacity-60 mt-1">
        {probability.toFixed(1)}% šanca
      </div>
    </div>
  );
}
