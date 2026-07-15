import type { Project, JournalPost, Service, Experience, SkillGroup, Education, Award, LabExperiment } from "@/lib/types";
import { projects as defaultProjects, journalPosts as defaultPosts, services as defaultServices, clientList as defaultClients, experiences as defaultExperiences, skillGroups as defaultSkillGroups, tools as defaultTools, education as defaultEducation, awards as defaultAwards } from "@/lib/data";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

import { kv } from "@vercel/kv";
import { revalidateTag } from "next/cache";

type BlobKey = "design" | "works" | "journal" | "services" | "clients" | "cv" | "seo" | "content" | "labs";

export type CVData = {
  experiences: Experience[];
  skillGroups: SkillGroup[];
  tools: SkillGroup[];
  education: Education[];
  awards: Award[];
};

async function fetchData<T>(key: BlobKey, fallback: T): Promise<T> {
  const isKvConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
  
  if (!isKvConfigured) {
    console.warn(`[store] No KV config for ${key}, falling back to local file`);
    try {
      const filePath = path.join(process.cwd(), "src", "data", `${key}.json`);
      if (existsSync(filePath)) {
        const fileData = readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(fileData);
        return parsed as T;
      }
    } catch (err) {
      console.error(`[store] Local read error for ${key}:`, err);
    }
    return fallback;
  }

  try {
    const data = await kv.get<T>(key);
    
    if (data === null || data === undefined) {
      console.warn(`[store] ${key} returned null, using fallback`);
      return fallback;
    }
    
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length === 0 || (keys.length === 1 && (data as any)[keys[0]] === null)) {
        console.warn(`[store] ${key} returned empty object or {"data": null}, using fallback`);
        return fallback;
      }
    }
    
    return data;
  } catch (err) {
    console.error(`[store] ${key} error:`, err);
    return fallback;
  }
}

async function saveData(key: BlobKey, data: unknown): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  const isKvConfigured = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

  if (!isKvConfigured) {
    console.warn(`[store] No KV config for ${key}, saving to local file`);
    const dir = path.join(process.cwd(), "src", "data");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(path.join(dir, `${key}.json`), json, "utf-8");
    return;
  }

  await kv.set(key, data);
  revalidateTag(key, { expire: 0 });
}

export type DesignConfig = {
  colors: { signal: string; black: string; white: string; grey: string };
  hero: { statement: string; bio: string; availableText: string; heroImage: string; imageTitle?: string; imageSubtitle?: string; statementSize: string; statementAlign: string; showImage: boolean; imageOverlay: number; };
  site: { name: string; role: string; tagline: string; email: string; location: string; timezone: string; established: string };
  social: { instagram: string; behance: string; linkedin: string; studio?: string };
  fonts: {
    display: string;
    heading: string;
    body: string;
    accent: string;
  };
  favicon: string;
  meta: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  layout: {
    containerWidth: string;
    sectionPadding: string;
    gridGap: string;
    borderRadius: string;
    headerHeight: string;
    navStyle: string;
    worksGridCols: number;
    journalGridCols: number;
  };
  components: {
    buttonStyle: string;
    cardStyle: string;
    badgeStyle: string;
    inputStyle: string;
    borderRadius: string;
    buttonPadding: string;
    cardPadding: string;
    shadowStyle: string;
  };
};

const defaultDesign: DesignConfig = {
  colors: { signal: "#ff3500", black: "#080808", white: "#f0f0ee", grey: "#7a7a76" },
  hero: { statement: "Working at the frequency between signal and silence.", bio: "", availableText: "Available for Work", heroImage: "/images/works/phantom-in-the-ruins/01.jpg", imageTitle: "Phantom in the Ruins", imageSubtitle: "Personal Series · 2024", statementSize: "clamp(3rem, 10vw, 12rem)", statementAlign: "left", showImage: true, imageOverlay: 0.6 },
  site: { name: "Rizky Irawan", role: "Multidisciplinary Visual Artist", tagline: "Visual Archive", email: "rizkyirawan0404@gmail.com", location: "Indonesia", timezone: "UTC +7", established: "2017" },
  social: { instagram: "", behance: "", linkedin: "", studio: "" },
  fonts: {
    display: "Bebas Neue",
    heading: "IBM Plex Sans",
    body: "IBM Plex Sans",
    accent: "IBM Plex Mono",
  },
  favicon: "",
  meta: {
    title: "",
    description: "",
    keywords: "",
    ogImage: "",
  },
  layout: {
    containerWidth: "1280px",
    sectionPadding: "80px 40px",
    gridGap: "24px",
    borderRadius: "4px",
    headerHeight: "64px",
    navStyle: "minimal",
    worksGridCols: 3,
    journalGridCols: 2,
  },
  components: {
    buttonStyle: "bordered",
    cardStyle: "bordered",
    badgeStyle: "bordered",
    inputStyle: "bordered",
    borderRadius: "4px",
    buttonPadding: "12px 24px",
    cardPadding: "20px",
    shadowStyle: "none",
  },
};

