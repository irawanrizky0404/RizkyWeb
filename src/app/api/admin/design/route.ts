import { NextResponse } from "next/server";
import { getDesign } from "@/lib/store";

export async function GET() {
  try {
    const design = await getDesign();
    return NextResponse.json(design);
  } catch (error) {
    console.error("[api admin design]", error);
    return NextResponse.json({
      colors: { signal: "#ff3500", black: "#080808", white: "#f0f0ee", grey: "#7a7a76" },
      hero: { statement: "", bio: "", availableText: "Available for Work" },
      site: { name: "", role: "", tagline: "", email: "", location: "", timezone: "", established: "" },
      social: { instagram: "", behance: "", linkedin: "" },
    }, { status: 200 });
  }
}
