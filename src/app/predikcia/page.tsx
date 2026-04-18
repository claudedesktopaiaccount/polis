import type { Metadata } from "next";
import { getLatestPolls } from "@/lib/poll-data";
import { getAggregatedPolls } from "@/lib/poll-aggregate";
import { runSimulation, type PartyInput } from "@/lib/prediction/monte-carlo";
import { allocateSeats } from "@/lib/prediction/dhondt";
import { getOrGenerateNarrative } from "@/lib/prediction/narrative";
import { getDb } from "@/lib/db";
import { getCandidates } from "@/lib/db/candidates";
import PredikciaClient from "./PredikciaClient";

export const metadata: Metadata = {
  title: "Predikcia",
  description: "Monte Carlo predikcia výsledkov slovenských parlamentných volieb. Simulácia rozdelenia mandátov metódou D'Hondt.",
  openGraph: {
    title: "Predikcia | Polis",
    description: "Monte Carlo predikcia výsledkov slovenských parlamentných volieb.",
  },
};

export const revalidate = 21600;

export default async function PredikciaPage() {
  const aggregated = await getAggregatedPolls();

  let inputs: PartyInput[];
  let pollCount: number;
  let newestPollDate: string;

  if (aggregated.length > 0) {
    inputs = aggregated.map((p) => ({
      partyId: p.partyId,
      meanPct: p.meanPct,
      stdDev: p.stdDev,
    }));
    pollCount = Math.max(...aggregated.map((p) => p.pollCount));
    newestPollDate = aggregated.reduce(
      (latest, p) => (p.newestPollDate > latest ? p.newestPollDate : latest),
      ""
    );
  } else {
    // Fallback: single latest poll with hardcoded stdDev brackets
    const pollData = await getLatestPolls();
    inputs = pollData.parties.map((p) => ({
      partyId: p.partyId,
      meanPct: p.percentage,
      stdDev: p.percentage > 10 ? 2.5 : p.percentage > 5 ? 2.0 : 1.5,
    }));
    pollCount = 1;
    newestPollDate = pollData.latestDate;
  }

  const simulation = runSimulation(inputs);

  const currentSeats = allocateSeats(
    inputs.map((p) => ({ partyId: p.partyId, percentage: p.meanPct }))
  );

  let narrative: string | null = null;
  try {
    const db = getDb();
    narrative = aggregated.length > 0
      ? await getOrGenerateNarrative(db, aggregated, simulation, process.env.ANTHROPIC_API_KEY)
      : null;
  } catch {
    // narrative unavailable — page renders without it
  }

  let candidates: Awaited<ReturnType<typeof getCandidates>> = [];
  try {
    const db = getDb();
    candidates = await getCandidates(db);
  } catch {
    // candidates unavailable — PoslanciSection renders empty
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-[#1a1a1a]" style={{ letterSpacing: "-0.5px" }}>
          Predikcia volieb
        </h1>
        <p className="text-[13px] text-[#888888] uppercase tracking-[0.08em] mt-1">
          MONTE CARLO SIMULÁCIA (10 000 ITERÁCIÍ) NA ZÁKLADE {pollCount} PRIESKUM{pollCount === 1 ? "U" : "OV"}
        </p>
      </div>

      <PredikciaClient
        simulation={simulation}
        currentSeats={currentSeats}
        narrative={narrative}
        newestPollDate={newestPollDate}
        pollCount={pollCount}
        candidates={candidates}
      />
    </div>
  );
}
