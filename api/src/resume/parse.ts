// Parsers that turn the live content/*.md files into structured resume data.
// Kept dependency-free and pure so they're easy to test and reason about.

export interface Field {
  label: string;
  items: string[];
}
export interface Project {
  title: string;
  fields: Field[];
}
export interface Job {
  role: string;
  company: string;
  period: string;
  projects: Project[];
}
export interface SkillGroup {
  group: string;
  items: string[];
}
export interface PortfolioProject {
  title: string;
  url?: string;
  bullets: string[];
}
export interface Contact {
  email?: string;
  phone?: string;
  bullets: string[];
}
export interface ResumeData {
  name: string;
  roleTitle: string;
  siteUrl: string;
  location?: string;
  availability?: string;
  summary: string;
  spokenLanguages: string[];
  education: string[];
  jobs: Job[];
  skills: SkillGroup[];
  projects: PortfolioProject[];
  bioLines: string[];
  contact: Contact;
}

/**
 * react-pdf's built-in fonts (Helvetica) use WinAnsi encoding, which does NOT
 * include the Romanian Latin-Extended letters (ș ț ă â î). Left as-is they
 * render as blank boxes. We transliterate them to ASCII for the PDF only —
 * the website still shows the proper diacritics. Dashes, curly quotes, bullets
 * etc. ARE in WinAnsi, so we deliberately leave those untouched.
 */
export function tx(s: string): string {
  return (s ?? "")
    .replace(/[șş]/g, "s")
    .replace(/[ȘŞ]/g, "S")
    .replace(/[țţ]/g, "t")
    .replace(/[ȚŢ]/g, "T")
    .replace(/ă/g, "a")
    .replace(/Ă/g, "A")
    .replace(/â/g, "a")
    .replace(/Â/g, "A")
    .replace(/î/g, "i")
    .replace(/Î/g, "I");
}

export function stripFrontmatter(text: string): string {
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return text;
  return text.slice(end + 4).replace(/^\s*\n/, "");
}

function lines(md: string): string[] {
  return stripFrontmatter(md).split(/\r?\n/);
}

/** First real paragraph of hero.md (the elevator pitch), minus heading/CTA. */
export function parseSummary(heroMd: string): string {
  for (const raw of lines(heroMd)) {
    const t = raw.trim();
    if (!t || t.startsWith("#") || t.startsWith("[")) continue;
    return t;
  }
  return "";
}

/** Non-empty, non-heading lines of bio.md (education, languages, location). */
export function parseBioLines(bioMd: string): string[] {
  return lines(bioMd)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

export function parseContact(contactMd: string): Contact {
  const body = stripFrontmatter(contactMd);
  const email = body.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];
  const phone = body.match(/\+\d[\d\s().-]{6,}\d/)?.[0]?.trim();
  const bullets = lines(contactMd)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
  return { email, phone, bullets };
}

export function parseSkills(skillsMd: string): SkillGroup[] {
  const groups: SkillGroup[] = [];
  let g: SkillGroup | null = null;
  for (const raw of lines(skillsMd)) {
    const t = raw.trim();
    if (t.startsWith("## ")) {
      g = { group: t.slice(3).trim(), items: [] };
      groups.push(g);
    } else if (t.startsWith("- ") && g) {
      g.items.push(t.slice(2).trim());
    }
  }
  return groups;
}

export function parseProjects(projectsMd: string): PortfolioProject[] {
  const projects: PortfolioProject[] = [];
  let p: PortfolioProject | null = null;
  for (const raw of lines(projectsMd)) {
    const t = raw.trim();
    if (t.startsWith("## ")) continue; // "## Projects" page title
    if (t.startsWith("# ")) {
      const title = t.slice(2).trim();
      const m = title.match(/^\[(.+?)\]\((.+?)\)$/);
      p = m
        ? { title: m[1], url: m[2], bullets: [] }
        : { title, bullets: [] };
      projects.push(p);
    } else if (t.startsWith(">") && p) {
      const b = t.replace(/^>\s?/, "").replace(/^-\s+/, "").trim();
      if (b) p.bullets.push(b);
    }
    // image lines (![...]) are intentionally ignored in the resume
  }
  return projects;
}

