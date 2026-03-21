"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { PARTY_LIST } from "@/lib/parties";

const CATEGORIES = ["Ekonomika", "Zdravotníctvo", "Školstvo", "Bezpečnosť", "Zahraničná politika", "Sociálne veci"];

interface Promise {
  text: string;
  category: string;
  isPro: boolean;
}

// Mock promises per party
const MOCK_PROMISES: Record<string, Promise[]> = {
  ps: [
    { text: "Zvýšenie investícií do vedy a výskumu na 2% HDP", category: "Ekonomika", isPro: true },
    { text: "Reforma zdravotníctva s dôrazom na prevenciu", category: "Zdravotníctvo", isPro: true },
    { text: "Podpora obnoviteľných zdrojov energie", category: "Ekonomika", isPro: true },
    { text: "Digitalizácia štátnej správy", category: "Ekonomika", isPro: true },
    { text: "Posilnenie vzťahov s EÚ a NATO", category: "Zahraničná politika", isPro: true },
  ],
  "smer-sd": [
    { text: "Konsolidácia verejných financií", category: "Ekonomika", isPro: true },
    { text: "Zachovanie sociálnych istôt", category: "Sociálne veci", isPro: true },
    { text: "Posilnenie suverenity SR", category: "Zahraničná politika", isPro: true },
    { text: "Boj proti nelegálnej migrácii", category: "Bezpečnosť", isPro: true },
    { text: "Regulácia cien energií", category: "Ekonomika", isPro: true },
  ],
  "hlas-sd": [
    { text: "Zvýšenie minimálnej mzdy", category: "Sociálne veci", isPro: true },
    { text: "Modernizácia nemocníc", category: "Zdravotníctvo", isPro: true },
    { text: "Podpora rodín s deťmi", category: "Sociálne veci", isPro: true },
  ],
  kdh: [
    { text: "Ochrana tradičnej rodiny", category: "Sociálne veci", isPro: true },
    { text: "Podpora vidieka a poľnohospodárstva", category: "Ekonomika", isPro: true },
    { text: "Zvýšenie platov učiteľov", category: "Školstvo", isPro: true },
  ],
  sas: [
    { text: "Zníženie daní a odvodov", category: "Ekonomika", isPro: true },
    { text: "Zrušenie zbytočnej byrokracie", category: "Ekonomika", isPro: true },
    { text: "Reforma školstva podľa fínskeho modelu", category: "Školstvo", isPro: true },
  ],
  republika: [
    { text: "Ochrana národnej suverenity a odmietanie federalizácie EÚ", category: "Zahraničná politika", isPro: true },
    { text: "Prísna migračná politika a ochrana hraníc", category: "Bezpečnosť", isPro: true },
    { text: "Podpora tradičnej rodiny a demografický rast", category: "Sociálne veci", isPro: true },
    { text: "Zníženie závislosti na zahraničných dodávateľoch energií", category: "Ekonomika", isPro: true },
  ],
  sns: [
    { text: "Ochrana slovenského jazyka a národnej identity", category: "Školstvo", isPro: true },
    { text: "Posilnenie obranyschopnosti SR", category: "Bezpečnosť", isPro: true },
    { text: "Podpora domáceho poľnohospodárstva", category: "Ekonomika", isPro: true },
    { text: "Zachovanie tradičných hodnôt v školstve", category: "Školstvo", isPro: true },
  ],
  demokrati: [
    { text: "Posilnenie právneho štátu a nezávislosti justície", category: "Bezpečnosť", isPro: true },
    { text: "Transparentnosť verejných financií", category: "Ekonomika", isPro: true },
    { text: "Proeurópska zahraničná politika", category: "Zahraničná politika", isPro: true },
    { text: "Boj proti korupcii a klientelizmu", category: "Bezpečnosť", isPro: true },
  ],
  aliancia: [
    { text: "Ochrana práv národnostných menšín", category: "Sociálne veci", isPro: true },
    { text: "Podpora dvojjazyčného vzdelávania", category: "Školstvo", isPro: true },
    { text: "Rozvoj regiónov a infraštruktúry na juhu Slovenska", category: "Ekonomika", isPro: true },
    { text: "Proeurópska orientácia a spolupráca s V4", category: "Zahraničná politika", isPro: true },
  ],
  slovensko: [
    { text: "Boj proti korupcii a oligarchom", category: "Bezpečnosť", isPro: true },
    { text: "Podpora rodín s deťmi a zvýšenie prídavkov", category: "Sociálne veci", isPro: true },
    { text: "Reforma verejnej správy a zníženie byrokracie", category: "Ekonomika", isPro: true },
    { text: "Dostupné bývanie pre mladé rodiny", category: "Sociálne veci", isPro: true },
  ],
};

export default function PovolebnePlanyClient() {
  const [activeParty, setActiveParty] = useState("ps");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const promises = MOCK_PROMISES[activeParty] ?? [];
  const filtered = activeCategory
    ? promises.filter((p) => p.category === activeCategory)
    : promises;

  const activePartyData = PARTY_LIST.find((p) => p.id === activeParty);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeading
        title="Povolebné plány"
        subtitle="Čo sľubujú politické strany pred voľbami"
      />

      {/* Party tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-divider pb-4">
        {PARTY_LIST.map((party) => {
          const isActive = activeParty === party.id;
          return (
            <button
              key={party.id}
              onClick={() => {
                setActiveParty(party.id);
                setActiveCategory(null);
              }}
              className={`px-3 py-2 text-xs font-medium transition-colors border ${
                isActive
                  ? "border-ink text-paper"
                  : "border-divider text-text hover:bg-hover"
              }`}
              style={
                isActive
                  ? { backgroundColor: party.color, borderColor: party.color, color: "#fff" }
                  : undefined
              }
            >
              {party.abbreviation}
            </button>
          );
        })}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors border ${
            !activeCategory
              ? "bg-ink text-paper border-ink"
              : "border-divider text-text/50 hover:bg-hover"
          }`}
        >
          Všetky
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors border ${
              activeCategory === cat
                ? "bg-ink text-paper border-ink"
                : "border-divider text-text/50 hover:bg-hover"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Promise cards */}
      <div className="divide-y divide-divider border border-divider bg-surface">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-text/40">Žiadne sľuby v tejto kategórii</p>
            <p className="text-xs text-text/30 mt-1">Dáta budú doplnené po spustení scrapera</p>
          </div>
        ) : (
          filtered.map((promise, i) => (
            <div key={i} className="p-4 hover:bg-hover transition-colors">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: activePartyData?.color ?? "var(--ink)",
                    color: "#fff",
                  }}
                >
                  {promise.isPro ? "+" : "−"}
                </div>
                <div>
                  <p className="text-sm text-ink">{promise.text}</p>
                  <span className="mt-1 inline-block text-xs text-text/40 uppercase tracking-wider">
                    {promise.category}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
