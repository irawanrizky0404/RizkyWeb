import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { topic, prompt } = await req.json();

  if (!topic?.trim() && !prompt?.trim()) {
    return NextResponse.json({ error: "Topic or prompt is required" }, { status: 400 });
  }

  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "XAI_API_KEY not configured" }, { status: 500 });
  }

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
            content: prompt ||
              `Write a journal/blog post about "${topic}".

Write in the style of a visual artist's personal journal — introspective, thoughtful, with references to creative process, aesthetics, and artistic vision. The writing should feel authentic and personal, not corporate or overly formal.

Format your response EXACTLY as follows (4 fields, each on its own line):
TITLE: [An evocative, intriguing title for the post - max 8 words]
EXCERPT: [A compelling 1-2 sentence excerpt that draws readers in - max 40 words]
TAGS: [tag1, tag2, tag3] (3-5 relevant tags, lowercase, separated by commas)
CONTENT:
[Full journal post content - 300-500 words, with thoughtful reflection on the topic. Use a personal, reflective tone. Include sensory details and artistic references where appropriate.]`,
          },
        ],
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai journal] xAI API error:", response.status, errorText);
      return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    const titleMatch = text.match(/TITLE:\s*(.+)/i);
    const excerptMatch = text.match(/EXCERPT:\s*(.+)/i);
    const tagsMatch = text.match(/TAGS:\s*\[?(.+?)\]?$/im);
    const contentMatch = text.match(/CONTENT:\s*\n?([\s\S]+)$/i);

    return NextResponse.json({
      title: titleMatch?.[1]?.trim() ?? "",
      excerpt: excerptMatch?.[1]?.trim() ?? "",
      tags: tagsMatch?.[1]?.trim() ?? "",
      content: contentMatch?.[1]?.trim() ?? text,
      raw: text,
    });
  } catch (err) {
    console.error("[ai journal] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
