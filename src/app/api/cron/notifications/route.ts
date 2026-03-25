import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, gte } from "drizzle-orm";
import { polls, userNotificationPrefs, notificationLog, users } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email/resend";
import { getDb } from "@/lib/db";

export const runtime = "edge";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(req: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const secret = req.headers.get("x-cron-secret");
  if (secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb(env.DB);
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();

  const newPolls = await db
    .select()
    .from(polls)
    .where(gte(polls.createdAt, oneHourAgo))
    .all();

  if (newPolls.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no new polls" });
  }

  const optedIn = await db
    .select({ userId: userNotificationPrefs.userId })
    .from(userNotificationPrefs)
    .where(eq(userNotificationPrefs.onNewPoll, 1))
    .all();

  let sent = 0;
  const siteUrl = "https://polis.sk";

  for (const { userId } of optedIn) {
    const recentLog = await db
      .select()
      .from(notificationLog)
      .where(eq(notificationLog.userId, userId))
      .all();
    const todayDate = new Date().toISOString().slice(0, 10);
    const sentToday = recentLog.some((l) => l.date === todayDate && l.type === "new_poll");
    if (sentToday) continue;

    const userRows = await db
      .select({ email: users.email, displayName: users.displayName })
      .from(users)
      .where(eq(users.id, userId))
      .all();
    if (userRows.length === 0) continue;
    const user = userRows[0];

    const poll = newPolls[0];
    try {
      await sendEmail(
        {
          to: user.email,
          subject: `Nový prieskum — ${poll.agency}, ${poll.publishedDate}`,
          html: `<p>Bol zverejnený nový prieskum od agentúry <strong>${escapeHtml(poll.agency)}</strong>.</p>
                 <p><a href="${siteUrl}/prieskumy">Zobraziť prieskumy →</a></p>
                 <p style="font-size:11px;color:#999">Odhlásenie z notifikácií: <a href="${siteUrl}/profil">Váš profil</a></p>`,
          text: `Nový prieskum — ${escapeHtml(poll.agency)}, ${poll.publishedDate}\n\n${siteUrl}/prieskumy`,
        },
        env
      );

      await db
        .insert(notificationLog)
        .values({
          userId,
          type: "new_poll",
          sentAt: new Date().toISOString(),
          date: new Date().toISOString().slice(0, 10),
        })
        .run();

      sent++;
    } catch {
      // continue on error
    }
  }

  return NextResponse.json({ sent });
}
