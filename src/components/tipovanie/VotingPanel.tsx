"use client";

import Link from "next/link";
import { PARTY_LIST } from "@/lib/parties";
import ShareButtons from "@/components/ShareButtons";
import { useAuth } from "@/components/AuthProvider";

interface Props {
  selectedWinner: string | null;
  setSelectedWinner: (id: string) => void;
  submitted: boolean;
  submitting: boolean;
  alreadyVotedParty: string | null;
  showAdvanced: boolean;
  setShowAdvanced: (v: boolean) => void;
  predictedPcts: Record<string, string>;
  setPredictedPcts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  coalitionPickSet: Set<string>;
  toggleCoalitionPick: (id: string) => void;
  onSubmit: () => void;
}

export default function VotingPanel({
  selectedWinner,
  setSelectedWinner,
  submitted,
  submitting,
  alreadyVotedParty,
  showAdvanced,
  setShowAdvanced,
  predictedPcts,
  setPredictedPcts,
  coalitionPickSet,
  toggleCoalitionPick,
  onSubmit,
}: Props) {
  const { user } = useAuth();
  const selectedParty = selectedWinner ? PARTY_LIST.find((p) => p.id === selectedWinner) : null;

  return (
    <div className="bg-card border border-border rounded-[12px] p-5">
      <h2 className="text-[18px] font-bold text-ink mb-4">Kto vyhrá voľby?</h2>

      {!submitted ? (
        <>
          <div className="space-y-2">
            {PARTY_LIST.map((party) => {
              const isSelected = selectedWinner === party.id;
              return (
                <button
                  key={party.id}
                  onClick={() => setSelectedWinner(party.id)}
                  aria-pressed={isSelected}
                  aria-label={`Tipovať ${party.name}`}
                  className="w-full flex items-center gap-3 rounded-[8px] border transition-all"
                  style={{
                    padding: "10px 12px",
                    background: isSelected ? `${party.color}15` : "#fff",
                    borderColor: isSelected ? party.color : "#e8e3db",
                    borderWidth: isSelected ? "2px" : "1px",
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-[2px] shrink-0" style={{ background: party.color }} />
                  <span className="text-[14px] font-medium text-ink flex-1 text-left">{party.name}</span>
                  <span className="text-[11px] text-faint">{party.leader}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 shrink-0" style={{ color: party.color }} fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.15" />
                      <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {selectedWinner && (
            <div className="mt-4">
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="w-full py-2.5 rounded-[8px] text-[14px] font-semibold transition-colors"
                style={{
                  background: selectedParty?.color ?? "#1a1a1a",
                  color: "#fff",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Odosielam..." : "Odoslať tip"}
              </button>

              <div className="mt-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-[11px] text-muted hover:text-ink underline transition-colors"
                >
                  {showAdvanced ? "Skryť rozšírené tipovanie" : "Rozšírené tipovanie (percentá, koalícia)"}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4">
                    <div className="border border-border rounded-lg p-4">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-secondary mb-3">
                        Tipnite percentá strán
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {PARTY_LIST.map((party) => (
                          <div key={party.id} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-[2px] shrink-0" style={{ backgroundColor: party.color }} />
                            <span className="text-[11px] text-[#666666] truncate flex-1">{party.abbreviation}</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="—"
                              value={predictedPcts[party.id] ?? ""}
                              onChange={(e) =>
                                setPredictedPcts((prev) => ({ ...prev, [party.id]: e.target.value }))
                              }
                              className="w-16 px-2 py-1 text-[11px] text-right border border-border rounded-[4px] bg-transparent tabular-nums focus:border-ink focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-secondary mb-3">
                        Tipnite koalíciu
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {PARTY_LIST.map((party) => {
                          const isInCoalition = coalitionPickSet.has(party.id);
                          return (
                            <button
                              key={party.id}
                              onClick={() => toggleCoalitionPick(party.id)}
                              className="px-3 py-1.5 text-[11px] rounded-[6px] border transition-colors"
                              style={{
                                borderColor: isInCoalition ? party.color : "#e8e3db",
                                background: isInCoalition ? `${party.color}15` : "#fff",
                                color: isInCoalition ? party.color : "#666666",
                                fontWeight: isInCoalition ? 600 : 400,
                              }}
                            >
                              {party.abbreviation}
                            </button>
                          );
                        })}
                      </div>
                      {coalitionPickSet.size > 0 && (
                        <p className="text-[11px] text-faint mt-2">
                          {coalitionPickSet.size}{" "}
                          {coalitionPickSet.size === 1
                            ? "strana"
                            : coalitionPickSet.size < 5
                            ? "strany"
                            : "strán"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="mt-4 p-3 rounded-[8px] bg-[#f0fdf4] border border-[#bbf7d0] text-[13px] text-[#16a34a] flex items-center justify-between">
            <span>{alreadyVotedParty ? "Už ste tipovali." : "Váš tip bol zaznamenaný."}</span>
          </div>
          <div className="mt-4 text-center">
            <p className="text-[13px] text-secondary">
              Tipujete výhru:{" "}
              <strong style={{ color: selectedParty?.color }}>{selectedParty?.name}</strong>
            </p>
            {user ? (
              <p className="text-[11px] text-faint mt-2">Prihlásený ako {user.displayName}</p>
            ) : (
              <p className="text-[11px] text-muted mt-3">
                <Link href="/prihlasenie" className="underline hover:text-ink">
                  Prihláste sa
                </Link>{" "}
                pre uloženie tipu naprieč zariadeniami
              </p>
            )}
            <ShareButtons
              url={typeof window !== "undefined" ? window.location.href : "/tipovanie"}
              title="Tipujem voľby na Polis"
              description="Tipnite si víťaza slovenských parlamentných volieb."
            />
            <Link
              href="/tipovanie/rebricek"
              className="inline-block mt-3 text-[12px] text-muted hover:text-ink underline"
            >
              Pozrite si rebríček predpovedí →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
