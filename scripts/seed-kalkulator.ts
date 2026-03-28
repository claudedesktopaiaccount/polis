/**
 * One-time seeder: populates kalkulator_weights from the QUESTIONS array.
 * Run with: npx tsx scripts/seed-kalkulator.ts
 *
 * Requires env vars: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN
 */
import { QUESTIONS } from "../src/lib/kalkulator/questions";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
const databaseId = process.env.CLOUDFLARE_DATABASE_ID!;
const token = process.env.CLOUDFLARE_D1_TOKEN!;

async function runSql(sql: string, params: unknown[]) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    }
  );
  const json = await res.json() as { success: boolean; errors?: unknown[] };
  if (!json.success) throw new Error(JSON.stringify(json.errors));
  return json;
}

async function main() {
  const now = new Date().toISOString();
  let count = 0;

  for (const question of QUESTIONS) {
    for (let answerIndex = 0; answerIndex < question.answers.length; answerIndex++) {
      const answer = question.answers[answerIndex];
      for (const [partyId, weight] of Object.entries(answer.weights)) {
        await runSql(
          `INSERT INTO kalkulator_weights (question_id, answer_index, party_id, weight, source_url, updated_at)
           VALUES (?, ?, ?, ?, NULL, ?)
           ON CONFLICT(question_id, answer_index, party_id) DO UPDATE SET
             weight = excluded.weight, updated_at = excluded.updated_at`,
          [question.id, answerIndex, partyId, weight, now]
        );
        count++;
      }
    }
  }
  console.log(`Seeded ${count} rows.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
