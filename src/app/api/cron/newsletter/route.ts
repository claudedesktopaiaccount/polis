import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { isNull, eq, desc } from "drizzle-orm";
import { newsletterSubscribers, polls, pollResults } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email/resend";
import { buildDigestHtml, buildDigestText, type PollSummary } from "@/lib/email/digest";
import { generateUnsubToken } from "@/lib/email/tokens";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });

  const secret = req.headers.get("x-cron-secret");
  if (secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = drizzle(env.DB);

  const subscribers = await db
    .select()
    .from(newsletterSubscribers)
    .where(isNull(newsletterSubscribers.unsubscribedAt))
    .all();

  if (subscribers.length === 0) {
    return NextResponse.json({ sent: 0, message: "No active subscribers" });
  }

  const sixHoursAgo = new Date(Date.now() - 6 * 3600_000).toISOString();
  const eligibleSubscribers = subscribers.filter(
    (s) => !s.lastDigestSentAt || s.lastDigestSentAt < sixHoursAgo
  );

  if (eligibleSubscribers.length === 0) {
    return NextResponse.json({ sent: 0, message: "All subscribers emailed recently" });
  }

  const recentPolls = await db
    .select()
    .from(polls)
    .orderBy(desc(polls.publishedDate))
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

  for (const subscriber of eligibleSubscribers) {
    try {
      const unsubToken = await generateUnsubToken(subscriber.email, env.RESEND_API_KEY);
      const unsubUrl = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${unsubToken}`;

      const html = buildDigestHtml(pollSummaries, siteUrl).replace("{{UNSUB_URL}}", unsubUrl);
      const text = buildDigestText(pollSummaries, siteUrl).replace("{{UNSUB_URL}}", unsubUrl);

      await sendEmail(
        {
          to: subscriber.email,
          subject: `Polis Týždenník — ${new Date().toLocaleDateString("sk-SK")}`,
          html,
          text,
        },
        env
      );
      sent++;
      await db
        .update(newsletterSubscribers)
        .set({ lastDigestSentAt: new Date().toISOString() })
        .where(eq(newsletterSubscribers.email, subscriber.email))
        .run();
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ sent, errors });
}
