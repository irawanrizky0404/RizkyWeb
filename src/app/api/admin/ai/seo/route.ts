import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title, description, type } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "XAI_API_KEY not configured" }, { status: 500 });
  }

  const contextType = type === "work"
    ? "a visual artist's portfolio work/series"
    : type === "journal"
    ? "a personal journal/blog post"
    : "a creative portfolio page";

  try {
    const response = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-0.1",
        input: [
          {
            role: "user",
            content: `Generate SEO metadata for ${contextType} titled "${title}" ${description ? `with this description: "${description}"` : ""}.

Generate EXACTLY this format (5 lines, no extra text):
META_TITLE: [SEO-friendly title, 50-60 chars, include key keywords]
META_DESCRIPTION: [Compelling description, 150-160 chars, actionable and specific]
OG_TITLE: [OpenGraph title, max 60 chars, engaging for social]
OG_DESCRIPTION: [OpenGraph description, 60-100 chars, click-worthy]
KEYWORDS: [5-7 relevant keywords, lowercase, comma-separated]`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai seo] xAI API error:", response.status, errorText);
      return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    const parseField = (field: string) =>
      text.match(new RegExp(`${field}:\\s*(.+)`, "i"))?.[1]?.trim() ?? "";

    return NextResponse.json({
      metaTitle: parseField("META_TITLE"),
      metaDescription: parseField("META_DESCRIPTION"),
      ogTitle: parseField("OG_TITLE"),
      ogDescription: parseField("OG_DESCRIPTION"),
      keywords: parseField("KEYWORDS"),
      raw: text,
    });
  } catch (err) {
    console.error("[ai seo] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
