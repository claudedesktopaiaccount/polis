"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sk-SK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilClient() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/prihlasenie");
    }
  }, [isLoading, user, router]);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-start justify-center pt-16 px-4">
        <p className="text-sm text-text">Načítava sa…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[70vh] flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl font-semibold text-ink mb-8">Profil</h1>

        <div className="border border-divider divide-y divide-divider">
          <div className="px-4 py-3">
            <p className="text-xs text-text uppercase tracking-wide mb-0.5">Meno</p>
            <p className="text-sm font-medium text-ink">{user.displayName}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-text uppercase tracking-wide mb-0.5">E-mail</p>
            <p className="text-sm font-medium text-ink">{user.email}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-text uppercase tracking-wide mb-0.5">Člen od</p>
            <p className="text-sm font-medium text-ink">{formatDate(user.createdAt)}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full py-2.5 border border-ink text-ink text-sm font-medium hover:bg-ink hover:text-surface transition-colors"
        >
          Odhlásiť sa
        </button>
      </div>
    </div>
  );
}
