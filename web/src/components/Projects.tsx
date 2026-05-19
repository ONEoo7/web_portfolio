import MarkdownBody from "./MarkdownBody";

export default function Projects() {
  return (
    <section id="projects">
      <div className="container">
        <p className="section-eyebrow">Projects</p>
        <MarkdownBody path="/content/projects.md" />
      </div>
    </section>
  );
}
