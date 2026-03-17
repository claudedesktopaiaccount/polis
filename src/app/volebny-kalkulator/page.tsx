"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { PARTIES, PARTY_LIST } from "@/lib/parties";

interface Question {
  id: number;
  text: string;
  // Each answer maps to a weight vector: partyId → weight (-2 to 2)
  answers: {
    label: string;
    weights: Record<string, number>;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Aký by mal byť postoj Slovenska k Európskej únii?",
    answers: [
      { label: "Silnejšia integrácia", weights: { ps: 2, demokrati: 1, sas: 0.5, kdh: 0, "hlas-sd": -1, "smer-sd": -2, sns: -2, republika: -2 } },
      { label: "Zachovať súčasný stav", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 1, "hlas-sd": 1, "smer-sd": 0, sns: -1, republika: -1 } },
      { label: "Menej právomocí pre EÚ", weights: { ps: -2, demokrati: -1, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": 1, sns: 2, republika: 2 } },
    ],
  },
  {
    id: 2,
    text: "Ako by sa malo Slovensko postaviť k vojne na Ukrajine?",
    answers: [
      { label: "Aktívna podpora Ukrajiny", weights: { ps: 2, demokrati: 2, sas: 1, kdh: 1, "hlas-sd": -1, "smer-sd": -2, sns: -2, republika: -2 } },
      { label: "Humanitárna pomoc, nie vojenskú", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 1, "hlas-sd": 1, "smer-sd": 0, sns: 0, republika: -1 } },
      { label: "Neutralita a mierové rokovania", weights: { ps: -2, demokrati: -1, sas: -1, kdh: 0, "hlas-sd": 1, "smer-sd": 2, sns: 1, republika: 1 } },
    ],
  },
  {
    id: 3,
    text: "Aká by mala byť daňová politika?",
    answers: [
      { label: "Nižšie dane, menší štát", weights: { ps: 0, demokrati: 1, sas: 2, kdh: 0.5, "hlas-sd": -1, "smer-sd": -1, sns: 0, republika: 0 } },
      { label: "Progresívne zdanenie", weights: { ps: 2, demokrati: 0, sas: -2, kdh: 0, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: -1 } },
      { label: "Zachovať súčasný systém", weights: { ps: 0, demokrati: 0, sas: -1, kdh: 1, "hlas-sd": 0, "smer-sd": 0, sns: 1, republika: 0 } },
    ],
  },
  {
    id: 4,
    text: "Ako pristupovať k téme migrácie?",
    answers: [
      { label: "Otvorenosť a integrácia", weights: { ps: 2, demokrati: 1, sas: 0, kdh: -1, "hlas-sd": -1, "smer-sd": -2, sns: -2, republika: -2 } },
      { label: "Regulovaná migrácia", weights: { ps: 0, demokrati: 0, sas: 1, kdh: 1, "hlas-sd": 1, "smer-sd": 0, sns: 0, republika: -1 } },
      { label: "Prísna ochrana hraníc", weights: { ps: -2, demokrati: -1, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": 1, sns: 2, republika: 2 } },
    ],
  },
  {
    id: 5,
    text: "Čo je dôležitejšie v školstve?",
    answers: [
      { label: "Modernizácia a digitalizácia", weights: { ps: 2, demokrati: 1, sas: 1, kdh: 0, "hlas-sd": 0.5, "smer-sd": 0, sns: -1, republika: 0 } },
      { label: "Vyššie platy učiteľov", weights: { ps: 1, demokrati: 0, sas: 0, kdh: 2, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: 0 } },
      { label: "Tradičné hodnoty v učebných osnovách", weights: { ps: -2, demokrati: -1, sas: -1, kdh: 2, "hlas-sd": 0, "smer-sd": 1, sns: 2, republika: 1 } },
    ],
  },
  {
    id: 6,
    text: "Aký je váš postoj k právam LGBTQ+ komunity?",
    answers: [
      { label: "Plná rovnoprávnosť vrátane manželstiev", weights: { ps: 2, demokrati: 1, sas: 1, kdh: -2, "hlas-sd": -1, "smer-sd": -1, sns: -2, republika: -2 } },
      { label: "Registrované partnerstvá", weights: { ps: 1, demokrati: 1, sas: 1, kdh: -1, "hlas-sd": 0, "smer-sd": 0, sns: -1, republika: -1 } },
      { label: "Zachovať tradičnú definíciu rodiny", weights: { ps: -2, demokrati: -1, sas: -1, kdh: 2, "hlas-sd": 1, "smer-sd": 1, sns: 2, republika: 2 } },
    ],
  },
  {
    id: 7,
    text: "Ako riešiť zdravotníctvo?",
    answers: [
      { label: "Väčší podiel súkromného sektora", weights: { ps: 0, demokrati: 1, sas: 2, kdh: 0, "hlas-sd": -1, "smer-sd": -1, sns: 0, republika: 0 } },
      { label: "Posilnenie štátnych nemocníc", weights: { ps: 1, demokrati: 0, sas: -1, kdh: 1, "hlas-sd": 2, "smer-sd": 1, sns: 1, republika: 0 } },
      { label: "Kombinácia oboch prístupov", weights: { ps: 1, demokrati: 0.5, sas: 0, kdh: 0.5, "hlas-sd": 0, "smer-sd": 0, sns: 0, republika: 0 } },
    ],
  },
  {
    id: 8,
    text: "Aký by mal byť vzťah štátu a cirkvi?",
    answers: [
      { label: "Striktná sekularizácia", weights: { ps: 2, demokrati: 0.5, sas: 1, kdh: -2, "hlas-sd": -1, "smer-sd": 0, sns: -1, republika: -1 } },
      { label: "Zachovať súčasný stav", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 1, "hlas-sd": 1, "smer-sd": 0.5, sns: 0.5, republika: 0 } },
      { label: "Posilniť úlohu kresťanských hodnôt", weights: { ps: -2, demokrati: -1, sas: -1, kdh: 2, "hlas-sd": 0, "smer-sd": 0.5, sns: 1, republika: 1 } },
    ],
  },
  {
    id: 9,
    text: "Ako pristupovať k životnému prostrediu?",
    answers: [
      { label: "Ambiciózne klimatické ciele", weights: { ps: 2, demokrati: 1, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": -1, sns: -2, republika: -1 } },
      { label: "Rovnováha medzi ekológiou a ekonomikou", weights: { ps: 0, demokrati: 0, sas: 1, kdh: 1, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: 0 } },
      { label: "Ekonomika je priorita", weights: { ps: -2, demokrati: -1, sas: 1, kdh: 0, "hlas-sd": 0, "smer-sd": 1, sns: 1, republika: 1 } },
    ],
  },
  {
    id: 10,
    text: "Aký je váš postoj k NATO?",
    answers: [
      { label: "Aktívne členstvo a plnenie záväzkov", weights: { ps: 2, demokrati: 2, sas: 1, kdh: 1, "hlas-sd": 0, "smer-sd": -1, sns: -2, republika: -2 } },
      { label: "Členstvo áno, ale bez vojenských misií", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 0, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: -1 } },
      { label: "Prehodnotiť členstvo", weights: { ps: -2, demokrati: -2, sas: -1, kdh: -1, "hlas-sd": -1, "smer-sd": 0, sns: 1, republika: 2 } },
    ],
  },
  {
    id: 11,
    text: "Čo je najdôležitejšie pre ekonomický rast?",
    answers: [
      { label: "Inovácie a digitálna ekonomika", weights: { ps: 2, demokrati: 1, sas: 1, kdh: 0, "hlas-sd": 0, "smer-sd": 0, sns: -1, republika: 0 } },
      { label: "Priemysel a výroba", weights: { ps: -1, demokrati: 0, sas: 0, kdh: 0.5, "hlas-sd": 1, "smer-sd": 2, sns: 1, republika: 1 } },
      { label: "Malé a stredné podnikanie", weights: { ps: 0, demokrati: 1, sas: 2, kdh: 1, "hlas-sd": 0, "smer-sd": 0, sns: 0, republika: 0 } },
    ],
  },
  {
    id: 12,
    text: "Ako by sa mal riešiť problém korupcie?",
    answers: [
      { label: "Nezávislé inštitúcie a transparentnosť", weights: { ps: 2, demokrati: 2, sas: 1, kdh: 1, "hlas-sd": 0, "smer-sd": -2, sns: -1, republika: 0 } },
      { label: "Prísnejšie tresty", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 1, "hlas-sd": 1, "smer-sd": 0, sns: 1, republika: 2 } },
      { label: "Reforma justície zhora", weights: { ps: -1, demokrati: -1, sas: 0, kdh: 0, "hlas-sd": 1, "smer-sd": 2, sns: 0, republika: 0 } },
    ],
  },
  {
    id: 13,
    text: "Aký by mal byť dôchodkový systém?",
    answers: [
      { label: "Posilnenie druhého piliera", weights: { ps: 1, demokrati: 1, sas: 2, kdh: 0, "hlas-sd": -1, "smer-sd": -1, sns: 0, republika: 0 } },
      { label: "Vyššie štátne dôchodky", weights: { ps: 0, demokrati: -1, sas: -2, kdh: 1, "hlas-sd": 2, "smer-sd": 2, sns: 1, republika: 1 } },
      { label: "Flexibilný vek odchodu do dôchodku", weights: { ps: 1, demokrati: 0, sas: 1, kdh: 0, "hlas-sd": 0, "smer-sd": 0, sns: 0, republika: 0 } },
    ],
  },
  {
    id: 14,
    text: "Ako pristupovať k médiám a slobode tlače?",
    answers: [
      { label: "Posilniť nezávislosť médií", weights: { ps: 2, demokrati: 2, sas: 1, kdh: 0.5, "hlas-sd": 0, "smer-sd": -2, sns: -1, republika: -1 } },
      { label: "Regulácia dezinformácií", weights: { ps: 1, demokrati: 0, sas: -1, kdh: 0, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: -1 } },
      { label: "Menej regulácie", weights: { ps: -1, demokrati: 0, sas: 2, kdh: 0, "hlas-sd": -1, "smer-sd": 0, sns: 1, republika: 2 } },
    ],
  },
  {
    id: 15,
    text: "Aká by mala byť bytová politika?",
    answers: [
      { label: "Štátna výstavba nájomných bytov", weights: { ps: 1, demokrati: 0, sas: -1, kdh: 0.5, "hlas-sd": 2, "smer-sd": 1, sns: 0.5, republika: 0 } },
      { label: "Deregulácia a podpora súkromnej výstavby", weights: { ps: 0, demokrati: 1, sas: 2, kdh: 0, "hlas-sd": -1, "smer-sd": 0, sns: 0, republika: 0 } },
      { label: "Zvýhodné hypotéky pre mladých", weights: { ps: 1, demokrati: 0, sas: 0, kdh: 1, "hlas-sd": 1, "smer-sd": 1, sns: 1, republika: 1 } },
    ],
  },
  {
    id: 16,
    text: "Ako riešiť rómsku otázku?",
    answers: [
      { label: "Inkluzívne programy a vzdelávanie", weights: { ps: 2, demokrati: 1, sas: 0, kdh: 1, "hlas-sd": 0, "smer-sd": -1, sns: -2, republika: -2 } },
      { label: "Pracovné príležitosti a infraštruktúra", weights: { ps: 0, demokrati: 0, sas: 1, kdh: 0, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: 0 } },
      { label: "Prísnejší prístup a podmienenie dávok", weights: { ps: -2, demokrati: -1, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": 1, sns: 2, republika: 2 } },
    ],
  },
  {
    id: 17,
    text: "Ako by mal vyzerať vzťah s Ruskom?",
    answers: [
      { label: "Tvrdé sankcie a izolácia", weights: { ps: 2, demokrati: 2, sas: 1, kdh: 1, "hlas-sd": -1, "smer-sd": -2, sns: -2, republika: -1 } },
      { label: "Pragmatický prístup", weights: { ps: -1, demokrati: 0, sas: 0, kdh: 0, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: 0 } },
      { label: "Obnovenie dialógu", weights: { ps: -2, demokrati: -2, sas: -1, kdh: -1, "hlas-sd": 1, "smer-sd": 2, sns: 2, republika: 1 } },
    ],
  },
  {
    id: 18,
    text: "Čo s verejnoprávnymi médiami (RTVS)?",
    answers: [
      { label: "Posilniť nezávislosť", weights: { ps: 2, demokrati: 1, sas: 0, kdh: 0, "hlas-sd": -1, "smer-sd": -2, sns: -1, republika: 0 } },
      { label: "Reformovať na moderné médium", weights: { ps: 1, demokrati: 1, sas: 1, kdh: 0, "hlas-sd": 0, "smer-sd": 0, sns: 0, republika: 0 } },
      { label: "Zrušiť koncesionárske poplatky", weights: { ps: -1, demokrati: 0, sas: 2, kdh: 0, "hlas-sd": 0, "smer-sd": 0, sns: 1, republika: 1 } },
    ],
  },
  {
    id: 19,
    text: "Ako pristupovať k maďarskej menšine?",
    answers: [
      { label: "Plná podpora menšinových práv", weights: { ps: 1, demokrati: 0.5, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": -1, sns: -2, republika: -1, aliancia: 2 } },
      { label: "Zachovať súčasný stav", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": 0, sns: 0, republika: 0, aliancia: 0 } },
      { label: "Jeden národ, jeden jazyk", weights: { ps: -1, demokrati: -1, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": 1, sns: 2, republika: 1, aliancia: -2 } },
    ],
  },
  {
    id: 20,
    text: "Aká je vaša priorita pre ďalšie volebné obdobie?",
    answers: [
      { label: "Právny štát a demokracia", weights: { ps: 2, demokrati: 2, sas: 1, kdh: 1, "hlas-sd": 0, "smer-sd": -1, sns: -1, republika: -1 } },
      { label: "Ekonomická stabilita a sociálne istoty", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 0, "hlas-sd": 2, "smer-sd": 2, sns: 1, republika: 0, slovensko: 1 } },
      { label: "Národná suverenita a tradičné hodnoty", weights: { ps: -2, demokrati: -1, sas: 0, kdh: 1, "hlas-sd": 0, "smer-sd": 1, sns: 2, republika: 2 } },
    ],
  },
];

/** Cosine similarity between two vectors */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export default function VolebnyKalkulatorPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const partyIds = PARTY_LIST.map((p) => p.id);

  function selectAnswer(answerIdx: number) {
    setAnswers((prev) => ({ ...prev, [currentQ]: answerIdx }));
    if (currentQ < QUESTIONS.length - 1) {
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
        const q = QUESTIONS[Number(qIdx)];
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
      const maxPossible = QUESTIONS.length * 2; // max weight per question is 2
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
        <div
          className="rounded-2xl p-8 text-white text-center mb-8"
          style={{ backgroundColor: top.party?.color ?? "#7c3aed" }}
        >
          <p className="text-6xl font-extrabold mb-2">{top.score}%</p>
          <h2 className="text-2xl font-bold">{top.party?.name}</h2>
          <p className="text-white/80 mt-1">{top.party?.leader}</p>
        </div>

        {/* All results */}
        <div className="space-y-3">
          {results.map((r) => (
            <div key={r.partyId} className="flex items-center gap-3">
              <span className="w-16 text-sm font-medium text-neutral-700">{r.party?.abbreviation}</span>
              <div className="flex-1 h-8 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                  style={{ width: `${r.score}%`, backgroundColor: r.party?.color }}
                >
                  {r.score > 15 && (
                    <span className="text-xs font-bold text-white">{r.score}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setCurrentQ(0);
            setAnswers({});
            setShowResults(false);
          }}
          className="mt-8 w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          Skúsiť znova
        </button>
      </div>
    );
  }

  const question = QUESTIONS[currentQ];
  const progress = ((currentQ + (answers[currentQ] !== undefined ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeading
        title="Koho voliť?"
        subtitle="Odpovedzte na 20 otázok a zistite, ktorá strana vám je najbližšia"
      />

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-neutral-400 mb-1">
          <span>Otázka {currentQ + 1} z {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mb-4">
        <h3 className="text-xl font-semibold text-neutral-800 mb-6">{question.text}</h3>
        <div className="space-y-3">
          {question.answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className="w-full text-left p-4 rounded-xl border-2 border-neutral-200 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 text-base font-medium text-neutral-700"
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
          className="text-sm text-neutral-500 hover:text-primary-600 transition-colors"
        >
          ← Predchádzajúca otázka
        </button>
      )}
    </div>
  );
}
