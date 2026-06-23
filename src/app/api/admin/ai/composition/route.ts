import { NextResponse } from "next/server";

const COMPOSITION_PROMPT = `You are a visual composition expert. Analyze the description and describe the compositional qualities.

Consider aspects like:
- Layout: centered, symmetrical, rule-of-thirds, diagonal, leading-lines, radial, scattered, gridded
- Depth: flat, layered, deep, shallow, parallax, isometric
- Balance: symmetrical, asymmetrical, weighted, distributed
- Focus: single-point, multi-point, edge, corner, full-frame
- Space usage: negative space dominant, positive space dominant, balanced

Return ONLY valid JSON:
{
  "primaryComposition": "main composition type",
  "compositionNotes": "brief notes on compositional choices",
  "compositionTags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description?.trim()) {
      return NextResponse.json({
        primaryComposition: "centered",
        compositionNotes: "Subject placed centrally for immediate focus.",
        compositionTags: ["centered", "symmetrical", "balanced", "focus", "clean"]
      });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: `${COMPOSITION_PROMPT}\n\nVisual description: ${description}` }],
        temperature: 0.5,
        max_tokens: 250
      })
    });

    if (!res.ok) throw new Error("Groq API error");

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    try {
      const jsonMatch = content?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      }
    } catch {
      // fallback
    }

    return NextResponse.json({
      primaryComposition: "balanced",
      compositionNotes: "Well-balanced composition.",
      compositionTags: ["balanced", "composed", "structured"]
    });
  } catch (err) {
    console.error("[composition]", err);
    return NextResponse.json({ error: "Failed to analyze composition" }, { status: 500 });
  }
}
