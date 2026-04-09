import { createHash } from "node:crypto";
import { predictionNarrative } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Database } from "@/lib/db";
import type { AggregatedParty } from "@/lib/poll-aggregate";
import type { SimulationResult } from "./monte-carlo";

export async function getOrGenerateNarrative(
  db: Database,
  aggregated: AggregatedParty[],
  simulation: SimulationResult[],
  apiKey: string | undefined
): Promise<string | null> {
  const inputHash = createHash("sha256")
    .update(JSON.stringify(aggregated))
    .digest("hex");

  const cached = await db
    .select()
    .from(predictionNarrative)
    .where(eq(predictionNarrative.id, "current"))
    .limit(1);

  const cachedRow = cached[0] ?? null;

  if (cachedRow?.inputHash === inputHash) {
    return cachedRow.narrative;
  }

  if (!apiKey) {
    return cachedRow?.narrative ?? null;
  }

  try {
    const narrative = await callClaude(aggregated, simulation, apiKey);

    await db
      .insert(predictionNarrative)
      .values({ id: "current", inputHash, narrative, generatedAt: Date.now() })
      .onConflictDoUpdate({
        target: [predictionNarrative.id],
        set: { inputHash, narrative, generatedAt: Date.now() },
      });

    return narrative;
  } catch (error) {
    console.error("[narrative] Claude API error:", error);
    return cachedRow?.narrative ?? null;
  }
}

async function callClaude(
  aggregated: AggregatedParty[],
  simulation: SimulationResult[],
  apiKey: string
): Promise<string> {
  const data = aggregated
    .map((a) => {
      const sim = simulation.find((s) => s.partyId === a.partyId);
      return {
        strana: a.partyId,
        priemer: a.meanPct,
        pocetPrieskumov: a.pollCount,
        pravdepodobnostVyhry: sim?.winProbability ?? 0,
        pravdepodobnostParlamenta: sim?.parliamentProbability ?? 0,
        odhadovaneMandaty: sim ? Math.round(sim.meanSeats) : 0,
      };
    })
    .slice(0, 10); // cap payload size

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content:
            `Si analytik slovenských volieb. Na základe nasledujúcich dát napíš 2-3 vety` +
            ` neutrálnej, novinárskej analýzy aktuálneho stavu prieskumov a predikcie.` +
            ` Buď stručný a faktický. Nepoužívaj hodnotové súdy.\n\n` +
            `Dáta: ${JSON.stringify(data)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const json = await response.json() as { content: Array<{ type: string; text: string }> };
  const block = json.content[0];
  if (block?.type !== "text") throw new Error("Unexpected Claude response type");
  return block.text;
}
