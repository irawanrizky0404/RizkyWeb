import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title, description, category } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `Generate tags for a visual artist's portfolio work.

Title: "${title}"
Category: ${category || "General"}
${description ? `Description: "${description}"` : ""}

Generate 4-6 relevant tags for this work. Tags should be lowercase, single words or short phrases (max 2 words each).

Format EXACTLY as (single line, comma-separated):
TAGS: tag1, tag2, tag3, tag4, tag5`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai tags] Groq API error:", response.status, errorText);
      return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    const tagsMatch = text.match(/TAGS:\s*(.+)/i);
    const tags = tagsMatch?.[1]?.trim() ?? "";

    return NextResponse.json({
      tags,
      raw: text,
    });
  } catch (err) {
    console.error("[ai tags] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
