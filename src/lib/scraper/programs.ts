import * as cheerio from "cheerio";

export interface ProgramSection {
  heading: string;
  text: string;
}

export interface ScrapedProgram {
  partyId: string;
  sourceUrl: string;
  sourceDate: string;
  title: string;
  fullText: string;
  sections: ProgramSection[];
}

type Fetcher = (url: string) => Promise<string>;

const PARTY_PROGRAMS = [
  { partyId: "smer", url: "https://www.strana-smer.sk/program/", date: "2023-09-30" },
  { partyId: "ps", url: "https://www.progresivneslovensko.sk/program/", date: "2023-09-30" },
  { partyId: "hlas", url: "https://www.hlas-sd.sk/program", date: "2023-09-30" },
  { partyId: "sns", url: "https://www.sns.sk/program/", date: "2023-09-30" },
  { partyId: "kdh", url: "https://www.kdh.sk/program/", date: "2023-09-30" },
  { partyId: "republika", url: "https://www.republika.sk/program/", date: "2023-09-30" },
];

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (compatible; Polis/1.0; +https://polis.sk)";

async function defaultFetcher(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": DEFAULT_USER_AGENT },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractSections(html: string): { sections: ProgramSection[]; fullText: string } {
  const $ = cheerio.load(html);

  // Strip nav/chrome
  $("nav, header, footer, script, style, .menu, .nav").remove();

  // Find main content container
  let $content = $("main").first();
  if (!$content.length) $content = $("article").first();
  if (!$content.length) $content = $(".program").first();
  if (!$content.length) $content = $("#program").first();
  if (!$content.length) $content = $(".content").first();
  if (!$content.length) $content = $("body");

  const sections: ProgramSection[] = [];

  // Extract h2/h3 → following paragraphs
  $content.find("h2, h3").each((_, heading) => {
    const $heading = $(heading);
    const headingText = $heading.text().trim();
    if (!headingText) return;

    const paragraphs: string[] = [];
    let $next = $heading.next();
    while ($next.length) {
      const tag = $next[0].tagName?.toLowerCase();
      if (tag === "h2" || tag === "h3") break;
      const txt = $next.text().trim();
      if (txt) paragraphs.push(txt);
      $next = $next.next();
    }

    if (paragraphs.length > 0) {
      sections.push({ heading: headingText, text: paragraphs.join("\n\n") });
    }
  });

  // If no sections found via headings, grab all paragraph text
  if (sections.length === 0) {
    const paras: string[] = [];
    $content.find("p").each((_, el) => {
      const t = $(el).text().trim();
      if (t) paras.push(t);
    });
    if (paras.length > 0) {
      sections.push({ heading: "", text: paras.join("\n\n") });
    }
  }

  const fullText = sections.map((s) => s.text).join("\n\n");
  return { sections, fullText };
}

export async function scrapePartyPrograms(fetcher?: Fetcher): Promise<ScrapedProgram[]> {
  const fetch_ = fetcher ?? defaultFetcher;
  const results: ScrapedProgram[] = [];

  for (const party of PARTY_PROGRAMS) {
    try {
      const html = await fetch_(party.url);
      const { sections, fullText } = extractSections(html);

      if (fullText.length < 200) {
        console.warn(`[programs] ${party.partyId}: content too short (${fullText.length} chars), skipping`);
        continue;
      }

      // Use first h1 as title, fallback to partyId
      const $ = cheerio.load(html);
      const title = $("h1").first().text().trim() || `Program strany ${party.partyId.toUpperCase()}`;

      results.push({
        partyId: party.partyId,
        sourceUrl: party.url,
        sourceDate: party.date,
        title,
        fullText,
        sections,
      });
    } catch (err) {
      console.error(`[programs] failed to scrape ${party.partyId}:`, err);
    }
  }

  return results;
}
