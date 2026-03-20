export interface NewsItem {
  id: number;
  title: string;
  url: string;
  source: "Aktuality" | "Denník N" | "SME";
  publishedAt: string;
  scrapedAt: string;
  category?: string;
}
