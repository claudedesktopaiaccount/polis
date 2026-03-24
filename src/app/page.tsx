import HeroBanner from "@/components/HeroBanner";
import PartyCard from "@/components/PartyCard";
import NewsHeadlines from "@/components/NewsHeadlines";
import SectionHeading from "@/components/ui/SectionHeading";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getLatestPolls } from "@/lib/poll-data";
import { scrapeNews } from "@/lib/scraper/news";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import Link from "next/link";

// Revalidate every hour (news freshness; polls scraped every 6h via cron)
export const revalidate = 3600;

export default async function Home() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const [pollData, newsItems] = await Promise.all([
    getLatestPolls(db),
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

      {/* Main content: 2-column on desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-12">
          {/* Left: Party cards + CTA */}
          <div>
            <SectionHeading
              title="Aktuálne preferencie"
              subtitle={`Posledný prieskum: ${pollData.latestAgency}`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
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

            <div className="mt-8 text-center">
              <Link
                href="/prieskumy"
                className="text-sm font-medium text-ink underline underline-offset-4 hover:text-text transition-colors"
              >
                Zobraziť všetky strany →
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-divider">
              <p className="font-serif text-lg font-semibold text-ink mb-1">Polis Týždenník</p>
              <p className="text-sm text-muted mb-4">Týždenný prehľad prieskumov a predikcií. Zadarmo.</p>
              <NewsletterSignup source="homepage" />
            </div>

            {/* CTA Cards */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CTACard
                href="/predikcia"
                title="Predikcia"
                description="Monte Carlo simulácia"
              />
              <CTACard
                href="/koalicny-simulator"
                title="Koalície"
                description="Simulátor väčšiny"
              />
              <CTACard
                href="/tipovanie"
                title="Tipovanie"
                description="Hlas ľudu vs. prieskumy"
              />
            </div>
          </div>

          {/* Right: News sidebar */}
          <aside className="mt-12 lg:mt-0 lg:border-l lg:border-divider lg:pl-8">
            <SectionHeading title="Live Feed" subtitle="Politické správy" />
            <NewsHeadlines items={newsItems} />
          </aside>
        </div>
      </div>

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

function CTACard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block border border-divider bg-surface p-5 hover:bg-hover transition-colors"
    >
      <h3 className="font-serif text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 text-xs text-text/60">{description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-ink">
        Otvoriť →
      </span>
    </Link>
  );
}
