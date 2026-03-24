import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getAllPartiesWithPromises } from "@/lib/db/party-promises";
import PovolebnePlanyClient from "./PovolebnePlanyClient";

export const revalidate = 86400; // 24h

export const metadata: Metadata = {
  title: "Povolebné plány",
  description: "Prehľad sľubov a programových bodov slovenských politických strán pred parlamentnými voľbami.",
  openGraph: {
    title: "Povolebné plány | Polis",
    description: "Čo sľubujú politické strany pred voľbami.",
  },
};

export default async function PovolebnePlanyPage() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const partiesWithPromises = await getAllPartiesWithPromises(db).catch(() => []);
  return <PovolebnePlanyClient partiesData={partiesWithPromises} />;
}
