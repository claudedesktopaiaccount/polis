import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import DeleteDataButton from "./DeleteDataButton";
import ExportDataButton from "./ExportDataButton";
import ConsentManager from "./ConsentManager";

export const metadata: Metadata = {
  title: "Ochrana súkromia | Progressive Tracker",
  description: "Informácie o spracovaní osobných údajov na stránke Progressive Tracker.",
};

export default function SukromiePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading title="Ochrana súkromia" />

      <div className="prose prose-neutral max-w-none space-y-6 text-neutral-700">
        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">Aké údaje zbierame</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Cookies:</strong> Ukladáme anonymný identifikátor návštevníka (<code>pt_visitor</code>) a CSRF token
              (<code>pt_csrf</code>) na zabezpečenie funkčnosti a ochranu pred útokmi.
            </li>
            <li>
              <strong>Fingerprinting (len so súhlasom):</strong> Ak udelíte súhlas, vytvoríme hash z technických
              parametrov prehliadača (rozlíšenie obrazovky, časové pásmo, jazyk, canvas rendering). Hash slúži
              výhradne na zabránenie duplicitným hlasom v sekcii Tipovanie. Ukladáme len hash, nie surové dáta.
            </li>
            <li>
              <strong>IP adresa:</strong> Používame ju dočasne (v pamäti servera) na rate limiting.
              Neukladáme ju do databázy.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">Účel spracovania</h2>
          <p>
            Údaje spracovávame výhradne na:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Zabránenie duplicitným hlasom v sekcii Tipovanie</li>
            <li>Ochranu pred automatizovanými útokmi (rate limiting)</li>
            <li>CSRF ochranu formulárov</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">Doba uchovávania</h2>
          <p>
            Údaje o hlasovaní uchovávame po dobu trvania volebného cyklu. Cookie identifikátor má platnosť
            1 rok. Údaje môžete kedykoľvek vymazať pomocou tlačidla nižšie.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">Vaše práva (GDPR)</h2>
          <p>Máte právo na:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Prístup</strong> — vedieť, aké údaje o vás máme</li>
            <li><strong>Vymazanie</strong> — požiadať o odstránenie všetkých vašich údajov</li>
            <li><strong>Odvolanie súhlasu</strong> — kedykoľvek odvolať súhlas s fingerprintingom</li>
            <li><strong>Prenosnosť</strong> — získať vaše údaje v strojovo čitateľnom formáte</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">Správa súhlasu</h2>
          <p className="mb-4">
            Tu môžete zmeniť váš súhlas s fingerprintingom prehliadača.
          </p>
          <ConsentManager />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">Stiahnuť moje údaje</h2>
          <p className="mb-4">
            Stiahnite si všetky údaje, ktoré o vás máme, vo formáte JSON.
          </p>
          <ExportDataButton />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">Vymazať moje údaje</h2>
          <p className="mb-4">
            Kliknutím na tlačidlo nižšie vymažeme všetky vaše hlasovanie a cookie identifikátor.
          </p>
          <DeleteDataButton />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mt-8 mb-3">Tretie strany</h2>
          <p>
            Stránka je hostovaná na Cloudflare Pages. Nepoužívame žiadne analytické nástroje tretích strán
            ani reklamné siete. Údaje nezdieľame so žiadnymi tretími stranami.
          </p>
        </section>
      </div>
    </div>
  );
}
