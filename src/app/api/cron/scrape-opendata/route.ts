import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  scrapeRpvsCompanies,
  scrapePublicContracts,
  getKnownDonations,
} from "@/lib/scraper/opendata";
import {
  upsertCompanies,
  upsertContracts,
  upsertDonations,
} from "@/lib/db/opendata";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    // Companies from RPVS OpenData
    const companyItems = await scrapeRpvsCompanies(500);
    const companyCount = await upsertCompanies(db, companyItems);

    // Public contracts from CRZ
    const contractItems = await scrapePublicContracts(500);
    const contractCount = await upsertContracts(db, contractItems);

    // Known donations (static seed from public reports)
    const donationItems = getKnownDonations();
    const donationCount = await upsertDonations(db, donationItems);

    return NextResponse.json({
      ok: true,
      companies: { scraped: companyItems.length, upserted: companyCount },
      contracts: { scraped: contractItems.length, upserted: contractCount },
      donations: { seeded: donationItems.length, inserted: donationCount },
    });
  } catch (error) {
    console.error("[cron] scrape-opendata error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
