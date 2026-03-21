import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSentry, captureException } from "@/lib/sentry";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      message?: string;
      stack?: string;
      digest?: string;
    };

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const sentry = createSentry(request, env as { SENTRY_DSN?: string });

    if (sentry) {
      const error = new Error(body.message);
      if (body.stack) error.stack = body.stack;
      captureException(sentry, error);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
