type Project = {
  name: string;
  tags: string;
  blurb: string;
  href?: string;
};

const projects: Project[] = [
  {
    name: "Project One",
    tags: "TypeScript · React · Node",
    blurb:
      "Placeholder description. One or two sentences about the problem and what you built.",
    href: "#",
  },
  {
    name: "Project Two",
    tags: "Go · Postgres · gRPC",
    blurb: "Another placeholder — outcomes or interesting technical bits.",
    href: "#",
  },
  {
    name: "Project Three",
    tags: "Python · ML · FastAPI",
    blurb: "Something you're proud of — small or large.",
    href: "#",
  },
];

export default function Projects() {
  return (
    <section id="projects">
      <div className="container">
        <p className="section-eyebrow">Projects</p>
        <h2>Selected work</h2>
        <div className="card-grid">
          {projects.map((p) => (
            <a
              className="card"
              key={p.name}
              href={p.href ?? "#"}
              target={p.href && p.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              <div className="meta">{p.tags}</div>
              <h3>{p.name}</h3>
              <p>{p.blurb}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
