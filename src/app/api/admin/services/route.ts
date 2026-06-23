import { NextResponse } from "next/server";
import { getServices } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getServices());
}
