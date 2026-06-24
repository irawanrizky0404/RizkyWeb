import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { description, category } = await req.json();

  if (!description?.trim()) {
    return NextResponse.json({ error: "Visual description is required" }, { status: 400 });
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
            content: `Generate a compelling, cinematic title for a ${category || "creative"} work based on this visual description: "${description}"

Rules:
- Create a title that evokes atmosphere and mood, not just describes content
- Use evocative language that suggests story, emotion, or concept
- Avoid generic descriptions - make it feel like a film title or art piece name
- Keep it to 3-8 words maximum
- Be specific and poetic, not generic
- Examples of good titles: "Echoes in the Static", "Fractured Light", "The Weight of Still Air"
- Examples of bad titles: "3D Interior Room", "Product Render", "Poster Design"

Only respond with the title, nothing else.`,
          },
        ],
        max_tokens: 50,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai title] Groq API error:", response.status, errorText);
      return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }

    const data = await response.json();
    const title = data.choices?.[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ title });
  } catch (err) {
    console.error("[ai title] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
