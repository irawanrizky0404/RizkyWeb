import { NextResponse } from "next/server";

const PALETTE_PROMPT = `You are a color analysis expert. Analyze the visual description provided and extract:
1. A 5-color palette that represents the image (hex codes)
2. The dominant color family (e.g., "warm oranges", "cool blues", "neutral grays")
3. Suggested palette-based tags for a portfolio

Return ONLY valid JSON in this exact format:
{
  "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "dominantFamily": "color family description",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

If no description is provided or it's unclear, return a default dark portfolio palette.`;

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description?.trim()) {
      return NextResponse.json({
        palette: ["#ff3500", "#1a1a1a", "#f0f0ee", "#ff6b35", "#333333"],
        dominantFamily: "warm orange with dark neutrals",
        suggestedTags: ["vibrant", "high-contrast", "bold", "warm", "dark"]
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
        messages: [{ role: "user", content: `${PALETTE_PROMPT}\n\nVisual description: ${description}` }],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!res.ok) {
      throw new Error("Groq API error");
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    try {
      const jsonMatch = content?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      }
    } catch {
      // Return fallback if JSON parsing fails
    }

    return NextResponse.json({
      palette: ["#ff3500", "#1a1a1a", "#f0f0ee", "#ff6b35", "#333333"],
      dominantFamily: "warm orange with dark neutrals",
      suggestedTags: ["vibrant", "high-contrast", "bold", "warm", "dark"]
    });
  } catch (err) {
    console.error("[color-palette]", err);
    return NextResponse.json({ error: "Failed to generate palette" }, { status: 500 });
  }
}
