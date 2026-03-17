import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      partyId: string;
      predictedPct?: number;
      coalitionPick?: string[];
    };
    const { partyId, predictedPct, coalitionPick } = body;

    // Get or create visitor ID
    let visitorId = request.cookies.get("pt_visitor")?.value;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
    }

    // In production, save to D1 via getCloudflareContext()
    // const { env } = await getCloudflareContext();
    // const db = getDb(env.DB);
    // await db.insert(userPredictions).values({...})

    const response = NextResponse.json({ success: true, visitorId });

    if (!request.cookies.get("pt_visitor")) {
      response.cookies.set("pt_visitor", visitorId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  // In production, aggregate from D1
  // const { env } = await getCloudflareContext();
  // const db = getDb(env.DB);
  // const aggregates = await db.select().from(crowdAggregates)...

  return NextResponse.json({
    aggregates: [],
    totalBets: 0,
    message: "Crowd data will be available after D1 is configured",
  });
}
