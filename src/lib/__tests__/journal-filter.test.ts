import { describe, it, expect } from "vitest";
import type { JournalPost } from "@/lib/types";

function filterPosts(posts: JournalPost[], includeUnpublished: boolean): JournalPost[] {
  if (includeUnpublished) return posts;

  const now = new Date();
  return posts.filter((post) => {
    if (post.status === "draft") return false;
    if (post.status === "scheduled" && post.scheduledAt) {
      return new Date(post.scheduledAt) <= now;
    }
    return true;
  });
}

const mockPosts: JournalPost[] = [
  { slug: "post-1", title: "Published Post", date: "2024-01-01", excerpt: "", content: "", tags: [], status: "published" },
  { slug: "post-2", title: "Draft Post", date: "2024-01-02", excerpt: "", content: "", tags: [], status: "draft" },
  { slug: "post-3", title: "Scheduled Past", date: "2024-01-03", excerpt: "", content: "", tags: [], status: "scheduled", scheduledAt: "2020-01-01" },
  { slug: "post-4", title: "Scheduled Future", date: "2024-01-04", excerpt: "", content: "", tags: [], status: "scheduled", scheduledAt: "2099-01-01" },
  { slug: "post-5", title: "No Status", date: "2024-01-05", excerpt: "", content: "", tags: [] },
];

describe("Journal Post Filtering", () => {
  it("includeUnpublished=true returns all posts", () => {
    const result = filterPosts(mockPosts, true);
    expect(result).toHaveLength(5);
  });

  it("published posts are always visible", () => {
    const result = filterPosts(mockPosts, false);
    expect(result.find((p) => p.slug === "post-1")).toBeDefined();
  });

  it("draft posts are hidden", () => {
    const result = filterPosts(mockPosts, false);
    expect(result.find((p) => p.slug === "post-2")).toBeUndefined();
  });

  it("past-scheduled posts are visible", () => {
    const result = filterPosts(mockPosts, false);
    expect(result.find((p) => p.slug === "post-3")).toBeDefined();
  });

  it("future-scheduled posts are hidden", () => {
    const result = filterPosts(mockPosts, false);
    expect(result.find((p) => p.slug === "post-4")).toBeUndefined();
  });

  it("posts without status are visible", () => {
    const result = filterPosts(mockPosts, false);
    expect(result.find((p) => p.slug === "post-5")).toBeDefined();
  });

  it("filters to 3 visible posts (published, past-scheduled, no-status)", () => {
    const result = filterPosts(mockPosts, false);
    expect(result).toHaveLength(3);
    expect(result.map((p) => p.slug)).toEqual(["post-1", "post-3", "post-5"]);
  });
});
