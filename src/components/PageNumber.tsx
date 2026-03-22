"use client";

import { usePathname } from "next/navigation";

const PAGE_MAP: Record<string, number> = {
  "/": 1,
  "/prieskumy": 2,
  "/predikcia": 3,
  "/povolebne-plany": 4,
  "/koalicny-simulator": 5,
  "/tipovanie": 6,
  "/volebny-kalkulator": 7,
  "/podmienky": 8,
  "/sukromie": 9,
};

export default function PageNumber() {
  const pathname = usePathname();
  const pageNumber = PAGE_MAP[pathname];

  if (!pageNumber) return null;

  return (
    <div className="page-folio" style={{ viewTransitionName: "page-folio" }}>
      — {pageNumber} —
    </div>
  );
}
