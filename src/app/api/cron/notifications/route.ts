import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { eq, gte } from "drizzle-orm";
import {
  polls,
  userNotificationPrefs,
  notificationLog,
  users,
} from "@/lib/db/schema";
import { sendEmail } from "@/lib/email/resend";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const secret = req.headers.get("x-cron-secret");
  if (secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb(env.DB);
  const oneDayAgo = new Date(Date.now() - 86400_000).toISOString();
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();

  // Find polls published in the last hour
  const newPolls = await db
    .select()
    .from(polls)
    .where(gte(polls.createdAt, oneHourAgo));

  if (newPolls.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no new polls" });
  }

  // Find users opted into new poll notifications
  const optedIn = await db
    .select({ userId: userNotificationPrefs.userId })
    .from(userNotificationPrefs)
    .where(eq(userNotificationPrefs.onNewPoll, 1));

  let sent = 0;
  const siteUrl = "https://polis.sk";

  for (const { userId } of optedIn) {
    // Rate limit: max 1 notification/user/day
    const recentLog = await db
      .select()
      .from(notificationLog)
      .where(eq(notificationLog.userId, userId));
    const sentToday = recentLog.some(
      (l) => l.sentAt >= oneDayAgo && l.type === "new_poll"
    );
    if (sentToday) continue;

    const [user] = await db
      .select({ email: users.email, displayName: users.displayName })
      .from(users)
      .where(eq(users.id, userId));
    if (!user) continue;

    const poll = newPolls[0];
    try {
      await sendEmail(
        {
          to: user.email,
          subject: `Novy prieskum -- ${poll.agency}, ${poll.publishedDate}`,
          html: `<p>Bol zverejneny novy prieskum od agentury <strong>${poll.agency}</strong>.</p>
                 <p><a href="${siteUrl}/prieskumy">Zobrazit prieskumy &rarr;</a></p>
                 <p style="font-size:11px;color:#999">Odhlasenie z notifikacii: <a href="${siteUrl}/profil">Vas profil</a></p>`,
          text: `Novy prieskum -- ${poll.agency}, ${poll.publishedDate}\n\n${siteUrl}/prieskumy`,
        },
        env
      );

      await db
        .insert(notificationLog)
        .values({
          userId,
          type: "new_poll",
          sentAt: new Date().toISOString(),
        });

      sent++;
    } catch {
      // continue on error
    }
  }

  return NextResponse.json({ sent });
}
