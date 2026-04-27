import PollStrip from "@/components/PollStrip";
import Link from "next/link";
import { getLatestPolls } from "@/lib/poll-data";
import { getDb } from "@/lib/db";
import { PredikciaMini, SimulatorMini, PrieskumyMini } from "@/components/home/FeaturePreviews";

export const revalidate = 3600;

export default async function Home() {
  const db = getDb();
  const pollData = await getLatestPolls(db).catch(() => ({
    parties: [],
    latestAgency: "—",
    latestDate: "—",
    pollCount: 0,
  }));

  const FEATURE_CARDS = [
    {
      href: "/predikcia",
      title: "Predikcia volieb",
      desc: "Monte Carlo simulácia na základe 42 prieskumov. Pravdepodobnosť výhry každej strany.",
      preview: <PredikciaMini />,
    },
    {
      href: "/koalicny-simulator",
      title: "Koaličný simulátor",
      desc: "Vyberte strany a zistite, či dokážu vytvoriť parlamentnú väčšinu.",
      preview: <SimulatorMini />,
    },
    {
      href: "/prieskumy",
      title: "Prieskumy",
      desc: "Vývoj volebných preferencií od júna 2025. Dáta z NMS, Focus, AKO, Ipsos.",
      preview: <PrieskumyMini />,
    },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border text-center bg-subtle px-6 pt-16 pb-14">
        <div className="max-w-content mx-auto">
          <p className="text-[11px] text-muted tracking-[0.12em] font-semibold uppercase mb-4">
            SLOVENSKÉ VOĽBY 2026
          </p>
          <h1
            className="text-[42px] font-extrabold text-ink mb-4 leading-[1.15] [text-wrap:balance]"
            style={{ letterSpacing: "-1px" }}
          >
            Kde stojíš v slovenskej politike?
          </h1>
          <p className="text-[16px] text-secondary mb-8 leading-[1.6] max-w-lg mx-auto">
            20 otázok. 2 minúty. Zisti, ktoré strany zastupujú tvoje hodnoty.
          </p>
          <Link
            href="/volebny-kalkulator"
            className="inline-block bg-ink text-white text-[15px] font-semibold px-7 py-3.5 hover:opacity-90 transition-opacity"
          >
            Spustiť kalkulačku →
          </Link>
        </div>
      </section>

      {/* Poll strip */}
      {pollData.parties.length > 0 && (
        <PollStrip
          parties={pollData.parties}
          agency={pollData.latestAgency ?? "—"}
          date={pollData.latestDate ?? "—"}
        />
      )}

      {/* Feature cards */}
      <section className="max-w-content mx-auto px-6 py-12">
        <div
          className="grid gap-px bg-border"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
        >
          {FEATURE_CARDS.map((card, i) => (
            <Link
              key={card.href}
              href={card.href}
              className="group block bg-card overflow-hidden transition-colors duration-150 hover:bg-subtle"
            >
              {/* Editorial header */}
              <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border">
                <span className="text-[10px] font-mono text-muted tabular-nums">
                  0{i + 1}
                </span>
                <span className="text-[10px] tracking-[0.1em] uppercase text-muted font-semibold">
                  {card.title}
                </span>
              </div>
              {/* Preview area */}
              <div className="min-h-[100px] flex items-center justify-center bg-subtle border-b border-border">
                {card.preview}
              </div>
              {/* Content */}
              <div className="p-5">
                <h3 className="text-[15px] font-bold text-ink mb-1.5">
                  {card.title}
                </h3>
                <p className="text-[12px] text-secondary leading-[1.55] mb-4">
                  {card.desc}
                </p>
                <span className="text-[12px] font-semibold text-ink group-hover:underline">
                  Otvoriť →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
