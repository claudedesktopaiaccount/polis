import * as cheerio from "cheerio";

interface ScrapedNewsItem {
  title: string;
  url: string;
  source: "SME" | "TASR" | "Pravda";
  publishedAt: string;
}

const SOURCES = [
  {
    name: "SME" as const,
    url: "https://www.sme.sk/t/4905/politika",
    baseUrl: "https://www.sme.sk",
    selector: "article h2 a, .article-title a, h3.article-title a",
  },
  {
    name: "TASR" as const,
    url: "https://www.tasr.sk/slovensko",
    baseUrl: "https://www.tasr.sk",
    selector: "article h2 a, .article-title a, h3 a",
  },
  {
    name: "Pravda" as const,
    url: "https://spravy.pravda.sk/domace/",
    baseUrl: "https://spravy.pravda.sk",
    selector: "article h2 a, .article-title a, h3 a",
  },
];

const POLITICAL_KEYWORDS = [
  "prieskum",
  "voľb",
  "parlament",
  "vláda",
  "koalíci",
  "opozíci",
  "strana",
  "fico",
  "šimečka",
  "danko",
  "pellegrini",
  "matovič",
  "predseda",
  "minister",
  "hlasovanie",
  "poslanc",
  "smer",
  "hlas",
  "progresívne",
  "sns",
  "kdh",
  "sas",
  "republika",
  "demokrati",
];

function isPolitical(title: string): boolean {
  const lower = title.toLowerCase();
  return POLITICAL_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export async function scrapeNews(): Promise<ScrapedNewsItem[]> {
  const allItems: ScrapedNewsItem[] = [];
  const now = new Date().toISOString();

  const results = await Promise.allSettled(
    SOURCES.map(async (source) => {
      const response = await fetch(source.url, {
        headers: { "User-Agent": "ProgressiveTracker/1.0 (poll-aggregator)" },
      });
      if (!response.ok) return [];

      const html = await response.text();
      const $ = cheerio.load(html);
      const items: ScrapedNewsItem[] = [];

      $(source.selector).each((_, el) => {
        const $el = $(el);
        const title = $el.text().trim();
        let href = $el.attr("href") ?? "";

        if (!title || !isPolitical(title)) return;
        if (href.startsWith("/")) href = source.baseUrl + href;
        if (!href.startsWith("http")) return;

        items.push({
          title,
          url: href,
          source: source.name,
          publishedAt: now,
        });
      });

      return items.slice(0, 10); // Limit per source
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  return allItems;
}

export { type ScrapedNewsItem };
