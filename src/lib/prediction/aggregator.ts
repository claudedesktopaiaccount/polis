interface PollDataPoint {
  agency: string;
  date: string; // ISO date
  partyId: string;
  percentage: number;
}

interface AggregatedResult {
  partyId: string;
  weightedAverage: number;
  trendSlope: number; // percentage points per month
  recentPolls: { agency: string; percentage: number }[];
}

/** Agency reliability weights — higher = more trusted */
const AGENCY_WEIGHTS: Record<string, number> = {
  Focus: 1.0,
  AKO: 0.95,
  Median: 0.9,
  IPSOS: 0.9,
  MVK: 0.85,
  NMS: 0.8,
  VolímTo: 0.8,
};

/** Time decay: polls lose 50% weight after this many days */
const HALF_LIFE_DAYS = 30;

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Aggregate polls using weighted average with time decay and agency weights.
 */
export function aggregatePolls(
  data: PollDataPoint[],
  referenceDate: string = new Date().toISOString().split("T")[0]
): AggregatedResult[] {
  // Group by party
  const byParty: Record<string, PollDataPoint[]> = {};
  for (const d of data) {
    if (!byParty[d.partyId]) byParty[d.partyId] = [];
    byParty[d.partyId].push(d);
  }

  const results: AggregatedResult[] = [];

  for (const [partyId, polls] of Object.entries(byParty)) {
    // Sort by date descending
    const sorted = polls.sort((a, b) => b.date.localeCompare(a.date));

    // Weighted average with time decay
    let weightSum = 0;
    let valueSum = 0;

    for (const poll of sorted) {
      const age = daysBetween(poll.date, referenceDate);
      const timeWeight = Math.pow(0.5, age / HALF_LIFE_DAYS);
      const agencyWeight = AGENCY_WEIGHTS[poll.agency] ?? 0.7;
      const weight = timeWeight * agencyWeight;

      valueSum += poll.percentage * weight;
      weightSum += weight;
    }

    const weightedAverage = weightSum > 0 ? valueSum / weightSum : 0;

    // Calculate trend (simple linear regression on last 90 days)
    const recent = sorted.filter((p) => daysBetween(p.date, referenceDate) <= 90);
    let trendSlope = 0;

    if (recent.length >= 2) {
      const n = recent.length;
      const xMean = recent.reduce((s, p) => s + daysBetween(p.date, referenceDate), 0) / n;
      const yMean = recent.reduce((s, p) => s + p.percentage, 0) / n;

      let numerator = 0;
      let denominator = 0;
      for (const p of recent) {
        const x = daysBetween(p.date, referenceDate);
        numerator += (x - xMean) * (p.percentage - yMean);
        denominator += (x - xMean) * (x - xMean);
      }

      // Slope in pct per day, convert to per month (×30)
      const dailySlope = denominator !== 0 ? numerator / denominator : 0;
      trendSlope = -dailySlope * 30; // Negative because x is "days ago"
    }

    results.push({
      partyId,
      weightedAverage: Math.round(weightedAverage * 100) / 100,
      trendSlope: Math.round(trendSlope * 100) / 100,
      recentPolls: sorted.slice(0, 5).map((p) => ({
        agency: p.agency,
        percentage: p.percentage,
      })),
    });
  }

  return results.sort((a, b) => b.weightedAverage - a.weightedAverage);
}

export { type PollDataPoint, type AggregatedResult };
