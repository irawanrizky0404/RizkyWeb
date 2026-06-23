import { writeFile, mkdir, readdir, stat, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/svg+xml"];
const MAX_SIZE = 10 * 1024 * 1024;

async function getAllImages(dir: string, baseCategory: string): Promise<{ name: string; path: string; size: number }[]> {
  const results: { name: string; path: string; size: number }[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const sub = await getAllImages(fullPath, baseCategory);
        results.push(...sub);
      } else if (entry.isFile() && /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(entry.name)) {
        const stats = await stat(fullPath);
        const relative = path.relative(path.join(process.cwd(), "public"), fullPath);
        results.push({
          name: entry.name,
          path: `/${relative.replace(/\\/g, "/")}`,
          size: stats.size,
        });
      }
    }
  } catch {
    // skip inaccessible dirs
  }
  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "general";
  const dir = path.join(process.cwd(), "public", "images", category);

  if (!existsSync(dir)) {
    return Response.json({ images: [] });
  }

  const images = await getAllImages(dir, category);
  return Response.json({ images });
}

export async function DELETE(request: Request) {
  try {
    const { paths } = await request.json();
    if (!Array.isArray(paths) || paths.length === 0) {
      return Response.json({ ok: false, error: "No paths provided" }, { status: 400 });
    }

    const results: { path: string; ok: boolean; error?: string }[] = [];
    for (const imgPath of paths) {
      const fullPath = path.join(process.cwd(), "public", imgPath.replace(/^\//, ""));
      try {
        if (existsSync(fullPath)) {
          await unlink(fullPath);
          results.push({ path: imgPath, ok: true });
        } else {
          results.push({ path: imgPath, ok: false, error: "File not found" });
        }
      } catch {
        results.push({ path: imgPath, ok: false, error: "Delete failed" });
      }
    }
    return Response.json({ results });
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string || "general").replace(/[^a-z0-9-]/gi, "-");

    if (!file) {
      return Response.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ ok: false, error: `File type "${file.type}" not allowed` }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ ok: false, error: "File too large (max 10MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 7);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").replace(/-+/g, "-");
    const baseName = safeName.replace(`.${ext}`, "");
    const filename = `${timestamp}-${random}-${baseName}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "images", category);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const publicPath = `/images/${category}/${filename}`;
    return Response.json({ ok: true, path: publicPath, filename });
  } catch (err) {
    console.error("[upload]", err);
    return Response.json({ ok: false, error: "Upload failed" }, { status: 500 });
  }
}