export function parseExperience(experienceMd: string): Job[] {
  const jobs: Job[] = [];
  let job: Job | null = null;
  let project: Project | null = null;
  let field: Field | null = null;

  for (const raw of lines(experienceMd)) {
    const t = raw.trim();
    if (!t) continue;

    if (t.startsWith("## ")) {
      // "Role — Company (period)"
      const header = t.slice(3).trim();
      const periodMatch = header.match(/\(([^)]+)\)\s*$/);
      const period = periodMatch ? periodMatch[1].trim() : "";
      const rest = periodMatch
        ? header.slice(0, periodMatch.index).trim()
        : header;
      const parts = rest.split(/\s+—\s+/);
      const role = (parts[0] ?? rest).trim();
      const company = parts.slice(1).join(" — ").trim();
      job = { role, company, period, projects: [] };
      jobs.push(job);
      project = null;
      field = null;
      continue;
    }

    if (t.startsWith("# ")) {
      project = { title: t.slice(2).trim(), fields: [] };
      job?.projects.push(project);
      field = null;
      continue;
    }

    const labelMatch = t.match(/^\*\*(.+?)\*\*\s*:?\s*$/);
    if (labelMatch) {
      field = { label: labelMatch[1].trim(), items: [] };
      project?.fields.push(field);
      continue;
    }

    if (t.startsWith("- ")) {
      field?.items.push(t.slice(2).trim());
      continue;
    }

    // continuation line — append to the last item (wrapped tech lists etc.)
    if (field && field.items.length) {
      field.items[field.items.length - 1] += " " + t;
    }
  }

  return jobs;
}

/** Pull a single field's first value out of a project (e.g. "Client"). */
export function fieldValue(project: Project, label: string): string | undefined {
  return project.fields.find((f) => f.label.toLowerCase() === label.toLowerCase())
    ?.items[0];
}

/** A bio line listing spoken languages, e.g. "Romanian (native), English (fluent)". */
function isLanguagesLine(line: string): boolean {
  return /\((native|fluent|proficient|beginner|intermediate|advanced|basic|[abc][12]|todo)\)/i.test(
    line
  );
}

/** A bio line describing current/target location. */
function isLocationLine(line: string): boolean {
  return /\b(currently in|based in|living in|relocat)/i.test(line);
}

/** Derive a short "City, Country" header location from the bio location line. */
function deriveLocation(locationLine: string | undefined): string | undefined {
  if (!locationLine) return undefined;
  // "Currently in Timișoara(Romania) and planning ..." → "Timișoara, Romania"
  const m = locationLine.match(/in\s+([A-Za-zĂÂÎȘȚăâîșț .'-]+?)\s*\(([^)]+)\)/);
  if (m) return `${m[1].trim()}, ${m[2].trim()}`;
  return undefined;
}

export interface ContentFiles {
  hero: string;
  bio: string;
  experience: string;
  skills: string;
  projects: string;
  contact: string;
}

export interface BuildOptions {
  name: string;
  siteUrl: string;
}

export function buildResumeData(
  files: ContentFiles,
  opts: BuildOptions
): ResumeData {
  const bioLines = parseBioLines(files.bio);
  const jobs = parseExperience(files.experience);

  const languagesLine = bioLines.find(isLanguagesLine);
  const locationLine = bioLines.find(isLocationLine);
  const spokenLanguages = languagesLine
    ? languagesLine.split(",").map((l) => l.trim()).filter(Boolean)
    : [];
  const education = bioLines.filter(
    (l) => l !== languagesLine && l !== locationLine
  );

  return {
    name: opts.name,
    roleTitle: jobs[0]?.role ?? "",
    siteUrl: opts.siteUrl,
    location: deriveLocation(locationLine),
    availability: locationLine,
    summary: parseSummary(files.hero),
    spokenLanguages,
    education,
    jobs,
    skills: parseSkills(files.skills),
    projects: parseProjects(files.projects),
    bioLines,
    contact: parseContact(files.contact),
  };
}
