"use client";

import { useState } from "react";

const STEPS = [
  {
    num: 1,
    eyebrow: "Zber dát",
    headline: "8 agentúr · 12 prieskumov",
    body: (
      <>
        <p className="text-[12px] text-secondary leading-[1.65]">
          Zbierame prieskumy zo všetkých agentúr. <strong className="text-ink font-semibold">Čerstvejšie dáta majú väčšiu váhu</strong> — prieskum spred týždňa ovplyvní výsledok viac ako ten spred dvoch mesiacov.
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {["Focus", "AKO", "Median", "Puls", "NMS", "MVK", "STEM/MARK", "Ipsos"].map((a) => (
            <span key={a} className="text-[10px] font-semibold text-secondary bg-subtle border border-border px-2 py-0.5 rounded">{a}</span>
          ))}
        </div>
        <div className="mt-3 bg-subtle border border-border border-l-2 border-l-accent rounded px-3 py-2 text-[11px] text-secondary leading-[1.6]">
          <div className="text-[9px] font-bold text-accent uppercase tracking-[0.12em] mb-1">Prečo viac agentúr?</div>
          Každá oslovuje iných ľudí. <strong className="text-ink">Priemer viacerých je spoľahlivejší.</strong>
          <div className="mt-1.5 pt-1.5 border-t border-border italic text-muted">
            💡 Ako opýtať sa celej triedy, nie len jedného kamaráta.
          </div>
        </div>
      </>
    ),
  },
  {
    num: 2,
    eyebrow: "Agregácia",
    headline: "Jeden vážený priemer",
    body: (
      <>
        <p className="text-[12px] text-secondary leading-[1.65]">
          Výsledky agentúr zmiešame do jedného čísla. <strong className="text-ink font-semibold">Novší prieskum váži viac ako starý.</strong>
        </p>
        <div className="mt-3 bg-subtle border border-border border-l-2 border-l-accent rounded px-3 py-2 text-[11px] text-secondary leading-[1.6]">
          <div className="text-[9px] font-bold text-accent uppercase tracking-[0.12em] mb-1">Čo je vážený priemer?</div>
          Prieskum spred týždňa váži 100 %, spred mesiaca ~50 %, spred troch mesiacov ~12 %. Staré dáta menej, čerstvé viac.
          <div className="mt-1.5 pt-1.5 border-t border-border italic text-muted">
            💡 Pamätáš si lepšie to, čo si čítal včera ako pred mesiacom.
          </div>
        </div>
      </>
    ),
  },
  {
    num: 3,
    eyebrow: "Simulácia",
    headline: "10 000 možných scenárov",
    body: (
      <>
        <p className="text-[12px] text-secondary leading-[1.65]">
          Prieskumy sa historicky mýlia o <strong className="text-ink font-semibold">±2–3 percentuálne body</strong>. Nasimulovali sme 10 000 rôznych výsledkov kde každá strana dostala náhodný posun — nahor aj nadol.
        </p>
        <div className="mt-3 bg-subtle border border-border border-l-2 border-l-accent rounded px-3 py-2 text-[11px] text-secondary leading-[1.6]">
          <div className="text-[9px] font-bold text-accent uppercase tracking-[0.12em] mb-1">Čo je simulácia?</div>
          Predstav si hod kockou 10 000-krát. My sme to spravili s voľbami. <strong className="text-ink">Z výsledkov vidíme, čo sa stane najčastejšie.</strong>
          <div className="mt-1.5 pt-1.5 border-t border-border italic text-muted">
            💡 Nepredpovedáme budúcnosť — hovoríme, čo je najpravdepodobnejšie.
          </div>
        </div>
      </>
    ),
  },
  {
    num: 4,
    eyebrow: "Mandáty",
    headline: "Metóda D'Hondt",
    body: (
      <>
        <p className="text-[12px] text-secondary leading-[1.65]">
          Hlasy sa nepremenia priamo na kreslá. Používame tú istú metódu ako Slovensko pri skutočných voľbách. Strany pod <strong className="text-ink font-semibold">5 % prah</strong> nedostanú žiadne mandáty.
        </p>
        <div className="mt-3 bg-subtle border border-border border-l-2 border-l-accent rounded px-3 py-2 text-[11px] text-secondary leading-[1.6]">
          <div className="text-[9px] font-bold text-accent uppercase tracking-[0.12em] mb-1">Prečo nie jednoduché %?</div>
          27 % zo 150 kresiel = 40.5 — čo nie je celé číslo. D&apos;Hondt to vyrieši matematicky spravodlivo.
          <div className="mt-1.5 pt-1.5 border-t border-border italic text-muted">
            💡 Ako deliť pizzu — musíš rozdeliť celé kusy, nie polovičky.
          </div>
        </div>
      </>
    ),
  },
] as const;

export default function MethodologyAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[11px] font-bold text-ink uppercase tracking-[0.08em]">
          Ako sme to vypočítali
        </div>
        <div className="text-[10px] text-faint mt-0.5">Klikni na krok pre vysvetlenie</div>
      </div>

      {STEPS.map((step) => {
        const isOpen = open === step.num;
        return (
          <div key={step.num} className="border-b border-border last:border-b-0">
            <button
              onClick={() => setOpen(isOpen ? null : step.num)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isOpen ? "bg-subtle" : "hover:bg-page"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-colors ${
                  isOpen
                    ? "border-accent text-accent"
                    : "border-border-strong text-muted"
                }`}
              >
                {step.num}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-faint uppercase tracking-[0.1em] font-semibold">
                  {step.eyebrow}
                </div>
                <div className="text-[12px] font-bold text-ink mt-0.5">{step.headline}</div>
              </div>
              <span
                className={`text-[10px] text-faint flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pl-12">{step.body}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
