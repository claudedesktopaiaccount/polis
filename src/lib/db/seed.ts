import { PARTY_LIST } from "@/lib/parties";
import type { Database } from "./index";
import { parties } from "./schema";

/**
 * Seeds the parties table with all tracked Slovak political parties.
 * Safe to run multiple times — uses INSERT OR IGNORE.
 */
export async function seedParties(db: Database) {
  for (const party of PARTY_LIST) {
    await db
      .insert(parties)
      .values({
        id: party.id,
        name: party.name,
        abbreviation: party.abbreviation,
        color: party.color,
        secondaryColor: party.secondaryColor ?? null,
        leader: party.leader,
        ideology: party.ideology,
        seats: party.seats,
        portraitUrl: party.portraitUrl ?? null,
      })
      .onConflictDoNothing();
  }
}
