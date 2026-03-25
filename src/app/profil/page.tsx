import type { Metadata } from "next";
import ProfilClient from "./ProfilClient";

export const metadata: Metadata = {
  title: "Profil — Polis",
  description: "Váš profil na Polis.",
};

export default function ProfilPage() {
  return <ProfilClient />;
}
