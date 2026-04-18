"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";

const PRIMARY_NAV = [
  { href: "/", label: "Prehľad" },
  { href: "/prieskumy", label: "Prieskumy" },
  { href: "/predikcia", label: "Predikcia" },
  { href: "/tipovanie", label: "Tipovanie" },
];

const SECONDARY_NAV = [
  { href: "/koalicny-simulator", label: "Koaličný simulátor" },
  { href: "/volebny-kalkulator", label: "Koho voliť?" },
  { href: "/povolebne-plany", label: "Povolebné plány" },
];


export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [score] = useState<{ total: number; rank: number } | null>(() => {
    if (typeof document === "undefined") return null;
    const raw = document.cookie.split("; ").find((c) => c.startsWith("polis_score="));
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(raw.split("=")[1]));
    } catch {
      return null;
    }
  });
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "Viac" dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <>
      <header className="sticky top-0 z-40 h-[52px] bg-white border-b border-[#e8e3db] flex items-center">
        <div className="max-w-[1100px] mx-auto px-6 w-full flex items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-dm-serif)] text-[20px] text-[#1a1a1a] leading-none tracking-normal">
            Polis
          </Link>

          <div className="flex items-center gap-2">
            {/* Desktop primary nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors ${
                    pathname === item.href
                      ? "text-[14px] text-[#1a1a1a] font-semibold px-3 py-2"
                      : "text-[14px] text-[#444444] hover:text-[#1a1a1a] font-medium transition-colors px-3 py-2"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* "Viac" dropdown for secondary nav */}
              <div
                className="relative"
                ref={moreRef}
                onMouseLeave={() => setMoreOpen(false)}
              >
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="flex items-center gap-1 text-[14px] text-[#444444] hover:text-[#1a1a1a] font-medium px-3 py-2 transition-colors"
                >
                  Viac
                  <svg className={`w-3 h-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {moreOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-[#e8e3db] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] min-w-[200px] py-1 z-50">
                    {SECONDARY_NAV.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`block px-4 py-[9px] text-[14px] transition-colors hover:bg-[#f8f5f0] ${
                          pathname === item.href ? "text-[#1a1a1a] font-medium" : "text-[#333333]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Score badge */}
            {score && (
              <Link
                href="/tipovanie"
                className="hidden lg:flex items-center gap-1 text-xs font-mono border border-divider px-2 py-1 hover:bg-hover transition-colors"
              >
                <span className="font-bold">{score.total}</span>
                <span className="opacity-50">· #{score.rank}</span>
              </Link>
            )}

            {/* Auth controls */}
            {!isLoading && (
              <div className="hidden lg:flex items-center gap-1">
                {user ? (
                  <>
                    <Link
                      href="/profil"
                      className="px-3 py-2 text-sm font-medium text-text hover:text-ink hover:bg-hover transition-colors"
                    >
                      {user.displayName}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 text-sm font-medium text-text hover:text-ink hover:bg-hover transition-colors"
                    >
                      Odhlásiť sa
                    </button>
                  </>
                ) : (
                  <Link
                    href="/prihlasenie"
                    className="text-[14px] text-[#1a1a1a] border border-[#d0cbc3] rounded-[6px] px-3 py-[5px] hover:bg-[#f0ede6] transition-colors"
                  >
                    Prihlásiť sa
                  </Link>
                )}
              </div>
            )}

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

            {/* Mobile hamburger — secondary nav only */}
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

        {/* Mobile drawer — secondary nav + auth */}
        {open && (
          <nav className="lg:hidden bg-surface border-t border-divider px-4 pb-4">
            {SECONDARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-3 text-base font-medium transition-colors ${
                  pathname === item.href
                    ? "text-ink font-semibold"
                    : "text-text hover:text-ink hover:bg-hover"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-divider mt-2 pt-2">
              {!isLoading && (
                user ? (
                  <>
                    <Link
                      href="/profil"
                      onClick={() => setOpen(false)}
                      className="block px-3 py-3 text-base font-medium text-text hover:text-ink hover:bg-hover transition-colors"
                    >
                      {user.displayName}
                    </Link>
                    <button
                      onClick={() => { setOpen(false); handleLogout(); }}
                      className="block w-full text-left px-3 py-3 text-base font-medium text-text hover:text-ink hover:bg-hover transition-colors"
                    >
                      Odhlásiť sa
                    </button>
                  </>
                ) : (
                  <Link
                    href="/prihlasenie"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 text-base font-medium text-text hover:text-ink hover:bg-hover transition-colors"
                  >
                    Prihlásiť sa
                  </Link>
                )
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e3db] flex justify-around py-2 lg:hidden z-50">
        {PRIMARY_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center text-[11px] py-1 ${
              pathname === item.href ? "text-[#1a1a1a] font-semibold" : "text-[#888888]"
            }`}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
