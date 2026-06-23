import { readdir, stat, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET() {
  const baseDir = path.join(process.cwd(), "public", "images");
  if (!existsSync(baseDir)) {
    return Response.json({ images: [] });
  }

  const categories = ["works", "clients", "hero", "services", "journal", "general"];
  const allImages: { name: string; path: string; size: number; category: string }[] = [];

  for (const cat of categories) {
    const dir = path.join(baseDir, cat);
    if (!existsSync(dir)) continue;

    try {
      const files = await readdir(dir);
      for (const file of files) {
        if (!/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(file)) continue;
        try {
          const stats = await stat(path.join(dir, file));
          allImages.push({
            name: file,
            path: `/images/${cat}/${file}`,
            size: stats.size,
            category: cat,
          });
        } catch {
          // skip
        }
      }
    } catch {
      // skip
    }
  }

  return Response.json({ images: allImages });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return Response.json({ ok: false, error: "No path provided" }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), "public", filePath);

  if (!fullPath.startsWith(path.join(process.cwd(), "public"))) {
    return Response.json({ ok: false, error: "Invalid path" }, { status: 400 });
  }

  if (!existsSync(fullPath)) {
    return Response.json({ ok: false, error: "File not found" }, { status: 404 });
  }

  try {
    await unlink(fullPath);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[delete media]", err);
    return Response.json({ ok: false, error: "Delete failed" }, { status: 500 });
  }
}
