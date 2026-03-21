"use client";

import { useState, useEffect, useRef } from "react";
import { PARTY_LIST, PARTIES } from "@/lib/parties";
import { getFingerprint } from "@/lib/fingerprint";
import Image from "next/image";

export interface CrowdData {
  partyId: string;
  totalBets: number;
}

interface Props {
  initialCrowd: CrowdData[];
  initialTotalBets: number;
}

// Floating particles in party color
function Particles({ color, count = 20 }: { color: string; count?: number }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            opacity: 0.3,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function TipovanieClient({ initialCrowd, initialTotalBets }: Props) {
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyVotedParty, setAlreadyVotedParty] = useState<string | null>(null);
  const [crowdData, setCrowdData] = useState<CrowdData[]>(initialCrowd);
  const [totalBets, setTotalBets] = useState(initialTotalBets);
  const [heroVisible, setHeroVisible] = useState(false);

  const selectedParty = selectedWinner ? PARTIES[selectedWinner] : null;

  useEffect(() => {
    if (selectedWinner) {
      setHeroVisible(false);
      const t = setTimeout(() => setHeroVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [selectedWinner]);

  async function handleSubmit() {
    if (!selectedWinner) return;
    setSubmitting(true);

    try {
      const fingerprint = await getFingerprint();

      // Read CSRF token from cookie
      const csrfToken = document.cookie
        .split("; ")
        .find((c) => c.startsWith("pt_csrf="))
        ?.split("=")[1] ?? "";

      const res = await fetch("/api/tipovanie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ selectedWinner, fingerprint }),
      });

      const data = await res.json() as { error?: string; partyId?: string };

      if (res.status === 409 && data.error === "already_voted") {
        setAlreadyVotedParty(data.partyId ?? null);
        setSelectedWinner(data.partyId ?? null);
        setSubmitted(true);
        // Still fetch fresh crowd data
        const crowdRes = await fetch("/api/tipovanie");
        if (crowdRes.ok) {
          const crowd = await crowdRes.json() as { aggregates: CrowdData[]; totalBets: number };
          setCrowdData(crowd.aggregates);
          setTotalBets(crowd.totalBets);
        }
        return;
      }

      if (!res.ok) throw new Error("Submit failed");

      const crowdRes = await fetch("/api/tipovanie");
      if (crowdRes.ok) {
        const crowd = await crowdRes.json() as { aggregates: CrowdData[]; totalBets: number };
        setCrowdData(crowd.aggregates);
        setTotalBets(crowd.totalBets);
      }

      setSubmitted(true);
    } catch (e) {
      console.error("Submit error:", e);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted && selectedParty) {
    return (
      <>
        {/* Success hero */}
        <div
          className="relative rounded-3xl p-8 mb-8 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${selectedParty.color}15, ${selectedParty.color}30)`,
            border: `2px solid ${selectedParty.color}30`,
          }}
        >
          <Particles color={selectedParty.color} count={15} />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              className="w-20 h-20 rounded-full mb-4 flex items-center justify-center"
              style={{ backgroundColor: selectedParty.color + "20" }}
            >
              <svg className="w-10 h-10" fill="none" stroke={selectedParty.color} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-1">
              {alreadyVotedParty ? "Už ste hlasovali" : "Tip prijatý!"}
            </h3>
            <p className="text-neutral-600">
              Tipujete výhru: <strong style={{ color: selectedParty.color }}>{selectedParty.name}</strong>
            </p>
          </div>
        </div>

        <CrowdResults data={crowdData} totalBets={totalBets} winnerId={selectedWinner ?? undefined} />
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes revealPortrait {
          from { clip-path: circle(0% at 50% 100%); }
          to { clip-path: circle(100% at 50% 50%); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px var(--glow-color); }
          50% { box-shadow: 0 0 40px var(--glow-color), 0 0 60px var(--glow-color); }
        }
        .animate-float { animation: float ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.4s ease-out forwards; }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 2s linear infinite;
        }
        .animate-reveal-portrait { animation: revealPortrait 0.7s ease-out forwards; }
        .animate-pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
      `}</style>

      {/* Hero card when party is selected */}
      {selectedParty && (
        <div
          className="relative rounded-3xl overflow-hidden mb-8 transition-all duration-500"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(20px)",
            background: `linear-gradient(160deg, ${selectedParty.color}08, ${selectedParty.color}20, ${selectedParty.color}08)`,
            border: `2px solid ${selectedParty.color}25`,
          }}
        >
          <Particles color={selectedParty.color} />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
            {/* Portrait with reveal animation */}
            <div
              className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shrink-0"
              style={{
                boxShadow: `0 8px 32px ${selectedParty.color}40`,
              }}
            >
              <div
                className="absolute inset-0 z-0"
                style={{ backgroundColor: selectedParty.color }}
              />
              {selectedParty.portraitUrl && (
                <Image
                  key={selectedWinner}
                  src={selectedParty.portraitUrl}
                  alt={`Portrét ${selectedParty.leader}, líder ${selectedParty.name}`}
                  fill
                  className="object-cover object-top animate-reveal-portrait"
                  sizes="160px"
                />
              )}
              {/* Gradient overlay at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1/3"
                style={{
                  background: `linear-gradient(transparent, ${selectedParty.color}90)`,
                }}
              />
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <p
                className="animate-slide-up text-sm font-semibold uppercase tracking-wider mb-1"
                style={{ color: selectedParty.color, animationDelay: "0.1s", opacity: 0 }}
              >
                Váš tip na víťaza
              </p>
              <h2
                className="animate-slide-up text-2xl sm:text-3xl font-bold text-neutral-900 mb-1"
                style={{ animationDelay: "0.2s", opacity: 0 }}
              >
                {selectedParty.name}
              </h2>
              <p
                className="animate-slide-up text-lg text-neutral-600 mb-4"
                style={{ animationDelay: "0.3s", opacity: 0 }}
              >
                {selectedParty.leader}
              </p>

              {/* Action buttons */}
              <div
                className="animate-slide-up flex flex-col sm:flex-row gap-3"
                style={{ animationDelay: "0.4s", opacity: 0 }}
              >
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="relative px-8 py-3.5 rounded-xl font-semibold text-white text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-shimmer animate-pulse-glow"
                  style={{
                    background: `linear-gradient(90deg, ${selectedParty.color}, ${selectedParty.color}DD, ${selectedParty.color})`,
                    ["--glow-color" as string]: selectedParty.color + "40",
                  }}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60 30" />
                      </svg>
                      Odosielam...
                    </span>
                  ) : (
                    "Odoslať tip"
                  )}
                </button>
                <button
                  onClick={() => { setSelectedWinner(null); setHeroVisible(false); }}
                  className="px-8 py-3.5 rounded-xl font-semibold text-neutral-600 border-2 border-neutral-200 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-neutral-300 hover:bg-white"
                >
                  Zmeniť tip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Party grid */}
      <div className={`bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mb-8 transition-all duration-500 ${selectedWinner ? "opacity-60" : ""}`}>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          {selectedWinner ? "Alebo vyberte inú stranu" : "Kto vyhrá voľby?"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PARTY_LIST.map((party) => {
            const isSelected = selectedWinner === party.id;
            const hasSelection = selectedWinner !== null;
            return (
              <button
                key={party.id}
                onClick={() => setSelectedWinner(party.id)}
                aria-pressed={isSelected}
                aria-label={`Tipovať ${party.name}`}
                className={`group rounded-xl p-3 border-2 transition-all duration-300 text-center ${
                  isSelected
                    ? "shadow-lg scale-[1.05] ring-2 ring-offset-2"
                    : hasSelection
                    ? "border-neutral-100 bg-neutral-50 hover:bg-white hover:border-neutral-300 hover:scale-[1.02]"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md hover:scale-[1.03]"
                }`}
                style={
                  isSelected
                    ? {
                        borderColor: party.color,
                        backgroundColor: party.color + "15",
                        ["--tw-ring-color" as string]: party.color + "60",
                      }
                    : undefined
                }
              >
                <div
                  className={`w-10 h-10 rounded-full mx-auto mb-2 transition-all duration-300 ${
                    isSelected ? "scale-110" : "group-hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: party.color,
                    boxShadow: isSelected ? `0 4px 15px ${party.color}50` : undefined,
                  }}
                />
                <p className={`text-sm font-bold transition-colors duration-200 ${isSelected ? "" : "text-neutral-700"}`}
                  style={isSelected ? { color: party.color } : undefined}
                >
                  {party.abbreviation}
                </p>
                <p className="text-xs text-neutral-500 truncate">{party.leader}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit button (fallback if no hero) */}
      {!selectedWinner && (
        <button
          disabled
          className="w-full py-4 rounded-xl font-semibold text-lg bg-neutral-200 text-neutral-400 cursor-not-allowed"
        >
          Vyberte stranu
        </button>
      )}

      {/* Current crowd results */}
      {totalBets > 0 && (
        <div className="mt-12">
          <CrowdResults data={crowdData} totalBets={totalBets} />
        </div>
      )}
    </>
  );
}

