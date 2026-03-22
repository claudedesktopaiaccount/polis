"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const NAV_ITEMS = [
  { href: "/", label: "Domov" },
  { href: "/prieskumy", label: "Prieskumy" },
  { href: "/predikcia", label: "Predikcia" },
  { href: "/povolebne-plany", label: "Povolebné plány" },
  { href: "/koalicny-simulator", label: "Koaličný simulátor" },
  { href: "/tipovanie", label: "Tipovanie" },
  { href: "/volebny-kalkulator", label: "Koho voliť?" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b-3 border-ink" style={{ viewTransitionName: "navbar" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[60px]">
        <Link href="/" className="group text-xl font-bold text-ink tracking-tight font-serif relative">
          <span className="transition-opacity duration-300 group-hover:opacity-0">Polis</span>
          <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">πόλις</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-text hover:text-ink hover:bg-hover transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-text hover:text-ink hover:bg-hover transition-colors"
            aria-label={theme === "light" ? "Prepnúť na tmavý režim" : "Prepnúť na svetlý režim"}
          >
            {theme === "light" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 hover:bg-hover transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="lg:hidden bg-surface border-t border-divider px-4 pb-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-3 text-base font-medium text-text hover:text-ink hover:bg-hover transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
