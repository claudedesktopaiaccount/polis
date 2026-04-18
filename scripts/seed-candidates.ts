/**
 * One-time seed: populate candidates table from known party lists.
 * Run: npx tsx scripts/seed-candidates.ts
 * Requires: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN in env.
 */

const CANDIDATES: Array<{
  partyId: string;
  name: string;
  listRank: number;
  role: string | null;
  portraitUrl: string | null;
}> = [
  // ── SMER-SD (42 predicted seats) ──
  { partyId: "smer-sd", listRank: 1,  name: "Robert Fico",          role: "Predseda · predseda vlády",     portraitUrl: "/portraits/smer-fico.jpg" },
  { partyId: "smer-sd", listRank: 2,  name: "Robert Kaliňák",       role: "Minister vnútra",               portraitUrl: null },
  { partyId: "smer-sd", listRank: 3,  name: "Ján Richter",          role: "Podpredseda vlády",             portraitUrl: null },
  { partyId: "smer-sd", listRank: 4,  name: "Richard Raši",         role: "Podpredseda vlády",             portraitUrl: null },
  { partyId: "smer-sd", listRank: 5,  name: "Monika Beňová",        role: "Europoslankyňa",               portraitUrl: null },
  { partyId: "smer-sd", listRank: 6,  name: "Erik Tomáš",           role: "Minister financií",             portraitUrl: null },
  { partyId: "smer-sd", listRank: 7,  name: "Ján Horecký",          role: "Minister práce",                portraitUrl: null },
  { partyId: "smer-sd", listRank: 8,  name: "Denisa Saková",        role: "Ministerka kultúry",           portraitUrl: null },
  { partyId: "smer-sd", listRank: 9,  name: "Martin Glváč",         role: "Poslanec NR SR",                portraitUrl: null },
  { partyId: "smer-sd", listRank: 10, name: "Peter Žiga",           role: "Poslanec NR SR",                portraitUrl: null },
  { partyId: "smer-sd", listRank: 11, name: "Ľuboš Blaha",          role: "Podpredseda parlamentu",        portraitUrl: null },
  { partyId: "smer-sd", listRank: 12, name: "Tibor Gašpar",         role: "Podpredseda parlamentu",        portraitUrl: null },
  { partyId: "smer-sd", listRank: 13, name: "Ján Podmanický",       role: "Poslanec NR SR",                portraitUrl: null },
  { partyId: "smer-sd", listRank: 14, name: "Marta Krajčíová",      role: "Poslankyňa NR SR",             portraitUrl: null },
  { partyId: "smer-sd", listRank: 15, name: "Dušan Muňko",          role: "Poslanec NR SR",                portraitUrl: null },
  { partyId: "smer-sd", listRank: 16, name: "Rastislav Schlosár",   role: "Poslanec NR SR",                portraitUrl: null },
  { partyId: "smer-sd", listRank: 17, name: "Jana Laššáková",       role: "Poslankyňa NR SR",             portraitUrl: null },
  { partyId: "smer-sd", listRank: 18, name: "Marek Šefčík",        role: "Poslanec NR SR",                portraitUrl: null },
  { partyId: "smer-sd", listRank: 19, name: "Andrej Kolesík",       role: "Poslanec NR SR",                portraitUrl: null },
  { partyId: "smer-sd", listRank: 20, name: "Peter Pamula",         role: "Poslanec NR SR",                portraitUrl: null },
  // ── PS (34 predicted seats) ──
  { partyId: "ps", listRank: 1,  name: "Michal Šimečka",     role: "Predseda · líder opozície",    portraitUrl: "/portraits/ps-simecka.jpg" },
  { partyId: "ps", listRank: 2,  name: "Marta Košútová",     role: "Podpredsedníčka",             portraitUrl: null },
  { partyId: "ps", listRank: 3,  name: "Zora Jaurová",       role: "Podpredsedníčka",             portraitUrl: null },
  { partyId: "ps", listRank: 4,  name: "Ivan Štefunko",      role: "Podpredseda",                  portraitUrl: null },
  { partyId: "ps", listRank: 5,  name: "Tomáš Valášek",      role: "Poslanec NR SR",               portraitUrl: null },
  { partyId: "ps", listRank: 6,  name: "Simona Petrík",      role: "Poslankyňa NR SR",            portraitUrl: null },
  { partyId: "ps", listRank: 7,  name: "Lucia Plaváková",    role: "Poslankyňa NR SR",            portraitUrl: null },
  { partyId: "ps", listRank: 8,  name: "Martin Dubéci",      role: "Poslanec NR SR",               portraitUrl: null },
  { partyId: "ps", listRank: 9,  name: "Ondrej Dostál",      role: "Poslanec NR SR",               portraitUrl: null },
  { partyId: "ps", listRank: 10, name: "Jana Žitňanská",     role: "Poslankyňa NR SR",            portraitUrl: null },
  { partyId: "ps", listRank: 11, name: "Ján Marosz",         role: "Poslanec NR SR",               portraitUrl: null },
  { partyId: "ps", listRank: 12, name: "Katarína Hatráková", role: "Poslankyňa NR SR",            portraitUrl: null },
  { partyId: "ps", listRank: 13, name: "Miroslav Kollár",    role: "Poslanec NR SR",               portraitUrl: null },
  { partyId: "ps", listRank: 14, name: "Petra Hajšel",       role: "Poslankyňa NR SR",            portraitUrl: null },
  // ── HLAS-SD (22 predicted seats) ──
  { partyId: "hlas-sd", listRank: 1,  name: "Matúš Šutaj Eštok",  role: "Predseda · minister vnútra",    portraitUrl: "/portraits/hlas-sutaj-estok.jpg" },
  { partyId: "hlas-sd", listRank: 2,  name: "Peter Dobeš",         role: "Podpredseda",                    portraitUrl: null },
  { partyId: "hlas-sd", listRank: 3,  name: "Radomír Šalitroš",   role: "Poslanec NR SR",                 portraitUrl: null },
  { partyId: "hlas-sd", listRank: 4,  name: "Samuel Migaľ",        role: "Poslanec NR SR",                 portraitUrl: null },
  { partyId: "hlas-sd", listRank: 5,  name: "Jana Vaľová",         role: "Poslankyňa NR SR",              portraitUrl: null },
  { partyId: "hlas-sd", listRank: 6,  name: "Erik Kaliňák",        role: "Poslanec NR SR",                 portraitUrl: null },
  { partyId: "hlas-sd", listRank: 7,  name: "Kristián Brngál",     role: "Poslanec NR SR",                 portraitUrl: null },
  { partyId: "hlas-sd", listRank: 8,  name: "Peter Pellegrini",    role: "Čestný predseda · prezident SR", portraitUrl: null },
  { partyId: "hlas-sd", listRank: 9,  name: "Róbert Puci",         role: "Poslanec NR SR",                 portraitUrl: null },
  { partyId: "hlas-sd", listRank: 10, name: "Natália Blahová",     role: "Poslankyňa NR SR",              portraitUrl: null },
  // ── KDH (14 predicted seats) ──
  { partyId: "kdh", listRank: 1,  name: "Milan Majerský",      role: "Predseda strany",     portraitUrl: "/portraits/kdh-majersky.jpg" },
  { partyId: "kdh", listRank: 2,  name: "Milan Krajniak",      role: "Podpredseda",          portraitUrl: null },
  { partyId: "kdh", listRank: 3,  name: "Vladimír Ledecký",    role: "Poslanec NR SR",       portraitUrl: null },
  { partyId: "kdh", listRank: 4,  name: "Marián Čaučík",       role: "Poslanec NR SR",       portraitUrl: null },
  { partyId: "kdh", listRank: 5,  name: "Anna Andrejuvová",    role: "Poslankyňa NR SR",    portraitUrl: null },
  { partyId: "kdh", listRank: 6,  name: "Peter Stachura",      role: "Poslanec NR SR",       portraitUrl: null },
  { partyId: "kdh", listRank: 7,  name: "Miriam Lexmann",      role: "Europoslankyňa",      portraitUrl: null },
  { partyId: "kdh", listRank: 8,  name: "Janka Žitňanová",    role: "Poslankyňa NR SR",    portraitUrl: null },
  // ── SaS (11 predicted seats) ──
  { partyId: "sas", listRank: 1,  name: "Branislav Gröhling",  role: "Predseda strany",              portraitUrl: "/portraits/sas-grohling.jpg" },
  { partyId: "sas", listRank: 2,  name: "Richard Sulík",       role: "Zakladateľ · čestný predseda", portraitUrl: null },
  { partyId: "sas", listRank: 3,  name: "Marián Viskupič",     role: "Poslanec NR SR",                portraitUrl: null },
  { partyId: "sas", listRank: 4,  name: "Mária Kolíková",      role: "Poslankyňa NR SR",             portraitUrl: null },
  { partyId: "sas", listRank: 5,  name: "Tomáš Lehotský",      role: "Poslanec NR SR",                portraitUrl: null },
  { partyId: "sas", listRank: 6,  name: "Peter Cmorej",        role: "Poslanec NR SR",                portraitUrl: null },
];

