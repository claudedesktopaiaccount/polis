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
      className={`text-sm font-medium tabular-nums ${
        isNeutral ? "text-text/50" : isPositive ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {isPositive ? "▲" : isNeutral ? "" : "▼"} {isPositive ? "+" : ""}
      {trend.toFixed(1)}%
    </span>
  );
}

function CandidateColumn({ data }: { data: CandidateData }) {
  const lastName = data.name.split(" ").pop() ?? data.name;
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden border border-divider">
        <Image
          src={data.portraitUrl}
          alt={data.name}
          fill
          className="object-cover object-top"
          sizes="112px"
        />
      </div>
      <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink">
        {lastName}
      </h2>
      <p className="text-3xl sm:text-4xl font-bold tabular-nums text-ink">
        {data.percentage.toFixed(1)}%
      </p>
      <TrendIndicator trend={data.trend} />
    </div>
  );
}

export default function HeroBanner({ left, right, lastPollAgency, lastPollDate }: HeroBannerProps) {
  return (
    <section className="border-b border-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-text/50 mb-6">
          Kľúčový súboj o premiérske kreslo
        </p>

        <div className="flex items-center justify-center gap-6 sm:gap-10 lg:gap-16">
          <CandidateColumn data={left} />

          {/* Vertical hairline divider */}
          <div className="w-px h-32 sm:h-40 bg-divider" />

          <CandidateColumn data={right} />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-xs text-text/50 tabular-nums">
            {lastPollAgency}, {lastPollDate}
          </p>
          <Link
            href="/predikcia"
            className="inline-block border border-ink bg-ink text-paper px-5 py-2.5 text-sm font-semibold hover:bg-transparent hover:text-ink transition-colors"
          >
            Zobraziť detailnú predikciu
          </Link>
        </div>
      </div>
    </section>
  );
}
