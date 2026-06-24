export type ServiceCategory =
  | "3D"
  | "Animation"
  | "Graphic Design"
  | "Illustration";

export interface Service {
  category: ServiceCategory;
  items: string[];
  description: string;
}

export interface Project {
  slug: string;
  title: string;
  year: string;
  category: ServiceCategory;
  client: string;
  summary: string;
  description: string;
  tags: string[];
  cover: string;
  gallery: string[];
  url?: string;
  videoUrl?: string;
  featured: boolean;
  type?: "client" | "personal";
}

export interface Award {
  title: string;
  organization: string;
  year: string;
  description: string;
}

export interface JournalPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  status?: "draft" | "published" | "scheduled";
  scheduledAt?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Experience {
  role: string;
  organization: string;
  period: string;
  description: string;
  highlights: string[];
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  description?: string;
}
