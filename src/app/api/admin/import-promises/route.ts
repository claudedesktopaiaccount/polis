import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { isAdminAuthed } from "@/lib/admin-auth";

export const runtime = "nodejs";

const CATEGORIES = [
  "Ekonomika", "Sociálne veci", "Zdravotníctvo", "Školstvo",
  "Zahraničná politika", "Bezpečnosť", "Životné prostredie",
  "Kultúra", "Spravodlivosť",
];

export interface ExtractedPromise {
  text: string;
  category: string;
  isPro: boolean;
}

export function parseClaudeResponse(raw: string): ExtractedPromise[] {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("Expected array");
  return parsed.map((item: unknown) => {
    const obj = item as Record<string, unknown>;
    if (typeof obj.text !== "string" || typeof obj.category !== "string") {
      throw new Error("Invalid promise shape");
    }
    const category = CATEGORIES.includes(obj.category as string)
      ? (obj.category as string)
      : "Ekonomika";
    return {
      text: obj.text,
      category,
      isPro: obj.isPro !== false,
    };
  });
}

async function fetchPageText(url: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Only https:// URLs allowed");
  }
  const res = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Polis/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header").remove();
  return $("body").text().replace(/\s+/g, " ").trim().slice(0, 12_000);
}

async function callClaude(text: string, apiKey: string): Promise<ExtractedPromise[]> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content:
            `Extrahuj politické sľuby zo slovenského straníckeho programu. ` +
            `Vráť iba JSON pole bez vysvetlenia:\n` +
            `[{"text": "...", "category": "...", "isPro": true}]\n\n` +
            `Kategórie (použi presne): ${CATEGORIES.join(", ")}.\n` +
            `isPro: true = strana to presadzuje, false = strana je proti.\n` +
            `Extrahuj 10–30 najdôležitejších sľubov. Slovenský jazyk.\n\n` +
            `Text programu:\n${text}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);

  const json = await res.json() as { content: Array<{ type: string; text: string }> };
  const block = json.content[0];
  if (block?.type !== "text") throw new Error("Unexpected Claude response type");
  return parseClaudeResponse(block.text);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 500 });
  }

  const body = await req.json().catch(() => null) as {
    url?: string;
    rawText?: string;
  } | null;

  if (!body?.url && !body?.rawText) {
    return NextResponse.json({ error: "missing_url_or_text" }, { status: 400 });
  }

  let text: string;

  if (body.rawText && typeof body.rawText === "string") {
    text = body.rawText.slice(0, 12_000);
  } else {
    try {
      text = await fetchPageText(body.url!);
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: "fetch_failed", message: "Nepodarilo sa načítať URL." },
        { status: 422 }
      );
    }
  }

  if (text.length < 100) {
    return NextResponse.json({ error: "text_too_short" }, { status: 422 });
  }

  try {
    const promises = await callClaude(text, apiKey);
    return NextResponse.json({ promises });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "extraction_failed", message: "Extrakcia zlyhala." },
      { status: 500 }
    );
  }
}
