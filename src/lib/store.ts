import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { Project, JournalPost, Service, Experience, SkillGroup, Education, Award } from "@/lib/types";
import { projects as defaultProjects, journalPosts as defaultPosts, services as defaultServices, clientList as defaultClients, experiences as defaultExperiences, skillGroups as defaultSkillGroups, tools as defaultTools, education as defaultEducation, awards as defaultAwards } from "@/lib/data";

const DATA_DIR = join(process.cwd(), "src/data");
const DESIGN_FILE = join(DATA_DIR, "design.json");
const WORKS_FILE = join(DATA_DIR, "works.json");
const JOURNAL_FILE = join(DATA_DIR, "journal.json");
const SERVICES_FILE = join(DATA_DIR, "services.json");
const CLIENTS_FILE = join(DATA_DIR, "clients.json");
const CV_FILE = join(DATA_DIR, "cv.json");
const SEO_FILE = join(DATA_DIR, "seo.json");

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

function readJSON<T>(file: string, fallback: T): T {
  try {
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(file: string, data: unknown) {
  ensureDataDir();
  writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

// ── Design ──────────────────────────────────────────────────────────────────
export type DesignConfig = {
  colors: { signal: string; black: string; white: string; grey: string };
  hero: { statement: string; bio: string; availableText: string };
  site: { name: string; role: string; tagline: string; email: string; location: string; timezone: string; established: string };
  social: { instagram: string; behance: string; linkedin: string };
};

export function getDesign(): DesignConfig {
  return readJSON<DesignConfig>(DESIGN_FILE, {
    colors: { signal: "#ff3500", black: "#080808", white: "#f0f0ee", grey: "#7a7a76" },
    hero: { statement: "Working at the frequency between signal and silence.", bio: "", availableText: "Available for Work" },
    site: { name: "Rizky Irawan", role: "Multidisciplinary Visual Artist", tagline: "Visual Archive", email: "rizkyirawan0404@gmail.com", location: "Indonesia", timezone: "UTC +7", established: "2017" },
    social: { instagram: "", behance: "", linkedin: "" },
  });
}

export function saveDesign(config: DesignConfig) {
  writeJSON(DESIGN_FILE, config);
}

// ── Works ────────────────────────────────────────────────────────────────────
export function getWorks(): Project[] {
  return readJSON<Project[]>(WORKS_FILE, defaultProjects);
}

export function saveWorks(works: Project[]) {
  writeJSON(WORKS_FILE, works);
}

// ── Journal ──────────────────────────────────────────────────────────────────
export function getJournal(includeUnpublished = false): JournalPost[] {
  const posts = readJSON<JournalPost[]>(JOURNAL_FILE, defaultPosts);
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

export function saveJournal(posts: JournalPost[]) {
  writeJSON(JOURNAL_FILE, posts);
}

// ── Services ─────────────────────────────────────────────────────────────────
export function getServices(): Service[] {
  return readJSON<Service[]>(SERVICES_FILE, defaultServices);
}

export function saveServices(services: Service[]) {
  writeJSON(SERVICES_FILE, services);
}

// ── Clients ──────────────────────────────────────────────────────────────────
export function getClients(): string[] {
  return readJSON<string[]>(CLIENTS_FILE, defaultClients);
}

export function saveClients(clients: string[]) {
  writeJSON(CLIENTS_FILE, clients);
}

// ── CV ────────────────────────────────────────────────────────────────────
export function getCV(): CVData {
  return readJSON<CVData>(CV_FILE, {
    experiences: defaultExperiences,
    skillGroups: defaultSkillGroups,
    tools: defaultTools,
    education: defaultEducation,
    awards: defaultAwards,
  });
}

export function saveCV(cv: CVData) {
  writeJSON(CV_FILE, cv);
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

export function getSEO(): SEOConfig {
  return readJSON<SEOConfig>(SEO_FILE, {
    siteName: "Rizky Irawan",
    titleTemplate: "%s — Rizky Irawan",
    defaultDescription: "Visual archive of works in 3D, motion, illustration, and graphic design — atmospheric, post-industrial, editorial.",
    ogImage: "",
    canonicalBaseUrl: "",
    twitterHandle: "",
    robots: "index, follow",
  });
}

export function saveSEO(seo: SEOConfig) {
  writeJSON(SEO_FILE, seo);
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
