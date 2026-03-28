export interface Question {
  id: number;
  text: string;
  answers: {
    label: string;
    weights: Record<string, number>;
  }[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Aký by mal byť postoj Slovenska k Európskej únii?",
    answers: [
      { label: "Silnejšia integrácia", weights: { ps: 2, demokrati: 1, sas: 0.5, kdh: 0, "hlas-sd": -1, "smer-sd": -2, sns: -2, republika: -2, aliancia: 1, slovensko: -1 } },
      { label: "Zachovať súčasný stav", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 1, "hlas-sd": 1, "smer-sd": 0, sns: -1, republika: -1, aliancia: 0, slovensko: 0 } },
      { label: "Menej právomocí pre EÚ", weights: { ps: -2, demokrati: -1, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": 1, sns: 2, republika: 2, aliancia: -1, slovensko: 1 } },
    ],
  },
  {
    id: 2,
    text: "Ako by sa malo Slovensko postaviť k vojne na Ukrajine?",
    answers: [
      { label: "Aktívna podpora Ukrajiny", weights: { ps: 2, demokrati: 2, sas: 1, kdh: 1, "hlas-sd": -1, "smer-sd": -2, sns: -2, republika: -2, aliancia: 1, slovensko: -1 } },
      { label: "Humanitárna pomoc, nie vojenskú", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 1, "hlas-sd": 1, "smer-sd": 0, sns: 0, republika: -1, aliancia: 0, slovensko: 1 } },
      { label: "Neutralita a mierové rokovania", weights: { ps: -2, demokrati: -1, sas: -1, kdh: 0, "hlas-sd": 1, "smer-sd": 2, sns: 1, republika: 1, aliancia: -1, slovensko: 0 } },
    ],
  },
  {
    id: 3,
    text: "Aká by mala byť daňová politika?",
    answers: [
      { label: "Nižšie dane, menší štát", weights: { ps: 0, demokrati: 1, sas: 2, kdh: 0.5, "hlas-sd": -1, "smer-sd": -1, sns: 0, republika: 0, aliancia: 0, slovensko: 0 } },
      { label: "Progresívne zdanenie", weights: { ps: 2, demokrati: 0, sas: -2, kdh: 0, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: -1, aliancia: 0, slovensko: 1 } },
      { label: "Zachovať súčasný systém", weights: { ps: 0, demokrati: 0, sas: -1, kdh: 1, "hlas-sd": 0, "smer-sd": 0, sns: 1, republika: 0, aliancia: 0, slovensko: 0 } },
    ],
  },
  {
    id: 4,
    text: "Ako pristupovať k téme migrácie?",
    answers: [
      { label: "Otvorenosť a integrácia", weights: { ps: 2, demokrati: 1, sas: 0, kdh: -1, "hlas-sd": -1, "smer-sd": -2, sns: -2, republika: -2, aliancia: 1, slovensko: -1 } },
      { label: "Regulovaná migrácia", weights: { ps: 0, demokrati: 0, sas: 1, kdh: 1, "hlas-sd": 1, "smer-sd": 0, sns: 0, republika: -1, aliancia: 0, slovensko: 0 } },
      { label: "Prísna ochrana hraníc", weights: { ps: -2, demokrati: -1, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": 1, sns: 2, republika: 2, aliancia: -1, slovensko: 1 } },
    ],
  },
  {
    id: 5,
    text: "Čo je dôležitejšie v školstve?",
    answers: [
      { label: "Modernizácia a digitalizácia", weights: { ps: 2, demokrati: 1, sas: 1, kdh: 0, "hlas-sd": 0.5, "smer-sd": 0, sns: -1, republika: 0, aliancia: 1, slovensko: 0 } },
      { label: "Vyššie platy učiteľov", weights: { ps: 1, demokrati: 0, sas: 0, kdh: 2, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: 0, aliancia: 1, slovensko: 1 } },
      { label: "Tradičné hodnoty v učebných osnovách", weights: { ps: -2, demokrati: -1, sas: -1, kdh: 2, "hlas-sd": 0, "smer-sd": 1, sns: 2, republika: 1, aliancia: -1, slovensko: 0 } },
    ],
  },
  {
    id: 6,
    text: "Aký je váš postoj k právam LGBTQ+ komunity?",
    answers: [
      { label: "Plná rovnoprávnosť vrátane manželstiev", weights: { ps: 2, demokrati: 1, sas: 1, kdh: -2, "hlas-sd": -1, "smer-sd": -1, sns: -2, republika: -2, aliancia: 0, slovensko: -1 } },
      { label: "Registrované partnerstvá", weights: { ps: 1, demokrati: 1, sas: 1, kdh: -1, "hlas-sd": 0, "smer-sd": 0, sns: -1, republika: -1, aliancia: 0, slovensko: 0 } },
      { label: "Zachovať tradičnú definíciu rodiny", weights: { ps: -2, demokrati: -1, sas: -1, kdh: 2, "hlas-sd": 1, "smer-sd": 1, sns: 2, republika: 2, aliancia: 0, slovensko: 1 } },
    ],
  },
  {
    id: 7,
    text: "Ako riešiť zdravotníctvo?",
    answers: [
      { label: "Väčší podiel súkromného sektora", weights: { ps: 0, demokrati: 1, sas: 2, kdh: 0, "hlas-sd": -1, "smer-sd": -1, sns: 0, republika: 0, aliancia: 0, slovensko: 0 } },
      { label: "Posilnenie štátnych nemocníc", weights: { ps: 1, demokrati: 0, sas: -1, kdh: 1, "hlas-sd": 2, "smer-sd": 1, sns: 1, republika: 0, aliancia: 1, slovensko: 1 } },
      { label: "Kombinácia oboch prístupov", weights: { ps: 1, demokrati: 0.5, sas: 0, kdh: 0.5, "hlas-sd": 0, "smer-sd": 0, sns: 0, republika: 0, aliancia: 0, slovensko: 0 } },
    ],
  },
  {
    id: 8,
    text: "Aký by mal byť vzťah štátu a cirkvi?",
    answers: [
      { label: "Striktná sekularizácia", weights: { ps: 2, demokrati: 0.5, sas: 1, kdh: -2, "hlas-sd": -1, "smer-sd": 0, sns: -1, republika: -1, aliancia: 0, slovensko: -1 } },
      { label: "Zachovať súčasný stav", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 1, "hlas-sd": 1, "smer-sd": 0.5, sns: 0.5, republika: 0, aliancia: 0, slovensko: 0 } },
      { label: "Posilniť úlohu kresťanských hodnôt", weights: { ps: -2, demokrati: -1, sas: -1, kdh: 2, "hlas-sd": 0, "smer-sd": 0.5, sns: 1, republika: 1, aliancia: 0, slovensko: 1 } },
    ],
  },
  {
    id: 9,
    text: "Ako pristupovať k životnému prostrediu?",
    answers: [
      { label: "Ambiciózne klimatické ciele", weights: { ps: 2, demokrati: 1, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": -1, sns: -2, republika: -1, aliancia: 1, slovensko: 0 } },
      { label: "Rovnováha medzi ekológiou a ekonomikou", weights: { ps: 0, demokrati: 0, sas: 1, kdh: 1, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: 0, aliancia: 0, slovensko: 0 } },
      { label: "Ekonomika je priorita", weights: { ps: -2, demokrati: -1, sas: 1, kdh: 0, "hlas-sd": 0, "smer-sd": 1, sns: 1, republika: 1, aliancia: 0, slovensko: 1 } },
    ],
  },
  {
    id: 10,
    text: "Aký je váš postoj k NATO?",
    answers: [
      { label: "Aktívne členstvo a plnenie záväzkov", weights: { ps: 2, demokrati: 2, sas: 1, kdh: 1, "hlas-sd": 0, "smer-sd": -1, sns: -2, republika: -2, aliancia: 1, slovensko: -1 } },
      { label: "Členstvo áno, ale bez vojenských misií", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 0, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: -1, aliancia: 0, slovensko: 0 } },
      { label: "Prehodnotiť členstvo", weights: { ps: -2, demokrati: -2, sas: -1, kdh: -1, "hlas-sd": -1, "smer-sd": 0, sns: 1, republika: 2, aliancia: -1, slovensko: 1 } },
    ],
  },
  {
    id: 11,
    text: "Čo je najdôležitejšie pre ekonomický rast?",
    answers: [
      { label: "Inovácie a digitálna ekonomika", weights: { ps: 2, demokrati: 1, sas: 1, kdh: 0, "hlas-sd": 0, "smer-sd": 0, sns: -1, republika: 0, aliancia: 0, slovensko: 0 } },
      { label: "Priemysel a výroba", weights: { ps: -1, demokrati: 0, sas: 0, kdh: 0.5, "hlas-sd": 1, "smer-sd": 2, sns: 1, republika: 1, aliancia: 0, slovensko: 1 } },
      { label: "Malé a stredné podnikanie", weights: { ps: 0, demokrati: 1, sas: 2, kdh: 1, "hlas-sd": 0, "smer-sd": 0, sns: 0, republika: 0, aliancia: 1, slovensko: 1 } },
    ],
  },
  {
    id: 12,
    text: "Ako by sa mal riešiť problém korupcie?",
    answers: [
      { label: "Nezávislé inštitúcie a transparentnosť", weights: { ps: 2, demokrati: 2, sas: 1, kdh: 1, "hlas-sd": 0, "smer-sd": -2, sns: -1, republika: 0, aliancia: 1, slovensko: 1 } },
      { label: "Prísnejšie tresty", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 1, "hlas-sd": 1, "smer-sd": 0, sns: 1, republika: 2, aliancia: 0, slovensko: 1 } },
      { label: "Reforma justície zhora", weights: { ps: -1, demokrati: -1, sas: 0, kdh: 0, "hlas-sd": 1, "smer-sd": 2, sns: 0, republika: 0, aliancia: -1, slovensko: -1 } },
    ],
  },
  {
    id: 13,
    text: "Aký by mal byť dôchodkový systém?",
    answers: [
      { label: "Posilnenie druhého piliera", weights: { ps: 1, demokrati: 1, sas: 2, kdh: 0, "hlas-sd": -1, "smer-sd": -1, sns: 0, republika: 0, aliancia: 0, slovensko: -1 } },
      { label: "Vyššie štátne dôchodky", weights: { ps: 0, demokrati: -1, sas: -2, kdh: 1, "hlas-sd": 2, "smer-sd": 2, sns: 1, republika: 1, aliancia: 0, slovensko: 1 } },
      { label: "Flexibilný vek odchodu do dôchodku", weights: { ps: 1, demokrati: 0, sas: 1, kdh: 0, "hlas-sd": 0, "smer-sd": 0, sns: 0, republika: 0, aliancia: 0, slovensko: 0 } },
    ],
  },
  {
    id: 14,
    text: "Ako pristupovať k médiám a slobode tlače?",
    answers: [
      { label: "Posilniť nezávislosť médií", weights: { ps: 2, demokrati: 2, sas: 1, kdh: 0.5, "hlas-sd": 0, "smer-sd": -2, sns: -1, republika: -1, aliancia: 1, slovensko: 0 } },
      { label: "Regulácia dezinformácií", weights: { ps: 1, demokrati: 0, sas: -1, kdh: 0, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: -1, aliancia: 0, slovensko: 0 } },
      { label: "Menej regulácie", weights: { ps: -1, demokrati: 0, sas: 2, kdh: 0, "hlas-sd": -1, "smer-sd": 0, sns: 1, republika: 2, aliancia: 0, slovensko: 1 } },
    ],
  },
  {
    id: 15,
    text: "Aká by mala byť bytová politika?",
    answers: [
      { label: "Štátna výstavba nájomných bytov", weights: { ps: 1, demokrati: 0, sas: -1, kdh: 0.5, "hlas-sd": 2, "smer-sd": 1, sns: 0.5, republika: 0, aliancia: 1, slovensko: 1 } },
      { label: "Deregulácia a podpora súkromnej výstavby", weights: { ps: 0, demokrati: 1, sas: 2, kdh: 0, "hlas-sd": -1, "smer-sd": 0, sns: 0, republika: 0, aliancia: 0, slovensko: 0 } },
      { label: "Zvýhodné hypotéky pre mladých", weights: { ps: 1, demokrati: 0, sas: 0, kdh: 1, "hlas-sd": 1, "smer-sd": 1, sns: 1, republika: 1, aliancia: 0, slovensko: 2 } },
    ],
  },
  {
    id: 16,
    text: "Ako riešiť rómsku otázku?",
    answers: [
      { label: "Inkluzívne programy a vzdelávanie", weights: { ps: 2, demokrati: 1, sas: 0, kdh: 1, "hlas-sd": 0, "smer-sd": -1, sns: -2, republika: -2, aliancia: 1, slovensko: 0 } },
      { label: "Pracovné príležitosti a infraštruktúra", weights: { ps: 0, demokrati: 0, sas: 1, kdh: 0, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: 0, aliancia: 1, slovensko: 0 } },
      { label: "Prísnejší prístup a podmienenie dávok", weights: { ps: -2, demokrati: -1, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": 1, sns: 2, republika: 2, aliancia: -1, slovensko: 1 } },
    ],
  },
  {
    id: 17,
    text: "Ako by mal vyzerať vzťah s Ruskom?",
    answers: [
      { label: "Tvrdé sankcie a izolácia", weights: { ps: 2, demokrati: 2, sas: 1, kdh: 1, "hlas-sd": -1, "smer-sd": -2, sns: -2, republika: -1, aliancia: 1, slovensko: -1 } },
      { label: "Pragmatický prístup", weights: { ps: -1, demokrati: 0, sas: 0, kdh: 0, "hlas-sd": 1, "smer-sd": 1, sns: 0, republika: 0, aliancia: 0, slovensko: 0 } },
      { label: "Obnovenie dialógu", weights: { ps: -2, demokrati: -2, sas: -1, kdh: -1, "hlas-sd": 1, "smer-sd": 2, sns: 2, republika: 1, aliancia: -1, slovensko: 1 } },
    ],
  },
  {
    id: 18,
    text: "Čo s verejnoprávnymi médiami (RTVS)?",
    answers: [
      { label: "Posilniť nezávislosť", weights: { ps: 2, demokrati: 1, sas: 0, kdh: 0, "hlas-sd": -1, "smer-sd": -2, sns: -1, republika: 0, aliancia: 1, slovensko: 0 } },
      { label: "Reformovať na moderné médium", weights: { ps: 1, demokrati: 1, sas: 1, kdh: 0, "hlas-sd": 0, "smer-sd": 0, sns: 0, republika: 0, aliancia: 0, slovensko: 0 } },
      { label: "Zrušiť koncesionárske poplatky", weights: { ps: -1, demokrati: 0, sas: 2, kdh: 0, "hlas-sd": 0, "smer-sd": 0, sns: 1, republika: 1, aliancia: 0, slovensko: 1 } },
    ],
  },
  {
    id: 19,
    text: "Ako pristupovať k maďarskej menšine?",
    answers: [
      { label: "Plná podpora menšinových práv", weights: { ps: 1, demokrati: 0.5, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": -1, sns: -2, republika: -1, aliancia: 2, slovensko: 0 } },
      { label: "Zachovať súčasný stav", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": 0, sns: 0, republika: 0, aliancia: 0, slovensko: 0 } },
      { label: "Jeden národ, jeden jazyk", weights: { ps: -1, demokrati: -1, sas: 0, kdh: 0, "hlas-sd": 0, "smer-sd": 1, sns: 2, republika: 1, aliancia: -2, slovensko: 0 } },
    ],
  },
  {
    id: 20,
    text: "Aká je vaša priorita pre ďalšie volebné obdobie?",
    answers: [
      { label: "Právny štát a demokracia", weights: { ps: 2, demokrati: 2, sas: 1, kdh: 1, "hlas-sd": 0, "smer-sd": -1, sns: -1, republika: -1, aliancia: 1, slovensko: 0 } },
      { label: "Ekonomická stabilita a sociálne istoty", weights: { ps: 0, demokrati: 0, sas: 0, kdh: 0, "hlas-sd": 2, "smer-sd": 2, sns: 1, republika: 0, aliancia: 0, slovensko: 1 } },
      { label: "Národná suverenita a tradičné hodnoty", weights: { ps: -2, demokrati: -1, sas: 0, kdh: 1, "hlas-sd": 0, "smer-sd": 1, sns: 2, republika: 2, aliancia: -1, slovensko: 0 } },
    ],
  },
];
