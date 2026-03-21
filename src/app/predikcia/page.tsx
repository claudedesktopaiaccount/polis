import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import { getLatestPolls } from "@/lib/poll-data";
import { runSimulation, estimateStdDev, type PartyInput } from "@/lib/prediction/monte-carlo";
import { allocateSeats } from "@/lib/prediction/dhondt";
import PredikciaClient from "./PredikciaClient";

export const metadata: Metadata = {
  title: "Predikcia | Progressive Tracker",
  description: "Monte Carlo predikcia výsledkov slovenských parlamentných volieb. Simulácia rozdelenia mandátov metódou D'Hondt.",
  openGraph: {
    title: "Predikcia | Progressive Tracker",
    description: "Monte Carlo predikcia výsledkov slovenských parlamentných volieb.",
  },
};

export const revalidate = 21600;

export default async function PredikciaPage() {
  const pollData = await getLatestPolls();

  // Build inputs for Monte Carlo from real poll data
  const inputs: PartyInput[] = pollData.parties.map((p) => ({
    partyId: p.partyId,
    meanPct: p.percentage,
    stdDev: p.percentage > 10 ? 2.5 : p.percentage > 5 ? 2.0 : 1.5,
  }));

  const simulation = runSimulation(inputs);

  const currentSeats = allocateSeats(
    pollData.parties.map((p) => ({
      partyId: p.partyId,
      percentage: p.percentage,
    }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeading
        title="Predikcia volieb"
        subtitle={`Monte Carlo simulácia (10 000 iterácií) na základe prieskumu ${pollData.latestAgency}`}
      />

      <PredikciaClient
        simulation={simulation}
        currentSeats={currentSeats}
        latestAgency={pollData.latestAgency}
        latestDate={pollData.latestDate}
      />
    </div>
  );
}
