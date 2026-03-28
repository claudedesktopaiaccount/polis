import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { isNull } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { newsletterSubscribers, polls, pollResults } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email/resend";
import { buildDigestHtml, buildDigestText, type PollSummary } from "@/lib/email/digest";
import { generateUnsubToken } from "@/lib/email/tokens";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });

  // Verify cron secret to block external calls
  const secret = req.headers.get("x-cron-secret");
  if (secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb(env.DB);

  // Fetch active subscribers
  const subscribers = await db
    .select()
    .from(newsletterSubscribers)
    .where(isNull(newsletterSubscribers.unsubscribedAt))
    .all();

  if (subscribers.length === 0) {
    return NextResponse.json({ sent: 0, message: "No active subscribers" });
  }

  // Fetch last 5 polls with results
  const recentPolls = await db
    .select()
    .from(polls)
    .orderBy(polls.publishedDate)
    .limit(5)
    .all();

  const pollSummaries: PollSummary[] = await Promise.all(
    recentPolls.map(async (poll) => {
      const results = await db
        .select()
        .from(pollResults)
        .where(eq(pollResults.pollId, poll.id))
        .all();
      const resultsMap: Record<string, number> = {};
      for (const r of results) resultsMap[r.partyId] = r.percentage;
      return {
        agency: poll.agency,
        publishedDate: poll.publishedDate,
        results: resultsMap,
      };
    })
  );

  const siteUrl = "https://polis.sk";
  let sent = 0;
  let errors = 0;

  for (const subscriber of subscribers) {
    try {
      const unsubToken = await generateUnsubToken(subscriber.email, env.RESEND_API_KEY);
      const unsubUrl = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${unsubToken}`;

      const html = buildDigestHtml(pollSummaries, siteUrl).replace("{{UNSUB_URL}}", unsubUrl);
      const text = buildDigestText(pollSummaries, siteUrl).replace("{{UNSUB_URL}}", unsubUrl);

      await sendEmail(
        {
          to: subscriber.email,
          subject: `Polis Tyzdenn\u00edk \u2014 ${new Date().toLocaleDateString("sk-SK")}`,
          html,
          text,
        },
        env
      );
      sent++;
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ sent, errors });
}
