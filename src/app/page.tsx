import PollStrip from "@/components/PollStrip";
import Link from "next/link";
import { getLatestPolls } from "@/lib/poll-data";
import { getDb } from "@/lib/db";

export const revalidate = 3600;

// Inline SVG previews for feature cards
function PredikciaMini() {
  const bars = [
    { label: "PS", pct: 91, color: "#1a6eb5" },
    { label: "SMER", pct: 9, color: "#c0392b" },
    { label: "REP", pct: 0, color: "#2c3e50" },
  ];
  return (
    <div className="p-4 space-y-2">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-2">
          <span className="text-[11px] text-[#888888] w-10 shrink-0">{b.label}</span>
          <div className="flex-1 h-2 bg-[#eeeeee] rounded-[4px] overflow-hidden">
            <div
              className="h-full rounded-[4px]"
              style={{ width: `${b.pct}%`, background: b.color }}
            />
          </div>
          <span className="text-[11px] font-semibold text-[#1a1a1a] w-8 text-right">
            {b.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

function SimulatorMini() {
  const parties = [
    { color: "#1a6eb5", seats: 36 },
    { color: "#c0392b", seats: 31 },
    { color: "#2c3e50", seats: 20 },
    { color: "#16a085", seats: 16 },
    { color: "#e74c3c", seats: 14 },
    { color: "#27ae60", seats: 13 },
    { color: "#1a3a6b", seats: 10 },
    { color: "#d63384", seats: 10 },
  ];

  const dotColours: string[] = [];
  for (const p of parties) {
    for (let i = 0; i < p.seats; i++) dotColours.push(p.color);
  }
  while (dotColours.length < 150) dotColours.push("#e8e3db");

  const arcCounts = [15, 22, 28, 35, 50];
  const dots: { x: number; y: number; color: string }[] = [];
  let dotIndex = 0;
  arcCounts.forEach((count, arcIdx) => {
    const r = 48 + arcIdx * 12;
    for (let i = 0; i < count; i++) {
      const angle = Math.PI - (i / (count - 1)) * Math.PI;
      dots.push({
        x: 80 + r * Math.cos(angle),
        y: 72 - r * Math.sin(angle),
        color: dotColours[dotIndex++] ?? "#e8e3db",
      });
    }
  });

  return (
    <div className="flex items-center justify-center p-2">
      <svg viewBox="0 0 160 80" width="160" height="80">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={2.5} fill={d.color} />
        ))}
      </svg>
    </div>
  );
}

function PrieskumyMini() {
  const ps = [19.5, 20.0, 19.8, 20.2, 19.9, 20.4, 20.2];
  const smer = [18.0, 17.8, 17.5, 17.3, 17.6, 17.4, 17.3];
  const w = 160,
    h = 60,
    pad = 8;
  const minV = 15,
    maxV = 23;
  const toX = (i: number) => pad + (i / (ps.length - 1)) * (w - pad * 2);
  const toY = (v: number) =>
    h - pad - ((v - minV) / (maxV - minV)) * (h - pad * 2);
  const path = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");

  return (
    <div className="flex items-center justify-center p-2">
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        <path d={path(ps)} fill="none" stroke="#1a6eb5" strokeWidth={2} />
        <path d={path(smer)} fill="none" stroke="#c0392b" strokeWidth={2} />
      </svg>
    </div>
  );
}

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
      <section
        className="border-b border-[#e8e3db] text-center"
        style={{ background: "#f0ede6", padding: "64px 24px 56px" }}
      >
        <div className="max-w-[1100px] mx-auto">
          <p className="text-[11px] text-[#999999] tracking-[0.12em] font-semibold uppercase mb-4">
            SLOVENSKÉ VOĽBY 2026
          </p>
          <h1
            className="text-[42px] font-extrabold text-[#1a1a1a] mb-4 leading-[1.15] [text-wrap:balance]"
            style={{ letterSpacing: "-1px" }}
          >
            Kde stojíš v slovenskej politike?
          </h1>
          <p className="text-[16px] text-[#666666] mb-8 leading-[1.6] max-w-lg mx-auto">
            20 otázok. 2 minúty. Zisti, ktoré strany zastupujú tvoje hodnoty.
          </p>
          <Link
            href="/volebny-kalkulator"
            className="inline-block bg-[#1a1a1a] text-white text-[15px] font-semibold rounded-[8px] hover:opacity-90 transition-opacity"
            style={{ padding: "13px 28px" }}
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
      <section className="max-w-[1100px] mx-auto" style={{ padding: "48px 24px" }}>
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
        >
          {FEATURE_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group block bg-white border border-[#e8e3db] rounded-[12px] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
            >
              {/* Preview area */}
              <div
                className="border-b border-[#e8e3db] min-h-[90px] flex items-center justify-center"
                style={{ background: "#f8f5f0" }}
              >
                {card.preview}
              </div>
              {/* Content */}
              <div style={{ padding: "20px 22px 22px" }}>
                <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-2">
                  {card.title}
                </h3>
                <p className="text-[13px] text-[#666666] leading-[1.55] mb-3">
                  {card.desc}
                </p>
                <span className="text-[13px] font-semibold text-[#1a6eb5]">
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
