import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { input, context, type } = await req.json();

  if (!input?.trim()) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  const prompts: Record<string, string> = {
    slug: `Generate a URL-friendly slug from this text. Only respond with the slug, no explanation.
Text: "${input}"
Rules:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Max 50 characters
- Example: "My Project Title 2024" → "my-project-title-2024"`,
    hashtag: `Generate relevant hashtags for this content. Only respond with hashtags, no explanation.
Content: "${input}" ${context ? `Context: "${context}"` : ""}
Rules:
- Include 5-8 specific hashtags
- Mix of broad (#art, #design) and specific tags
- Use camelCase for multi-word tags
- No # symbols mixed with words
- Example: #VisualArtist #3DRendering #Portfolio`,
    alttext: `Generate a detailed alt text description for an image. Only respond with the alt text, no explanation.
Image/Content: "${input}" ${context ? `Context/Purpose: "${context}"` : ""}
Rules:
- Describe the visual elements, lighting, mood
- Include key subjects and composition
- Mention colors and atmosphere
- 100-150 characters optimal
- Write as if describing to someone who cannot see the image`,
    summary: `Generate a compelling brief summary/description. Only respond with the summary, no explanation.
Topic: "${input}" ${context ? `Context: "${context}"` : ""}
Rules:
- 2-3 sentences max
- Compelling and descriptive
- No clichés or generic phrases
- Include specific details when available
- Write in third person for work descriptions`,
    email: `Generate a professional email template. Only respond with the email, no explanation.
Purpose: "${input}" ${context ? `Context/Details: "${context}"` : ""}
Rules:
- Subject line first (marked with SUBJECT:)
- Professional but not generic greeting
- Clear purpose in opening
- Include a call-to-action
- Professional sign-off
- Keep it concise and actionable`,
  };

  const prompt = prompts[type];

  if (!prompt) {
    return NextResponse.json({ error: "Invalid utility type" }, { status: 400 });
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
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai utils] Groq API error:", response.status, errorText);
      return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ result: text.trim() });
  } catch (err) {
    console.error("[ai utils] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
