import { MetadataRoute } from "next";
import { getWorks } from "@/lib/store";
import { getSEO } from "@/lib/store";

export default function sitemap(): MetadataRoute.Sitemap {
  const seo = getSEO();
  const baseUrl = seo.canonicalBaseUrl || "https://rizkyirawan.com";
  const works = getWorks();

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${baseUrl}/works`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/cv`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/journal`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  const workPages = works.map((work) => ({
    url: `${baseUrl}/works/${work.slug}`,
    lastModified: new Date(work.year ? `${work.year}-01-01` : "2024-01-01"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const journalPages = works
    .filter((w) => w.tags?.includes("journal"))
    .map((w) => ({
      url: `${baseUrl}/journal/${w.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...workPages, ...journalPages];
}
