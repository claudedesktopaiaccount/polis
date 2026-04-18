/**
 * Scrape MP portraits from nrsr.sk and save to /public/portraits/.
 * Naming: nrsr-{slugifiedName}.jpg
 * Run: npx tsx scripts/scrape-portraits.ts
 * Requires: cheerio (already installed)
 */

import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";

const PORTRAITS_DIR = path.join(process.cwd(), "public", "portraits");
const NRSR_BASE = "https://www.nrsr.sk";
const LIST_URL = `${NRSR_BASE}/web/default.aspx?sid=poslanci/zoznam_poslancov&ListType=0`;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function downloadImage(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return false;
    const buf = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buf));
    return true;
  } catch {
    return false;
  }
}

async function scrape() {
  if (!fs.existsSync(PORTRAITS_DIR)) fs.mkdirSync(PORTRAITS_DIR, { recursive: true });

  const res = await fetch(LIST_URL, {
    headers: { "User-Agent": "Polis/1.0 (educational project)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`nrsr.sk returned ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const rows = $("table.members-table tr, .poslanci-list .poslanec-row, tr:has(img[src*='foto'])");

  let saved = 0;
  let skipped = 0;

  rows.each((_, row) => {
    const $row = $(row);
    const nameEl = $row.find("a[href*='poslanec'], .poslanec-name, td:nth-child(2) a").first();
    const imgEl  = $row.find("img[src*='foto'], img[src*='photo'], img[src*='poslanec']").first();

    const name = nameEl.text().trim();
    let imgSrc = imgEl.attr("src") ?? "";

    if (!name || !imgSrc) return;
    if (!imgSrc.startsWith("http")) imgSrc = NRSR_BASE + imgSrc;

    const slug = slugify(name);
    const dest = path.join(PORTRAITS_DIR, `nrsr-${slug}.jpg`);

    if (fs.existsSync(dest)) { skipped++; return; }

    downloadImage(imgSrc, dest).then((ok) => {
      if (ok) { saved++; console.log(`✓ ${name}`); }
      else      console.warn(`✗ ${name} — download failed`);
    });
  });

  console.log(`\nDone. Saved: ${saved}, Skipped (already existed): ${skipped}`);
  console.log(`\nNext step: match nrsr-*.jpg files to candidates and rename to`);
  console.log(`{partyId}-{slugifiedName}.jpg, then update portrait_url in DB.`);
}

scrape().catch((err) => { console.error(err); process.exit(1); });
