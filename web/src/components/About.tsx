import MarkdownBody from "./MarkdownBody";

export default function About() {
  return (
    <section id="about">
      <div className="container">
        <p className="section-eyebrow">About</p>
        <MarkdownBody path="/content/bio.md" />
      </div>
    </section>
  );
}
