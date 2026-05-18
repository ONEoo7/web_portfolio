import { readFile } from "node:fs/promises";
import OpenAI from "openai";
import { config } from "../config.js";

export type Chunk = {
  id: string;
  source: string;
  text: string;
  embedding: number[];
};

export type Hit = Omit<Chunk, "embedding"> & { score: number };

let index: Chunk[] = [];
let loaded = false;

const openai = new OpenAI({
  baseURL: `${config.litellmUrl}/v1`,
  apiKey: config.litellmApiKey || "sk-no-key",
});

export async function loadIndex() {
  const raw = await readFile(config.indexPath, "utf-8");
  index = JSON.parse(raw) as Chunk[];
  loaded = true;
  console.log(`[rag] loaded ${index.length} chunks from ${config.indexPath}`);
}

export function isLoaded() {
  return loaded;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function retrieve(query: string, k = config.topK): Promise<Hit[]> {
  if (!loaded || index.length === 0) return [];
  const q = query.trim();
  if (!q) return [];

  const resp = await openai.embeddings.create({
    model: config.embeddingModel,
    input: [q],
  });
  const qe = resp.data[0].embedding;

  return index
    .map((c) => ({
      id: c.id,
      source: c.source,
      text: c.text,
      score: cosine(qe, c.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function formatContext(hits: Hit[]): string {
  if (hits.length === 0) return "(no relevant context found)";
  return hits
    .map(
      (h, i) =>
        `[${i + 1}] source: ${h.source} (score=${h.score.toFixed(3)})\n${h.text}`
    )
    .join("\n\n---\n\n");
}
