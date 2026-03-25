declare global {
  interface CloudflareEnv {
    DB: D1Database;
    RESEND_API_KEY: string;
    CRON_SECRET: string;
  }
}

export {};
