"use client";

import Image from "next/image";

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

function TrendBadge({ trend }: { trend: number }) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
        isNeutral
          ? "bg-white/10 text-white/70"
          : isPositive
            ? "bg-emerald-500/20 text-emerald-200"
            : "bg-red-500/20 text-red-200"
      }`}
    >
      {!isNeutral && (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
}

function CandidateColumn({ data }: { data: CandidateData }) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      {/* Portrait with party-colored background, head breaks out above */}
      <div className="relative w-36 sm:w-44">
        <div
          className="relative w-full aspect-[3/4] rounded-2xl shadow-lg overflow-visible"
          style={{ backgroundColor: data.color }}
        >
          {/* Image wrapper — taller than container so head extends above */}
          <div className="absolute -top-[15%] left-0 right-0 bottom-0" style={{ clipPath: "inset(0 0 0 0 round 16px)" }}>
            <Image
              src={data.portraitUrl}
              alt={data.name}
              fill
              className="object-cover object-top"
              sizes="180px"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-white text-xl sm:text-2xl font-bold">{data.name}</h2>
        <p className="text-primary-200 text-base sm:text-lg">{data.party}</p>
      </div>
      <p className="text-white text-6xl sm:text-7xl font-extrabold tracking-tighter leading-none tabular-nums">
        {data.percentage.toFixed(1)}%
      </p>
      <TrendBadge trend={data.trend} />
    </div>
  );
}

export default function HeroBanner({ left, right, lastPollAgency, lastPollDate }: HeroBannerProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 overflow-hidden">
      {/* Subtle geometric overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-20">
          <CandidateColumn data={left} />

          {/* Divider */}
          <div className="flex items-center">
            <div className="hidden md:block w-px h-48 bg-white/20" />
            <span className="text-white/30 text-3xl sm:text-4xl font-black px-4">VS</span>
            <div className="hidden md:block w-px h-48 bg-white/20" />
          </div>

          <CandidateColumn data={right} />
        </div>

        <div className="mt-8 text-center space-y-1">
          <p className="text-primary-200 text-sm">
            Posledny prieskum: {lastPollAgency}, {lastPollDate}
          </p>
        </div>
      </div>
    </section>
  );
}