function CrowdResults({ data, totalBets, winnerId }: { data: CrowdData[]; totalBets: number; winnerId?: string }) {
  const sorted = [...data].sort((a, b) => b.totalBets - a.totalBets);
  const maxBets = sorted.length > 0 ? sorted[0].totalBets : 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-1">Hlas ľudu</h3>
      <p className="text-sm text-neutral-500 mb-6">
        Celkom {totalBets.toLocaleString("sk-SK")} tipov
      </p>

      <div className="space-y-3">
        {sorted.map((item, i) => {
          const party = PARTIES[item.partyId];
          const pct = totalBets > 0 ? (item.totalBets / totalBets) * 100 : 0;
          const barWidth = maxBets > 0 ? (item.totalBets / maxBets) * 100 : 0;
          const isWinner = winnerId === item.partyId;
          return (
            <div
              key={item.partyId}
              className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-300 ${
                isWinner ? "bg-neutral-50 ring-1 ring-neutral-200" : ""
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                style={{ backgroundColor: party?.color + "20" }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: party?.color }}
                />
              </div>
              <span className="w-14 text-sm font-bold text-neutral-700">{party?.abbreviation}</span>
              <div className="flex-1 h-8 bg-neutral-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${party?.color}CC, ${party?.color})`,
                  }}
                />
              </div>
              <div className="text-right w-20 shrink-0">
                <span className="text-sm font-bold tabular-nums" style={{ color: party?.color }}>
                  {pct.toFixed(1)}%
                </span>
                <span className="text-xs text-neutral-400 ml-1">({item.totalBets})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
