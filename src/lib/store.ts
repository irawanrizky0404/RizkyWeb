import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { Project, JournalPost, Service, Experience, SkillGroup, Education, Award } from "@/lib/types";
import { projects as defaultProjects, journalPosts as defaultPosts, services as defaultServices, clientList as defaultClients, experiences as defaultExperiences, skillGroups as defaultSkillGroups, tools as defaultTools, education as defaultEducation, awards as defaultAwards } from "@/lib/data";

const DATA_DIR = join(process.cwd(), "src", "data");

const FILES = {
  design: "design.json",
  works: "works.json",
  journal: "journal.json",
  services: "services.json",
  clients: "clients.json",
  cv: "cv.json",
  seo: "seo.json",
} as const;

type FileKey = keyof typeof FILES;

export type CVData = {
  experiences: Experience[];
  skillGroups: SkillGroup[];
  tools: SkillGroup[];
  education: Education[];
  awards: Award[];
};

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON<T>(key: FileKey, fallback: T): T {
  const file = join(DATA_DIR, FILES[key]);
  try {
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: FileKey, data: unknown): void {
  ensureDataDir();
  const file = join(DATA_DIR, FILES[key]);
  writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
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

export function getDesign(): DesignConfig {
  return readJSON("design", defaultDesign);
}

export function saveDesign(config: DesignConfig): void {
  writeJSON("design", config);
}

// ── Works ────────────────────────────────────────────────────────────────────
export function getWorks(): Project[] {
  const result = readJSON<Project[]>("works", defaultProjects);
  return Array.isArray(result) ? result : defaultProjects;
}

export function saveWorks(works: Project[]): void {
  writeJSON("works", works);
}

// ── Journal ──────────────────────────────────────────────────────────────────
export function getJournal(includeUnpublished = false): JournalPost[] {
  const result = readJSON<JournalPost[]>("journal", defaultPosts);
  const posts = Array.isArray(result) ? result : defaultPosts;
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

export function saveJournal(posts: JournalPost[]): void {
  writeJSON("journal", posts);
}

// ── Services ──────────────────────────────────────────────────────────────────
export function getServices(): Service[] {
  const result = readJSON<Service[]>("services", defaultServices);
  return Array.isArray(result) ? result : defaultServices;
}

export function saveServices(services: Service[]): void {
  writeJSON("services", services);
}

// ── Clients ──────────────────────────────────────────────────────────────────
export function getClients(): string[] {
  const result = readJSON<string[]>("clients", defaultClients);
  return Array.isArray(result) ? result : defaultClients;
}

export function saveClients(clients: string[]): void {
  writeJSON("clients", clients);
}

// ── CV ────────────────────────────────────────────────────────────────────
const defaultCV: CVData = {
  experiences: defaultExperiences,
  skillGroups: defaultSkillGroups,
  tools: defaultTools,
  education: defaultEducation,
  awards: defaultAwards,
};

export function getCV(): CVData {
  return readJSON("cv", defaultCV);
}

export function saveCV(cv: CVData): void {
  writeJSON("cv", cv);
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

export function getSEO(): SEOConfig {
  return readJSON("seo", defaultSEO);
}

export function saveSEO(seo: SEOConfig): void {
  writeJSON("seo", seo);
}

export function buildMetadata(overrides: {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
} = {}): import("next").Metadata {
  const seo = getSEO();
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
