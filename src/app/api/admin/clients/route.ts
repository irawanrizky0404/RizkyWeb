import { NextResponse } from "next/server";
import { getClients } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getClients());
}
