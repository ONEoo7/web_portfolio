import MarkdownBody from "./MarkdownBody";

export default function Experience() {
  return (
    <section id="experience">
      <div className="container">
        <p className="section-eyebrow">Experience</p>
        <MarkdownBody path="/content/experience.md" />
      </div>
    </section>
  );
}
