import Image from "next/image";
import Link from "next/link";

interface CandidateData {
  name: string;
  party: string;
  percentage: number;
  trend: number;
  portraitUrl: string;
  color: string;
}

interface HeroBannerProps {
  left: CandidateData;
  right: CandidateData;
  lastPollAgency: string;
  lastPollDate: string;
}

function TrendIndicator({ trend }: { trend: number }) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  return (
    <span
      className={`text-sm sm:text-base font-semibold tabular-nums ${
        isNeutral ? "text-text/50" : isPositive ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {isPositive ? "▲" : isNeutral ? "—" : "▼"} {isPositive ? "+" : ""}
      {trend.toFixed(1)}%
    </span>
  );
}

function CandidateColumn({ data }: { data: CandidateData }) {
  const lastName = data.name.split(" ").pop() ?? data.name;

  return (
    <div className="flex flex-col items-center text-center gap-3 sm:gap-4 flex-1">
      {/* Portrait — big and prominent */}
      <div
        className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 overflow-hidden border-3 rounded-md shadow-lg"
        style={{ borderColor: data.color }}
      >
        <Image
          src={data.portraitUrl}
          alt={data.name}
          fill
          className="object-cover object-top"
          sizes="(min-width: 1024px) 208px, (min-width: 640px) 176px, 128px"
          priority
        />
      </div>

      {/* Name + party */}
      <div>
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-ink leading-none">
          {lastName}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-text/50 font-medium">
          {data.party}
        </p>
      </div>

      {/* Percentage */}
      <p className="text-3xl sm:text-4xl lg:text-5xl font-black tabular-nums text-ink leading-none">
        {data.percentage.toFixed(1)}%
      </p>

      {/* Trend */}
      <TrendIndicator trend={data.trend} />
    </div>
  );
}

function StrengthBar({
  leftPct,
  rightPct,
  leftColor,
  rightColor,
}: {
  leftPct: number;
  rightPct: number;
  leftColor: string;
  rightColor: string;
}) {
  const total = leftPct + rightPct;
  const leftShare = (leftPct / total) * 100;
  const diff = Math.abs(leftPct - rightPct).toFixed(1);
  const leader = leftPct > rightPct ? "left" : "right";

  return (
    <div className="w-full max-w-md mx-auto mt-6 sm:mt-8">
      {/* Difference badge */}
      <div className="flex justify-center mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink text-paper text-xs sm:text-sm font-bold tabular-nums rounded-full">
          {leader === "left" ? "←" : "→"} {diff} b. náskok
        </span>
      </div>

      {/* Bar with percentage labels */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-sm sm:text-base font-bold tabular-nums text-ink shrink-0">
          {leftPct.toFixed(1)}%
        </span>
        <div className="flex h-3 sm:h-4 rounded-full overflow-hidden gap-0.5 flex-1">
          <div
            className="rounded-l-full transition-all duration-700"
            style={{ width: `${leftShare}%`, backgroundColor: leftColor }}
          />
          <div
            className="rounded-r-full transition-all duration-700"
            style={{ width: `${100 - leftShare}%`, backgroundColor: rightColor }}
          />
        </div>
        <span className="text-sm sm:text-base font-bold tabular-nums text-ink shrink-0">
          {rightPct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default function HeroBanner({ left, right, lastPollAgency, lastPollDate }: HeroBannerProps) {
  return (
    <section className="border-b border-divider bg-gradient-to-b from-paper to-surface/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-18">
        <p className="text-center text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-text/40 mb-6 sm:mb-8">
          Kľúčový súboj o premiérske kreslo
        </p>

        {/* Candidates side-by-side, centered & symmetric */}
        <div className="flex items-start justify-center gap-6 sm:gap-12 lg:gap-20">
          <CandidateColumn data={left} />

          {/* Vertical divider with VS */}
          <div className="flex flex-col items-center gap-2 pt-14 sm:pt-20 lg:pt-24 shrink-0">
            <div className="w-px h-16 sm:h-24 bg-divider" />
            <span className="text-xs sm:text-sm font-bold text-text/25 tracking-widest">VS</span>
            <div className="w-px h-16 sm:h-24 bg-divider" />
          </div>

          <CandidateColumn data={right} />
        </div>

        {/* Strength bar */}
        <StrengthBar
          leftPct={left.percentage}
          rightPct={right.percentage}
          leftColor={left.color}
          rightColor={right.color}
        />

        {/* Footer */}
        <div className="mt-6 sm:mt-8 flex flex-col items-center gap-4">
          <p className="text-xs text-text/40 tabular-nums">
            {lastPollAgency}, {lastPollDate}
          </p>
          <Link
            href="/predikcia"
            className="inline-block border-2 border-ink bg-ink text-paper px-6 py-3 text-sm font-bold hover:bg-transparent hover:text-ink transition-colors"
          >
            Zobraziť detailnú predikciu
          </Link>
        </div>
      </div>
    </section>
  );
}
