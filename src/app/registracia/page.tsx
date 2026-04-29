import type { Metadata } from "next";
import RegistraciaClient from "./RegistraciaClient";

export const metadata: Metadata = {
  title: "Registrácia — VolímTo",
  description: "Vytvorte si účet na VolímTo a sledujte slovenské volebné prieskumy.",
};

export default function RegistraciaPage() {
  return <RegistraciaClient />;
}
