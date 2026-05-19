import ReactMarkdown from "react-markdown";
import { useMarkdown } from "../lib/useMarkdown";

/**
 * Renders the body of a markdown file fetched from the public `content/` path.
 * The first-level `#` in the markdown is rendered as an `<h2>` so it matches
 * the page's section-title hierarchy.
 */
export default function MarkdownBody({ path }: { path: string }) {
  const md = useMarkdown(path);
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h2>{children}</h2>,
      }}
    >
      {md}
    </ReactMarkdown>
  );
}
