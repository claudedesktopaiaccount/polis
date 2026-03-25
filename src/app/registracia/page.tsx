import type { Metadata } from "next";
import RegistraciaClient from "./RegistraciaClient";

export const metadata: Metadata = {
  title: "Registrácia — Polis",
  description: "Vytvorte si účet na Polis a sledujte slovenské volebné prieskumy.",
};

export default function RegistraciaPage() {
  return <RegistraciaClient />;
}
