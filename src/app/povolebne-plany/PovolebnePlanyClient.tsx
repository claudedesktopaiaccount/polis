"use client";

import { useState, useCallback, useMemo } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ProgramSection, { type ProgramData } from "@/components/ui/ProgramSection";
import { PARTY_LIST } from "@/lib/parties";
import { PS_PROMISES, PS_PROGRAM_NAME, KNK_PROMISES, KNK_PROGRAM_NAME } from "@/lib/ps-promises";
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
  }>;
}

interface Props {
  partiesData?: DbPartyData[];
}

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

export default function PovolebnePlanyClient({ partiesData }: Props) {
  const [activeParty, setActiveParty] = useState("ps");
  const [searchQuery, setSearchQuery] = useState("");

  const effectivePrograms = useMemo<Record<string, ProgramData[]>>(() => {
    if (!partiesData || partiesData.length === 0) return PARTY_PROGRAMS;
    const dbMap: Record<string, ProgramData[]> = {};
    for (const party of partiesData) {
      dbMap[party.id] = [{
        name: "",
        promises: party.promises.map((p) => ({
          text: p.promiseText,
          category: p.category,
          isPro: p.isPro,
          status: p.status,
        })),
      }];
    }
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

      {hasLargeProgram && (
        <div className="relative mb-5">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
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

      <div className="space-y-10">
        {programs.map((program, i) => (
          <ProgramSection
            key={program.name || `db-${activeParty}-${i}`}
            program={program}
            partyColor={partyColor}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}
