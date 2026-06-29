import { useEffect, useState } from "react";
import { withBase } from "./withBase";

/**
 * Fetches a markdown file at runtime and returns its body (with any
 * `--- ... ---` frontmatter block stripped). Live-editable: change the
 * markdown file on disk and refresh the page — no rebuild needed.
 */
export function useMarkdown(path: string): string {
  const [content, setContent] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(withBase(path))
      .then((r) => (r.ok ? r.text() : ""))
      .then((text) => {
        if (!cancelled) setContent(stripFrontmatter(text));
      })
      .catch(() => {
        if (!cancelled) setContent("");
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return content;
}

function stripFrontmatter(text: string): string {
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return text;
  return text.slice(end + 4).replace(/^\s*\n/, "");
}
