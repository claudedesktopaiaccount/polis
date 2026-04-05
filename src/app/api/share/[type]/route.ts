import { NextRequest } from "next/server";
import { generateQuizCard, generateScoreCard } from "@/lib/share/templates";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const searchParams = req.nextUrl.searchParams;

  let svg: string;

  switch (type) {
    case "quiz": {
      const topParty = searchParams.get("party") ?? "Neznáma strana";
      const topScore = parseInt(searchParams.get("score") ?? "0", 10);
      const partyColor = searchParams.get("color") ?? "#111110";
      svg = generateQuizCard({ topParty, topScore, partyColor });
      break;
    }
    case "score": {
      const score = parseInt(searchParams.get("score") ?? "0", 10);
      const rank = parseInt(searchParams.get("rank") ?? "0", 10);
      const totalUsers = parseInt(searchParams.get("total") ?? "0", 10);
      svg = generateScoreCard({ score, rank, totalUsers });
      break;
    }
    default:
      return new Response("Unknown share type", { status: 404 });
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
