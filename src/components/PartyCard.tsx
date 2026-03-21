import Image from "next/image";

interface PartyCardProps {
  name: string;
  abbreviation: string;
  leader: string;
  color: string;
  percentage: number;
  trend: number;
  portraitUrl?: string;
  lastAgency?: string;
}

export default function PartyCard({
  name,
  abbreviation,
  leader,
  color,
  percentage,
  trend,
  portraitUrl,
  lastAgency,
}: PartyCardProps) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-neutral-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Portrait area with party-colored background */}
      <div className="relative h-44 overflow-hidden" style={{ backgroundColor: color }}>
        {portraitUrl ? (
          <Image
            src={portraitUrl}
            alt={`Portrét ${leader}, líder ${name}`}
            fill
            className="object-cover object-top grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, 280px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-7xl font-bold">
            {abbreviation}
          </div>
        )}
        {/* Subtle gradient at bottom for color hint */}
        <div
          className="absolute inset-x-0 bottom-0 h-16 opacity-70"
          style={{ background: `linear-gradient(to top, ${color}, transparent)` }}
        />
      </div>

      {/* Party color accent bar */}
      <div className="h-1" style={{ backgroundColor: color }} />

      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-neutral-800 truncate">{name}</h3>
          <p className="text-xs text-neutral-500 truncate">{leader}</p>
        </div>

        {/* Percentage + trend */}
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold tabular-nums" style={{ color }}>
            {percentage.toFixed(1)}%
          </p>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
              isNeutral
                ? "bg-neutral-50 text-neutral-600 border-neutral-200"
                : isPositive
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {!isNeutral && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d={isPositive ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                />
              </svg>
            )}
            {isPositive ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
        </div>

        {lastAgency && (
          <p className="mt-2 text-xs text-neutral-400">{lastAgency}</p>
        )}
      </div>
    </div>
  );
}
