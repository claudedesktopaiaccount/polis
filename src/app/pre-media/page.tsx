import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Pre médiá",
  description: "Polis pre médiá — vložiteľné widgety, verejné API a dátové partnerstvá pre novinárov a výskumníkov.",
};

export default function PreMediaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading title="Pre médiá a novinárov" subtitle="Polis pre novinárov a výskumníkov" />

      <div className="space-y-8 text-text">
        <section>
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Vložiteľné widgety</h2>
          <p className="text-sm mb-4">
            Polis ponúka vložiteľné widgety s trendami volebných prieskumov pre mediálne webové stránky. Môžete jednoducho
            vložiť interaktívne grafy priamo do svojich článkov bez potreby údržby dát.
          </p>
          <p className="text-sm mb-4">
            Dokumentácia a príklady kódu nájdete na{" "}
            <a href="/embed" className="text-ink underline underline-offset-2 hover:text-text transition-colors">
              stránke vložiteľných widgetov
            </a>
            . Ponúkame možnosti vloženia cez:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              <strong>iframe</strong> — najjednoduchší spôsob pre väčšinu webových platforiem
            </li>
            <li>
              <strong>Script tag</strong> — pre pokročilú integráciu a personalizáciu
            </li>
          </ul>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Verejné API</h2>
          <p className="text-sm mb-4">
            Všetky údaje o volebných prieskumoch sú dostupné cez REST API bez potreby autentifikácie:
          </p>
          <div className="bg-zinc-100 p-4 border border-divider mb-4 font-mono text-xs">
            <code>https://polis.sk/api/v1/polls</code>
          </div>
          <p className="text-sm mb-3">
            Dáta sú vrátené vo formáte <strong>JSON</strong>. CORS je povolený pre novinárov a výskumníkov. API je
            bezplatný bez obmedzení na počet požiadaviek.
          </p>
          <p className="text-sm">
            Podrobná dokumentácia API vrátane všetkých dostupných endpointov a parametrov je dostupná na{" "}
            <a href="/api-docs" className="text-ink underline underline-offset-2 hover:text-text transition-colors">
              stránke dokumentácie API
            </a>
            .
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Dátové partnerstvo</h2>
          <p className="text-sm mb-4">
            Pre mediálne agentúry a výskumné inštitúcie ponúkame špeciálne partnerstvá s ďalšími výhodami:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Vlastné, prispôsobené widgety a vizualizácie pre vašu značku</li>
            <li>Skorý prístup k novým funkciám a predikciam pred ich zverejnením</li>
            <li>Integrovaná spolupráca pri zastrešení volebných výsledkov</li>
            <li>Technická podpora a poradenstvo pri integrácii</li>
          </ul>
          <p className="text-sm mt-4">
            Ak vás zaujíma dátové partnerstvo, kontaktujte nás na e-mailovú adresu uvedenú nižšie.
          </p>
        </section>

        <section className="border-t border-divider pt-6">
          <h2 className="font-serif text-xl font-bold text-ink mb-3">Kontakt</h2>
          <p className="text-sm mb-3">
            Máte otázky k vložiteľným widgetom, API alebo sa chcete dohodnúť na partnerstve?
          </p>
          <p className="text-sm">
            <strong>E-mail:</strong>{" "}
            <a href="mailto:redakcia@polis.sk" className="text-ink underline underline-offset-2 hover:text-text transition-colors">
              redakcia@polis.sk
            </a>
          </p>
          <p className="text-sm mt-4 text-zinc-600">
            Zvyčajne odpovedáme do 24 hodín. Ďakujeme za záujem o spoluprácu.
          </p>
        </section>
      </div>
    </div>
  );
}
