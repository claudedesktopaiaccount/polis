"use client";

import { useState } from "react";

const STEPS = [
  {
    num: 1,
    eyebrow: "Zber dát",
    headline: "8 agentúr · 12 prieskumov",
    body: (
      <>
        <p className="text-[12px] text-[#444] leading-[1.65]">
          Zbierame prieskumy zo všetkých agentúr. <strong className="text-[#1a1a1a] font-semibold">Čerstvejšie dáta majú väčšiu váhu</strong> — prieskum spred týždňa ovplyvní výsledok viac ako ten spred dvoch mesiacov.
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {["Focus", "AKO", "Median", "Puls", "NMS", "MVK", "STEM/MARK", "Ipsos"].map((a) => (
            <span key={a} className="text-[10px] font-semibold text-[#444] bg-[#f0ede6] border border-[#e8e3db] px-2 py-0.5 rounded">{a}</span>
          ))}
        </div>
        <div className="mt-3 bg-[#f0ede6] border border-[#e8e3db] border-l-[2px] border-l-[#1a6eb5] rounded px-3 py-2 text-[11px] text-[#444] leading-[1.6]">
          <div className="text-[9px] font-bold text-[#1a6eb5] uppercase tracking-[0.12em] mb-1">Prečo viac agentúr?</div>
          Každá oslovuje iných ľudí. <strong className="text-[#1a1a1a]">Priemer viacerých je spoľahlivejší.</strong>
          <div className="mt-1.5 pt-1.5 border-t border-[#e8e3db] italic text-[#888]">
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
        <p className="text-[12px] text-[#444] leading-[1.65]">
          Výsledky agentúr zmiešame do jedného čísla. <strong className="text-[#1a1a1a] font-semibold">Novší prieskum váži viac ako starý.</strong>
        </p>
        <div className="mt-3 bg-[#f0ede6] border border-[#e8e3db] border-l-[2px] border-l-[#1a6eb5] rounded px-3 py-2 text-[11px] text-[#444] leading-[1.6]">
          <div className="text-[9px] font-bold text-[#1a6eb5] uppercase tracking-[0.12em] mb-1">Čo je vážený priemer?</div>
          Prieskum spred týždňa váži 100 %, spred mesiaca ~50 %, spred troch mesiacov ~12 %. Staré dáta menej, čerstvé viac.
          <div className="mt-1.5 pt-1.5 border-t border-[#e8e3db] italic text-[#888]">
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
        <p className="text-[12px] text-[#444] leading-[1.65]">
          Prieskumy sa historicky mýlia o <strong className="text-[#1a1a1a] font-semibold">±2–3 percentuálne body</strong>. Nasimulovali sme 10 000 rôznych výsledkov kde každá strana dostala náhodný posun — nahor aj nadol.
        </p>
        <div className="mt-3 bg-[#f0ede6] border border-[#e8e3db] border-l-[2px] border-l-[#1a6eb5] rounded px-3 py-2 text-[11px] text-[#444] leading-[1.6]">
          <div className="text-[9px] font-bold text-[#1a6eb5] uppercase tracking-[0.12em] mb-1">Čo je simulácia?</div>
          Predstav si hod kockou 10 000-krát. My sme to spravili s voľbami. <strong className="text-[#1a1a1a]">Z výsledkov vidíme, čo sa stane najčastejšie.</strong>
          <div className="mt-1.5 pt-1.5 border-t border-[#e8e3db] italic text-[#888]">
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
        <p className="text-[12px] text-[#444] leading-[1.65]">
          Hlasy sa nepremenia priamo na kreslá. Používame tú istú metódu ako Slovensko pri skutočných voľbách. Strany pod <strong className="text-[#1a1a1a] font-semibold">5 % prah</strong> nedostanú žiadne mandáty.
        </p>
        <div className="mt-3 bg-[#f0ede6] border border-[#e8e3db] border-l-[2px] border-l-[#1a6eb5] rounded px-3 py-2 text-[11px] text-[#444] leading-[1.6]">
          <div className="text-[9px] font-bold text-[#1a6eb5] uppercase tracking-[0.12em] mb-1">Prečo nie jednoduché %?</div>
          27 % zo 150 kresiel = 40.5 — čo nie je celé číslo. D&apos;Hondt to vyrieši matematicky spravodlivo.
          <div className="mt-1.5 pt-1.5 border-t border-[#e8e3db] italic text-[#888]">
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
    <div className="bg-white border border-[#e8e3db] rounded-[8px] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e8e3db]">
        <div className="text-[11px] font-bold text-[#1a1a1a] uppercase tracking-[0.08em]">
          Ako sme to vypočítali
        </div>
        <div className="text-[10px] text-[#aaa] mt-0.5">Klikni na krok pre vysvetlenie</div>
      </div>

      {STEPS.map((step) => {
        const isOpen = open === step.num;
        return (
          <div key={step.num} className="border-b border-[#e8e3db] last:border-b-0">
            <button
              onClick={() => setOpen(isOpen ? null : step.num)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isOpen ? "bg-[#f0ede6]" : "hover:bg-[#f8f5f0]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-colors ${
                  isOpen
                    ? "border-[#1a6eb5] text-[#1a6eb5]"
                    : "border-[#d0cbc3] text-[#888]"
                }`}
              >
                {step.num}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-[#aaa] uppercase tracking-[0.1em] font-semibold">
                  {step.eyebrow}
                </div>
                <div className="text-[12px] font-bold text-[#1a1a1a] mt-0.5">{step.headline}</div>
              </div>
              <span
                className={`text-[10px] text-[#aaa] flex-shrink-0 transition-transform duration-200 ${
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
