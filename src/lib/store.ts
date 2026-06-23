import type { Project, JournalPost, Service, Experience, SkillGroup, Education, Award } from "@/lib/types";
import { projects as defaultProjects, journalPosts as defaultPosts, services as defaultServices, clientList as defaultClients, experiences as defaultExperiences, skillGroups as defaultSkillGroups, tools as defaultTools, education as defaultEducation, awards as defaultAwards } from "@/lib/data";

const JSONBIN_BASE = "https://api.jsonbin.io/v3";
const BIN_IDS = {
  design: process.env.JSONBIN_DESIGN_ID || "",
  works: process.env.JSONBIN_WORKS_ID || "",
  journal: process.env.JSONBIN_JOURNAL_ID || "",
  services: process.env.JSONBIN_SERVICES_ID || "",
  clients: process.env.JSONBIN_CLIENTS_ID || "",
  cv: process.env.JSONBIN_CV_ID || "",
  seo: process.env.JSONBIN_SEO_ID || "",
};

const memoryCache: Record<string, string> = {};

export type CVData = {
  experiences: Experience[];
  skillGroups: SkillGroup[];
  tools: SkillGroup[];
  education: Education[];
  awards: Award[];
};

async function fetchJSONBin<T>(key: keyof typeof BIN_IDS, fallback: T): Promise<T> {
  const cacheKey = key;

  if (memoryCache[cacheKey]) {
    try {
      return JSON.parse(memoryCache[cacheKey]) as T;
    } catch {
      delete memoryCache[cacheKey];
    }
  }

  const binId = BIN_IDS[key];
  if (!binId) {
    return fallback;
  }

  try {
    const response = await fetch(`${JSONBIN_BASE}/b/${binId}/latest`, {
      headers: {
        "X-Access-Key": process.env.JSONBIN_ACCESS_KEY || "",
      },
    });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const value = data.record || data;
    memoryCache[cacheKey] = JSON.stringify(value);
    return value as T;
  } catch {
    return fallback;
  }
}

async function saveJSONBin(key: keyof typeof BIN_IDS, data: unknown): Promise<void> {
  const binId = BIN_IDS[key];
  if (!binId) {
    console.warn(`[store] No bin ID for ${key}, skipping save`);
    return;
  }

  const json = JSON.stringify(data, null, 2);
  memoryCache[key] = json;

  console.log(`[store] Saving ${key} to bin ${binId}`);

  const response = await fetch(`${JSONBIN_BASE}/b/${binId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": process.env.JSONBIN_ACCESS_KEY || "",
    },
    body: json,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[store] Failed to save ${key}: ${response.status} - ${errorText}`);
    throw new Error(`Failed to save ${key}: ${response.status}`);
  }

  console.log(`[store] Successfully saved ${key}`);
}

export type DesignConfig = {
  colors: { signal: string; black: string; white: string; grey: string };
  hero: { statement: string; bio: string; availableText: string };
  site: { name: string; role: string; tagline: string; email: string; location: string; timezone: string; established: string };
  social: { instagram: string; behance: string; linkedin: string };
};

const defaultDesign: DesignConfig = {
  colors: { signal: "#ff3500", black: "#080808", white: "#f0f0ee", grey: "#7a7a76" },
  hero: { statement: "Working at the frequency between signal and silence.", bio: "", availableText: "Available for Work" },
  site: { name: "Rizky Irawan", role: "Multidisciplinary Visual Artist", tagline: "Visual Archive", email: "rizkyirawan0404@gmail.com", location: "Indonesia", timezone: "UTC +7", established: "2017" },
  social: { instagram: "", behance: "", linkedin: "" },
};

export async function getDesign(): Promise<DesignConfig> {
  return fetchJSONBin("design", defaultDesign);
}

export async function saveDesign(config: DesignConfig): Promise<void> {
  await saveJSONBin("design", config);
}

// ── Works ────────────────────────────────────────────────────────────────────
export async function getWorks(): Promise<Project[]> {
  return fetchJSONBin("works", defaultProjects);
}

