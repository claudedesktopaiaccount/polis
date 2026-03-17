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
};

export default function PovolebnePlanyPage() {
  const [activeParty, setActiveParty] = useState("ps");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const promises = MOCK_PROMISES[activeParty] ?? [];
  const filtered = activeCategory
    ? promises.filter((p) => p.category === activeCategory)
    : promises;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeading
        title="Povolebné plány"
        subtitle="Čo sľubujú politické strany pred voľbami"
      />

      {/* Party tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PARTY_LIST.map((party) => (
          <button
            key={party.id}
            onClick={() => {
              setActiveParty(party.id);
              setActiveCategory(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeParty === party.id
                ? "text-white shadow-md"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
            style={
              activeParty === party.id
                ? { backgroundColor: party.color }
                : undefined
            }
          >
            {party.abbreviation}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !activeCategory ? "bg-primary-100 text-primary-700" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
          }`}
        >
          Všetky
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary-100 text-primary-700"
                : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Promise cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            <p className="text-lg">Žiadne sľuby v tejto kategórii</p>
            <p className="text-sm mt-1">Dáta budú doplnené po spustení scrapera</p>
          </div>
        ) : (
          filtered.map((promise, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-neutral-100 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                    promise.isPro ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {promise.isPro ? "+" : "−"}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">{promise.text}</p>
                  <span className="mt-1 inline-block text-xs bg-neutral-100 text-neutral-500 rounded-full px-2 py-0.5">
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
