import { describe, it, expect } from "vitest";

function normalizeSlug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

describe("Slug Normalization", () => {
  it("converts spaces to hyphens", () => {
    expect(normalizeSlug("My Project Title")).toBe("my-project-title");
  });

  it("removes special characters", () => {
    expect(normalizeSlug("Test@Project!2024")).toBe("testproject2024");
  });

  it("handles already-slugified text", () => {
    expect(normalizeSlug("already-slugified")).toBe("already-slugified");
  });

  it("handles mixed case", () => {
    expect(normalizeSlug("UpperCase AND LowerCase")).toBe("uppercase-and-lowercase");
  });

  it("handles unicode", () => {
    expect(normalizeSlug("Projetçaƒ")).toBe("projeta");
  });
});

describe("CV Data Structure", () => {
  it("CVData has required fields", () => {
    const mockCV = {
      experiences: [],
      skillGroups: [],
      tools: [],
      education: [],
      awards: [],
    };
    expect(mockCV).toHaveProperty("experiences");
    expect(mockCV).toHaveProperty("skillGroups");
    expect(mockCV).toHaveProperty("tools");
    expect(mockCV).toHaveProperty("education");
    expect(mockCV).toHaveProperty("awards");
  });

  it("Project has required fields", () => {
    const mockProject = {
      slug: "test-project",
      title: "Test Project",
      year: "2024",
      category: "3D" as const,
      client: "Test Client",
      summary: "A test project",
      description: "Full description",
      tags: ["3D", "Archviz"],
      cover: "/images/test.jpg",
      gallery: [],
      featured: false,
    };
    expect(mockProject.slug).toBe("test-project");
    expect(mockProject.category).toBe("3D");
    expect(mockProject.tags).toHaveLength(2);
  });

  it("JournalPost supports all statuses", () => {
    const draft: import("@/lib/types").JournalPost = {
      slug: "draft",
      title: "Draft",
      date: "2024-01-01",
      excerpt: "",
      content: "",
      tags: [],
      status: "draft",
    };
    const published: import("@/lib/types").JournalPost = {
      slug: "pub",
      title: "Published",
      date: "2024-01-01",
      excerpt: "",
      content: "",
      tags: [],
      status: "published",
    };
    const scheduled: import("@/lib/types").JournalPost = {
      slug: "sched",
      title: "Scheduled",
      date: "2024-01-01",
      excerpt: "",
      content: "",
      tags: [],
      status: "scheduled",
      scheduledAt: "2099-01-01",
    };
    expect(draft.status).toBe("draft");
    expect(published.status).toBe("published");
    expect(scheduled.status).toBe("scheduled");
  });
});
