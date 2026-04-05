import { NextRequest } from "next/server";
import { scrapeWikipediaPolls } from "@/lib/scraper/wikipedia";
import { createSentry, captureException } from "@/lib/sentry";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
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
    const sentry = createSentry(new Request("https://polis.sk/api/scrape"), {
      SENTRY_DSN: process.env.SENTRY_DSN,
    });
    captureException(sentry, error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
