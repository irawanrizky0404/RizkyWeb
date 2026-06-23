import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

export type ActivityEntry = {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  user?: string;
};

const ACTIVITY_FILE = path.join(process.cwd(), "src", "data", "activity.json");

function readActivity(): ActivityEntry[] {
  try {
    if (!existsSync(ACTIVITY_FILE)) return [];
    return JSON.parse(readFileSync(ACTIVITY_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeActivity(entries: ActivityEntry[]) {
  const dir = path.dirname(ACTIVITY_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(ACTIVITY_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function GET() {
  const entries = readActivity();
  return Response.json({ entries: entries.reverse() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entry: ActivityEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      action: body.action || "Unknown",
      detail: body.detail || "",
      user: body.user,
    };

    const entries = readActivity();
    entries.push(entry);
    writeActivity(entries);

    return Response.json({ ok: true, entry });
  } catch (err) {
    console.error("[activity log]", err);
    return Response.json({ ok: false, error: "Failed to log" }, { status: 500 });
  }
}
