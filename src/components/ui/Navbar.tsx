"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { ELECTION_DATE_ESTIMATE } from "@/lib/site-config";

type NavLink = { href: string; label: string };

const PRIMARY_LINKS: NavLink[] = [
  { href: "/prieskumy", label: "Prieskumy" },
  { href: "/predikcia", label: "Predikcia" },
  { href: "/poslanci", label: "Poslanci" },
  { href: "/koalicny-simulator", label: "Koaličný simulátor" },
  { href: "/tipovanie", label: "Tipovanie" },
];

const OVERFLOW_LINKS: NavLink[] = [
  { href: "/povolebne-plany", label: "Povolebné plány" },
  { href: "/volebny-kalkulator", label: "Koho voliť?" },
];

const ALL_LINKS: NavLink[] = [
  { href: "/", label: "Domov" },
  ...PRIMARY_LINKS,
  ...OVERFLOW_LINKS,
];

function daysUntilElection(): number {
  return Math.ceil((ELECTION_DATE_ESTIMATE.getTime() - Date.now()) / 86_400_000);
}

function SunIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  );
}

function MoonIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  );
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [score, setScore] = useState<{ total: number; rank: number } | null>(null);

  const overflowRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    const raw = document.cookie.split("; ").find((c) => c.startsWith("volimto_score="));
    if (!raw) return;
    try {
      setScore(JSON.parse(decodeURIComponent(raw.split("=")[1])));
    } catch {
      // invalid cookie — leave null
    }
  }, []);

  useEffect(() => {
    if (!overflowOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOverflowOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [overflowOpen]);

  useEffect(() => {
    setDrawerOpen(false);
    setOverflowOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await logout();
    setOverflowOpen(false);
    setDrawerOpen(false);
    router.push("/");
  }

  const days = daysUntilElection();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className="sticky top-0 z-50 bg-surface border-b-3 border-ink"
      style={{ viewTransitionName: "navbar" }}
    >
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 h-[52px]">
        {/* Logo + countdown */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="logo-swap font-serif font-bold text-xl text-ink tracking-tight"
            aria-label="VolímTo — domov"
          >
            <span className="logo-en">VolímTo</span>
            <span aria-hidden className="logo-gr whitespace-nowrap pointer-events-none">πόλις</span>
          </Link>
          {days > 0 && (
            <div
              suppressHydrationWarning
              aria-label={`~${days} dní do volieb`}
              className="hidden sm:flex flex-col items-center justify-center bg-ink text-surface w-[52px] h-[36px] pointer-events-none"
            >
              <span className="text-[14px] font-bold leading-none">~{days}</span>
              <span className="text-[7px] font-medium tracking-[0.12em] uppercase opacity-60 mt-[2px]">DNÍ</span>
            </div>
          )}
        </div>

        {/* Primary links — desktop */}
        <nav className="hidden lg:flex items-center flex-1 justify-center gap-0">
          {PRIMARY_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors ${
                isActive(item.href)
                  ? "text-ink font-semibold"
                  : "text-text hover:text-ink hover:bg-hover"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-1 shrink-0 ml-auto lg:ml-0">
          {/* Theme toggle — visible on desktop */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Prepnúť na tmavý režim" : "Prepnúť na svetlý režim"}
            className="hidden lg:inline-flex p-2 text-ink hover:bg-hover transition-colors"
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* Auth — desktop */}
          {!isLoading && (
            <div className="hidden lg:flex items-center">
              {user ? (
                <Link
                  href="/profil"
                  className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-text hover:text-ink hover:bg-hover transition-colors"
                >
                  <span>{user.displayName}</span>
                  {score && (
                    <span className="text-[11px] font-mono opacity-60">
                      {score.total}b · #{score.rank}
                    </span>
                  )}
                </Link>
              ) : (
                <Link
                  href="/prihlasenie"
                  className="px-3 py-2 text-[13px] font-medium text-text hover:text-ink hover:bg-hover transition-colors"
                >
                  Prihlásiť sa
                </Link>
              )}
            </div>
          )}

          {/* Overflow menu (Povolebné plány, Koho voliť?, logout) — desktop */}
          <div ref={overflowRef} className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setOverflowOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={overflowOpen}
              aria-label="Ďalšie možnosti"
              className="p-2 text-ink hover:bg-hover transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="4" cy="10" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="16" cy="10" r="1.5" />
              </svg>
            </button>

            {overflowOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 w-56 bg-card border border-divider z-50"
              >
                {OVERFLOW_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setOverflowOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-ink font-semibold bg-hover"
                        : "text-text hover:text-ink hover:bg-hover"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {user && (
                  <>
                    <div className="border-t border-divider" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-text hover:text-ink hover:bg-hover transition-colors"
                    >
                      Odhlásiť sa
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? "Zavrieť menu" : "Otvoriť menu"}
            aria-expanded={drawerOpen}
            className="lg:hidden p-2 text-ink hover:bg-hover transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {drawerOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <nav className="lg:hidden bg-card border-t border-divider">
          {ALL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`block px-4 py-3 text-base font-medium border-b border-divider transition-colors ${
                isActive(item.href)
                  ? "text-ink font-semibold bg-hover"
                  : "text-text hover:text-ink hover:bg-hover"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link
                    href="/profil"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-base font-medium text-text hover:text-ink hover:bg-hover border-b border-divider transition-colors"
                  >
                    <span>{user.displayName}</span>
                    {score && (
                      <span className="text-[12px] font-mono opacity-60">
                        {score.total}b · #{score.rank}
                      </span>
                    )}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-text hover:text-ink hover:bg-hover border-b border-divider transition-colors"
                  >
                    Odhlásiť sa
                  </button>
                </>
              ) : (
                <Link
                  href="/prihlasenie"
                  onClick={() => setDrawerOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-text hover:text-ink hover:bg-hover border-b border-divider transition-colors"
                >
                  Prihlásiť sa
                </Link>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => { toggleTheme(); setDrawerOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-text hover:text-ink hover:bg-hover transition-colors"
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
            <span>{theme === "light" ? "Tmavý režim" : "Svetlý režim"}</span>
          </button>
        </nav>
      )}
    </header>
  );
}
