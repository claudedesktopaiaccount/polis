import type { Metadata } from "next";
import RebricekClient from "./RebricekClient";

export const metadata: Metadata = {
  title: "Rebríček predpovedí",
  description:
    "Rebríček najlepších predpovedí slovenských parlamentných volieb na Polis.",
};

export default function RebricekPage() {
  return <RebricekClient />;
}