async function seed() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
  const token = process.env.CLOUDFLARE_D1_TOKEN;

  if (!accountId || !databaseId || !token) {
    throw new Error("Missing CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_DATABASE_ID / CLOUDFLARE_D1_TOKEN");
  }

  const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Clear existing
  await fetch(`${base}/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({ sql: "DELETE FROM candidates" }),
  });

  // Insert all — batch into groups of 20
  const chunkSize = 20;
  for (let i = 0; i < CANDIDATES.length; i += chunkSize) {
    const chunk = CANDIDATES.slice(i, i + chunkSize);
    const placeholders = chunk
      .map(() => "(?, ?, ?, ?, ?)")
      .join(", ");
    const params = chunk.flatMap((c) => [
      c.partyId, c.name, c.listRank, c.role ?? null, c.portraitUrl ?? null,
    ]);
    const sql = `INSERT INTO candidates (party_id, name, list_rank, role, portrait_url) VALUES ${placeholders}`;
    const res = await fetch(`${base}/query`, {
      method: "POST",
      headers,
      body: JSON.stringify({ sql, params }),
    });
    const data = await res.json() as { success: boolean; errors?: unknown[] };
    if (!data.success) {
      console.error("Insert failed:", data.errors);
      process.exit(1);
    }
    console.log(`Inserted candidates ${i + 1}–${Math.min(i + chunkSize, CANDIDATES.length)}`);
  }

  console.log(`✓ Seeded ${CANDIDATES.length} candidates`);
}

seed().catch((err) => { console.error(err); process.exit(1); });
