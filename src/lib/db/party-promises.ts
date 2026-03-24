import { eq, asc } from "drizzle-orm";
import type { Database } from "./index";
import { partyPromises, parties } from "./schema";

export async function getPromisesForParty(db: Database, partyId: string) {
  return db
    .select()
    .from(partyPromises)
    .where(eq(partyPromises.partyId, partyId))
    .orderBy(asc(partyPromises.category));
}

export async function getAllPartiesWithPromises(db: Database) {
  const rows = await db.select({ id: parties.id, name: parties.name }).from(parties);
  const results = await Promise.all(
    rows.map(async (party) => {
      const promises = await getPromisesForParty(db, party.id);
      return { ...party, promises };
    })
  );
  return results.filter((p) => p.promises.length > 0);
}
