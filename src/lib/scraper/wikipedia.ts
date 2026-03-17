import * as cheerio from "cheerio";

const WIKI_URL =
  "https://en.wikipedia.org/wiki/Opinion_polling_for_the_next_Slovak_parliamentary_election";

/**
 * Mapping from Wikipedia header text (lowercased) → our internal party IDs.
 * Keep in sync with src/lib/parties.ts
 */
const HEADER_TO_PARTY: Record<string, string> = {
  // Direct abbreviations
  smer: "smer-sd",
  "smer-sd": "smer-sd",
  "smer–sd": "smer-sd",
  ps: "ps",
  hlas: "hlas-sd",
  "hlas-sd": "hlas-sd",
  "hlas–sd": "hlas-sd",
  kdh: "kdh",
  sas: "sas",
  sns: "sns",
  republika: "republika",
  rep: "republika",
  dem: "demokrati",
  // Full names from English Wikipedia
  "progressive slovakia": "ps",
  democrats: "demokrati",
  "hungarian alliance": "aliancia",
  slovakia: "slovensko",
  // OĽaNO rebranded to Slovakia
  "oľano and friends": "slovensko",
  "oľano": "slovensko",
};

export interface RawPollRow {
  agency: string;
  publishedDate: string; // YYYY-MM-DD
  sampleSize: number | null;
  results: Record<string, number>; // partyId → percentage
}

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04",
  may: "05", jun: "06", jul: "07", aug: "08",
  sep: "09", oct: "10", nov: "11", dec: "12",
};

/**
 * Parse English Wikipedia date: "4-9 Mar 2026" or "28 Feb-3 Mar 2026" → end date
 */
function parseWikiDate(raw: string): string | null {
  const cleaned = raw.trim().replace(/\s+/g, " ").replace(/–/g, "-");

  // Match the LAST day + month + year in the string
  const match = cleaned.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s*$/);
  if (!match) return null;

  const day = match[1].padStart(2, "0");
  const monthKey = match[2].slice(0, 3).toLowerCase();
  const year = match[3];
  const month = MONTHS[monthKey];
  if (!month) return null;

  return `${year}-${month}-${day}`;
}

/**
 * Resolve a header cell text to a party ID.
 */
function resolvePartyId(headerText: string): string | null {
  const cleaned = headerText
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  // Direct match
  if (HEADER_TO_PARTY[cleaned]) return HEADER_TO_PARTY[cleaned];

  // Try partial matches (header contains key or key contains header)
  for (const [key, id] of Object.entries(HEADER_TO_PARTY)) {
    if (cleaned.includes(key) || key.includes(cleaned)) return id;
  }

  return null;
}

/**
 * Parse a percentage value from cell text.
 * Wikipedia uses "16.7" format, leading party is bold, missing = "–"
 */
function parsePercentage(text: string): number | null {
  const cleaned = text.replace(/,/g, ".").replace(/[^0-9.]/g, "").trim();
  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0 || num >= 100) return null;
  return Math.round(num * 10) / 10; // 1 decimal precision
}

/**
 * Scrape the "Voting intention estimates" table from English Wikipedia.
 * Returns polls sorted by date (newest first).
 */
export async function scrapeWikipediaPolls(): Promise<RawPollRow[]> {
  const response = await fetch(WIKI_URL, {
    headers: {
      "User-Agent":
        "ProgressiveTracker/1.0 (Slovak poll aggregator; educational project)",
    },
  });

  if (!response.ok) {
    throw new Error(`Wikipedia fetch failed: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const polls: RawPollRow[] = [];

  // Find the first wikitable — "Voting intention estimates"
  const table = $("table.wikitable").first();
  if (!table.length) {
    throw new Error("Could not find wikitable on page");
  }

  // Build column mapping from header rows.
  // Wikipedia tables may have multi-row headers with colspan/rowspan.
  // We'll look at all header rows and try to identify party columns.
  const columnMap: Map<number, string> = new Map();
  let agencyCol = 0;
  let dateCol = 1;
  let sampleCol = 2;

  // Get all th in the header area
  const allHeaders = table.find("tr").first().find("th");
  allHeaders.each((i, el) => {
    const text = $(el).text().trim();
    const lower = text.toLowerCase();

    if (lower.includes("polling firm") || lower.includes("fieldwork")) {
      agencyCol = i;
    } else if (lower.includes("date")) {
      dateCol = i;
    } else if (lower.includes("sample")) {
      sampleCol = i;
    } else if (lower === "lead" || lower === "others") {
      // Skip non-party columns
    } else {
      const partyId = resolvePartyId(text);
      if (partyId) {
        columnMap.set(i, partyId);
      }
    }
  });

  // If header didn't have enough, try second row too
  if (columnMap.size < 3) {
    const secondRow = table.find("tr").eq(1).find("th, td");
    secondRow.each((i, el) => {
      const text = $(el).text().trim();
      const partyId = resolvePartyId(text);
      if (partyId && !columnMap.has(i)) {
        columnMap.set(i, partyId);
      }
    });
  }

  if (columnMap.size < 3) {
    console.warn(`Only found ${columnMap.size} party columns, expected ≥3`);
  }

  // Parse data rows
  const rows = table.find("tr").slice(1);

  rows.each((_, row) => {
    const cells = $(row).find("td, th");
    if (cells.length < 5) return;

    // Skip sub-header rows (mostly th elements)
    const thCount = $(row).find("th").length;
    if (thCount > cells.length * 0.5) return;

    // Skip rows with colspan (they're usually section dividers)
    const hasColspan = $(row).find("[colspan]").length > 0;
    if (hasColspan) return;

    const agencyText = cells.eq(agencyCol).text().trim();
    const dateText = cells.eq(dateCol).text().trim();
    const sampleText = cells.eq(sampleCol).text().trim();

    if (!agencyText || agencyText === "–" || agencyText === "—") return;

    const publishedDate = parseWikiDate(dateText);
    if (!publishedDate) return;

    // Parse sample size (e.g. "1,003")
    const sampleSize =
      parseInt(sampleText.replace(/[,\s]/g, ""), 10) || null;

    // Parse party percentages
    const results: Record<string, number> = {};
    columnMap.forEach((partyId, colIndex) => {
      const cellText = cells.eq(colIndex).text();
      const pct = parsePercentage(cellText);
      if (pct !== null) {
        results[partyId] = pct;
      }
    });

    // Only add if we got results for at least 3 parties
    if (Object.keys(results).length >= 3) {
      const agency = agencyText
        .replace(/\[.*?\]/g, "")
        .replace(/\(.*?\)/g, "")
        .trim();

      polls.push({ agency, publishedDate, sampleSize, results });
    }
  });

  // Sort newest first
  polls.sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));

  return polls;
}
