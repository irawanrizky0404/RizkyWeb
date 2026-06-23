import { NextResponse } from "next/server";

const NAMING_PROMPT = `You are a creative naming expert for a portfolio. Generate evocative, memorable names for creative projects.

Guidelines:
- Names should be evocative, not descriptive
- Mix of short (1-2 words) and longer (3-4 words) options
- Include abstract, concrete, and word-play options
- Avoid generic names like "Project 1" or "Untitled"
- Consider: sounds, emotions, imagery, references

Return ONLY valid JSON:
{
  "names": [
    { "name": "name1", "type": "abstract" },
    { "name": "name2", "type": "concrete" },
    { "name": "name3", "type": "wordplay" }
  ]
}`;

export async function POST(request: Request) {
  try {
    const { description, keywords } = await request.json();

    const input = [description, keywords].filter(Boolean).join(" ");

    if (!input.trim()) {
      return NextResponse.json({
        names: [
          { name: "Emergence", type: "abstract" },
          { name: "The space between", type: "concrete" },
          { name: "Afterglow", type: "wordplay" }
        ]
      });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    const context = keywords ? `Keywords: ${keywords}\nDescription: ${description}` : `Description: ${description}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: `${NAMING_PROMPT}\n\n${context}` }],
        temperature: 0.85,
        max_tokens: 400
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
      names: [
        { name: "Untitled", type: "concrete" }
      ]
    });
  } catch (err) {
    console.error("[naming]", err);
    return NextResponse.json({ error: "Failed to generate names" }, { status: 500 });
  }
}
