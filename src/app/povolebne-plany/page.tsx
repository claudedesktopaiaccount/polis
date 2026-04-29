import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { getAllPartiesWithPromises } from "@/lib/db/party-promises";
import PovolebnePlanyClient from "./PovolebnePlanyClient";

export const revalidate = 86400; // 24h

export const metadata: Metadata = {
  title: "Povolebné plány",
  description: "Prehľad sľubov a programových bodov slovenských politických strán pred parlamentnými voľbami.",
  openGraph: {
    title: "Povolebné plány | VolímTo",
    description: "Čo sľubujú politické strany pred voľbami.",
  },
};

export default async function PovolebnePlanyPage() {
  const db = getDb();
  const partiesWithPromises = await getAllPartiesWithPromises(db).catch(() => []);
  return <PovolebnePlanyClient partiesData={partiesWithPromises} />;
}
