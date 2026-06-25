"use server";

import { revalidatePath } from "next/cache";
import { saveDesign, getWorks, saveWorks, getJournal, saveJournal, getServices, saveServices, getClients, saveClients, getCV, saveCV, saveSEO, saveContent, getLabs, saveLabs } from "@/lib/store";
import type { DesignConfig, CVData, SEOConfig, PageContent } from "@/lib/store";
import type { Project, JournalPost, Service, Experience, SkillGroup, Education, Award, LabExperiment } from "@/lib/types";
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
  try {
    await saveDesign(config);
    revalidatePath("/", "layout");
    await logActivity("design.update", "Design settings updated");
    return { ok: true };
  } catch (err) {
    console.error("[updateDesign]", err);
    return { ok: false, error: String(err) };
  }
}

// ── SEO ─────────────────────────────────────────────────────────────────────
export async function updateSEO(seo: SEOConfig) {
  try {
    await saveSEO(seo);
    await logActivity("seo.update", "SEO settings updated");
    return { ok: true };
  } catch (err) {
    console.error("[updateSEO]", err);
    return { ok: false, error: String(err) };
  }
}

// ── Page Content ──────────────────────────────────────────────────────────────
export async function updateContent(content: PageContent) {
  try {
    await saveContent(content);
    revalidatePath("/");
    await logActivity("content.update", "Page content updated");
    return { ok: true };
  } catch (err) {
    console.error("[updateContent]", err);
    return { ok: false, error: String(err) };
  }
}

// ── Works ────────────────────────────────────────────────────────────────────
export async function addWork(work: Project) {
  try {
    const works = await getWorks();
    if (works.find((w) => w.slug === work.slug)) {
      return { ok: false, error: "Slug already exists" };
    }
    await saveWorks([work, ...works]);
    revalidatePath("/works");
    revalidatePath("/");
    await logActivity("work.add", `Added work: "${work.title}"`);
    return { ok: true };
  } catch (err) {
    console.error("[addWork]", err);
    return { ok: false, error: String(err) };
  }
}

export async function updateWork(slug: string, work: Project) {
  try {
    const works = await getWorks();
    const idx = works.findIndex((w) => w.slug === slug);
    if (idx === -1) return { ok: false, error: "Not found" };
    works[idx] = work;
    await saveWorks(works);
    revalidatePath("/works");
    revalidatePath("/personal-works");
    revalidatePath("/works/" + slug);
    revalidatePath("/personal-works/" + slug);
    revalidatePath(`/works/${slug}`);
    revalidatePath("/");
    await logActivity("work.update", `Updated work: "${work.title}"`);
    return { ok: true };
  } catch (err) {
    console.error("[updateWork]", err);
    return { ok: false, error: String(err) };
  }
}

export async function deleteWork(slug: string) {
  try {
    const works = (await getWorks()).filter((w) => w.slug !== slug);
    await saveWorks(works);
    revalidatePath("/works");
    revalidatePath("/");
    await logActivity("work.delete", `Deleted work: "${slug}"`);
    return { ok: true };
  } catch (err) {
    console.error("[deleteWork]", err);
    return { ok: false, error: String(err) };
  }
}

export async function toggleFeatured(slug: string) {
  try {
    const works = await getWorks();
    const idx = works.findIndex((w) => w.slug === slug);
    if (idx === -1) return { ok: false };
    works[idx].featured = !works[idx].featured;
    await saveWorks(works);
    revalidatePath("/works");
    revalidatePath("/");
    const action = works[idx].featured ? "Featured" : "Unfeatured";
    await logActivity("work.update", `${action} work: "${slug}"`);
    return { ok: true };
  } catch (err) {
    console.error("[toggleFeatured]", err);
    return { ok: false, error: String(err) };
  }
}

