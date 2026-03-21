import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { crowdAggregates } from "@/lib/db/schema";
import { createSentryWithoutRequest, captureException } from "@/lib/sentry";
import TipovanieClient from "./TipovanieClient";

export const metadata: Metadata = {
  title: "Tipovanie | Progressive Tracker",
  description: "Tipnite si víťaza slovenských parlamentných volieb a porovnajte sa s ostatnými.",
  openGraph: {
    title: "Tipovanie | Progressive Tracker",
    description: "Tipnite si víťaza slovenských parlamentných volieb.",
  },
};

export const revalidate = 0; // always fresh crowd data

export default async function TipovaniePage() {
  let initialCrowd: { partyId: string; totalBets: number }[] = [];
  let initialTotalBets = 0;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDb(env.DB);
    const aggregates = await db.select().from(crowdAggregates);

    initialCrowd = aggregates.map((a) => ({
      partyId: a.partyId,
      totalBets: a.totalBets,
    }));
    initialTotalBets = aggregates.reduce((s, a) => s + a.totalBets, 0);
  } catch (e) {
    console.error("Failed to load crowd data:", e);
    try {
      const { env } = await getCloudflareContext({ async: true });
      captureException(createSentryWithoutRequest(env as { SENTRY_DSN?: string }), e);
    } catch { /* Sentry reporting best-effort */ }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeading
        title="Tipovanie"
        subtitle="Tipnite si, kto vyhrá voľby — porovnajte svoj tip s hlasom ľudu"
      />

      <TipovanieClient
        initialCrowd={initialCrowd}
        initialTotalBets={initialTotalBets}
      />
    </div>
  );
}
