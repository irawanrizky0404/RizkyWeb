import { NextResponse } from "next/server";
import { getCV } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cv = await getCV();
    return NextResponse.json(cv);
  } catch (error) {
    console.error("[api admin cv]", error);
    return NextResponse.json({ experiences: [], skillGroups: [], tools: [], education: [], awards: [] }, { status: 200 });
  }
}
