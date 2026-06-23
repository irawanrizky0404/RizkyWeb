import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageUrl, prompt } = await req.json();

  if (!imageUrl) {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  }

  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "XAI_API_KEY not configured" }, { status: 500 });
  }

  if (imageUrl.startsWith("data:")) {
    return NextResponse.json({ error: "Clipboard paste not supported. Please upload image as file instead." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.3",
        input: [
          {
            role: "user",
            content: prompt ||
              `Analyze this image and provide:
1. A short caption (5-10 words, evocative, fits a visual artist's portfolio)
2. A detailed description (2-3 sentences, atmospheric, describing mood/lighting/composition)

Format your response exactly as:
CAPTION: [your caption here]
DESCRIPTION: [your description here]`,
          },
          {
            role: "user",
            content: `Image URL: ${imageUrl}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai caption] xAI API error:", response.status, errorText);
      return NextResponse.json({ error: `AI request failed: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    const captionMatch = text.match(/CAPTION:\s*(.+)/i);
    const descBlock = text.split(/DESCRIPTION:/i)[1]?.trim() ?? "";
    const description = descBlock.split(/\n/)[0]?.replace(/\n+$/, "") ?? "Unable to generate description";

    return NextResponse.json({
      caption: captionMatch?.[1]?.trim() ?? "Unable to generate caption",
      description,
      raw: text,
    });
  } catch (err) {
    console.error("[ai caption] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
