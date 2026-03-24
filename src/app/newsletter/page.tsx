import type { Metadata } from "next";
import NewsletterSignup from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Polis Týždenník — týždenný prehľad slovenských politických prieskumov a predikcií. Zadarmo, každý piatok.",
};

export default function NewsletterPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl font-bold text-ink mb-4">Polis Týždenník</h1>
      <p className="text-text mb-2 leading-relaxed">
        Každý piatok: prehľad zmien v prieskumoch, čo hovoria predikcie, a jeden editorial uhol pohľadu na slovenské politické dianie.
      </p>
      <p className="text-muted text-sm mb-8">Zadarmo. Odhlásenie kedykoľvek.</p>
      <NewsletterSignup source="newsletter-page" />
    </main>
  );
}
