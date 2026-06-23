import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { topic, prompt } = await req.json();

  if (!topic?.trim() && !prompt?.trim()) {
    return NextResponse.json({ error: "Topic or keywords are required" }, { status: 400 });
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
            content: prompt ||
              `Based on this topic/keywords: "${topic}"

Generate a title and description for a visual artist's portfolio piece.

Format your response EXACTLY as:
TITLE: [An evocative, intriguing title - max 6 words]
DESCRIPTION: [A compelling 1-2 sentence description of the work, atmospheric and poetic, max 40 words]`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai title] Groq API error:", response.status, errorText);
      return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    const titleMatch = text.match(/TITLE:\s*(.+)/i);
    const descMatch = text.match(/DESCRIPTION:\s*(.+)/i);

    return NextResponse.json({
      title: titleMatch?.[1]?.trim() ?? "",
      description: descMatch?.[1]?.trim() ?? "",
      raw: text,
    });
  } catch (err) {
    console.error("[ai title] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
