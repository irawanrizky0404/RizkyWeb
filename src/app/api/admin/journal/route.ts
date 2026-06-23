import { NextResponse } from "next/server";
import { getJournal } from "@/lib/store";

export async function GET() {
  try {
    const journal = await getJournal();
    return NextResponse.json(journal);
  } catch (error) {
    console.error("[api admin journal]", error);
    return NextResponse.json([], { status: 200 });
  }
}
