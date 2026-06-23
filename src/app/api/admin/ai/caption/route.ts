import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageUrl, prompt } = await req.json();

  if (!imageUrl) {
    return NextResponse.json({ error: "Image URL or data is required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const imagePart = imageUrl.startsWith("data:")
      ? {
          mimeType: imageUrl.split(";")[0].replace("data:", ""),
          data: imageUrl.split(",")[1],
        }
      : await fetchImageAsBase64(imageUrl);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: imagePart,
                },
                {
                  text:
                    prompt ||
                    `Analyze this image and provide:
1. A short caption (5-10 words, evocative, fits a visual artist's portfolio)
2. A detailed description (2-3 sentences, atmospheric, describing mood/lighting/composition)

Format your response exactly as:
CAPTION: [your caption here]
DESCRIPTION: [your description here]`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai caption] Gemini API error:", response.status, errorText);
      return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

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

async function fetchImageAsBase64(url: string): Promise<{ mimeType: string; data: string }> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = response.headers.get("content-type") || "image/jpeg";
  return {
    mimeType,
    data: buffer.toString("base64"),
  };
}
