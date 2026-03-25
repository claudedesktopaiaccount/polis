import type { Metadata } from "next";
import PrihlasenieClient from "./PrihlasenieClient";

export const metadata: Metadata = {
  title: "Prihlásenie — Polis",
  description: "Prihláste sa do svojho účtu na Polis.",
};

export default function PrihlaseniePage() {
  return <PrihlasenieClient />;
}
