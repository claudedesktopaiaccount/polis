import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Zásady cookies",
  description: "Prehľad cookies používaných na stránke VolímTo.",
};

export default function CookiesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeading title="Zásady cookies" subtitle="Aké cookies používame a prečo" />

      <div className="text-sm text-text space-y-6">
        <p>
          VolímTo používa nasledujúce cookies. Funkčné cookies sú nevyhnutné na prevádzku stránky
          a nemožno ich vypnúť. Analytické cookies sú voliteľné a aktivujú sa len s vaším súhlasom.
        </p>

        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="text-left py-2 pr-4 font-semibold text-ink">Cookie</th>
              <th className="text-left py-2 pr-4 font-semibold text-ink">Účel</th>
              <th className="text-left py-2 pr-4 font-semibold text-ink">Platnosť</th>
              <th className="text-left py-2 font-semibold text-ink">Typ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            <tr>
              <td className="py-2 pr-4 font-mono">volimto_session</td>
              <td className="py-2 pr-4 text-text/70">Prihlásenie — identifikácia prihláseného používateľa</td>
              <td className="py-2 pr-4 text-text/70">7 dní</td>
              <td className="py-2 text-text/70">Funkčné</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">pt_visitor</td>
              <td className="py-2 pr-4 text-text/70">Tipovanie — anonymná identifikácia pre detekciu duplicitných tipov</td>
              <td className="py-2 pr-4 text-text/70">1 rok</td>
              <td className="py-2 text-text/70">Funkčné</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">pt_csrf</td>
              <td className="py-2 pr-4 text-text/70">Bezpečnosť — ochrana formulárov pred CSRF útokmi</td>
              <td className="py-2 pr-4 text-text/70">Relácia</td>
              <td className="py-2 text-text/70">Funkčné</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">volimto_engaged</td>
              <td className="py-2 pr-4 text-text/70">UI — pamätá si, či ste prešli úvodnou obrazovkou</td>
              <td className="py-2 pr-4 text-text/70">1 rok</td>
              <td className="py-2 text-text/70">Funkčné</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">volimto_score</td>
              <td className="py-2 pr-4 text-text/70">Tipovanie — cachuje vaše skóre pre zobrazenie v navigácii</td>
              <td className="py-2 pr-4 text-text/70">7 dní</td>
              <td className="py-2 text-text/70">Funkčné</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">volimto_theme</td>
              <td className="py-2 pr-4 text-text/70">UI — pamätá si vašu voľbu svetlého/tmavého režimu</td>
              <td className="py-2 pr-4 text-text/70">1 rok</td>
              <td className="py-2 text-text/70">Funkčné</td>
            </tr>
          </tbody>
        </table>

        <section>
          <h2 className="font-serif text-base font-bold text-ink mb-2">Ako odmietnuť cookies</h2>
          <p className="text-text/70">
            Analytické sledovanie (Umami) môžete odmietnuť cez banner pri prvej návšteve alebo kedykoľvek
            v nastaveniach súhlasu na stránke{" "}
            <a href="/sukromie" className="text-ink underline underline-offset-2">Súkromie</a>.
            Funkčné cookies nie je možné vypnúť — sú nevyhnutné na základnú prevádzku stránky.
          </p>
        </section>
      </div>
    </div>
  );
}