export async function getDesign(): Promise<DesignConfig> {
  return fetchData("design", defaultDesign);
}

export async function saveDesign(config: DesignConfig): Promise<void> {
  await saveData("design", config);
}

// ── Works ────────────────────────────────────────────────────────────────────
export async function getWorks(): Promise<Project[]> {
  const result = await fetchData<Project[]>("works", defaultProjects);
  return Array.isArray(result) ? result : defaultProjects;
}

export async function saveWorks(works: Project[]): Promise<void> {
  await saveData("works", works);
}

// ── Journal ──────────────────────────────────────────────────────────────────
export async function getJournal(includeUnpublished = false): Promise<JournalPost[]> {
  const result = await fetchData<JournalPost[]>("journal", defaultPosts);
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

export async function saveJournal(posts: JournalPost[]): Promise<void> {
  await saveData("journal", posts);
}

// ── Labs ──────────────────────────────────────────────────────────────────────
const defaultLabs: LabExperiment[] = [
  {
    slug: "fluid-sim",
    title: "WebGL Fluid Simulation",
    year: "2024",
    description: "Real-time fluid dynamics computed in a custom GLSL shader.",
    componentName: "FluidSim"
  },
  {
    slug: "wireframe-cube",
    title: "Reactive Wireframe",
    year: "2024",
    description: "A three.js cube that reacts to mouse velocity and scroll position.",
    componentName: "WireframeCube"
  },
  {
    slug: "hologram-torus",
    title: "Holographic Ascii Torus",
    year: "2024",
    description: "A glowing wireframe torus that reacts to pointer movement.",
    componentName: "HologramTorus"
  },
  {
    slug: "audio-visualizer",
    title: "Audio Reactive Mesh",
    year: "2024",
    description: "A 3D geometry that deforms in real-time based on microphone audio frequencies using the Web Audio API.",
    componentName: "AudioVisualizer"
  }
];

export async function getLabs(): Promise<LabExperiment[]> {
  const result = await fetchData<LabExperiment[]>("labs", defaultLabs);
  return Array.isArray(result) ? result : defaultLabs;
}

export async function saveLabs(labs: LabExperiment[]): Promise<void> {
  await saveData("labs", labs);
}

// ── Services ──────────────────────────────────────────────────────────────────
export async function getServices(): Promise<Service[]> {
  const result = await fetchData<Service[]>("services", defaultServices);
  return Array.isArray(result) ? result : defaultServices;
}

export async function saveServices(services: Service[]): Promise<void> {
  await saveData("services", services);
}

// ── Clients ──────────────────────────────────────────────────────────────────
export async function getClients(): Promise<string[]> {
  const result = await fetchData<string[]>("clients", defaultClients);
  return Array.isArray(result) ? result : defaultClients;
}

export async function saveClients(clients: string[]): Promise<void> {
  await saveData("clients", clients);
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
  return fetchData("cv", defaultCV);
}

export async function saveCV(cv: CVData): Promise<void> {
  await saveData("cv", cv);
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
  return fetchData("seo", defaultSEO);
}

export async function saveSEO(seo: SEOConfig): Promise<void> {
  await saveData("seo", seo);
}

// ── Page Content ──────────────────────────────────────────────────────────────
export type PageContent = {
  homepage: {
    statement: string;
    bio: string;
    location: string;
    established: string;
    showFilmStrip: boolean;
    showWorks: boolean;
    showCapabilities: boolean;
    showClients: boolean;
    showRecognition: boolean;
    showCta: boolean;
    ctaText: string;
    metaTitle: string;
    metaDescription: string;
  };
  about: {
    intro: string;
    storyTitle: string;
    story: string;
    approachTitle: string;
    approach: string;
    imageUrl: string;
    metaTitle: string;
    metaDescription: string;
  };
  services: {
    intro: string;
    outro: string;
    metaTitle: string;
    metaDescription: string;
  };
  labs: {
    intro: string;
    metaTitle: string;
    metaDescription: string;
  };
  contact: {
    intro: string;
    email: string;
    location: string;
    availability: string;
    metaTitle: string;
    metaDescription: string;
  };
  cv: {
    metaTitle: string;
    metaDescription: string;
  };
};

const defaultContent: PageContent = {
  homepage: {
    statement: "Working at the frequency between signal and silence.",
    bio: "5 years across 3D, motion, illustration, and identity.",
    location: "Indonesia",
    established: "2017",
    showFilmStrip: true,
    showWorks: true,
    showCapabilities: true,
    showClients: true,
    showRecognition: true,
    showCta: true,
    ctaText: "Start a Project",
    metaTitle: "",
    metaDescription: "",
  },
  about: {
    intro: "5 years across 3D, motion, illustration, and identity. Every project begins with a feeling, not a brief. Aesthetic leads. Technique follows.",
    storyTitle: "Working at the frequency between signal and silence.",
    story: "Aesthetic leads. Technique follows.",
    approachTitle: "The Approach",
    approach: "Aesthetic leads. Technique follows. I believe in the power of restraint, the importance of negative space, and the emotional resonance of light.",
    imageUrl: "/images/hero/hero-a.jpg",
    metaTitle: "",
    metaDescription: "",
  },
  services: {
    intro: "I offer creative services across 3D visualization, motion design, illustration, and graphic design.",
    outro: "Each project is approached with fresh eyes and careful attention to the specific needs of the brief.",
    metaTitle: "",
    metaDescription: "",
  },
  labs: {
    intro: "Experiments, explorations, and works in progress — a space for creative testing without the pressure of client expectations.",
    metaTitle: "",
    metaDescription: "",
  },
  contact: {
    intro: "Have a project in mind? I'd love to hear about it.",
    email: "rizkyirawan0404@gmail.com",
    location: "Indonesia",
    availability: "Available for new projects",
    metaTitle: "",
    metaDescription: "",
  },
  cv: {
    metaTitle: "",
    metaDescription: "",
  },
};

export async function getContent(): Promise<PageContent> {
  return fetchData("content", defaultContent);
}

export async function saveContent(content: PageContent): Promise<void> {
  await saveData("content", content);
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
  const seo = await getSEO().catch(() => null);
  const siteName = seo?.siteName ?? "Rizky Irawan";
  const base = seo?.canonicalBaseUrl || "https://rizkyirawan.xyz";

  const metadataBase = overrides.canonical ? undefined : new URL(base);

  return {
    metadataBase,
    title: overrides.title || siteName,
    description: overrides.description || seo?.defaultDescription || "",
    authors: overrides.authors ? [{ name: overrides.authors[0] }] : [{ name: siteName }],
    openGraph: {
      type: overrides.type || "website",
      locale: "en_US",
      title: overrides.title ? `${overrides.title} — ${siteName}` : siteName,
      description: overrides.description || seo?.defaultDescription || "",
      siteName: siteName,
      images: overrides.image ? [{ url: overrides.image }] : seo?.ogImage ? [{ url: seo.ogImage }] : [],
      ...(overrides.publishedTime ? { publishedTime: overrides.publishedTime } : {}),
      ...(overrides.authors ? { authors: overrides.authors } : {}),
      ...(overrides.tags ? { tags: overrides.tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: seo?.twitterHandle || undefined,
      title: overrides.title || siteName,
      description: overrides.description || seo?.defaultDescription || "",
      images: overrides.image ? [overrides.image] : seo?.ogImage ? [seo.ogImage] : [],
    },
    robots: seo?.robots ? { index: seo.robots.includes("index"), follow: seo.robots.includes("follow") } : { index: true, follow: true },
    alternates: overrides.canonical ? { canonical: overrides.canonical } : undefined,
  };
}
