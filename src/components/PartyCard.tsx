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
    <div className="group border-b border-divider bg-transparent hover:bg-hover transition-colors duration-200 p-4">
      <div className="flex items-start gap-4">
        {/* Portrait */}
        {portraitUrl ? (
          <div className="relative w-12 h-12 shrink-0 overflow-hidden border border-divider">
            <Image
              src={portraitUrl}
              alt={`Portrét ${leader}, líder ${name}`}
              fill
              className="object-cover object-top"
              sizes="48px"
            />
          </div>
        ) : (
          <div
            className="w-12 h-12 shrink-0 flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: color }}
          >
            {abbreviation}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-ink truncate">{name}</h3>
              <p className="text-xs text-text/60 truncate">{leader}</p>
            </div>
            <p className="text-2xl font-bold tabular-nums shrink-0" style={{ color }}>
              {percentage.toFixed(1)}%
            </p>
          </div>

          <div className="mt-2 flex items-center justify-between">
            {/* Party color accent line */}
            <div className="h-0.5 flex-1 mr-3 opacity-30" style={{ backgroundColor: color }} />

            <span
              className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums ${
                isNeutral
                  ? "text-text/50"
                  : isPositive
                    ? "text-emerald-600"
                    : "text-red-600"
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
            <p className="mt-1 text-[10px] text-text/40 uppercase tracking-wider">{lastAgency}</p>
          )}
        </div>
      </div>
    </div>
  );
}
