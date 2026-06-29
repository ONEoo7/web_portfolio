/**
 * Prefixes a root-absolute URL (e.g. `/content/bio.md`) with Vite's
 * configured `base` so it resolves correctly when the site is served from a
 * sub-path — such as a GitHub Pages project site at `/web_portfolio/`.
 *
 * Vite rewrites asset URLs it sees at build time, but runtime strings like
 * `fetch("/content/...")` and the absolute paths baked into markdown are
 * opaque to it, so they must be resolved explicitly. External and
 * already-relative URLs are returned unchanged.
 */
export function withBase(url: string): string {
  if (!url.startsWith("/")) return url;
  return import.meta.env.BASE_URL.replace(/\/$/, "") + url;
}
