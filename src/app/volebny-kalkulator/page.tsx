import type { Metadata } from "next";
import VolebnyKalkulatorClient from "./VolebnyKalkulatorClient";

export const metadata: Metadata = {
  title: "Koho voliť?",
  description: "Volebný kalkulátor — odpovedzte na 20 otázok a zistite, ktorá slovenská politická strana vám je najbližšia.",
  openGraph: {
    title: "Koho voliť? | Polis",
    description: "Volebný kalkulátor — zistite, ktorá strana vám je najbližšia.",
  },
};

export default function VolebnyKalkulatorPage() {
  return <VolebnyKalkulatorClient />;
}
