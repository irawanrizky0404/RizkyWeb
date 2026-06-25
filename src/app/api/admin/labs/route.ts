import { NextResponse } from "next/server";
import { getLabs } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const labs = await getLabs();
    return NextResponse.json(labs);
  } catch (error) {
    console.error("[api admin labs]", error);
    return NextResponse.json([], { status: 200 });
  }
}
