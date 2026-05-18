type Role = {
  when: string;
  title: string;
  org: string;
  blurb: string;
};

const roles: Role[] = [
  {
    when: "2024 – Present",
    title: "Senior Engineer",
    org: "Placeholder Co.",
    blurb:
      "Replace this with a one-line summary of impact, scope, or technologies.",
  },
  {
    when: "2021 – 2024",
    title: "Engineer",
    org: "Earlier Company",
    blurb: "Summary of what you owned and shipped in this role.",
  },
  {
    when: "2018 – 2021",
    title: "Junior Engineer",
    org: "First Company",
    blurb: "Where you started and what you learned.",
  },
];

export default function Experience() {
  return (
    <section id="experience">
      <div className="container">
        <p className="section-eyebrow">Experience</p>
        <h2>Where I've worked</h2>
        <div className="timeline">
          {roles.map((r) => (
            <div className="role" key={`${r.when}-${r.org}`}>
              <div className="when">{r.when}</div>
              <div className="what">
                <h3>{r.title}</h3>
                <div className="org">{r.org}</div>
                <p>{r.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
