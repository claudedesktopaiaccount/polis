import { NextRequest } from "next/server";
import { scrapeWikipediaPolls } from "@/lib/scraper/wikipedia";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSentry, captureException } from "@/lib/sentry";

export const runtime = "edge";

/**
 * GET /api/scrape — Test endpoint to run the Wikipedia scraper.
 * In production, the Cloudflare Worker cron does this automatically.
 * Requires x-cron-secret header matching CRON_SECRET env variable.
 */
export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const secret = req.headers.get("x-cron-secret");
  if (secret !== (env as Record<string, string>).CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const polls = await scrapeWikipediaPolls();

    return Response.json({
      success: true,
      count: polls.length,
      latest: polls.slice(0, 5),
      parties: polls.length > 0 ? Object.keys(polls[0].results) : [],
    });
  } catch (error) {
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
