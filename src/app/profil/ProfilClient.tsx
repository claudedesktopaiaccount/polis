"use client";

import { useEffect, useState, useCallback } from "react";
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

  const [notifPrefs, setNotifPrefs] = useState({ onNewPoll: false, onScoreChange: false });
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/prihlasenie");
    }
  }, [isLoading, user, router]);

  const fetchNotifPrefs = useCallback(async () => {
    try {
      const res = await fetch("/api/user/notification-prefs");
      if (res.ok) {
        const data = await res.json() as { onNewPoll: boolean; onScoreChange: boolean };
        setNotifPrefs({ onNewPoll: data.onNewPoll, onScoreChange: data.onScoreChange });
      }
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifPrefs();
    }
  }, [user, fetchNotifPrefs]);

  async function handleSaveNotifPrefs() {
    setNotifSaving(true);
    try {
      await fetch("/api/user/notification-prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifPrefs),
      });
    } finally {
      setNotifSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  async function handleExport() {
    const csrfToken = document.cookie
      .split("; ")
      .find((c) => c.startsWith("pt_csrf="))
      ?.split("=")[1] ?? "";
    const res = await fetch("/api/gdpr/export", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
    });
    if (res.ok) {
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "volimto-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Naozaj chcete vymazať svoj účet? Táto akcia je nevratná.")) return;
    const csrfToken = document.cookie
      .split("; ")
      .find((c) => c.startsWith("pt_csrf="))
      ?.split("=")[1] ?? "";
    const res = await fetch("/api/gdpr/delete", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
    });
    if (res.ok) {
      router.push("/");
    }
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

        <div className="mt-8 pt-6 border-t border-divider">
          <h2 className="font-serif text-lg font-semibold text-ink mb-4">E-mailové notifikácie</h2>
          {notifLoading ? (
            <p className="text-sm text-text">Načítava sa...</p>
          ) : (
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.onNewPoll}
                  onChange={(e) =>
                    setNotifPrefs((p) => ({ ...p, onNewPoll: e.target.checked }))
                  }
                  className="accent-ink w-4 h-4"
                />
                <span className="text-sm text-ink">Nový prieskum zverejnený</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.onScoreChange}
                  onChange={(e) =>
                    setNotifPrefs((p) => ({ ...p, onScoreChange: e.target.checked }))
                  }
                  className="accent-ink w-4 h-4"
                />
                <span className="text-sm text-ink">Zmena skóre vo vašej predikcii</span>
              </label>
              <button
                onClick={handleSaveNotifPrefs}
                disabled={notifSaving}
                className="mt-1 w-full py-2.5 border border-ink text-ink text-sm font-medium hover:bg-ink hover:text-surface transition-colors disabled:opacity-50"
              >
                {notifSaving ? "Ukladá sa..." : "Uložiť notifikácie"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-divider">
          <h2 className="font-serif text-lg font-semibold text-ink mb-4">Správa dát</h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleExport}
              className="w-full py-2.5 border border-divider text-text text-sm font-medium hover:border-ink transition-colors"
            >
              Exportovať dáta
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full py-2.5 border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Vymazať účet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
