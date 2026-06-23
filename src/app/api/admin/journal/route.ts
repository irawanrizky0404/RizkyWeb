import { NextResponse } from "next/server";
import { getJournal } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const journal = await getJournal();
    return NextResponse.json(journal, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[api admin journal]", error);
    return NextResponse.json([], { status: 200 });
  }
}
