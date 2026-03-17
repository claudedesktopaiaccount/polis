#!/usr/bin/env node
/**
 * Downloads politician portrait images from Wikipedia (CC-licensed).
 * Uses the Wikipedia API to find the main image for each politician.
 */

import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const PORTRAITS_DIR = path.resolve("public/portraits");

const POLITICIANS = [
  { file: "ps-simecka.webp", wiki: "Michal_Šimečka" },
  { file: "smer-fico.webp", wiki: "Robert_Fico" },
  { file: "hlas-sutaj-estok.webp", wiki: "Matúš_Šutaj_Eštok" },
  { file: "republika-uhrik.webp", wiki: "Milan_Uhrík" },
  { file: "sas-grohling.webp", wiki: "Branislav_Gröhling" },
  { file: "kdh-majersky.webp", wiki: "Milan_Majerský" },
  { file: "sns-danko.webp", wiki: "Andrej_Danko" },
  { file: "demokrati-nad.webp", wiki: "Jaroslav_Naď" },
  { file: "aliancia-gubik.webp", wiki: "Gubík_László" },
  { file: "slovensko-matovic.webp", wiki: "Igor_Matovič" },
];

async function getWikiImageUrl(wikiTitle) {
  // Use Wikipedia API to get the page's main image (pageimages prop)
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
  const resp = await fetch(url);
  const data = await resp.json();
  const pages = data.query.pages;
  const page = Object.values(pages)[0];

  if (page?.thumbnail?.source) {
    return page.thumbnail.source;
  }

  // Try Slovak Wikipedia
  const skUrl = `https://sk.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
  const skResp = await fetch(skUrl);
  const skData = await skResp.json();
  const skPages = skData.query.pages;
  const skPage = Object.values(skPages)[0];

  return skPage?.thumbnail?.source ?? null;
}

async function downloadImage(imageUrl, filename) {
  const resp = await fetch(imageUrl);
  if (!resp.ok) throw new Error(`Failed to download: ${resp.status}`);

  const buffer = await resp.arrayBuffer();
  const outPath = path.join(PORTRAITS_DIR, filename);

  // Save as original format (we'll keep the .webp extension but it might be jpg/png)
  // Next.js Image component handles format differences fine
  await writeFile(outPath, Buffer.from(buffer));
  return outPath;
}

async function main() {
  if (!existsSync(PORTRAITS_DIR)) {
    await mkdir(PORTRAITS_DIR, { recursive: true });
  }

  console.log("Downloading politician portraits from Wikipedia...\n");

  for (const pol of POLITICIANS) {
    const outPath = path.join(PORTRAITS_DIR, pol.file);
    if (existsSync(outPath)) {
      console.log(`✓ ${pol.file} already exists, skipping`);
      continue;
    }

    try {
      console.log(`  Fetching image URL for ${pol.wiki}...`);
      const imageUrl = await getWikiImageUrl(pol.wiki);

      if (!imageUrl) {
        console.log(`✗ ${pol.file}: No image found on Wikipedia for "${pol.wiki}"`);
        continue;
      }

      console.log(`  Downloading ${pol.file}...`);
      await downloadImage(imageUrl, pol.file);
      console.log(`✓ ${pol.file} saved`);
    } catch (err) {
      console.error(`✗ ${pol.file}: ${err.message}`);
    }
  }

  console.log("\nDone! Portraits saved to public/portraits/");
}

main();
