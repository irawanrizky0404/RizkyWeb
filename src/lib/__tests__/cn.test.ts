import { describe, it, expect } from "vitest";

describe("cn utility", () => {
  it("handles basic class merging", async () => {
    const { cn } = await import("@/lib/utils");
    const result = cn("text-white", "text-white/50");
    expect(result).toContain("text-white");
  });

  it("handles conditional classes", async () => {
    const { cn } = await import("@/lib/utils");
    const result = cn("text-white", false && "text-black", "bg-black");
    expect(result).toContain("text-white");
    expect(result).toContain("bg-black");
    expect(result).not.toContain("text-black");
  });

  it("handles undefined", async () => {
    const { cn } = await import("@/lib/utils");
    const result = cn("text-white", undefined, "bg-black");
    expect(result).toContain("text-white");
    expect(result).toContain("bg-black");
  });
});
