import SectionHeading from "@/components/ui/SectionHeading";
import { getLatestPolls } from "@/lib/poll-data";
import KoalicnyClient from "./KoalicnyClient";

export const revalidate = 21600;

export default async function KoalicnySimulatorPage() {
  const pollData = await getLatestPolls();

  const pollResults = pollData.parties.map((p) => ({
    partyId: p.partyId,
    percentage: p.percentage,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeading
        title="Koaličný simulátor"
        subtitle={`Vyberte strany a zistite, či dokážu vytvoriť väčšinu (dáta: ${pollData.latestAgency})`}
      />

      <KoalicnyClient pollResults={pollResults} />
    </div>
  );
}
