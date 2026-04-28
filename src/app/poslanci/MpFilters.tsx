"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

interface Party {
  id: string;
  name: string;
  abbreviation: string;
}

interface MpFiltersProps {
  parties: Party[];
}

export default function MpFilters({ parties }: MpFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val) {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      }
      // Reset to page 1 on filter change
      params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handlePartyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      pushParams({ party: e.target.value || null });
    },
    [pushParams]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        pushParams({ search: value || null });
      }, 300);
    },
    [pushParams]
  );

  const currentParty = searchParams.get("party") ?? "";
  const currentSearch = searchParams.get("search") ?? "";

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <select
        defaultValue={currentParty}
        onChange={handlePartyChange}
        className="border border-border bg-surface text-sm px-3 py-2 text-ink"
      >
        <option value="">Všetky strany</option>
        {parties.map((p) => (
          <option key={p.id} value={p.abbreviation}>
            {p.abbreviation} — {p.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Hľadať poslanca..."
        defaultValue={currentSearch}
        onChange={handleSearchChange}
        className="border border-border bg-surface text-sm px-3 py-2 text-ink placeholder:text-muted min-w-[200px]"
      />
    </div>
  );
}
