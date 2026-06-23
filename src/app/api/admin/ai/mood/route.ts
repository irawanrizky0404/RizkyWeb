import { NextResponse } from "next/server";

const MOOD_PROMPT = `You are a visual mood analyzer for a portfolio. Analyze the description and describe the emotional quality and atmosphere.

Consider moods like: mysterious, energetic, calm, chaotic, ethereal, dark, haunting, dreamy, melancholic, hopeful, ominous, serene, intense, nostalgic, unsettling, otherworldly

Return ONLY valid JSON:
{
  "primaryMood": "main mood descriptor",
  "moodDescription": "2-3 sentence description of the emotional atmosphere",
  "moodTags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "intensity": "low" | "medium" | "high"
}`;

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description?.trim()) {
      return NextResponse.json({
        primaryMood: "contemplative",
        moodDescription: "A reflective and introspective mood that invites quiet contemplation.",
        moodTags: ["contemplative", "thoughtful", "serene", "subtle", "meditative", "calm"],
        intensity: "medium"
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
        messages: [{ role: "user", content: `${MOOD_PROMPT}\n\nVisual description: ${description}` }],
        temperature: 0.7,
        max_tokens: 300
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
      primaryMood: "contemplative",
      moodDescription: "A reflective and introspective mood.",
      moodTags: ["contemplative", "serene", "calm"],
      intensity: "medium"
    });
  } catch (err) {
    console.error("[mood-analyzer]", err);
    return NextResponse.json({ error: "Failed to analyze mood" }, { status: 500 });
  }
}
