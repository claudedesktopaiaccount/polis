export interface NewsItem {
  id: number;
  title: string;
  url: string;
  source: "SME" | "TASR" | "Pravda";
  publishedAt: string;
  scrapedAt: string;
  category?: string;
}
