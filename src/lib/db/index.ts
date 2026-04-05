import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { createD1Http, D1Http } from "./d1-http";

export function getDb(d1?: D1Http) {
  const binding = d1 ?? createD1Http();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return drizzle(binding as any, { schema });
}

export function getD1(): D1Http {
  return createD1Http();
}

export type Database = ReturnType<typeof getDb>;
