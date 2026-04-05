declare global {
  interface CloudflareEnv {
    DB: D1Database;
    ADMIN_SECRET: string;
    RESEND_API_KEY: string;
    CRON_SECRET: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    STRIPE_PRICE_ID: string;
    ANTHROPIC_API_KEY: string;
  }
}

export {};
