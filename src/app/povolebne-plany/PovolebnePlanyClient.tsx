"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { PARTY_LIST } from "@/lib/parties";
import { PS_PROMISES, PS_PROGRAM_NAME, KNK_PROMISES, KNK_PROGRAM_NAME } from "@/lib/ps-promises";
import type { PartyPromise } from "@/lib/ps-promises";

const PREVIEW_COUNT = 5;

interface ProgramData {
  name: string;
  promises: PartyPromise[];
}

// Party programs — each party can have multiple programs
const PARTY_PROGRAMS: Record<string, ProgramData[]> = {
  ps: [
    { name: PS_PROGRAM_NAME, promises: PS_PROMISES },
    { name: KNK_PROGRAM_NAME, promises: KNK_PROMISES },
  ],
  "smer-sd": [{
    name: "",
    promises: [
      { text: "Konsolidácia verejných financií", category: "Ekonomika", isPro: true },
      { text: "Zachovanie sociálnych istôt", category: "Sociálne veci", isPro: true },
      { text: "Posilnenie suverenity SR", category: "Zahraničná politika", isPro: true },
      { text: "Boj proti nelegálnej migrácii", category: "Bezpečnosť", isPro: true },
      { text: "Regulácia cien energií", category: "Ekonomika", isPro: true },
    ],
  }],
  "hlas-sd": [{
    name: "",
    promises: [
      { text: "Zvýšenie minimálnej mzdy", category: "Sociálne veci", isPro: true },
      { text: "Modernizácia nemocníc", category: "Zdravotníctvo", isPro: true },
      { text: "Podpora rodín s deťmi", category: "Sociálne veci", isPro: true },
    ],
  }],
  kdh: [{
    name: "",
    promises: [
      { text: "Ochrana tradičnej rodiny", category: "Sociálne veci", isPro: true },
      { text: "Podpora vidieka a poľnohospodárstva", category: "Ekonomika", isPro: true },
      { text: "Zvýšenie platov učiteľov", category: "Školstvo", isPro: true },
    ],
  }],
  sas: [{
    name: "",
    promises: [
      { text: "Zníženie daní a odvodov", category: "Ekonomika", isPro: true },
      { text: "Zrušenie zbytočnej byrokracie", category: "Ekonomika", isPro: true },
      { text: "Reforma školstva podľa fínskeho modelu", category: "Školstvo", isPro: true },
    ],
  }],
  republika: [{
    name: "",
    promises: [
      { text: "Ochrana národnej suverenity a odmietanie federalizácie EÚ", category: "Zahraničná politika", isPro: true },
      { text: "Prísna migračná politika a ochrana hraníc", category: "Bezpečnosť", isPro: true },
      { text: "Podpora tradičnej rodiny a demografický rast", category: "Sociálne veci", isPro: true },
      { text: "Zníženie závislosti na zahraničných dodávateľoch energií", category: "Ekonomika", isPro: true },
    ],
  }],
  sns: [{
    name: "",
    promises: [
      { text: "Ochrana slovenského jazyka a národnej identity", category: "Školstvo", isPro: true },
      { text: "Posilnenie obranyschopnosti SR", category: "Bezpečnosť", isPro: true },
      { text: "Podpora domáceho poľnohospodárstva", category: "Ekonomika", isPro: true },
      { text: "Zachovanie tradičných hodnôt v školstve", category: "Školstvo", isPro: true },
    ],
  }],
  demokrati: [{
    name: "",
    promises: [
      { text: "Posilnenie právneho štátu a nezávislosti justície", category: "Bezpečnosť", isPro: true },
      { text: "Transparentnosť verejných financií", category: "Ekonomika", isPro: true },
      { text: "Proeurópska zahraničná politika", category: "Zahraničná politika", isPro: true },
      { text: "Boj proti korupcii a klientelizmu", category: "Bezpečnosť", isPro: true },
    ],
  }],
  aliancia: [{
    name: "",
    promises: [
      { text: "Ochrana práv národnostných menšín", category: "Sociálne veci", isPro: true },
      { text: "Podpora dvojjazyčného vzdelávania", category: "Školstvo", isPro: true },
      { text: "Rozvoj regiónov a infraštruktúry na juhu Slovenska", category: "Ekonomika", isPro: true },
      { text: "Proeurópska orientácia a spolupráca s V4", category: "Zahraničná politika", isPro: true },
    ],
  }],
  slovensko: [{
    name: "",
    promises: [
      { text: "Boj proti korupcii a oligarchom", category: "Bezpečnosť", isPro: true },
      { text: "Podpora rodín s deťmi a zvýšenie prídavkov", category: "Sociálne veci", isPro: true },
      { text: "Reforma verejnej správy a zníženie byrokracie", category: "Ekonomika", isPro: true },
      { text: "Dostupné bývanie pre mladé rodiny", category: "Sociálne veci", isPro: true },
    ],
  }],
};

