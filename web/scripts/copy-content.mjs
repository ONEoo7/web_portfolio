// Copies the repo-root `content/` directory (markdown + images, which are
// the editable source of the site) into `web/public/content/` so Vite ships
// them as static assets under `/content/...`. Runs before `dev` and `build`.
// The destination is generated and gitignored — always edit the root copy.
import { cpSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "../../content");
const dest = resolve(here, "../public/content");

if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
console.log(`[copy-content] ${src} -> ${dest}`);
