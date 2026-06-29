import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMarkdown } from "../lib/useMarkdown";
import { withBase } from "../lib/withBase";

type GalleryItem = { src: string; alt: string };
type GalleryState = { items: GalleryItem[]; current: number };

/**
 * Renders the body of a markdown file fetched from the public `content/` path.
 *
 * - `remark-gfm` enables auto-linking of bare URLs and email addresses, so
 *   `stefan@example.com` becomes a `mailto:` link and `https://...` becomes
 *   a clickable anchor without explicit `[text](url)` syntax.
 * - The first-level `#` in markdown is rendered as an `<h2>` so it matches
 *   the page's section-title hierarchy.
 * - External http(s) links open in a new tab; mailto / anchor links don't.
 * - Images render as small thumbnails. Clicking one opens a lightbox with
 *   prev/next buttons that cycle through every image in this section.
 *   Keyboard: ← / → to navigate, Esc to close.
 */
export default function MarkdownBody({ path }: { path: string }) {
  const md = useMarkdown(path);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gallery, setGallery] = useState<GalleryState | null>(null);

  const openFromEvent = (e: React.MouseEvent<HTMLImageElement>) => {
    const root = containerRef.current;
    if (!root) return;
    const items: GalleryItem[] = Array.from(
      root.querySelectorAll<HTMLImageElement>("img.md-thumb")
    ).map((el) => ({ src: el.src, alt: el.alt }));
    const clickedSrc = (e.currentTarget as HTMLImageElement).src;
    const current = Math.max(
      0,
      items.findIndex((i) => i.src === clickedSrc)
    );
    setGallery({ items, current });
  };

  const step = (delta: number) =>
    setGallery((g) =>
      g
        ? {
            ...g,
            current: (g.current + delta + g.items.length) % g.items.length,
          }
        : null
    );

  useEffect(() => {
    if (!gallery) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGallery(null);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gallery !== null]);

  return (
    <div ref={containerRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h2>{children}</h2>,
          a: ({ href, children, ...props }) => {
            const isExternal =
              href?.startsWith("http://") || href?.startsWith("https://");
            const isPdf = /\.pdf(\?|#|$)/i.test(href ?? "");
            return (
              <a
                href={href ? withBase(href) : href}
                target={isExternal && !isPdf ? "_blank" : undefined}
                rel={isExternal ? "noreferrer noopener" : undefined}
                download={isPdf ? "" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => (
            <img
              src={withBase(src as string)}
              alt={alt ?? ""}
              className="md-thumb"
              loading="lazy"
              onClick={openFromEvent}
            />
          ),
        }}
      >
        {md}
      </ReactMarkdown>

      {gallery && (
        <div
          className="md-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={gallery.items[gallery.current].alt || "Image preview"}
          onClick={() => setGallery(null)}
        >
          {gallery.items.length > 1 && (
            <button
              type="button"
              className="md-lightbox-nav prev"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
            >
              ‹
            </button>
          )}
          <img
            src={gallery.items[gallery.current].src}
            alt={gallery.items[gallery.current].alt}
            onClick={(e) => e.stopPropagation()}
          />
          {gallery.items.length > 1 && (
            <button
              type="button"
              className="md-lightbox-nav next"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