// Extract unique categories from promises
function getCategories(promises: PartyPromise[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const p of promises) {
    if (!seen.has(p.category)) {
      seen.add(p.category);
      result.push(p.category);
    }
  }
  return result;
}

function ProgramSection({
  program,
  partyColor,
  searchQuery,
}: {
  program: ProgramData;
  partyColor: string;
  searchQuery: string;
}) {
  const { name, promises } = program;
  const isLargeProgram = promises.length > 10;
  const categories = useMemo(() => getCategories(promises), [promises]);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAllInCategory, setShowAllInCategory] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const grouped = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = query
      ? promises.filter((p) => p.text.toLowerCase().includes(query))
      : promises;

    const groups: Record<string, PartyPromise[]> = {};
    for (const cat of categories) {
      const items = filtered.filter((p) => p.category === cat);
      if (items.length > 0) {
        groups[cat] = items;
      }
    }
    return groups;
  }, [promises, categories, searchQuery]);

  const isCategoryExpanded = useCallback(
    (cat: string) => {
      if (!isLargeProgram) return true;
      if (searchQuery.trim()) return true;
      return expandedCategories.has(cat);
    },
    [isLargeProgram, searchQuery, expandedCategories],
  );

  const toggleCategory = useCallback((cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const handleCategoryNav = useCallback(
    (cat: string) => {
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        next.add(cat);
        return next;
      });
      setTimeout(() => {
        sectionRefs.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    },
    [],
  );

  const toggleExpandAll = useCallback(() => {
    const allExpanded = categories.every((cat) => expandedCategories.has(cat));
    if (allExpanded) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(categories));
    }
  }, [categories, expandedCategories]);

  const toggleShowAll = useCallback((cat: string) => {
    setShowAllInCategory((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  return (
    <div>
      {/* Program header */}
      {name && (
        <div className="mb-4 flex items-center gap-3">
          <div
            className="w-1 h-8 shrink-0"
            style={{ backgroundColor: partyColor }}
          />
          <div>
            <p className="text-sm font-bold text-ink">{name}</p>
            <p className="text-xs text-text/50">{promises.length} programových bodov</p>
          </div>
        </div>
      )}

      {/* Category navigation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {isLargeProgram ? (
          <button
            onClick={toggleExpandAll}
            className={`px-3 py-1.5 text-xs font-medium transition-colors border ${
              !searchQuery && categories.every((cat) => expandedCategories.has(cat))
                ? "bg-ink text-paper border-ink"
                : "border-divider text-text/50 hover:bg-hover"
            }`}
          >
            {categories.every((cat) => expandedCategories.has(cat)) ? "Zbaliť všetky" : "Rozbaliť všetky"}
          </button>
        ) : (
          <span className="px-3 py-1.5 text-xs font-medium bg-ink text-paper border border-ink">
            Všetky ({promises.length})
          </span>
        )}
        {categories.map((cat) => {
          const count = (grouped[cat] ?? []).length;
          const totalCount = promises.filter((p) => p.category === cat).length;
          const displayCount = searchQuery ? count : totalCount;
          return (
            <button
              key={cat}
              onClick={() => isLargeProgram ? handleCategoryNav(cat) : undefined}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border border-divider text-text/50 hover:bg-hover ${
                displayCount === 0 ? "opacity-30" : ""
              }`}
              disabled={displayCount === 0}
            >
              {cat} {displayCount > 0 && <span className="opacity-60">({displayCount})</span>}
            </button>
          );
        })}
      </div>

      {/* Accordion sections */}
      {Object.keys(grouped).length === 0 ? (
        <div className="border border-divider bg-surface text-center py-12">
          <p className="text-sm text-text/40">
            {searchQuery ? "Žiadne výsledky pre hľadaný výraz" : "Žiadne sľuby v tejto kategórii"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.filter((cat) => grouped[cat]).map((cat) => {
            const items = grouped[cat];
            const expanded = isCategoryExpanded(cat);
            const showAll = showAllInCategory.has(cat) || items.length <= PREVIEW_COUNT;
            const visibleItems = showAll ? items : items.slice(0, PREVIEW_COUNT);
            const hiddenCount = items.length - PREVIEW_COUNT;

            return (
              <div
                key={cat}
                ref={(el) => { sectionRefs.current[cat] = el; }}
                className="border border-divider bg-surface"
              >
                <button
                  onClick={() => isLargeProgram ? toggleCategory(cat) : undefined}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                    isLargeProgram ? "hover:bg-hover cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div
                    className="w-1 h-6 shrink-0"
                    style={{ backgroundColor: partyColor }}
                  />
                  <span className="text-sm font-bold text-ink flex-1">{cat}</span>
                  <span className="text-xs text-text/40 tabular-nums">
                    {items.length} {items.length === 1 ? "bod" : items.length < 5 ? "body" : "bodov"}
                  </span>
                  {isLargeProgram && (
                    <svg
                      className={`w-4 h-4 text-text/30 transition-transform ${expanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {expanded && (
                  <div className="border-t border-divider">
                    <div className="divide-y divide-divider">
                      {visibleItems.map((promise, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-hover transition-colors">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center text-xs font-bold tabular-nums text-text/30">
                              {i + 1}.
                            </span>
                            <div
                              className="mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center text-xs font-bold"
                              style={{ backgroundColor: partyColor, color: "#fff" }}
                            >
                              {promise.isPro ? "+" : "−"}
                            </div>
                            <p className="text-sm text-ink">{promise.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {!showAll && hiddenCount > 0 && (
                      <button
                        onClick={() => toggleShowAll(cat)}
                        className="w-full py-3 text-xs font-medium transition-colors hover:bg-hover border-t border-divider"
                        style={{ color: partyColor }}
                      >
                        Zobraziť všetkých {items.length} bodov (+{hiddenCount})
                      </button>
                    )}

                    {showAll && items.length > PREVIEW_COUNT && (
                      <button
                        onClick={() => toggleShowAll(cat)}
                        className="w-full py-3 text-xs font-medium text-text/40 transition-colors hover:bg-hover border-t border-divider"
                      >
                        Zobraziť menej
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PovolebnePlanyClient() {
  const [activeParty, setActiveParty] = useState("ps");
  const [searchQuery, setSearchQuery] = useState("");

  const programs = useMemo(() => PARTY_PROGRAMS[activeParty] ?? [], [activeParty]);
  const totalPromises = programs.reduce((sum, p) => sum + p.promises.length, 0);
  const hasLargeProgram = programs.some((p) => p.promises.length > 10);
  const activePartyData = PARTY_LIST.find((p) => p.id === activeParty);
  const partyColor = activePartyData?.color ?? "var(--ink)";

  const handlePartyChange = useCallback((partyId: string) => {
    setActiveParty(partyId);
    setSearchQuery("");
  }, []);

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
              onClick={() => handlePartyChange(party.id)}
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

      {/* Search input — only when there's a large program */}
      {hasLargeProgram && (
        <div className="relative mb-6">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Hľadaj v ${totalPromises} programových bodoch...`}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface border border-divider text-ink placeholder:text-text/30 focus:outline-none focus:border-text/30 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 hover:text-ink transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Program sections */}
      <div className="space-y-10">
        {programs.map((program, i) => (
          <ProgramSection
            key={program.name || i}
            program={program}
            partyColor={partyColor}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}
