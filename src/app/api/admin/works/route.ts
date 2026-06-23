import { NextResponse } from "next/server";
import { getWorks } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getWorks());
}
