"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { PARTY_LIST } from "@/lib/parties";
import { PS_PROMISES, PS_PROGRAM_NAME, KNK_PROMISES, KNK_PROGRAM_NAME } from "@/lib/ps-promises";
import type { PartyPromise } from "@/lib/ps-promises";
import {
  SMER_PROMISES, SMER_PROGRAM_NAME,
  HLAS_PROMISES, HLAS_PROGRAM_NAME,
  KDH_PROMISES, KDH_PROGRAM_NAME,
  SAS_PROMISES, SAS_PROGRAM_NAME,
  REPUBLIKA_PROMISES, REPUBLIKA_PROGRAM_NAME,
  SNS_PROMISES, SNS_PROGRAM_NAME,
  DEMOKRATI_PROMISES, DEMOKRATI_PROGRAM_NAME,
  ALIANCIA_PROMISES, ALIANCIA_PROGRAM_NAME,
  SLOVENSKO_PROMISES, SLOVENSKO_PROGRAM_NAME,
} from "@/lib/party-promises";

interface DbPartyData {
  id: string;
  name: string;
  promises: Array<{
    id: number;
    partyId: string;
    promiseText: string;
    category: string;
    isPro: boolean;
    status: string;
    sourceUrl: string | null;
  }>;
}

interface Props {
  partiesData?: DbPartyData[];
}

const PREVIEW_COUNT = 5;

interface ProgramData {
  name: string;
  promises: PartyPromise[];
  isStub?: boolean;
}

