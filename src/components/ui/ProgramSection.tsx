"use client";

import { useCallback, useRef, useMemo } from "react";
import { useToggleSet } from "@/hooks/useToggleSet";
import StatusBadge from "@/components/ui/StatusBadge";

const PREVIEW_COUNT = 5;

export interface PartyPromise {
  text: string;
  category: string;
  isPro: boolean;
  status?: string;
}

export interface ProgramData {
  name: string;
  promises: PartyPromise[];
  isStub?: boolean;
}

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

export default function ProgramSection({
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

  const expanded = useToggleSet<string>();
  const showAll = useToggleSet<string>();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const grouped = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = query
      ? promises.filter((p) => p.text.toLowerCase().includes(query))
      : promises;
    const groups: Record<string, PartyPromise[]> = {};
    for (const cat of categories) {
      const items = filtered.filter((p) => p.category === cat);
      if (items.length > 0) groups[cat] = items;
    }
    return groups;
  }, [promises, categories, searchQuery]);

  const isCategoryExpanded = useCallback(
    (cat: string) => {
      if (!isLargeProgram) return true;
      if (searchQuery.trim()) return true;
      return expanded.set.has(cat);
    },
    [isLargeProgram, searchQuery, expanded.set],
  );

  const handleCategoryNav = useCallback(
    (cat: string) => {
      expanded.add(cat);
      setTimeout(() => {
        sectionRefs.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    },
    [expanded],
  );

  const toggleExpandAll = useCallback(() => {
    const allExpanded = categories.every((cat) => expanded.set.has(cat));
    if (allExpanded) expanded.clear();
    else expanded.replaceAll(categories);
  }, [categories, expanded]);

  return (
    <div>
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

      <div className="flex flex-wrap gap-2 mb-4">
        {isLargeProgram ? (
          <button
            onClick={toggleExpandAll}
            className="px-3 py-1.5 text-xs font-medium transition-colors border border-border-strong text-muted hover:bg-page focus-visible:outline-none"
          >
            {categories.every((cat) => expanded.set.has(cat)) ? "Zbaliť všetky" : "Rozbaliť všetky"}
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
            const isExpanded = isCategoryExpanded(cat);
            const isShowAll = showAll.set.has(cat) || items.length <= PREVIEW_COUNT;
            const visibleItems = isShowAll ? items : items.slice(0, PREVIEW_COUNT);
            const hiddenCount = items.length - PREVIEW_COUNT;

            return (
              <div
                key={cat}
                ref={(el) => { sectionRefs.current[cat] = el; }}
                className="border-b border-border"
              >
                <button
                  onClick={() => isLargeProgram ? expanded.toggle(cat) : undefined}
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
                        style={{ transition: "transform .2s", transform: isExpanded ? "rotate(180deg)" : "none" }}
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

                {isExpanded && (
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

                    {!isShowAll && hiddenCount > 0 && (
                      <button
                        onClick={() => showAll.toggle(cat)}
                        className="w-full py-2 text-xs font-medium transition-colors hover:opacity-80"
                        style={{ color: partyColor }}
                      >
                        Zobraziť všetkých {items.length} bodov (+{hiddenCount})
                      </button>
                    )}

                    {isShowAll && items.length > PREVIEW_COUNT && (
                      <button
                        onClick={() => showAll.toggle(cat)}
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
