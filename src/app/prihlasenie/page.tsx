import type { Metadata } from "next";
import PrihlasenieClient from "./PrihlasenieClient";

export const metadata: Metadata = {
  title: "Prihlásenie — VolímTo",
  description: "Prihláste sa do svojho účtu na VolímTo.",
};

export default function PrihlaseniePage() {
  return <PrihlasenieClient />;
}