export async function saveWorks(works: Project[]): Promise<void> {
  await saveJSONBin("works", works);
}

// ── Journal ──────────────────────────────────────────────────────────────────
export async function getJournal(includeUnpublished = false): Promise<JournalPost[]> {
  const posts = await fetchJSONBin<JournalPost[]>("journal", defaultPosts);
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

export async function saveJournal(posts: JournalPost[]): Promise<void> {
  await saveJSONBin("journal", posts);
}

// ── Services ──────────────────────────────────────────────────────────────────
export async function getServices(): Promise<Service[]> {
  return fetchJSONBin("services", defaultServices);
}

export async function saveServices(services: Service[]): Promise<void> {
  await saveJSONBin("services", services);
}

// ── Clients ──────────────────────────────────────────────────────────────────
export async function getClients(): Promise<string[]> {
  return fetchJSONBin("clients", defaultClients);
}

export async function saveClients(clients: string[]): Promise<void> {
  await saveJSONBin("clients", clients);
}

// ── CV ────────────────────────────────────────────────────────────────────
const defaultCV: CVData = {
  experiences: defaultExperiences,
  skillGroups: defaultSkillGroups,
  tools: defaultTools,
  education: defaultEducation,
  awards: defaultAwards,
};

export async function getCV(): Promise<CVData> {
  return fetchJSONBin("cv", defaultCV);
}

export async function saveCV(cv: CVData): Promise<void> {
  await saveJSONBin("cv", cv);
}

// ── SEO ────────────────────────────────────────────────────────────────────
export type SEOConfig = {
  siteName: string;
  titleTemplate: string;
  defaultDescription: string;
  ogImage: string;
  canonicalBaseUrl: string;
  twitterHandle: string;
  robots: string;
};

const defaultSEO: SEOConfig = {
  siteName: "Rizky Irawan",
  titleTemplate: "%s — Rizky Irawan",
  defaultDescription: "Visual archive of works in 3D, motion, illustration, and graphic design — atmospheric, post-industrial, editorial.",
  ogImage: "",
  canonicalBaseUrl: "",
  twitterHandle: "",
  robots: "index, follow",
};

export async function getSEO(): Promise<SEOConfig> {
  return fetchJSONBin("seo", defaultSEO);
}

export async function saveSEO(seo: SEOConfig): Promise<void> {
  await saveJSONBin("seo", seo);
}

export async function buildMetadata(overrides: {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
} = {}): Promise<import("next").Metadata> {
  const seo = await getSEO();
  const base = seo.canonicalBaseUrl || "https://rizkyirawan.com";

  const metadataBase = overrides.canonical ? undefined : new URL(base);

  return {
    metadataBase,
    title: overrides.title || seo.siteName,
    description: overrides.description || seo.defaultDescription,
    authors: overrides.authors ? [{ name: overrides.authors[0] }] : [{ name: seo.siteName }],
    openGraph: {
      type: overrides.type || "website",
      locale: "en_US",
      title: overrides.title ? `${overrides.title} — ${seo.siteName}` : seo.siteName,
      description: overrides.description || seo.defaultDescription,
      siteName: seo.siteName,
      images: overrides.image ? [{ url: overrides.image }] : seo.ogImage ? [{ url: seo.ogImage }] : [],
      ...(overrides.publishedTime ? { publishedTime: overrides.publishedTime } : {}),
      ...(overrides.authors ? { authors: overrides.authors } : {}),
      ...(overrides.tags ? { tags: overrides.tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: seo.twitterHandle || undefined,
      title: overrides.title || seo.siteName,
      description: overrides.description || seo.defaultDescription,
      images: overrides.image ? [overrides.image] : seo.ogImage ? [seo.ogImage] : [],
    },
    robots: seo.robots ? { index: seo.robots.includes("index"), follow: seo.robots.includes("follow") } : { index: true, follow: true },
    alternates: overrides.canonical ? { canonical: overrides.canonical } : undefined,
  };
}
