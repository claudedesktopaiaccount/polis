import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import VolebnyKalkulatorClient from "./VolebnyKalkulatorClient";
import { getKalkulatorWeights } from "@/lib/db/kalkulator";
import { QUESTIONS } from "@/lib/kalkulator/questions";
import type { Question } from "@/lib/kalkulator/questions";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Koho voliť?",
  description: "Volebný kalkulátor — odpovedzte na 20 otázok a zistite, ktorá slovenská politická strana vám je najbližšia.",
  openGraph: {
    title: "Koho voliť? | Polis",
    description: "Volebný kalkulátor — zistite, ktorá strana vám je najbližšia.",
  },
};

export default async function VolebnyKalkulatorPage() {
  let questions: Question[] = QUESTIONS;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = drizzle(env.DB);
    const rows = await getKalkulatorWeights(db);

    if (rows.length > 0) {
      questions = QUESTIONS.map((q) => ({
        ...q,
        answers: q.answers.map((answer, answerIndex) => {
          const weights: Record<string, number> = { ...answer.weights };
          for (const row of rows) {
            if (row.questionId === q.id && row.answerIndex === answerIndex) {
              weights[row.partyId] = row.weight;
            }
          }
          return { ...answer, weights };
        }),
      }));
    }
  } catch (err) {
    console.error("[volebny-kalkulator] DB unavailable, using static fallback:", err);
  }

  return <VolebnyKalkulatorClient questions={questions} />;
}
