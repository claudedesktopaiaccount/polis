import { scrapeWikipediaPolls, type RawPollRow } from "./scraper/wikipedia";
import { PARTIES, PARTY_LIST } from "./parties";

export interface LatestPollData {
  partyId: string;
  name: string;
  abbreviation: string;
  leader: string;
  color: string;
  percentage: number;
  trend: number; // difference vs previous poll
  portraitUrl?: string;
  agency: string;
  date: string;
}

export interface PollSummary {
  parties: LatestPollData[];
  latestAgency: string;
  latestDate: string;
  pollCount: number;
}

/**
 * Fetch latest polls from Wikipedia and compute trends.
 * Uses ISR/caching — call from server components.
 */
export async function getLatestPolls(): Promise<PollSummary> {
  let polls: RawPollRow[];

  try {
    polls = await scrapeWikipediaPolls();
  } catch (error) {
    console.error("Failed to scrape Wikipedia polls:", error);
    // Return fallback mock data
    return getFallbackData();
  }

  if (polls.length === 0) {
    return getFallbackData();
  }

  const latest = polls[0];
  const previous = polls.length > 1 ? polls[1] : null;

  const parties: LatestPollData[] = PARTY_LIST
    .map((party) => {
      const percentage = latest.results[party.id] ?? 0;
      const prevPercentage = previous?.results[party.id] ?? percentage;
      const trend = Math.round((percentage - prevPercentage) * 10) / 10;

      return {
        partyId: party.id,
        name: party.name,
        abbreviation: party.abbreviation,
        leader: party.leader,
        color: party.color,
        percentage,
        trend,
        portraitUrl: party.portraitUrl,
        agency: latest.agency,
        date: latest.publishedDate,
      };
    })
    .filter((p) => p.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  return {
    parties,
    latestAgency: latest.agency,
    latestDate: formatSlovakDate(latest.publishedDate),
    pollCount: polls.length,
  };
}

/**
 * Get all scraped polls for the charts page.
 */
export async function getAllPolls(): Promise<RawPollRow[]> {
  try {
    return await scrapeWikipediaPolls();
  } catch {
    return [];
  }
}

function formatSlovakDate(isoDate: string): string {
  const months = [
    "január", "február", "marec", "apríl", "máj", "jún",
    "júl", "august", "september", "október", "november", "december",
  ];
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day}. ${months[month - 1]} ${year}`;
}

function getFallbackData(): PollSummary {
  // Hardcoded fallback in case scraping fails
  const fallback: Record<string, number> = {
    ps: 24.8,
    "smer-sd": 22.3,
    "hlas-sd": 14.1,
    republika: 8.7,
    sas: 6.2,
    kdh: 5.9,
    sns: 5.1,
    slovensko: 4.8,
    demokrati: 3.5,
    aliancia: 2.1,
  };

  const parties: LatestPollData[] = PARTY_LIST
    .filter((p) => fallback[p.id])
    .map((party) => ({
      partyId: party.id,
      name: party.name,
      abbreviation: party.abbreviation,
      leader: party.leader,
      color: party.color,
      percentage: fallback[party.id],
      trend: 0,
      portraitUrl: party.portraitUrl,
      agency: "Fallback",
      date: new Date().toISOString().split("T")[0],
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return {
    parties,
    latestAgency: "Fallback",
    latestDate: "nedostupné",
    pollCount: 0,
  };
}
