import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Podmienky používania",
  description: "Podmienky používania stránky Polis.",
};

export default function PodmienkyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading title="Podmienky používania" />

      <div className="space-y-8 text-text">
        <section>
          <h2 className="font-serif text-xl font-bold text-ink mt-8 mb-3">1. Všeobecné ustanovenia</h2>
          <p className="text-sm">
            Tieto podmienky upravujú používanie webovej stránky Polis (ďalej len &quot;stránka&quot;).
            Používaním stránky vyjadrujete súhlas s týmito podmienkami.
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">2. Účel stránky</h2>
          <p className="text-sm mb-3">Stránka slúži na sledovanie a analýzu volebných prieskumov na Slovensku:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Prehľad volebných prieskumov z verejne dostupných zdrojov</li>
            <li>Predikcie výsledkov volieb na základe štatistických modelov</li>
            <li>Simulátor koaličných kombinácií</li>
            <li>Volebný kalkulátor na porovnanie postojov s politickými stranami</li>
            <li>Tipovanie volebných výsledkov</li>
          </ul>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">3. Zdroje dát</h2>
          <p className="text-sm">
            Dáta o prieskumoch pochádzajú z verejne dostupných zdrojov (Wikipedia, spravodajské portály).
            Predikcie sú generované štatistickými modelmi (Monte Carlo simulácia) a nemusia presne
            zodpovedať skutočným výsledkom volieb.
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">4. Tipovanie</h2>
          <p className="text-sm">
            Sekcia Tipovanie umožňuje používateľom anonymne tipovať víťaza volieb. Na zabránenie
            duplicitným hlasom používame cookies a (so súhlasom) fingerprinting prehliadača.
            Tipovanie nie je hazardná hra a neposkytuje žiadne výhry ani odmeny.
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">5. Ochrana osobných údajov</h2>
          <p className="text-sm">
            Spracovanie osobných údajov sa riadi našimi{" "}
            <a href="/sukromie" className="text-ink underline underline-offset-2 hover:text-text transition-colors">
              pravidlami ochrany súkromia
            </a>
            . Zbierame len nevyhnutné údaje na fungovanie stránky.
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">6. Duševné vlastníctvo</h2>
          <p className="text-sm">
            Obsah stránky (kód, dizajn, texty) je chránený autorským právom. Dáta z prieskumov
            pochádzajú z verejných zdrojov a ich ďalšie použitie sa riadi podmienkami pôvodných zdrojov.
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">7. Odmietnutie zodpovednosti</h2>
          <p className="text-sm mb-3">Stránka je poskytovaná &quot;tak ako je&quot; bez akýchkoľvek záruk. Nezodpovedáme za:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Presnosť predikcií a štatistických modelov</li>
            <li>Dostupnosť stránky alebo jej častí</li>
            <li>Rozhodnutia urobené na základe informácií zo stránky</li>
          </ul>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">8. Zmeny podmienok</h2>
          <p className="text-sm">
            Vyhradzujeme si právo tieto podmienky kedykoľvek zmeniť. Pokračovaním v používaní stránky
            vyjadrujete súhlas s aktualizovanými podmienkami.
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">9. Rozhodné právo</h2>
          <p className="text-sm">Tieto podmienky sa riadia právnym poriadkom Slovenskej republiky.</p>
        </section>
      </div>
    </div>
  );
}
