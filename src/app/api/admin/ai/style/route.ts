import { NextResponse } from "next/server";

const STYLE_PROMPT = `You are a visual style expert for a portfolio. Analyze the description and tag it with appropriate style descriptors.

Consider categories like:
- Movement: minimal, maximal, intricate, bold, subtle, delicate
- Era/Mood: retro, futuristic, timeless, vintage, modern, contemporary
- Technique: photographic, illustrative, typographic, geometric, organic, textured
- Aesthetic: brutalist, elegant, raw, refined, industrial, ethereal, grungy, clean, dark, bright
- Feel: moody, energetic, calm, mysterious, playful, serious, haunting, dreamy

Return ONLY valid JSON:
{
  "primaryStyle": "main style descriptor",
  "secondaryStyles": ["style2", "style3"],
  "styleTags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"]
}

Return a fallback if description is unclear.`;

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description?.trim()) {
      return NextResponse.json({
        primaryStyle: "contemporary",
        secondaryStyles: ["digital", "minimal"],
        styleTags: ["modern", "minimal", "digital", "clean", "professional", "contemporary"]
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
        messages: [{ role: "user", content: `${STYLE_PROMPT}\n\nVisual description: ${description}` }],
        temperature: 0.6,
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
      primaryStyle: "contemporary",
      secondaryStyles: ["digital"],
      styleTags: ["modern", "digital", "professional"]
    });
  } catch (err) {
    console.error("[visual-style]", err);
    return NextResponse.json({ error: "Failed to analyze style" }, { status: 500 });
  }
}
