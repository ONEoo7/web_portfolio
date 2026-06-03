import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { config } from "../config.js";
import { buildResumeData, type ContentFiles } from "./parse.js";
import { ResumeDoc, type Variant } from "./document.js";

async function read(name: string): Promise<string> {
  try {
    return await readFile(path.join(config.contentDir, name), "utf-8");
  } catch {
    return "";
  }
}

async function loadFiles(): Promise<ContentFiles> {
  const [hero, bio, experience, skills, projects, contact] = await Promise.all([
    read("hero.md"),
    read("bio.md"),
    read("experience.md"),
    read("skills.md"),
    read("projects.md"),
    read("contact.md"),
  ]);
  return { hero, bio, experience, skills, projects, contact };
}

/**
 * Builds the resume from the LIVE content/*.md files and renders a PDF.
 * Because content/ is bind-mounted into the api container, edits to the
 * markdown are reflected on the very next download — no rebuild, no restart.
 */
export async function renderResume(variant: Variant): Promise<Buffer> {
  const files = await loadFiles();
  const data = buildResumeData(files, {
    name: config.resumeName,
    siteUrl: config.siteUrl,
  });
  return renderToBuffer(<ResumeDoc data={data} variant={variant} />);
}
