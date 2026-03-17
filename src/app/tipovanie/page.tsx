"use client";

import { useState, useEffect } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { PARTY_LIST, PARTIES } from "@/lib/parties";

interface CrowdData {
  partyId: string;
  totalBets: number;
  avgPredictedPct: number;
}

// Mock crowd data
const MOCK_CROWD: CrowdData[] = [
  { partyId: "ps", totalBets: 342, avgPredictedPct: 25.4 },
  { partyId: "smer-sd", totalBets: 287, avgPredictedPct: 21.8 },
  { partyId: "hlas-sd", totalBets: 198, avgPredictedPct: 13.5 },
  { partyId: "republika", totalBets: 156, avgPredictedPct: 9.1 },
  { partyId: "sas", totalBets: 134, avgPredictedPct: 6.8 },
  { partyId: "kdh", totalBets: 123, avgPredictedPct: 6.2 },
  { partyId: "sns", totalBets: 98, avgPredictedPct: 5.3 },
  { partyId: "slovensko", totalBets: 76, avgPredictedPct: 4.5 },
  { partyId: "demokrati", totalBets: 65, avgPredictedPct: 3.8 },
  { partyId: "aliancia", totalBets: 41, avgPredictedPct: 2.1 },
];

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = document.cookie
    .split("; ")
    .find((c) => c.startsWith("pt_visitor="))
    ?.split("=")[1];
  if (!id) {
    id = crypto.randomUUID();
    document.cookie = `pt_visitor=${id}; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Lax`;
  }
  return id;
}

export default function TipovaniePage() {
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sliders, setSliders] = useState<Record<string, number>>(() =>
    Object.fromEntries(PARTY_LIST.map((p) => [p.id, 0]))
  );

  useEffect(() => {
    getVisitorId();
  }, []);

  const totalPct = Object.values(sliders).reduce((s, v) => s + v, 0);
  const totalBets = MOCK_CROWD.reduce((s, c) => s + c.totalBets, 0);

  function handleSubmit() {
    if (!selectedWinner) return;
    // In production, this would POST to /api/tipovanie
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SectionHeading title="Tipovanie" subtitle="Vaše tipovanie bolo zaznamenané" />

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-center">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-green-800">Tip prijatý!</h3>
          <p className="text-sm text-green-600 mt-1">
            Tipujete výhru: <strong>{PARTIES[selectedWinner!]?.name}</strong>
          </p>
        </div>

        {/* Show crowd results */}
        <CrowdResults data={MOCK_CROWD} totalBets={totalBets} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeading
        title="Tipovanie"
        subtitle="Tipnite si, kto vyhrá voľby — porovnajte svoj tip s hlasom ľudu"
      />

      {/* Winner selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Kto vyhrá voľby?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PARTY_LIST.map((party) => {
            const isSelected = selectedWinner === party.id;
            return (
              <button
                key={party.id}
                onClick={() => setSelectedWinner(party.id)}
                className={`rounded-xl p-3 border-2 transition-all duration-200 text-center ${
                  isSelected
                    ? "shadow-md scale-[1.02]"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
                style={isSelected ? { borderColor: party.color, backgroundColor: party.color + "10" } : undefined}
              >
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-1.5"
                  style={{ backgroundColor: party.color }}
                />
                <p className="text-sm font-semibold">{party.abbreviation}</p>
                <p className="text-xs text-neutral-500 truncate">{party.leader}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Percentage prediction sliders */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">Tipnite si percentá</h3>
          <span
            className={`text-sm font-medium tabular-nums ${
              Math.abs(totalPct - 100) < 1 ? "text-green-600" : "text-red-500"
            }`}
          >
            Spolu: {totalPct.toFixed(0)}%
          </span>
        </div>

        <div className="space-y-4">
          {PARTY_LIST.map((party) => (
            <div key={party.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-20 shrink-0">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: party.color }} />
                <span className="text-sm font-medium">{party.abbreviation}</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={0.5}
                value={sliders[party.id] ?? 0}
                onChange={(e) =>
                  setSliders((prev) => ({ ...prev, [party.id]: parseFloat(e.target.value) }))
                }
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${party.color} ${((sliders[party.id] ?? 0) / 40) * 100}%, #e5e7eb ${((sliders[party.id] ?? 0) / 40) * 100}%)`,
                }}
              />
              <span className="w-14 text-right text-sm font-bold tabular-nums" style={{ color: party.color }}>
                {(sliders[party.id] ?? 0).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!selectedWinner}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
          selectedWinner
            ? "bg-primary-600 text-white hover:bg-primary-700 shadow-md"
            : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
        }`}
      >
        Odoslať tip
      </button>

      {/* Current crowd results */}
      <div className="mt-12">
        <CrowdResults data={MOCK_CROWD} totalBets={totalBets} />
      </div>
    </div>
  );
}

function CrowdResults({ data, totalBets }: { data: CrowdData[]; totalBets: number }) {
  const sorted = [...data].sort((a, b) => b.totalBets - a.totalBets);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-1">Hlas ľudu</h3>
      <p className="text-sm text-neutral-500 mb-4">
        Celkom {totalBets.toLocaleString("sk-SK")} tipov
      </p>

      <div className="space-y-3">
        {sorted.map((item) => {
          const party = PARTIES[item.partyId];
          const pct = (item.totalBets / totalBets) * 100;
          return (
            <div key={item.partyId} className="flex items-center gap-3">
              <span className="w-16 text-sm font-medium text-neutral-700">{party?.abbreviation}</span>
              <div className="flex-1 h-8 bg-neutral-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: party?.color,
                  }}
                />
              </div>
              <div className="text-right w-20">
                <span className="text-sm font-bold tabular-nums">{item.avgPredictedPct.toFixed(1)}%</span>
                <span className="text-xs text-neutral-400 ml-1">({item.totalBets})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
