import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import OpenAI from "openai";
import { config } from "../config.js";

type Record = {
  id: string;
  source: string;
  text: string;
  embedding: number[];
};

// ~4 chars per token; sliding window over characters
function chunk(text: string, targetTokens = 600, overlapTokens = 100): string[] {
  const size = targetTokens * 4;
  const step = (targetTokens - overlapTokens) * 4;
  const clean = text.trim();
  if (clean.length <= size) return [clean];
  const out: string[] = [];
  for (let i = 0; i < clean.length; i += step) {
    const slice = clean.slice(i, i + size);
    if (slice.trim()) out.push(slice);
    if (i + size >= clean.length) break;
  }
  return out;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else if (e.name.endsWith(".md")) files.push(p);
  }
  return files;
}

async function main() {
  const { contentDir, indexPath, litellmUrl, litellmApiKey, embeddingModel } =
    config;

  console.log(`[index] reading from ${contentDir}`);
  const files = await walk(contentDir);
  if (files.length === 0) {
    throw new Error(`No markdown files found in ${contentDir}`);
  }

  const openai = new OpenAI({
    baseURL: `${litellmUrl}/v1`,
    apiKey: litellmApiKey || "sk-no-key",
  });

  const records: Record[] = [];

  for (const file of files) {
    const raw = await readFile(file, "utf-8");
    const { content } = matter(raw);
    const source = path.relative(contentDir, file).replace(/\\/g, "/");
    const chunks = chunk(content);
    console.log(`[index] ${source}: ${chunks.length} chunk(s)`);

    const resp = await openai.embeddings.create({
      model: embeddingModel,
      input: chunks,
    });

    chunks.forEach((text, i) => {
      records.push({
        id: `${source}#${i}`,
        source,
        text,
        embedding: resp.data[i].embedding,
      });
    });
  }

  await mkdir(path.dirname(indexPath), { recursive: true });
  await writeFile(indexPath, JSON.stringify(records));
  console.log(`[index] wrote ${records.length} chunk(s) → ${indexPath}`);
}

main().catch((err) => {
  console.error("[index] failed:", err);
  process.exit(1);
});
