import MarkdownBody from "./MarkdownBody";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container">
        <p className="section-eyebrow">Portfolio</p>
        <MarkdownBody path="/content/hero.md" />
      </div>
    </section>
  );
}
