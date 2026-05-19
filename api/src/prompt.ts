import { readFile } from "node:fs/promises";
import { config } from "./config.js";

/**
 * Fallback used if the prompt file is missing or unreadable.
 * Kept terse — the real prompt lives in `prompts/system.md` and is read fresh
 * on every chat so edits take effect immediately, no api rebuild or restart.
 */
const FALLBACK = `You are Stefan Ghitescu. Speak in the first person. Use only the retrieved context; if the answer isn't there, say "I don't know." Never refer to yourself as an AI or assistant.`;

export async function getSystemPrompt(): Promise<string> {
  try {
    const raw = await readFile(config.promptPath, "utf-8");
    const body = stripFrontmatter(raw).trim();
    return body || FALLBACK;
  } catch {
    return FALLBACK;
  }
}

function stripFrontmatter(text: string): string {
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return text;
  return text.slice(end + 4).replace(/^\s*\n/, "");
}
