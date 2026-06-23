import { NextResponse } from "next/server";
import { getCV } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await getCV());
}
