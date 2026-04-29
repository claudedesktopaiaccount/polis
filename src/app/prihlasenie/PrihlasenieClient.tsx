"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { validateEmail, validatePassword } from "@/lib/auth/validate";

export default function PrihlasenieClient() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.error ?? "Neplatný e-mail");
      return;
    }
    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      setError(passCheck.error ?? "Neplatné heslo");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/profil");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl font-semibold text-ink mb-1">Prihlásenie</h1>
        <p className="text-sm text-text mb-8">Vitajte späť na VolímTo.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full px-3 py-2 bg-surface border border-divider text-ink text-sm placeholder:text-text/50 focus:outline-none focus:border-ink transition-colors"
              placeholder="vas@email.sk"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
              Heslo
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 bg-surface border border-divider text-ink text-sm placeholder:text-text/50 focus:outline-none focus:border-ink transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-ink text-surface text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Prihlasovanie…" : "Prihlásiť sa"}
          </button>
        </form>

        <p className="mt-6 text-sm text-text text-center">
          Nemáte účet?{" "}
          <Link href="/registracia" className="text-ink font-medium hover:underline">
            Registrovať sa
          </Link>
        </p>
      </div>
    </div>
  );
}
