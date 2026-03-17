import { PARTIES } from "./parties";

export const MOCK_POLL_DATA = [
  { partyId: "ps", percentage: 24.8, trend: 1.2 },
  { partyId: "smer-sd", percentage: 22.3, trend: -0.5 },
  { partyId: "hlas-sd", percentage: 14.1, trend: 0.3 },
  { partyId: "republika", percentage: 8.7, trend: 1.8 },
  { partyId: "sas", percentage: 6.2, trend: -0.3 },
  { partyId: "kdh", percentage: 5.9, trend: -0.1 },
  { partyId: "sns", percentage: 5.1, trend: 0.4 },
  { partyId: "slovensko", percentage: 4.8, trend: -1.0 },
  { partyId: "demokrati", percentage: 3.5, trend: 0.2 },
  { partyId: "aliancia", percentage: 2.1, trend: 0 },
];

export const MOCK_NEWS = [
  {
    title: "Prieskum Focus: PS si udržiava náskok pred Smerom",
    url: "#",
    source: "SME" as const,
    publishedAt: "15. marec 2026",
  },
  {
    title: "Fico reaguje na nové čísla prieskumov",
    url: "#",
    source: "TASR" as const,
    publishedAt: "14. marec 2026",
  },
  {
    title: "Republika zaznamenáva rast preferencií medzi mladými",
    url: "#",
    source: "Pravda" as const,
    publishedAt: "14. marec 2026",
  },
  {
    title: "KDH a SaS diskutujú o možnej predvolebnej spolupráci",
    url: "#",
    source: "SME" as const,
    publishedAt: "13. marec 2026",
  },
  {
    title: "Šutaj Eštok: Hlas-SD je pripravený na predčasné voľby",
    url: "#",
    source: "TASR" as const,
    publishedAt: "13. marec 2026",
  },
  {
    title: "Analytici: Volebný prah 5% môže prekvapiť viaceré strany",
    url: "#",
    source: "Pravda" as const,
    publishedAt: "12. marec 2026",
  },
];

export function getMockPartyData() {
  return MOCK_POLL_DATA.map((poll) => {
    const party = PARTIES[poll.partyId];
    return {
      ...party,
      ...poll,
    };
  });
}
