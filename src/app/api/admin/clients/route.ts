import { NextResponse } from "next/server";
import { getClients } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clients = await getClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error("[api admin clients]", error);
    return NextResponse.json([], { status: 200 });
  }
}
