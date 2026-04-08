"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { PARTIES, PARTY_LIST } from "@/lib/parties";
import { QUESTIONS } from "@/lib/kalkulator/questions";
import type { Question } from "@/lib/kalkulator/questions";

interface Props {
  questions?: Question[];
}

export default function VolebnyKalkulatorClient({ questions: questionsProp }: Props) {
  const questions = questionsProp ?? QUESTIONS;
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const partyIds = PARTY_LIST.map((p) => p.id);

  useEffect(() => {
    if (showResults) {
      document.cookie = "polis_engaged=1; path=/; max-age=31536000; SameSite=Lax";
    }
  }, [showResults]);

  function selectAnswer(answerIdx: number) {
    setAnswers((prev) => ({ ...prev, [currentQ]: answerIdx }));
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResults(true);
    }
  }

  function calculateResults() {
    // Build user vector (sum of weights for each party)
    const userVector: number[] = partyIds.map((partyId) => {
      let total = 0;
      for (const [qIdx, aIdx] of Object.entries(answers)) {
        const q = questions[Number(qIdx)];
        const answer = q.answers[aIdx];
        total += answer.weights[partyId] ?? 0;
      }
      return total;
    });

    // Build ideal vectors for each party (max weights)
    return partyIds.map((partyId, i) => {
      const idealVector: number[] = partyIds.map((_, j) => (j === i ? 40 : 0));
      // Use raw scores instead of ideal — compare user's accumulated score
      const score = userVector[i];
      // Normalize to 0-100
      const maxPossible = questions.length * 2; // max weight per question is 2
      const percentage = Math.max(0, Math.min(100, ((score + maxPossible) / (2 * maxPossible)) * 100));
      return {
        partyId,
        party: PARTIES[partyId],
        score: Math.round(percentage),
      };
    }).sort((a, b) => b.score - a.score);
  }

  if (showResults) {
    const results = calculateResults();
    const top = results[0];

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SectionHeading title="Váš výsledok" subtitle="Na základe vašich odpovedí vám najviac vyhovuje:" />

        {/* Top match */}
        <div className="border border-divider bg-surface p-8 text-center mb-8">
          <p
            className="text-6xl font-extrabold mb-2"
            style={{ color: top.party?.color ?? "var(--ink)" }}
          >
            {top.score}%
          </p>
          <h2 className="font-serif text-2xl font-bold text-ink">{top.party?.name}</h2>
          <p className="text-sm text-text/60 mt-1">{top.party?.leader}</p>
        </div>

        {/* All results */}
        <div className="border border-divider bg-surface divide-y divide-divider">
          {results.map((r) => {
            const maxScore = results[0].score;
            const barWidth = maxScore > 0 ? (r.score / maxScore) * 100 : 0;
            return (
              <div key={r.partyId} className="flex items-center gap-3 px-4 py-3">
                <div className="flex items-center gap-2 w-20 shrink-0">
                  <div className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: r.party?.color }} />
                  <span className="text-xs font-medium text-ink">{r.party?.abbreviation}</span>
                </div>
                <div className="flex-1 h-6 bg-hover overflow-hidden">
                  <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${barWidth}%`, backgroundColor: r.party?.color }}
                  />
                </div>
                <span
                  className="text-xs font-bold tabular-nums w-10 text-right"
                  style={{ color: r.party?.color }}
                >
                  {r.score}%
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            setCurrentQ(0);
            setAnswers({});
            setShowResults(false);
          }}
          className="mt-8 w-full py-3 bg-ink text-paper font-semibold text-sm border border-ink hover:bg-transparent hover:text-ink transition-colors"
        >
          Skúsiť znova
        </button>

        {/* Post-quiz funnel */}
        <div className="mt-8 border-t border-divider pt-6 space-y-4">
          {/* Top match highlight */}
          <div className="bg-hover/50 p-4 border border-divider">
            <p className="micro-label mb-1">Tvoja najväčšia zhoda</p>
            <p className="font-serif text-xl font-bold" style={{ color: top.party?.color ?? "var(--ink)" }}>
              {top.party?.name} — {top.score.toFixed(0)}%
            </p>
          </div>

          {/* Funnel CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/prieskumy"
              className="block p-4 border border-divider hover:bg-hover transition-colors"
            >
              <p className="font-semibold text-sm mb-1">Ako sa darí {top.party?.abbreviation}?</p>
              <p className="text-xs text-text/50">Pozri si aktuálne prieskumy →</p>
            </Link>
            <Link
              href="/tipovanie"
              className="block p-4 border border-divider hover:bg-hover transition-colors"
            >
              <p className="font-semibold text-sm mb-1">Tipni si výsledok volieb</p>
              <p className="text-xs text-text/50">Ako dopadnú voľby podľa teba? →</p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];
  const progress = ((currentQ + (answers[currentQ] !== undefined ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeading
        title="Koho voliť?"
        subtitle="20 otázok · 2 minúty · Váhy strán sú redakčné odhady"
      />

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-text/40 mb-1">
          <span>Otázka {currentQ + 1} z {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-hover overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Postup v dotazníku">
          <div
            className="h-full bg-ink transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="border border-divider bg-surface p-6 mb-4">
        <h3 className="font-serif text-xl font-bold text-ink mb-6">{question.text}</h3>
        <div className="space-y-2">
          {question.answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              aria-label={`Odpoveď: ${answer.label}`}
              className="w-full text-left p-4 border border-divider text-sm font-medium text-text hover:bg-hover hover:border-ink transition-colors"
            >
              {answer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {currentQ > 0 && (
        <button
          onClick={() => setCurrentQ(currentQ - 1)}
          className="text-sm text-text/50 hover:text-ink transition-colors"
        >
          ← Predchádzajúca otázka
        </button>
      )}
    </div>
  );
}
