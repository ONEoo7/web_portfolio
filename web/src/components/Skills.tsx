const groups = [
  {
    name: "Languages",
    items: ["TypeScript", "Python", "Go", "SQL", "Bash"],
  },
  {
    name: "Frontend",
    items: ["React", "Vite", "CSS", "Accessibility"],
  },
  {
    name: "Backend & Infra",
    items: ["Node.js", "FastAPI", "Postgres", "Docker", "nginx", "Linux"],
  },
  {
    name: "Other",
    items: ["LLMs / RAG", "Observability", "CI/CD"],
  },
];

export default function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <p className="section-eyebrow">Skills</p>
        <h2>Tools I reach for</h2>
        <div className="skill-groups">
          {groups.map((g) => (
            <div className="skill-group" key={g.name}>
              <h3>{g.name}</h3>
              <ul>
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
