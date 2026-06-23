import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageUrl, prompt } = await req.json();

  if (!imageUrl) {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  return NextResponse.json({
    error: "Image captioning is not supported with Groq. Groq's free models do not support image inputs. Please use Gemini or OpenAI for image captioning.",
    caption: "",
    description: "",
    raw: "",
  }, { status: 501 });
}
