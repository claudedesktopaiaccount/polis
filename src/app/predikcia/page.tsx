import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import { getLatestPolls } from "@/lib/poll-data";
import { getAggregatedPolls } from "@/lib/poll-aggregate";
import { runSimulation, type PartyInput } from "@/lib/prediction/monte-carlo";
import { allocateSeats } from "@/lib/prediction/dhondt";
import { getOrGenerateNarrative } from "@/lib/prediction/narrative";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
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
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    narrative = aggregated.length > 0
      ? await getOrGenerateNarrative(db, aggregated, simulation, env.ANTHROPIC_API_KEY)
      : null;
  } catch {
    // narrative unavailable — page renders without it
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeading
        title="Predikcia volieb"
        subtitle={`Monte Carlo simulácia (10 000 iterácií) na základe ${pollCount} prieskum${pollCount === 1 ? "u" : "ov"}`}
      />

      <PredikciaClient
        simulation={simulation}
        currentSeats={currentSeats}
        narrative={narrative}
        newestPollDate={newestPollDate}
        pollCount={pollCount}
      />
    </div>
  );
}
