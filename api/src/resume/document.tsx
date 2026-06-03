import {
  Document,
  Page,
  Text,
  View,
  Link,
  Svg,
  Path,
  StyleSheet,
} from "@react-pdf/renderer";
import { tx, type ResumeData, type SkillGroup } from "./parse.js";

export type Variant = "short" | "full";

const BLUE = "#2746c7";
const DARK = "#222222";
const MUTED = "#5a5a5a";
const RULE = "#bdbdbd";

const st = StyleSheet.create({
  page: {
    paddingVertical: 34,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: DARK,
    lineHeight: 1.4,
  },
  bold: { fontFamily: "Helvetica-Bold" },
  italic: { fontFamily: "Helvetica-Oblique" },

  // Header
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: BLUE,
    textAlign: "center",
    letterSpacing: 4,
    lineHeight: 1.2,
    marginBottom: 6,
  },
  role: {
    fontSize: 12,
    color: "#3a3a3a",
    textAlign: "center",
    letterSpacing: 2,
    lineHeight: 1.2,
  },
  rule: { borderBottomWidth: 1, borderBottomColor: RULE },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  contactText: { fontSize: 8.5, color: "#333", marginLeft: 4 },
  link: { color: "#333", textDecoration: "none" },

  // Sections
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    color: BLUE,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 13,
    marginBottom: 4,
  },
  summary: { marginTop: 6, textAlign: "justify" },
  availability: {
    marginTop: 6,
    fontFamily: "Helvetica-Oblique",
    color: MUTED,
  },

  // Two-column row (Languages | Education)
  twoCol: { flexDirection: "row", gap: 24 },
  col: { flex: 1 },

  // Experience
  jobLine: {
    fontFamily: "Helvetica-Oblique",
    color: BLUE,
    fontSize: 10,
    marginTop: 9,
  },
  jobPeriod: {
    fontFamily: "Helvetica-Oblique",
    color: BLUE,
    fontSize: 8.5,
    marginTop: 1,
    marginBottom: 2,
  },
  projectTitle: {
    fontFamily: "Helvetica-Bold",
    color: "#2b2b2b",
    marginTop: 5,
  },

  // Bullets with a blue dot
  bulletRow: { flexDirection: "row", marginTop: 2, paddingLeft: 6 },
  dot: { color: BLUE, width: 10, fontSize: 9 },
  bulletText: { flex: 1 },

  // Skill tables
  tableTop: { borderTopWidth: 1, borderTopColor: RULE, marginTop: 3 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 2,
  },
  cellLeft: { width: "38%", paddingRight: 8 },
  cellRight: { width: "62%" },
  skillInline: { marginTop: 3 },
});

/* ---------- small SVG icons (Material, CC0) ---------- */
function Icon({ d }: { d: string }) {
  return (
    <Svg width={9} height={9} viewBox="0 0 24 24">
      <Path d={d} fill={BLUE} />
    </Svg>
  );
}
const ICONS = {
  phone:
    "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  mail:
    "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  globe:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  pin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
};

/* ---------- helpers ---------- */
function Inline({ text, style }: { text: string; style?: any }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={style}>
      {parts.map((p, i) => {
        const m = p.match(/^\*\*([^*]+)\*\*$/);
        return m ? (
          <Text key={i} style={st.bold}>
            {tx(m[1])}
          </Text>
        ) : (
          <Text key={i}>{tx(p)}</Text>
        );
      })}
    </Text>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={st.bulletRow}>
      <Text style={st.dot}>•</Text>
      <Text style={st.bulletText}>{children}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={st.sectionTitle}>{children}</Text>;
}

