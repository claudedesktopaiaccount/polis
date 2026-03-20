import HeroBanner from "@/components/HeroBanner";
import PartyCard from "@/components/PartyCard";
import NewsHeadlines from "@/components/NewsHeadlines";
import SectionHeading from "@/components/ui/SectionHeading";
import { getLatestPolls } from "@/lib/poll-data";
import { scrapeNews } from "@/lib/scraper/news";
import Link from "next/link";

// Revalidate every 6 hours (match cron schedule)
export const revalidate = 21600;

export default async function Home() {
  const [pollData, newsItems] = await Promise.all([
    getLatestPolls(),
    scrapeNews().catch(() => []),
  ]);
  const ps = pollData.parties.find((p) => p.partyId === "ps");
  const smer = pollData.parties.find((p) => p.partyId === "smer-sd");

  return (
    <>
      {/* Hero: Šimečka vs Fico */}
      {ps && smer && (
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
      )}

      {/* Party cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <SectionHeading
          title="Aktuálne prieskumy"
          subtitle={`Prehľad preferencií podľa najnovšieho prieskumu (${pollData.latestAgency})`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {pollData.parties.map((party) => (
            <PartyCard
              key={party.partyId}
              name={party.name}
              abbreviation={party.abbreviation}
              leader={party.leader}
              color={party.color}
              percentage={party.percentage}
              trend={party.trend}
              portraitUrl={party.portraitUrl}
              lastAgency={party.agency}
            />
          ))}
        </div>
      </section>

      {/* News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <SectionHeading title="Správy" subtitle="Najnovšie politické správy zo Slovenska" />
        <NewsHeadlines items={newsItems} />
      </section>

      {/* CTA Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <CTACard
            href="/predikcia"
            title="Predikcia volieb"
            description="Monte Carlo simulácia predpovedá výsledky ďalších volieb"
            gradient="from-primary-700 to-primary-500"
          />
          <CTACard
            href="/koalicny-simulator"
            title="Koaličný simulátor"
            description="Poskladajte si vlastnú koalíciu a zistite, či má väčšinu"
            gradient="from-primary-600 to-primary-400"
          />
          <CTACard
            href="/tipovanie"
            title="Tipovanie"
            description="Tipnite si, kto vyhrá voľby — hlas ľudu vs. prieskumy"
            gradient="from-primary-800 to-primary-600"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-950 text-primary-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            Progressive Tracker — Agregátor prieskumov a predikcie slovenských volieb
          </p>
          <p className="mt-2 text-xs text-primary-300/60">
            Dáta z verejne dostupných prieskumov. Neoficiálna stránka.
          </p>
          {pollData.pollCount > 0 && (
            <p className="mt-1 text-xs text-primary-300/40">
              Spracovaných {pollData.pollCount} prieskumov z Wikipedie
            </p>
          )}
        </div>
      </footer>
    </>
  );
}

function CTACard({
  href,
  title,
  description,
  gradient,
}: {
  href: string;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white hover:shadow-lg transition-shadow duration-200`}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/80">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white/90">
        Zobraziť
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
