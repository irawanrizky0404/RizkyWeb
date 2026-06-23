import { NextResponse } from "next/server";
import { getDesign } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await getDesign());
}
