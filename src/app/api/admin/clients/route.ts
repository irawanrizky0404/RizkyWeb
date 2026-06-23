import { NextResponse } from "next/server";
import { getClients } from "@/lib/store";

export async function GET() {
  try {
    const clients = await getClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error("[api admin clients]", error);
    return NextResponse.json([], { status: 200 });
  }
}
