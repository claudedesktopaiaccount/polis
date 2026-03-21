import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Podmienky používania | Progressive Tracker",
  description: "Podmienky používania stránky Progressive Tracker.",
};

export default function PodmienkyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading title="Podmienky používania" />

      <div className="prose prose-neutral max-w-none space-y-6 text-neutral-700">
        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">1. Všeobecné ustanovenia</h2>
          <p>
            Tieto podmienky upravujú používanie webovej stránky Progressive Tracker (ďalej len &quot;stránka&quot;).
            Používaním stránky vyjadrujete súhlas s týmito podmienkami. Ak s nimi nesúhlasíte,
            prosím nepoužívajte túto stránku.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">2. Účel stránky</h2>
          <p>
            Stránka slúži na sledovanie a analýzu volebných prieskumov na Slovensku. Poskytuje:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Prehľad volebných prieskumov z verejne dostupných zdrojov</li>
            <li>Predikcie výsledkov volieb na základe štatistických modelov</li>
            <li>Simulátor koaličných kombinácií</li>
            <li>Volebný kalkulátor na porovnanie postojov s politickými stranami</li>
            <li>Tipovanie volebných výsledkov</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">3. Zdroje dát</h2>
          <p>
            Dáta o prieskumoch pochádzajú z verejne dostupných zdrojov (Wikipedia, spravodajské portály).
            Predikcie sú generované štatistickými modelmi (Monte Carlo simulácia) a nemusia presne
            zodpovedať skutočným výsledkom volieb. Stránka nezodpovedá za presnosť predikcií.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">4. Tipovanie</h2>
          <p>
            Sekcia Tipovanie umožňuje používateľom anonymne tipovať víťaza volieb. Na zabránenie
            duplicitným hlasom používame cookies a (so súhlasom) fingerprinting prehliadača.
            Tipovanie nie je hazardná hra a neposkytuje žiadne výhry ani odmeny.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">5. Ochrana osobných údajov</h2>
          <p>
            Spracovanie osobných údajov sa riadi našimi{" "}
            <a href="/sukromie" className="text-violet-600 underline hover:text-violet-700">
              pravidlami ochrany súkromia
            </a>
            . Zbierame len nevyhnutné údaje na fungovanie stránky.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">6. Duševné vlastníctvo</h2>
          <p>
            Obsah stránky (kód, dizajn, texty) je chránený autorským právom. Dáta z prieskumov
            pochádzajú z verejných zdrojov a ich ďalšie použitie sa riadi podmienkami pôvodných zdrojov.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">7. Odmietnutie zodpovednosti</h2>
          <p>
            Stránka je poskytovaná &quot;tak ako je&quot; bez akýchkoľvek záruk. Nezodpovedáme za:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Presnosť predikcií a štatistických modelov</li>
            <li>Dostupnosť stránky alebo jej častí</li>
            <li>Rozhodnutia urobené na základe informácií zo stránky</li>
            <li>Dočasné výpadky spôsobené údržbou alebo technickými problémami</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">8. Zmeny podmienok</h2>
          <p>
            Vyhradzujeme si právo tieto podmienky kedykoľvek zmeniť. Zmeny nadobúdajú účinnosť
            okamihom ich zverejnenia na stránke. Pokračovaním v používaní stránky po zmene podmienok
            vyjadrujete súhlas s aktualizovanými podmienkami.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">9. Rozhodné právo</h2>
          <p>
            Tieto podmienky sa riadia právnym poriadkom Slovenskej republiky.
          </p>
        </section>
      </div>
    </div>
  );
}