export async function reorderWorks(slugs: string[]) {
  try {
    const works = await getWorks();
    const reordered: Project[] = [];
    for (const slug of slugs) {
      const work = works.find((w) => w.slug === slug);
      if (work) reordered.push(work);
    }
    const remaining = works.filter((w) => !slugs.includes(w.slug));
    await saveWorks([...reordered, ...remaining]);
    revalidatePath("/works");
    revalidatePath("/");
    await logActivity("work.reorder", `Reordered ${slugs.length} works`);
    return { ok: true };
  } catch (err) {
    console.error("[reorderWorks]", err);
    return { ok: false, error: String(err) };
  }
}

// ── Journal ──────────────────────────────────────────────────────────────────
export async function addPost(post: JournalPost) {
  try {
    const posts = await getJournal();
    if (!post.slug || !post.slug.trim()) {
      const generated = post.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);
      post.slug = generated || `post-${Date.now()}`;
    }
    if (posts.find((p) => p.slug === post.slug)) {
      return { ok: false, error: "Slug already exists" };
    }
    await saveJournal([post, ...posts]);
    revalidatePath("/journal");
    await logActivity("journal.add", `Added post: "${post.title}"`);
    return { ok: true, slug: post.slug };
  } catch (err) {
    console.error("[addPost]", err);
    return { ok: false, error: String(err) };
  }
}

export async function updatePost(slug: string, post: JournalPost) {
  try {
    const posts = await getJournal();
    const idx = posts.findIndex((p) => p.slug === slug);
    if (idx === -1) return { ok: false, error: "Not found" };
    posts[idx] = post;
    await saveJournal(posts);
    revalidatePath("/journal");
    revalidatePath(`/journal/${slug}`);
    await logActivity("journal.update", `Updated post: "${post.title}"`);
    return { ok: true };
  } catch (err) {
    console.error("[updatePost]", err);
    return { ok: false, error: String(err) };
  }
}

export async function deletePost(slug: string) {
  try {
    const posts = (await getJournal()).filter((p) => p.slug !== slug);
    await saveJournal(posts);
    revalidatePath("/journal");
    await logActivity("journal.delete", `Deleted post: "${slug}"`);
    return { ok: true };
  } catch (err) {
    console.error("[deletePost]", err);
    return { ok: false, error: String(err) };
  }
}

// ── Services ─────────────────────────────────────────────────────────────────
export async function addService(service: Service) {
  try {
    const services = await getServices();
    if (services.find((s) => s.category === service.category)) {
      return { ok: false, error: "Category already exists" };
    }
    await saveServices([service, ...services]);
    revalidatePath("/services");
    revalidatePath("/");
    await logActivity("service.add", `Added service: "${service.category}"`);
    return { ok: true };
  } catch (err) {
    console.error("[addService]", err);
    return { ok: false, error: String(err) };
  }
}

export async function updateService(category: string, service: Service) {
  try {
    const services = await getServices();
    const idx = services.findIndex((s) => s.category === category);
    if (idx === -1) return { ok: false, error: "Not found" };
    services[idx] = service;
    await saveServices(services);
    revalidatePath("/services");
    revalidatePath("/");
    await logActivity("service.update", `Updated service: "${service.category}"`);
    return { ok: true };
  } catch (err) {
    console.error("[updateService]", err);
    return { ok: false, error: String(err) };
  }
}

export async function deleteService(category: string) {
  try {
    const services = (await getServices()).filter((s) => s.category !== category);
    await saveServices(services);
    revalidatePath("/services");
    revalidatePath("/");
    await logActivity("service.delete", `Deleted service: "${category}"`);
    return { ok: true };
  } catch (err) {
    console.error("[deleteService]", err);
    return { ok: false, error: String(err) };
  }
}

// ── Clients ──────────────────────────────────────────────────────────────────
export async function addClient(name: string) {
  try {
    const clients = await getClients();
    if (clients.includes(name)) {
      return { ok: false, error: "Client already exists" };
    }
    await saveClients([...clients, name]);
    revalidatePath("/cv");
    await logActivity("client.add", `Added client: "${name}"`);
    return { ok: true };
  } catch (err) {
    console.error("[addClient]", err);
    return { ok: false, error: String(err) };
  }
}

