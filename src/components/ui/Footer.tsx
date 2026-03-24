import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";

export default function Footer() {
  return (
    <footer className="border-t border-divider bg-[#111110] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-t border-[#F4F3EE]/10 pt-6 pb-4">
          <p className="text-xs text-[#F4F3EE]/50 mb-2 font-semibold uppercase tracking-widest">Newsletter</p>
          <NewsletterSignup source="footer" compact />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#F4F3EE]/80">
              &copy; {new Date().getFullYear()} Polis
            </p>
            <p className="mt-1 text-xs text-[#F4F3EE]/50">
              Dáta z verejne dostupných prieskumov. Nezodpovedáme za presnosť predikcií.
            </p>
          </div>
          <nav aria-label="Odkazy v pätičke" className="flex items-center gap-6">
            <Link
              href="/sukromie"
              className="text-sm text-[#F4F3EE]/70 hover:text-[#F4F3EE] transition-colors"
            >
              Ochrana súkromia
            </Link>
            <Link
              href="/podmienky"
              className="text-sm text-[#F4F3EE]/70 hover:text-[#F4F3EE] transition-colors"
            >
              Podmienky používania
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