// Party programs — each party can have multiple programs
const PARTY_PROGRAMS: Record<string, ProgramData[]> = {
  ps: [
    { name: PS_PROGRAM_NAME, promises: PS_PROMISES },
    { name: KNK_PROGRAM_NAME, promises: KNK_PROMISES },
  ],
  "smer-sd": [{ name: SMER_PROGRAM_NAME, promises: SMER_PROMISES }],
  "hlas-sd": [{ name: HLAS_PROGRAM_NAME, promises: HLAS_PROMISES }],
  kdh: [{ name: KDH_PROGRAM_NAME, promises: KDH_PROMISES }],
  sas: [{ name: SAS_PROGRAM_NAME, promises: SAS_PROMISES }],
  republika: [{ name: REPUBLIKA_PROGRAM_NAME, promises: REPUBLIKA_PROMISES }],
  sns: [{ name: SNS_PROGRAM_NAME, promises: SNS_PROMISES }],
  demokrati: [{ name: DEMOKRATI_PROGRAM_NAME, promises: DEMOKRATI_PROMISES }],
  aliancia: [{ name: ALIANCIA_PROGRAM_NAME, promises: ALIANCIA_PROMISES }],
  slovensko: [{ name: SLOVENSKO_PROGRAM_NAME, promises: SLOVENSKO_PROMISES }],
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
  const { name, promises, isStub } = program;
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
      {/* Program header with accent bar */}
      {name && (
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-1 rounded-[2px] self-stretch shrink-0"
            style={{ background: partyColor, minHeight: "24px" }}
          />
          <div>
            <h2 className="text-[18px] font-bold text-ink">{name}</h2>
            <p className="text-[12px] text-muted">{promises.length} programových bodov</p>
          </div>
        </div>
      )}

      {isStub && (
        <div className="border border-border bg-page px-4 py-3 mb-4">
          <p className="text-xs text-muted">
            Programové body tejto strany sa dopĺňajú. Vráťte sa neskôr.
          </p>
        </div>
      )}

      {/* Category navigation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {isLargeProgram ? (
          <button
            onClick={toggleExpandAll}
            className="px-3 py-1.5 text-xs font-medium transition-colors border border-border-strong text-muted hover:bg-page focus-visible:outline-none"
          >
            {categories.every((cat) => expandedCategories.has(cat)) ? "Zbaliť všetky" : "Rozbaliť všetky"}
          </button>
        ) : (
          <span className="px-3 py-1.5 text-xs font-medium border border-border-strong text-muted">
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
              className={`px-3 py-1.5 text-xs font-medium transition-colors border border-border-strong text-muted hover:bg-page ${
                displayCount === 0 ? "opacity-30" : ""
              }`}
              disabled={displayCount === 0}
            >
              {cat} {displayCount > 0 && <span className="opacity-60">({displayCount})</span>}
            </button>
          );
        })}
      </div>

      {/* Expandable category sections */}
      {Object.keys(grouped).length === 0 ? (
        <div className="border border-border bg-page text-center py-12">
          <p className="text-sm text-muted">
            {searchQuery ? "Žiadne výsledky pre hľadaný výraz" : "Žiadne sľuby v tejto kategórii"}
          </p>
        </div>
      ) : (
        <div className="border-t border-border">
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
                className="border-b border-border"
              >
                <button
                  onClick={() => isLargeProgram ? toggleCategory(cat) : undefined}
                  className={`w-full flex items-center justify-between py-4 px-1 text-left transition-colors ${
                    isLargeProgram ? "hover:bg-page cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span className="text-[15px] font-semibold text-ink">{cat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-muted">
                      {items.length} {items.length === 1 ? "bod" : items.length < 5 ? "body" : "bodov"}
                    </span>
                    {isLargeProgram && (
                      <svg
                        className="w-4 h-4 text-muted"
                        style={{
                          transition: "transform .2s",
                          transform: expanded ? "rotate(180deg)" : "none",
                        }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </button>

                {expanded && (
                  <div className="pb-4 space-y-3 px-1">
                    {visibleItems.map((promise, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span
                          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                          style={{ background: partyColor }}
                        >
                          {i + 1}
                        </span>
                        <div className="flex flex-col gap-1 pt-0.5">
                          <p className="text-[13px] text-secondary leading-[1.55]">{promise.text}</p>
                          {promise.status && <StatusBadge status={promise.status} />}
                        </div>
                      </div>
                    ))}

                    {!showAll && hiddenCount > 0 && (
                      <button
                        onClick={() => toggleShowAll(cat)}
                        className="w-full py-2 text-xs font-medium transition-colors hover:opacity-80"
                        style={{ color: partyColor }}
                      >
                        Zobraziť všetkých {items.length} bodov (+{hiddenCount})
                      </button>
                    )}

                    {showAll && items.length > PREVIEW_COUNT && (
                      <button
                        onClick={() => toggleShowAll(cat)}
                        className="w-full py-2 text-xs font-medium text-muted transition-colors hover:text-ink"
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    fulfilled:    { label: "Splnené",   color: "#00C853" },
    in_progress:  { label: "Prebieha", color: "#FFB300" },
    broken:       { label: "Nesplnené", color: "#D32F2F" },
    not_started:  { label: "Nezačaté", color: "#757575" },
  };
  const s = map[status] ?? map["not_started"];
  return (
    <span
      className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 border"
      style={{ color: s.color, borderColor: s.color }}
    >
      {s.label}
    </span>
  );
}

export default function PovolebnePlanyClient({ partiesData }: Props) {
  const [activeParty, setActiveParty] = useState("ps");
  const [searchQuery, setSearchQuery] = useState("");

  // Build a merged PARTY_PROGRAMS: DB data takes precedence over hardcoded data when available
  const effectivePrograms = useMemo<Record<string, ProgramData[]>>(() => {
    if (!partiesData || partiesData.length === 0) return PARTY_PROGRAMS;
    const dbMap: Record<string, ProgramData[]> = {};
    for (const party of partiesData) {
      dbMap[party.id] = [
        {
          name: "",
          promises: party.promises.map((p) => ({
            text: p.promiseText,
            category: p.category,
            isPro: p.isPro,
            status: p.status,
          })),
        },
      ];
    }
    // For "ps", preserve detailed hardcoded data if DB has none
    return { ...PARTY_PROGRAMS, ...dbMap };
  }, [partiesData]);

  const programs = useMemo(() => effectivePrograms[activeParty] ?? [], [effectivePrograms, activeParty]);
  const totalPromises = programs.reduce((sum, p) => sum + p.promises.length, 0);
  const hasLargeProgram = programs.some((p) => p.promises.length > 10);
  const activePartyData = PARTY_LIST.find((p) => p.id === activeParty);
  const partyColor = activePartyData?.color ?? "#1a1a1a";

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

      {/* Party tabs as pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {PARTY_LIST.map((party) => {
          const isActive = activeParty === party.id;
          return (
            <button
              key={party.id}
              onClick={() => handlePartyChange(party.id)}
              className="px-4 py-1.5 text-[13px] font-semibold rounded-[20px] border transition-all"
              style={{
                background: isActive ? (party.color ?? "#1a1a1a") : "transparent",
                color: isActive ? "#fff" : "#333",
                borderColor: isActive ? (party.color ?? "#1a1a1a") : "#d0cbc3",
              }}
            >
              {party.abbreviation}
            </button>
          );
        })}
      </div>

      {/* Search input — only when there's a large program */}
      {hasLargeProgram && (
        <div className="relative mb-5">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Hľadaj v ${totalPromises} programových bodoch...`}
            className="w-full text-[14px] text-ink bg-card border border-border rounded-[8px] outline-none focus:border-border-strong transition-colors"
            style={{ padding: "9px 14px 9px 36px" }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
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
