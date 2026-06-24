import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title, type, category } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  const contextType = type === "summary"
    ? "a brief one-sentence summary (max 120 characters)"
    : "a compelling multi-sentence description (2-4 sentences)";

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
            content: `Generate ${contextType} for a ${category || "creative"} work titled "${title}".

Rules for summary:
- Capture the essence in one compelling sentence
- Use evocative, atmospheric language
- Focus on mood, concept, or unique quality
- Max 120 characters
- Write as if describing to someone who should be intrigued

Rules for description:
- Be specific and detailed
- Describe the artistic intent, technique, and emotional impact
- 2-4 sentences, vivid and engaging
- Avoid generic phrases like "high quality" or "professional work"
- Include sensory details where appropriate

Only respond with the ${type === "summary" ? "summary" : "description"}, nothing else.`,
          },
        ],
        max_tokens: type === "summary" ? 100 : 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai description] Groq API error:", response.status, errorText);
      return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ result });
  } catch (err) {
    console.error("[ai description] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