export async function deleteClient(name: string) {
  try {
    const clients = (await getClients()).filter((c) => c !== name);
    await saveClients(clients);
    revalidatePath("/cv");
    await logActivity("client.delete", `Deleted client: "${name}"`);
    return { ok: true };
  } catch (err) {
    console.error("[deleteClient]", err);
    return { ok: false, error: String(err) };
  }
}

// ── CV ────────────────────────────────────────────────────────────────────
export async function saveCVData(data: CVData) {
  try {
    await saveCV(data);
    revalidatePath("/cv");
    revalidatePath("/about");
    return { ok: true };
  } catch (err) {
    console.error("[saveCVData]", err);
    return { ok: false, error: String(err) };
  }
}

export async function addExperience(exp: Experience) {
  try {
    const cv = await getCV();
    cv.experiences = [exp, ...cv.experiences];
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.add", `Added experience: "${exp.role}"`);
    return { ok: true };
  } catch (err) {
    console.error("[addExperience]", err);
    return { ok: false, error: String(err) };
  }
}

export async function updateExperience(role: string, exp: Experience) {
  try {
    const cv = await getCV();
    const idx = cv.experiences.findIndex((e) => e.role === role);
    if (idx === -1) return { ok: false, error: "Not found" };
    cv.experiences[idx] = exp;
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.update", `Updated experience: "${exp.role}"`);
    return { ok: true };
  } catch (err) {
    console.error("[updateExperience]", err);
    return { ok: false, error: String(err) };
  }
}

export async function deleteExperience(role: string) {
  try {
    const cv = await getCV();
    cv.experiences = cv.experiences.filter((e) => e.role !== role);
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.delete", `Deleted experience: "${role}"`);
    return { ok: true };
  } catch (err) {
    console.error("[deleteExperience]", err);
    return { ok: false, error: String(err) };
  }
}

export async function addSkillGroup(group: SkillGroup) {
  try {
    const cv = await getCV();
    if (cv.skillGroups.find((g) => g.category === group.category)) {
      return { ok: false, error: "Category already exists" };
    }
    cv.skillGroups = [group, ...cv.skillGroups];
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.add", `Added skill group: "${group.category}"`);
    return { ok: true };
  } catch (err) {
    console.error("[addSkillGroup]", err);
    return { ok: false, error: String(err) };
  }
}

export async function updateSkillGroup(category: string, group: SkillGroup) {
  try {
    const cv = await getCV();
    const idx = cv.skillGroups.findIndex((g) => g.category === category);
    if (idx === -1) return { ok: false, error: "Not found" };
    cv.skillGroups[idx] = group;
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.update", `Updated skill group: "${group.category}"`);
    return { ok: true };
  } catch (err) {
    console.error("[updateSkillGroup]", err);
    return { ok: false, error: String(err) };
  }
}

export async function deleteSkillGroup(category: string) {
  try {
    const cv = await getCV();
    cv.skillGroups = cv.skillGroups.filter((g) => g.category !== category);
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.delete", `Deleted skill group: "${category}"`);
    return { ok: true };
  } catch (err) {
    console.error("[deleteSkillGroup]", err);
    return { ok: false, error: String(err) };
  }
}

export async function addToolGroup(group: SkillGroup) {
  try {
    const cv = await getCV();
    if (cv.tools.find((g) => g.category === group.category)) {
      return { ok: false, error: "Category already exists" };
    }
    cv.tools = [group, ...cv.tools];
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.add", `Added tool group: "${group.category}"`);
    return { ok: true };
  } catch (err) {
    console.error("[addToolGroup]", err);
    return { ok: false, error: String(err) };
  }
}

