interface D1Meta {
  last_row_id: number;
  changes: number;
  duration: number;
  rows_read: number;
  rows_written: number;
}

interface D1RestResult {
  results: Record<string, unknown>[];
  success: boolean;
  meta: D1Meta;
}

export class D1HttpStatement {
  private _params: unknown[] = [];

  constructor(
    private sql: string,
    private accountId: string,
    private databaseId: string,
    private token: string
  ) {}

  bind(...values: unknown[]): D1HttpStatement {
    const stmt = new D1HttpStatement(this.sql, this.accountId, this.databaseId, this.token);
    stmt._params = values;
    return stmt;
  }

  private async exec(): Promise<D1RestResult> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: this.sql, params: this._params }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`D1 HTTP error ${res.status}: ${text}`);
    }
    const json = await res.json() as { success: boolean; errors: unknown[]; result: D1RestResult[] };
    if (!json.success || !json.result?.[0]) {
      throw new Error(`D1 API error: ${JSON.stringify(json.errors)}`);
    }
    return json.result[0];
  }

  async first<T = unknown>(): Promise<T | null> {
    const r = await this.exec();
    return (r.results[0] as T) ?? null;
  }

  async run<T = unknown>(): Promise<{ results: T[]; success: boolean; meta: D1Meta }> {
    const r = await this.exec();
    return { results: r.results as T[], success: r.success, meta: r.meta };
  }

  async all<T = unknown>(): Promise<{ results: T[]; success: boolean; meta: D1Meta }> {
    return this.run<T>();
  }

  async raw<T = unknown[]>(): Promise<T[]> {
    const r = await this.exec();
    return r.results as unknown as T[];
  }
}

export class D1Http {
  constructor(
    private accountId: string,
    private databaseId: string,
    private token: string
  ) {}

  prepare(query: string): D1HttpStatement {
    return new D1HttpStatement(query, this.accountId, this.databaseId, this.token);
  }

  async dump(): Promise<ArrayBuffer> {
    throw new Error("dump() not supported in HTTP mode");
  }

  async batch<T = unknown>(
    statements: D1HttpStatement[]
  ): Promise<{ results: T[]; success: boolean; meta: D1Meta }[]> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        statements.map((s) => ({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sql: (s as any).sql as string,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          params: (s as any)._params as unknown[],
        }))
      ),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`D1 HTTP batch error ${res.status}: ${text}`);
    }
    const json = (await res.json()) as { success: boolean; errors: unknown[]; result: D1RestResult[] };
    if (!json.success) {
      throw new Error(`D1 API batch error: ${JSON.stringify(json.errors)}`);
    }
    return (json.result ?? []).map((r) => ({
      results: r.results as T[],
      success: r.success,
      meta: r.meta,
    }));
  }

  async exec(query: string): Promise<{ count: number; duration: number }> {
    const r = await this.prepare(query).run();
    return { count: 1, duration: r.meta.duration };
  }
}

export function createD1Http(): D1Http {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
  const token = process.env.CLOUDFLARE_D1_TOKEN;
  if (!accountId || !databaseId || !token) {
    throw new Error(
      "Missing D1 HTTP config: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN required"
    );
  }
  return new D1Http(accountId, databaseId, token);
}
