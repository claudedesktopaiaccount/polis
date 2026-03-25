"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { validateEmail, validatePassword, validateDisplayName } from "@/lib/auth/validate";

export default function RegistraciaClient() {
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) newErrors.email = emailCheck.error!;

    const passCheck = validatePassword(password);
    if (!passCheck.valid) newErrors.password = passCheck.error!;

    const nameCheck = validateDisplayName(displayName);
    if (!nameCheck.valid) newErrors.displayName = nameCheck.error!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await register(email, password, displayName);
      if (result.error) {
        setServerError(result.error);
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
        <h1 className="font-serif text-2xl font-semibold text-ink mb-1">Registrácia</h1>
        <p className="text-sm text-text mb-8">Vytvorte si účet a sledujte volebné dianie.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-ink mb-1">
              Meno
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              required
              className="w-full px-3 py-2 bg-surface border border-divider text-ink text-sm placeholder:text-text/50 focus:outline-none focus:border-ink transition-colors"
              placeholder="Vaše meno"
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-red-600">{errors.displayName}</p>
            )}
          </div>

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
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
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
              autoComplete="new-password"
              required
              className="w-full px-3 py-2 bg-surface border border-divider text-ink text-sm placeholder:text-text/50 focus:outline-none focus:border-ink transition-colors"
              placeholder="Min. 8 znakov"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          {serverError && (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-ink text-surface text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registruje sa…" : "Registrovať sa"}
          </button>
        </form>

        <p className="mt-6 text-sm text-text text-center">
          Už máte účet?{" "}
          <Link href="/prihlasenie" className="text-ink font-medium hover:underline">
            Prihlásiť sa
          </Link>
        </p>
      </div>
    </div>
  );
}