/* ---------- header ---------- */
function Header({ data }: { data: ResumeData }) {
  const { contact, siteUrl } = data;
  return (
    <View>
      <Text style={st.name}>{tx(data.name)}</Text>
      {data.roleTitle ? (
        <Text style={st.role}>{tx(data.roleTitle)}</Text>
      ) : null}
      <View style={[st.rule, { marginTop: 6 }]} />
      <View style={st.contactRow}>
        {contact.phone ? (
          <View style={st.contactItem}>
            <Icon d={ICONS.phone} />
            <Text style={st.contactText}>{tx(contact.phone)}</Text>
          </View>
        ) : null}
        {contact.email ? (
          <View style={st.contactItem}>
            <Icon d={ICONS.mail} />
            <Link src={`mailto:${contact.email}`} style={st.link}>
              <Text style={st.contactText}>{tx(contact.email)}</Text>
            </Link>
          </View>
        ) : null}
        {siteUrl ? (
          <View style={st.contactItem}>
            <Icon d={ICONS.globe} />
            <Link
              src={
                siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`
              }
              style={st.link}
            >
              <Text style={st.contactText}>{tx(siteUrl)}</Text>
            </Link>
          </View>
        ) : null}
        {data.location ? (
          <View style={st.contactItem}>
            <Icon d={ICONS.pin} />
            <Text style={st.contactText}>{tx(data.location)}</Text>
          </View>
        ) : null}
      </View>
      <View style={st.rule} />
    </View>
  );
}

/* ---------- skills tables ---------- */
function splitRow(item: string): [string, string] | null {
  const colon = item.indexOf(": ");
  if (colon > -1) return [item.slice(0, colon).trim(), item.slice(colon + 2).trim()];
  const dash = item.indexOf(" - ");
  if (dash > -1) return [item.slice(0, dash).trim(), item.slice(dash + 3).trim()];
  return null;
}

function SkillBlock({ group }: { group: SkillGroup }) {
  const rows = group.items.map(splitRow);
  const tabular = rows.filter(Boolean).length >= Math.ceil(group.items.length / 2);

  return (
    <View wrap={false}>
      <SectionTitle>{group.group}</SectionTitle>
      {tabular ? (
        <View style={st.tableTop}>
          {group.items.map((it, i) => {
            const r = rows[i];
            return (
              <View key={i} style={st.tableRow}>
                <Text style={[st.cellLeft, st.bold]}>{tx(r ? r[0] : it)}</Text>
                <Text style={st.cellRight}>{tx(r ? r[1] : "")}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={st.skillInline}>
          {group.items.map((it) => tx(it)).join("   ·   ")}
        </Text>
      )}
    </View>
  );
}

/* ---------- experience ---------- */
function Experience({ data, variant }: { data: ResumeData; variant: Variant }) {
  return (
    <View>
      <SectionTitle>Experience</SectionTitle>
      {data.jobs.map((job, i) => (
        <View key={i}>
          <Text style={st.jobLine}>
            {tx(job.role)}
            {job.company ? `  |  ${tx(job.company)}` : ""}
          </Text>
          {job.period ? (
            <Text style={st.jobPeriod}>{tx(job.period)}</Text>
          ) : null}

          {job.projects.map((p, j) => {
            const scope =
              p.fields.find((f) => /scope/i.test(f.label)) ??
              p.fields.find((f) => /responsibilit/i.test(f.label));
            const target = p.fields.find((f) => /target/i.test(f.label));
            const team = p.fields.find((f) => /team/i.test(f.label));
            return (
              <View key={j} wrap={false}>
                <Text style={st.projectTitle}>{tx(p.title)}</Text>
                {variant === "short" ? (
                  <View>
                    {[target, team].map((f, k) =>
                      f ? (
                        <Bullet key={k}>
                          <Text style={st.bold}>{tx(f.label)}: </Text>
                          {f.items.map(tx).join(" · ")}
                        </Bullet>
                      ) : null
                    )}
                    {(scope?.items ?? []).map((it, k) => (
                      <Bullet key={`s${k}`}>{tx(it)}</Bullet>
                    ))}
                  </View>
                ) : (
                  p.fields.map((f, k) => (
                    <Bullet key={k}>
                      <Text style={st.bold}>{tx(f.label)}: </Text>
                      {f.items.map(tx).join(" · ")}
                    </Bullet>
                  ))
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/* ---------- document ---------- */
export function ResumeDoc({
  data,
  variant,
}: {
  data: ResumeData;
  variant: Variant;
}) {
  return (
    <Document
      title={`${data.name} — ${variant === "full" ? "CV" : "Resume"}`}
      author={data.name}
    >
      <Page size="A4" style={st.page}>
        <Header data={data} />

        {data.summary ? (
          <View>
            <SectionTitle>Profile</SectionTitle>
            <Inline text={data.summary} style={st.summary} />
            {variant === "short" && data.availability ? (
              <Text style={st.availability}>{tx(data.availability)}</Text>
            ) : null}
          </View>
        ) : null}

        {(data.spokenLanguages.length > 0 || data.education.length > 0) && (
          <View style={st.twoCol}>
            {data.spokenLanguages.length > 0 && (
              <View style={st.col}>
                <SectionTitle>Languages</SectionTitle>
                {data.spokenLanguages.map((l, i) => (
                  <Bullet key={i}>{tx(l)}</Bullet>
                ))}
              </View>
            )}
            {data.education.length > 0 && (
              <View style={st.col}>
                <SectionTitle>Education</SectionTitle>
                {data.education.map((e, i) => (
                  <Text key={i} style={{ marginTop: 2 }}>
                    {tx(e)}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        <Experience data={data} variant={variant} />

        {data.skills.map((g, i) => (
          <SkillBlock key={i} group={g} />
        ))}
      </Page>
    </Document>
  );
}
