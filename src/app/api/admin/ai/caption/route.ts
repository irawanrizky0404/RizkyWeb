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

  return NextResponse.json({
    error: "Image captioning is not supported with grok-build-0.1. This model only supports text input. Please upload image as a file and use a different AI service for image captioning.",
    caption: "",
    description: "",
    raw: "",
  }, { status: 501 });
}
