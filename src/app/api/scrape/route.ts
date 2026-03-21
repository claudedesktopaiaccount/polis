import { scrapeWikipediaPolls } from "@/lib/scraper/wikipedia";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSentry, captureException } from "@/lib/sentry";

export const runtime = "edge";

/**
 * GET /api/scrape — Test endpoint to run the Wikipedia scraper.
 * In production, the Cloudflare Worker cron does this automatically.
 */
export async function GET() {
  try {
    const polls = await scrapeWikipediaPolls();

    return Response.json({
      success: true,
      count: polls.length,
      latest: polls.slice(0, 5),
      parties: polls.length > 0 ? Object.keys(polls[0].results) : [],
    });
  } catch (error) {
    const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: {} as Record<string, unknown> }));
    const sentry = createSentry(new Request("https://localhost/api/scrape"), env as { SENTRY_DSN?: string });
    captureException(sentry, error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
