import type { Database } from "./index";
import { companies, contracts, donations } from "./schema";
import type {
  ScrapedCompany,
  ScrapedContract,
  ScrapedDonation,
} from "@/lib/scraper/opendata";

const CHUNK = 50;

function chunks<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// ─── Companies ────────────────────────────────────────────

/**
 * Upsert companies by ICO (unique key).
 * Returns count of rows inserted/updated.
 */
export async function upsertCompanies(
  db: Database,
  items: ScrapedCompany[]
): Promise<number> {
  if (!items.length) return 0;
  let count = 0;

  for (const batch of chunks(items, CHUNK)) {
    const values = batch.map((c) => ({
      ico: c.ico,
      name: c.name,
      legalForm: c.legalForm ?? null,
      rpvsUboUrl: c.rpvsUboUrl ?? null,
      finstatUrl: null,
      foundedDate: null,
      sector: null,
      addressSk: c.addressSk ?? null,
    }));

    const result = await db
      .insert(companies)
      .values(values)
      .onConflictDoUpdate({
        target: companies.ico,
        set: {
          name: companies.name,
          legalForm: companies.legalForm,
          rpvsUboUrl: companies.rpvsUboUrl,
          addressSk: companies.addressSk,
        },
      })
      .returning({ id: companies.id });

    count += result.length;
  }

  return count;
}

// ─── Contracts ────────────────────────────────────────────

/**
 * Insert contracts. Uses onConflictDoNothing — no reliable unique key.
 * Returns count of rows inserted.
 */
export async function upsertContracts(
  db: Database,
  items: ScrapedContract[]
): Promise<number> {
  if (!items.length) return 0;
  let count = 0;

  for (const batch of chunks(items, CHUNK)) {
    const values = batch.map((c) => ({
      contractNumber: c.contractNumber ?? null,
      titleSk: c.titleSk,
      contractingAuthority: c.contractingAuthority,
      supplierIco: c.supplierIco,
      supplierName: c.supplierName,
      amountEur: c.amountEur,
      signedDate: c.signedDate,
      cpvCode: c.cpvCode ?? null,
      sourceUrl: c.sourceUrl,
      linkedPoliticianId: null,
    }));

    const result = await db
      .insert(contracts)
      .values(values)
      .onConflictDoNothing()
      .returning({ id: contracts.id });

    count += result.length;
  }

  return count;
}

// ─── Donations ────────────────────────────────────────────

/**
 * Insert donations. Uses onConflictDoNothing — no unique constraint.
 * Returns count of rows inserted.
 */
export async function upsertDonations(
  db: Database,
  items: ScrapedDonation[]
): Promise<number> {
  if (!items.length) return 0;
  let count = 0;

  for (const batch of chunks(items, CHUNK)) {
    const values = batch.map((d) => ({
      partyId: d.partyId,
      donorName: d.donorName,
      donorIco: d.donorIco ?? null,
      amountEur: d.amountEur,
      donationDate: d.donationDate,
      sourceUrl: d.sourceUrl,
    }));

    const result = await db
      .insert(donations)
      .values(values)
      .onConflictDoNothing()
      .returning({ id: donations.id });

    count += result.length;
  }

  return count;
}
