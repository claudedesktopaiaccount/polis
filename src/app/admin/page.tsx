import Link from "next/link";

export default function AdminDashboard() {
  const sections = [
    { href: "/admin/promises", label: "Programové sľuby strán", desc: "Pridať, upraviť, zmazať" },
    { href: "/admin/polls", label: "Manuálne zadanie prieskumu", desc: "Pridať výsledky prieskumu" },
  ];
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-ink mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="block p-5 border border-divider hover:border-ink transition-colors">
            <div className="font-semibold text-ink mb-1">{s.label}</div>
            <div className="text-sm text-muted">{s.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
