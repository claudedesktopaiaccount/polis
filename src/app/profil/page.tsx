import type { Metadata } from "next";
import ProfilClient from "./ProfilClient";

export const metadata: Metadata = {
  title: "Profil — VolímTo",
  description: "Váš profil na VolímTo.",
};

export default function ProfilPage() {
  return <ProfilClient />;
}
