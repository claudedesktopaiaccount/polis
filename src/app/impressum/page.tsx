import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Informácie o prevádzkovateľovi stránky VolímTo podľa §5 zákona o elektronickom obchode.",
};

export default function ImpressumPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading title="Impressum" />

      <div className="space-y-8 text-text">
        <section>
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Prevádzkovateľ</h2>
          <p className="text-sm">
            VolímTo — nezávislý agregátor volebných prieskumov a predikcií
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Kontakt</h2>
          <p className="text-sm mb-2">
            E-mail:{" "}
            <a href="mailto:redakcia@volimto.sk" className="text-ink underline underline-offset-2 hover:text-text transition-colors">
              redakcia@volimto.sk
            </a>
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">O projekte</h2>
          <p className="text-sm mb-3">
            VolímTo je nezávislý agregátor volebných prieskumov a predikcií na Slovensku. Projekt nie je napojený
            na žiadnu politickú stranu ani iné záujmové skupiny.
          </p>
          <p className="text-sm">
            Dáta pochádzajú z verejne dostupných prieskumov zverejnených na Wikipédii a od autorských agentúr.
            Predikcie predstavujú štatistické modely určené na informačné účely a nemusia presne zodpovedať
            skutočným výsledkom volieb.
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Zodpovednosť za obsah</h2>
          <p className="text-sm mb-3">
            Prevádzkovateľ vyvíja maximálnu snahu, aby bol obsah presný a aktuálny. Predikcie a simulácie
            na tejto stránke sú štatistické modely určené na informačné účely a nepredstavujú garanciu
            volebných výsledkov.
          </p>
          <p className="text-sm">
            Prevádzkovateľ nezodpovedá za:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
            <li>Presnosť predikcií a modelov</li>
            <li>Prípadné nepresnosti v dátach tretích strán</li>
            <li>Rozhodnutia urobené na základe informácií z tejto stránky</li>
          </ul>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Ochrana osobných údajov</h2>
          <p className="text-sm">
            Spracovanie osobných údajov sa riadi našimi{" "}
            <a href="/sukromie" className="text-ink underline underline-offset-2 hover:text-text transition-colors">
              pravidlami ochrany súkromia
            </a>
            . Zbierame len nevyhnutné údaje na fungovanie stránky.
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Licencia obsahu</h2>
          <p className="text-sm">
            Obsah stránky (kód, dizajn, texty) je chránený autorským právom. Dáta z prieskumov a verejných
            zdrojov sú používané v súlade s ich pôvodnými licenčnými podmienkami.
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Právne informácie</h2>
          <p className="text-sm mb-2">
            Táto stránka je prevádzkovaná v súlade s Zákonom č. 22/2004 Z.z. o elektronickom obchode
            a Všeobecným nariadením o ochrane údajov (GDPR).
          </p>
          <p className="text-sm">
            Úplné podmienky používania sú dostupné v sekcii{" "}
            <a href="/podmienky" className="text-ink underline underline-offset-2 hover:text-text transition-colors">
              Podmienky používania
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
