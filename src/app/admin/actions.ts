"use server";

import { revalidatePath } from "next/cache";
import { saveDesign, getWorks, saveWorks, getJournal, saveJournal, getServices, saveServices, getClients, saveClients, getCV, saveCV, saveSEO } from "@/lib/store";
import type { DesignConfig, CVData, SEOConfig } from "@/lib/store";
import type { Project, JournalPost, Service, Experience, SkillGroup, Education, Award } from "@/lib/types";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const ACTIVITY_FILE = path.join(process.cwd(), "src", "data", "activity.json");

type ActivityEntry = {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  user?: string;
};

function readActivity(): ActivityEntry[] {
  try {
    if (!existsSync(ACTIVITY_FILE)) return [];
    return JSON.parse(readFileSync(ACTIVITY_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeActivity(entries: ActivityEntry[]) {
  const dir = path.dirname(ACTIVITY_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(ACTIVITY_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

async function logActivity(action: string, detail: string) {
  try {
    const entry: ActivityEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      detail,
    };
    const entries = readActivity();
    entries.push(entry);
    writeActivity(entries);
  } catch {
    // silently fail — activity logging should never break main actions
  }
}

// ── Design ───────────────────────────────────────────────────────────────────
export async function updateDesign(config: DesignConfig) {
  saveDesign(config);
  revalidatePath("/", "layout");
  await logActivity("design.update", "Design settings updated");
  return { ok: true };
}

// ── SEO ─────────────────────────────────────────────────────────────────────
export async function updateSEO(seo: SEOConfig) {
  saveSEO(seo);
  await logActivity("seo.update", "SEO settings updated");
  return { ok: true };
}

// ── Works ────────────────────────────────────────────────────────────────────
export async function addWork(work: Project) {
  const works = getWorks();
  if (works.find((w) => w.slug === work.slug)) {
    return { ok: false, error: "Slug already exists" };
  }
  saveWorks([work, ...works]);
  revalidatePath("/works");
  revalidatePath("/");
  await logActivity("work.add", `Added work: "${work.title}"`);
  return { ok: true };
}

export async function updateWork(slug: string, work: Project) {
  const works = getWorks();
  const idx = works.findIndex((w) => w.slug === slug);
  if (idx === -1) return { ok: false, error: "Not found" };
  works[idx] = work;
  saveWorks(works);
  revalidatePath("/works");
  revalidatePath(`/works/${slug}`);
  revalidatePath("/");
  await logActivity("work.update", `Updated work: "${work.title}"`);
  return { ok: true };
}

export async function deleteWork(slug: string) {
  const works = getWorks().filter((w) => w.slug !== slug);
  saveWorks(works);
  revalidatePath("/works");
  revalidatePath("/");
  await logActivity("work.delete", `Deleted work: "${slug}"`);
  return { ok: true };
}

export async function toggleFeatured(slug: string) {
  const works = getWorks();
  const idx = works.findIndex((w) => w.slug === slug);
  if (idx === -1) return { ok: false };
  works[idx].featured = !works[idx].featured;
  saveWorks(works);
  revalidatePath("/works");
  revalidatePath("/");
  const action = works[idx].featured ? "Featured" : "Unfeatured";
  await logActivity("work.update", `${action} work: "${slug}"`);
  return { ok: true };
}

// ── Journal ──────────────────────────────────────────────────────────────────
export async function addPost(post: JournalPost) {
  const posts = getJournal();
  if (posts.find((p) => p.slug === post.slug)) {
    return { ok: false, error: "Slug already exists" };
  }
  saveJournal([post, ...posts]);
  revalidatePath("/journal");
  await logActivity("journal.add", `Added post: "${post.title}"`);
  return { ok: true };
}

export async function updatePost(slug: string, post: JournalPost) {
  const posts = getJournal();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return { ok: false, error: "Not found" };
  posts[idx] = post;
  saveJournal(posts);
  revalidatePath("/journal");
  revalidatePath(`/journal/${slug}`);
  await logActivity("journal.update", `Updated post: "${post.title}"`);
  return { ok: true };
}

export async function deletePost(slug: string) {
  const posts = getJournal().filter((p) => p.slug !== slug);
  saveJournal(posts);
  revalidatePath("/journal");
  await logActivity("journal.delete", `Deleted post: "${slug}"`);
  return { ok: true };
}

// ── Services ─────────────────────────────────────────────────────────────────
export async function addService(service: Service) {
  const services = getServices();
  if (services.find((s) => s.category === service.category)) {
    return { ok: false, error: "Category already exists" };
  }
  saveServices([service, ...services]);
  revalidatePath("/services");
  revalidatePath("/");
  await logActivity("service.add", `Added service: "${service.category}"`);
  return { ok: true };
}

export async function updateService(category: string, service: Service) {
  const services = getServices();
  const idx = services.findIndex((s) => s.category === category);
  if (idx === -1) return { ok: false, error: "Not found" };
  services[idx] = service;
  saveServices(services);
  revalidatePath("/services");
  revalidatePath("/");
  await logActivity("service.update", `Updated service: "${service.category}"`);
  return { ok: true };
}

export async function deleteService(category: string) {
  const services = getServices().filter((s) => s.category !== category);
  saveServices(services);
  revalidatePath("/services");
  revalidatePath("/");
  await logActivity("service.delete", `Deleted service: "${category}"`);
  return { ok: true };
}

// ── Clients ──────────────────────────────────────────────────────────────────
export async function addClient(name: string) {
  const clients = getClients();
  if (clients.includes(name)) {
    return { ok: false, error: "Client already exists" };
  }
  saveClients([...clients, name]);
  revalidatePath("/cv");
  await logActivity("client.add", `Added client: "${name}"`);
  return { ok: true };
}

export async function deleteClient(name: string) {
  const clients = getClients().filter((c) => c !== name);
  saveClients(clients);
  revalidatePath("/cv");
  await logActivity("client.delete", `Deleted client: "${name}"`);
  return { ok: true };
}

// ── CV ────────────────────────────────────────────────────────────────────
export async function saveCVData(data: CVData) {
  saveCV(data);
  revalidatePath("/cv");
  revalidatePath("/about");
  return { ok: true };
}

export async function addExperience(exp: Experience) {
  const cv = getCV();
  cv.experiences = [exp, ...cv.experiences];
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.add", `Added experience: "${exp.role}"`);
  return { ok: true };
}

export async function updateExperience(role: string, exp: Experience) {
  const cv = getCV();
  const idx = cv.experiences.findIndex((e) => e.role === role);
  if (idx === -1) return { ok: false, error: "Not found" };
  cv.experiences[idx] = exp;
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.update", `Updated experience: "${exp.role}"`);
  return { ok: true };
}

export async function deleteExperience(role: string) {
  const cv = getCV();
  cv.experiences = cv.experiences.filter((e) => e.role !== role);
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.delete", `Deleted experience: "${role}"`);
  return { ok: true };
}

export async function addSkillGroup(group: SkillGroup) {
  const cv = getCV();
  if (cv.skillGroups.find((g) => g.category === group.category)) {
    return { ok: false, error: "Category already exists" };
  }
  cv.skillGroups = [group, ...cv.skillGroups];
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.add", `Added skill group: "${group.category}"`);
  return { ok: true };
}

export async function updateSkillGroup(category: string, group: SkillGroup) {
  const cv = getCV();
  const idx = cv.skillGroups.findIndex((g) => g.category === category);
  if (idx === -1) return { ok: false, error: "Not found" };
  cv.skillGroups[idx] = group;
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.update", `Updated skill group: "${group.category}"`);
  return { ok: true };
}

export async function deleteSkillGroup(category: string) {
  const cv = getCV();
  cv.skillGroups = cv.skillGroups.filter((g) => g.category !== category);
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.delete", `Deleted skill group: "${category}"`);
  return { ok: true };
}

export async function addToolGroup(group: SkillGroup) {
  const cv = getCV();
  if (cv.tools.find((g) => g.category === group.category)) {
    return { ok: false, error: "Category already exists" };
  }
  cv.tools = [group, ...cv.tools];
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.add", `Added tool group: "${group.category}"`);
  return { ok: true };
}

export async function updateToolGroup(category: string, group: SkillGroup) {
  const cv = getCV();
  const idx = cv.tools.findIndex((g) => g.category === category);
  if (idx === -1) return { ok: false, error: "Not found" };
  cv.tools[idx] = group;
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.update", `Updated tool group: "${group.category}"`);
  return { ok: true };
}

export async function deleteToolGroup(category: string) {
  const cv = getCV();
  cv.tools = cv.tools.filter((g) => g.category !== category);
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.delete", `Deleted tool group: "${category}"`);
  return { ok: true };
}

export async function addEducation(edu: Education) {
  const cv = getCV();
  cv.education = [edu, ...cv.education];
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.add", `Added education: "${edu.degree}"`);
  return { ok: true };
}

export async function updateEducation(degree: string, edu: Education) {
  const cv = getCV();
  const idx = cv.education.findIndex((e) => e.degree === degree);
  if (idx === -1) return { ok: false, error: "Not found" };
  cv.education[idx] = edu;
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.update", `Updated education: "${edu.degree}"`);
  return { ok: true };
}

export async function deleteEducation(degree: string) {
  const cv = getCV();
  cv.education = cv.education.filter((e) => e.degree !== degree);
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.delete", `Deleted education: "${degree}"`);
  return { ok: true };
}

export async function addAward(award: Award) {
  const cv = getCV();
  cv.awards = [award, ...cv.awards];
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.add", `Added award: "${award.title}"`);
  return { ok: true };
}

export async function updateAward(title: string, award: Award) {
  const cv = getCV();
  const idx = cv.awards.findIndex((a) => a.title === title);
  if (idx === -1) return { ok: false, error: "Not found" };
  cv.awards[idx] = award;
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.update", `Updated award: "${award.title}"`);
  return { ok: true };
}

export async function deleteAward(title: string) {
  const cv = getCV();
  cv.awards = cv.awards.filter((a) => a.title !== title);
  saveCV(cv);
  revalidatePath("/cv");
  revalidatePath("/about");
  await logActivity("cv.delete", `Deleted award: "${title}"`);
  return { ok: true };
}
