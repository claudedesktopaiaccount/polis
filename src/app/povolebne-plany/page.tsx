import type { Metadata } from "next";
import PovolebnePlanyClient from "./PovolebnePlanyClient";

export const metadata: Metadata = {
  title: "Povolebné plány | Progressive Tracker",
  description: "Prehľad sľubov a programových bodov slovenských politických strán pred parlamentnými voľbami.",
  openGraph: {
    title: "Povolebné plány | Progressive Tracker",
    description: "Čo sľubujú politické strany pred voľbami.",
  },
};

export default function PovolebnePlanyPage() {
  return <PovolebnePlanyClient />;
}
