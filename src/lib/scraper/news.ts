import * as cheerio from "cheerio";

export interface ScrapedNewsItem {
  title: string;
  url: string;
  source: "Aktuality" | "Denník N" | "SME";
  publishedAt: string;
}

const POLITICAL_KEYWORDS = [
  // topics
  "prieskum",
  "voľb",
  "parlament",
  "vláda",
  "koalíci",
  "opozíci",
  "strana",
  "predseda",
  "minister",
  "hlasovanie",
  "poslanc",
  "politik",
  "zákon",
  "novela",
  "rezort",
  "premiér",
  "prezident",
  "ústavný",
  "referendum",
  "eurovoľb",
  "európsk",
  "rozpočet",
  "kandidát",
  "kampaň",
  "mandát",
  "nrsr",
  // parties
  "smer",
  "hlas",
  "progresívne",
  "sns",
  "kdh",
  "sas",
  "republika",
  "demokrati",
  "slovensko",
  // politicians
  "fico",
  "šimečka",
  "danko",
  "pellegrini",
  "matovič",
  "sulik",
  "šutaj eštok",
  "kaliňák",
  "saková",
  "blanár",
  "šeliga",
  "remišová",
  "čaputová",
  "krajniak",
  "hlina",
];

function isPolitical(title: string): boolean {
  const lower = title.toLowerCase();
  return POLITICAL_KEYWORDS.some((keyword) => lower.includes(keyword));
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; ProgressiveTracker/1.0; +https://progressive-tracker.sk)";

function formatDate(date: Date): string {
  const months = [
    "január", "február", "marec", "apríl", "máj", "jún",
    "júl", "august", "september", "október", "november", "december",
  ];
  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Extract link from RSS item.
 * RSS <link> can be text content or in some feeds the URL is between <link> and </link>
 * but cheerio XML mode sometimes returns empty for self-closing tags.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractLink($item: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string {
  // Try <link> text first
  const linkText = $item.find("link").first().text().trim();
  if (linkText) return linkText;

  // Fallback: get raw XML and extract link with regex
  const itemXml = $.xml($item);
  const match = itemXml.match(/<link[^>]*>([^<]+)<\/link>/);
  if (match) return match[1].trim();

  // Try <guid> as last resort
  const guid = $item.find("guid").first().text().trim();
  if (guid?.startsWith("http")) return guid;

  return "";
}

/** Parse RSS XML and extract items — political first, then general as fallback */
function parseRssItems(
  xml: string,
  source: ScrapedNewsItem["source"],
  limit: number
): ScrapedNewsItem[] {
  const $ = cheerio.load(xml, { xml: true });
  const items: ScrapedNewsItem[] = [];

  $("item").each((_, el) => {
    if (items.length >= limit) return false;

    const $item = $(el);
    const title = $item.find("title").first().text().trim();
    const link = extractLink($item, $);
    const pubDate = $item.find("pubDate").first().text().trim();

    if (!title || !link) return;
    if (!isPolitical(title)) return;

    const date = pubDate ? new Date(pubDate) : new Date();
    items.push({
      title,
      url: link,
      source,
      publishedAt: formatDate(date),
    });
  });

  return items;
}

/** Scrape Aktuality.sk via RSS */
async function scrapeAktuality(): Promise<ScrapedNewsItem[]> {
  const res = await fetch("https://www.aktuality.sk/rss/", {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseRssItems(xml, "Aktuality", 4);
}

/** Scrape Denník N via RSS */
async function scrapeDennikN(): Promise<ScrapedNewsItem[]> {
  const res = await fetch("https://dennikn.sk/feed/", {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseRssItems(xml, "Denník N", 4);
}

/** Scrape SME.sk politics section via HTML */
async function scrapeSme(): Promise<ScrapedNewsItem[]> {
  const res = await fetch("https://domov.sme.sk/", {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return [];

  const html = await res.text();
  const $ = cheerio.load(html);
  const items: ScrapedNewsItem[] = [];

  $("article a[href], h2 a[href], h3 a[href]").each((_, el) => {
    if (items.length >= 4) return false;

    const $el = $(el);
    const title = $el.text().trim();
    let href = $el.attr("href") ?? "";

    if (!title || title.length < 15) return;
    if (href.startsWith("/")) href = "https://www.sme.sk" + href;
    if (!href.startsWith("http")) return;
    if (!isPolitical(title)) return;

    items.push({
      title,
      url: href,
      source: "SME",
      publishedAt: formatDate(new Date()),
    });
  });

  return items;
}

export async function scrapeNews(): Promise<ScrapedNewsItem[]> {
  const results = await Promise.allSettled([
    scrapeAktuality(),
    scrapeDennikN(),
    scrapeSme(),
  ]);

  const allItems: ScrapedNewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // Deduplicate by title
  const seen = new Set<string>();
  const unique = allItems.filter((item) => {
    const key = item.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, 12);
}
