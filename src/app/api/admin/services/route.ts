import { NextResponse } from "next/server";
import { getServices } from "@/lib/store";

export async function GET() {
  try {
    const services = await getServices();
    return NextResponse.json(services);
  } catch (error) {
    console.error("[api admin services]", error);
    return NextResponse.json([], { status: 200 });
  }
}
