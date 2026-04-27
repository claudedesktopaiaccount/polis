export const CATEGORIES = [
  "Ekonomika",
  "Zdravotníctvo",
  "Školstvo",
  "Bezpečnosť",
  "Zahraničná politika",
  "Sociálne",
  "Životné prostredie",
  "Právny štát",
  "Doprava",
  "Iné",
] as const;

export type Category = (typeof CATEGORIES)[number];
