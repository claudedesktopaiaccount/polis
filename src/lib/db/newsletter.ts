import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { newsletterSubscribers } from "./schema";

export async function isAlreadySubscribed(
  db: DrizzleD1Database,
  email: string
): Promise<boolean> {
  const rows = await db
    .select({ id: newsletterSubscribers.id })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email.toLowerCase().trim()))
    .limit(1);
  return rows.length > 0;
}

export async function subscribeEmail(
  db: DrizzleD1Database,
  email: string,
  source: string = "web"
): Promise<void> {
  const alreadyExists = await isAlreadySubscribed(db, email);
  if (alreadyExists) throw new Error("already_subscribed");

  await db.insert(newsletterSubscribers).values({
    email: email.toLowerCase().trim(),
    createdAt: new Date().toISOString(),
    source,
  });
}
