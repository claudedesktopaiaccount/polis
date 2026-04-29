import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";

export default function Footer() {
  return (
    <footer style={{ background: "var(--footer-bg)", marginTop: "80px" }}>
      <div className="max-w-content mx-auto px-6 py-10">
        {/* Newsletter row */}
        <div className="mb-8">
          <p className="text-[11px] text-white/50 tracking-[0.12em] uppercase font-semibold mb-3">
            NEWSLETTER
          </p>
          <NewsletterSignup source="footer" compact />
        </div>
        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t border-white/20">
          <div>
            <p className="text-[14px] text-white/80">© {new Date().getFullYear()} VolímTo</p>
            <p className="text-[12px] text-white/40 mt-1">
              Dáta z verejne dostupných prieskumov. Nezodpovedáme za presnosť predikcií.
            </p>
          </div>
          <nav className="flex gap-6">
            {[
              { href: "/sukromie", label: "Ochrana súkromia" },
              { href: "/podmienky", label: "Podmienky používania" },
              { href: "/impressum", label: "Impressum" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-white/50 hover:text-white/80 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
