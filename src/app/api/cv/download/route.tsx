import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { CVPDF } from "@/lib/pdf/cv-document";
import { getCV } from "@/lib/store";

export async function GET() {
  try {
    const cv = getCV();
    const buffer = await renderToBuffer(<CVPDF cv={cv} />);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=rizky-irawan-cv.pdf",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[CV PDF]", err);
    return new NextResponse("Failed to generate CV PDF", { status: 500 });
  }
}
