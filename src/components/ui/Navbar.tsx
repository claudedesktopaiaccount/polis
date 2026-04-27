"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { ELECTION_DATE_ESTIMATE } from "@/lib/site-config";

const NAV_LINKS = [
  { href: "/", label: "Domov" },
  { href: "/prieskumy", label: "Prieskumy" },
  { href: "/predikcia", label: "Predikcia" },
  { href: "/povolebne-plany", label: "Povolebné plány" },
  { href: "/koalicny-simulator", label: "Koaličný simulátor" },
  { href: "/tipovanie", label: "Tipovanie" },
  { href: "/volebny-kalkulator", label: "Koho voliť?" },
];


function daysUntilElection(): number {
  return Math.ceil((ELECTION_DATE_ESTIMATE.getTime() - Date.now()) / 86_400_000);
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<{ total: number; rank: number } | null>(null);

  useEffect(() => {
    const raw = document.cookie.split("; ").find((c) => c.startsWith("polis_score="));
    if (!raw) return;
    try {
      setScore(JSON.parse(decodeURIComponent(raw.split("=")[1])));
    } catch {
      // invalid cookie — leave null
    }
  }, []);
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface border-b-3 border-ink" style={{viewTransitionName:"navbar"}}>
        <div className="relative max-w-content mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[52px]">
          <Link href="/" className="logo-swap font-serif font-bold text-xl text-ink tracking-tight">
            <span className="logo-en">Polis</span>
            <span aria-hidden className="logo-gr whitespace-nowrap pointer-events-none">πόλις</span>
          </Link>

          {/* Election countdown badge — desktop only, hidden after election */}
          {daysUntilElection() > 0 && (
            <div
              suppressHydrationWarning
              aria-label={`~${daysUntilElection()} dní do volieb`}
              className="hidden lg:flex absolute left-1/2 -translate-x-1/2 flex-col items-center justify-center bg-ink text-surface w-[60px] h-[44px]"
            >
              <span className="text-[20px] font-bold leading-none">~{daysUntilElection()}</span>
              <span className="text-[7px] font-medium tracking-[0.12em] uppercase opacity-60 mt-[2px]">DNÍ</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Desktop nav — flat */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-ink font-semibold"
                      : "text-text hover:text-ink hover:bg-hover"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
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
                    className="text-[14px] text-ink border border-border-strong px-3 py-[5px] hover:bg-hover transition-colors"
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

        {/* Mobile drawer */}
        {open && (
          <nav className="lg:hidden bg-card border-t border-border px-4 pb-4">
            {NAV_LINKS.map((item) => (
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
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around py-2 lg:hidden z-50">
        {NAV_LINKS.slice(0, 4).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center text-[11px] py-1 ${
              pathname === item.href ? "text-ink font-semibold" : "text-muted"
            }`}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
