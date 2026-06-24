import { NextResponse } from "next/server";
import { getContent } from "@/lib/store";

export async function GET() {
  try {
    const content = await getContent();
    return NextResponse.json(content);
  } catch (err) {
    console.error("[api admin content] Error:", err);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
