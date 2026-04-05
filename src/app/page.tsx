import { cookies } from "next/headers";
import HeroBanner from "@/components/HeroBanner";
import PartyCard from "@/components/PartyCard";
import NewsHeadlines from "@/components/NewsHeadlines";
import NewsletterSignup from "@/components/NewsletterSignup";
import TickerBar from "@/components/TickerBar";
import HomepageHook from "@/components/HomepageHook";
import PersonalBar from "@/components/PersonalBar";
import LeaderboardPreview from "@/components/LeaderboardPreview";
import CrowdSentiment from "@/components/CrowdSentiment";
import CoalitionBadge from "@/components/CoalitionBadge";
import { getLatestPolls } from "@/lib/poll-data";
import { getLatestNews } from "@/lib/db/news";
import { getDb } from "@/lib/db";
import { predictionScores, users, crowdAggregates, coalitionScenarios } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { PARTIES } from "@/lib/parties";

// Revalidate every hour (news freshness; polls scraped every 6h via cron)
export const revalidate = 3600;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ dashboard?: string }>;
}) {
  const db = getDb();

  // Cookie detection
  const cookieStore = await cookies();
  const isEngaged = cookieStore.get("polis_engaged")?.value === "1";
  const scoreRaw = cookieStore.get("polis_score")?.value;
  let userScore: { total: number; rank: number } | null = null;
  try {
    if (scoreRaw) userScore = JSON.parse(decodeURIComponent(scoreRaw));
  } catch {
    /* ignore */
  }

  const params = await searchParams;
  const isDashboard = isEngaged || params.dashboard === "1";

  // Always fetch poll data (needed for both modes)
  const [pollData, newsItems] = await Promise.all([
    getLatestPolls(db),
    getLatestNews(db, 10).catch(() => []),
  ]);

  // Hook mode — show onboarding for new visitors
  if (!isDashboard) {
    return <HomepageHook topParties={pollData.parties} />;
  }

  // Dashboard mode — fetch additional data
  let leaderboard: { rank: number; displayName: string; totalScore: number }[] = [];
  try {
    const lbRows = await db
      .select({
        totalScore: predictionScores.totalScore,
        displayName: users.displayName,
      })
      .from(predictionScores)
      .leftJoin(users, eq(predictionScores.userId, users.id))
      .where(eq(predictionScores.electionId, "2026"))
      .orderBy(desc(predictionScores.totalScore))
      .limit(5);
    leaderboard = lbRows.map((r, i) => ({
      rank: i + 1,
      displayName: r.displayName ?? "Anonym",
      totalScore: r.totalScore,
    }));
  } catch {
    /* leaderboard not critical */
  }

  let crowdParties: { partyId: string; abbreviation: string; color: string; avgPct: number }[] = [];
  let totalBets = 0;
  try {
    const crowdRows = await db
      .select()
      .from(crowdAggregates)
      .orderBy(desc(crowdAggregates.totalBets));
    crowdParties = crowdRows.map((r) => ({
      partyId: r.partyId,
      abbreviation: PARTIES[r.partyId]?.abbreviation ?? r.partyId,
      color: PARTIES[r.partyId]?.color ?? "#888",
      avgPct: r.avgPredictedPct ?? 0,
    }));
    totalBets = crowdRows.reduce((sum, r) => sum + (r.totalBets ?? 0), 0);
  } catch {
    /* crowd data not critical */
  }

  let topCoalitions: { parties: string[]; seats: number; probability: number }[] = [];
  try {
    const coalRows = await db
      .select()
      .from(coalitionScenarios)
      .orderBy(desc(coalitionScenarios.combinedProbability))
      .limit(3);
    topCoalitions = coalRows
      .filter((c) => c.partyIds && c.predictedSeats)
      .map((c) => ({
        parties: JSON.parse(c.partyIds) as string[],
        seats: c.predictedSeats ?? 0,
        probability: c.combinedProbability ?? 0,
      }));
  } catch {
    /* coalition data not critical */
  }

  const ps = pollData.parties.find((p) => p.partyId === "ps");
  const smer = pollData.parties.find((p) => p.partyId === "smer-sd");

  return (
    <>
      <TickerBar
        parties={pollData.parties}
        agency={pollData.latestAgency ?? "—"}
        date={pollData.latestDate ?? "—"}
      />
      <PersonalBar
        score={userScore?.total ?? null}
        rank={userScore?.rank ?? null}
        totalUsers={null}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-px bg-divider">
        {/* Left: Prediction hero */}
        <div className="bg-surface p-5">
          {ps && smer ? (
            <HeroBanner
              left={{
                name: "Michal Šimečka",
                party: "Progresívne Slovensko",
                percentage: ps.percentage,
                trend: ps.trend,
                portraitUrl: ps.portraitUrl ?? "/portraits/ps-simecka.jpg",
                color: ps.color,
              }}
              right={{
                name: "Robert Fico",
                party: "Smer – sociálna demokracia",
                percentage: smer.percentage,
                trend: smer.trend,
                portraitUrl: smer.portraitUrl ?? "/portraits/smer-fico.jpg",
                color: smer.color,
              }}
              lastPollAgency={pollData.latestAgency}
              lastPollDate={pollData.latestDate}
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-48">
              <p className="text-sm text-text/50">Dáta nedostupné</p>
            </div>
          )}
        </div>

        {/* Center: Party table */}
        <div className="bg-surface p-5">
          <p className="micro-label mb-3">Prieskumy · posledný mesiac</p>
          <div className="space-y-0">
            {pollData.parties.map((p) => (
              <PartyCard
                key={p.partyId}
                name={p.name}
                abbreviation={p.abbreviation}
                leader={p.leader}
                color={p.color}
                percentage={p.percentage}
                trend={p.trend}
                portraitUrl={p.portraitUrl}
                lastAgency={p.agency}
              />
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-divider">
            <p className="font-serif text-lg font-semibold text-ink mb-1">Polis Týždenník</p>
            <p className="text-sm text-muted mb-4">
              Týždenný prehľad prieskumov a predikcií. Zadarmo.
            </p>
            <NewsletterSignup source="homepage" />
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="bg-surface flex flex-col">
          <CrowdSentiment parties={crowdParties} totalBets={totalBets} />
          <LeaderboardPreview entries={leaderboard} />
          <div className="p-4 flex-1">
            <p className="micro-label mb-2">Správy · Dnes</p>
            <NewsHeadlines items={newsItems} />
          </div>
        </div>
      </div>

      {/* Coalition bar */}
      {topCoalitions.length > 0 && (
        <section className="border-t border-divider bg-surface p-5">
          <p className="micro-label mb-3">
            Koaličné scenáre · Pravdepodobnosť zostavenia vlády
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topCoalitions.map((c, i) => (
              <CoalitionBadge
                key={i}
                partyIds={c.parties}
                seats={c.seats}
                probability={c.probability}
              />
            ))}
          </div>
        </section>
      )}

      {/* Bottom info bar */}
      <div className="border-t border-divider bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-text/60">
            Polis — Agregátor prieskumov a predikcie slovenských volieb
          </p>
          <p className="mt-1 text-xs text-text/40">
            Dáta z verejne dostupných prieskumov. Neoficiálna stránka.
          </p>
          {pollData.pollCount > 0 && (
            <p className="mt-1 text-xs text-text/30">
              Spracovaných {pollData.pollCount} prieskumov z Wikipedie
            </p>
          )}
        </div>
      </div>
    </>
  );
}

