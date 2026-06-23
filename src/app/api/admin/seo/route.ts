import { getSEO, saveSEO } from "@/lib/store";
import type { SEOConfig } from "@/lib/store";

export async function GET() {
  return Response.json(getSEO());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    saveSEO(body as SEOConfig);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[seo]", err);
    return Response.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
}
