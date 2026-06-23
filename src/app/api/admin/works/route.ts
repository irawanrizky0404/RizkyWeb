import { NextResponse } from "next/server";
import { getWorks } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const works = await getWorks();
    return NextResponse.json(works);
  } catch (error) {
    console.error("[api admin works]", error);
    return NextResponse.json([], { status: 200 });
  }
}