export async function updateToolGroup(category: string, group: SkillGroup) {
  try {
    const cv = await getCV();
    const idx = cv.tools.findIndex((g) => g.category === category);
    if (idx === -1) return { ok: false, error: "Not found" };
    cv.tools[idx] = group;
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.update", `Updated tool group: "${group.category}"`);
    return { ok: true };
  } catch (err) {
    console.error("[updateToolGroup]", err);
    return { ok: false, error: String(err) };
  }
}

export async function deleteToolGroup(category: string) {
  try {
    const cv = await getCV();
    cv.tools = cv.tools.filter((g) => g.category !== category);
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.delete", `Deleted tool group: "${category}"`);
    return { ok: true };
  } catch (err) {
    console.error("[deleteToolGroup]", err);
    return { ok: false, error: String(err) };
  }
}

export async function addEducation(edu: Education) {
  try {
    const cv = await getCV();
    cv.education = [edu, ...cv.education];
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.add", `Added education: "${edu.degree}"`);
    return { ok: true };
  } catch (err) {
    console.error("[addEducation]", err);
    return { ok: false, error: String(err) };
  }
}

export async function updateEducation(degree: string, edu: Education) {
  try {
    const cv = await getCV();
    const idx = cv.education.findIndex((e) => e.degree === degree);
    if (idx === -1) return { ok: false, error: "Not found" };
    cv.education[idx] = edu;
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.update", `Updated education: "${edu.degree}"`);
    return { ok: true };
  } catch (err) {
    console.error("[updateEducation]", err);
    return { ok: false, error: String(err) };
  }
}

export async function deleteEducation(degree: string) {
  try {
    const cv = await getCV();
    cv.education = cv.education.filter((e) => e.degree !== degree);
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.delete", `Deleted education: "${degree}"`);
    return { ok: true };
  } catch (err) {
    console.error("[deleteEducation]", err);
    return { ok: false, error: String(err) };
  }
}

export async function addAward(award: Award) {
  try {
    const cv = await getCV();
    cv.awards = [award, ...cv.awards];
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.add", `Added award: "${award.title}"`);
    return { ok: true };
  } catch (err) {
    console.error("[addAward]", err);
    return { ok: false, error: String(err) };
  }
}

export async function updateAward(title: string, award: Award) {
  try {
    const cv = await getCV();
    const idx = cv.awards.findIndex((a) => a.title === title);
    if (idx === -1) return { ok: false, error: "Not found" };
    cv.awards[idx] = award;
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.update", `Updated award: "${award.title}"`);
    return { ok: true };
  } catch (err) {
    console.error("[updateAward]", err);
    return { ok: false, error: String(err) };
  }
}

export async function deleteAward(title: string) {
  try {
    const cv = await getCV();
    cv.awards = cv.awards.filter((a) => a.title !== title);
    await saveCV(cv);
    revalidatePath("/cv");
    revalidatePath("/about");
    await logActivity("cv.delete", `Deleted award: "${title}"`);
    return { ok: true };
  } catch (err) {
    console.error("[deleteAward]", err);
    return { ok: false, error: String(err) };
  }
}

// ── LABS ───────────────────────────────────────────────────────────────────

export async function addLab(data: LabExperiment) {
  try {
    const labs = await getLabs();
    if (labs.some((l) => l.slug === data.slug)) return { ok: false, error: "Slug exists" };
    labs.push(data);
    await saveLabs(labs);
    revalidatePath("/labs");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function updateLab(slug: string, data: LabExperiment) {
  try {
    const labs = await getLabs();
    const idx = labs.findIndex((l) => l.slug === slug);
    if (idx === -1) return { ok: false, error: "Not found" };
    labs[idx] = { ...labs[idx], ...data };
    await saveLabs(labs);
    revalidatePath("/labs");
    revalidatePath(`/labs/${slug}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function deleteLab(slug: string) {
  try {
    const labs = await getLabs();
    await saveLabs(labs.filter((l) => l.slug !== slug));
    revalidatePath("/labs");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
