import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMarkdown } from "../lib/useMarkdown";

/**
 * Renders the body of a markdown file fetched from the public `content/` path.
 *
 * - `remark-gfm` enables auto-linking of bare URLs and email addresses, so
 *   `stefan@example.com` becomes a `mailto:` link and `https://...` becomes
 *   a clickable anchor without explicit `[text](url)` syntax.
 * - The first-level `#` in markdown is rendered as an `<h2>` so it matches
 *   the page's section-title hierarchy.
 * - External http(s) links open in a new tab; mailto / anchor links don't.
 */
export default function MarkdownBody({ path }: { path: string }) {
  const md = useMarkdown(path);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h2>{children}</h2>,
        a: ({ href, children, ...props }) => {
          const isExternal =
            href?.startsWith("http://") || href?.startsWith("https://");
          return (
            <a
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer noopener" : undefined}
              {...props}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {md}
    </ReactMarkdown>
  );
}
