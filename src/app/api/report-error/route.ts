import { NextRequest, NextResponse } from "next/server";
import { createSentry, captureException } from "@/lib/sentry";

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

    const sentry = createSentry(request, { SENTRY_DSN: process.env.SENTRY_DSN });

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
