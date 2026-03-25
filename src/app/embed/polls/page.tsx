import { getAllPolls } from "@/lib/poll-data";
import { PARTY_LIST } from "@/lib/parties";
import EmbedPollsClient from "./EmbedPollsClient";

export const revalidate = 3600;

export default async function EmbedPollsPage() {
  const polls = await getAllPolls();

  const chartData = polls
    .slice(0, 60)
    .reverse()
    .map((poll) => {
      const entry: Record<string, string | number> = {
        date: poll.publishedDate,
        agency: poll.agency,
      };
      for (const [partyId, pct] of Object.entries(poll.results)) {
        entry[partyId] = pct;
      }
      return entry;
    });

  const partyMeta = PARTY_LIST.map((p) => ({
    id: p.id,
    abbreviation: p.abbreviation,
    color: p.color,
  }));

  return <EmbedPollsClient chartData={chartData} partyMeta={partyMeta} />;
}
