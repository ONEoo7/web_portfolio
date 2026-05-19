import MarkdownBody from "./MarkdownBody";

export default function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <p className="section-eyebrow">Skills</p>
        <MarkdownBody path="/content/skills.md" />
      </div>
    </section>
  );
}
