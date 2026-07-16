import { NextResponse } from "next/server";
import { saveWorks, getWorks } from "@/lib/store";
import worksData from "@/data/works.json";
import type { Project } from "@/lib/types";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

export async function POST() {
  // Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || ""));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Merge: keep existing KV data, overlay with local data for matching slugs, add missing ones
  const existing = await getWorks();
  const existingMap = new Map(existing.map((w: Project) => [w.slug, w]));
  const localWorks = worksData as Project[];

  const merged = localWorks.map((local) => {
    const kv = existingMap.get(local.slug);
    if (!kv) return local; // new work — add it
    // Existing work — update url, videoUrl, gallery if local has them
    return {
      ...kv,
      url: local.url || kv.url,
      videoUrl: local.videoUrl || kv.videoUrl,
      gallery: local.gallery.length > kv.gallery.length ? local.gallery : kv.gallery,
    };
  });

  // Add any KV-only works not in local data
  for (const kvWork of existing) {
    if (!merged.find((w) => w.slug === kvWork.slug)) {
      merged.push(kvWork);
    }
  }

  await saveWorks(merged);
  return NextResponse.json({ ok: true, total: merged.length, message: `Synced ${merged.length} works to KV` });
}
