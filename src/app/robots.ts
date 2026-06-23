import { MetadataRoute } from "next";
import { getSEO } from "@/lib/store";

export default function robots(): MetadataRoute.Robots {
  const seo = getSEO();
  const baseUrl = seo.canonicalBaseUrl || "https://rizkyirawan.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
