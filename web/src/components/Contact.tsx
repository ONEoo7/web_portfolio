import MarkdownBody from "./MarkdownBody";

export default function Contact() {
  return (
    <section id="contact">
      <div className="container">
        <p className="section-eyebrow">Contact</p>
        <MarkdownBody path="/content/contact.md" />
      </div>
    </section>
  );
}
