import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { PortfolioContent } from "@/config/contentModel";
import { getPdfSocialLinks } from "@/components/portfolio/SocialLinks";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0b1620",
    padding: 24,
    fontSize: 10.5,
    color: "#dfe9f4",
    fontFamily: "Helvetica",
  },
  sheet: {
    borderRadius: 22,
    border: "1 solid rgba(202, 223, 241, 0.22)",
    backgroundColor: "#112231",
    padding: 22,
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  identity: {
    flexGrow: 1,
    gap: 6,
  },
  eyebrow: {
    color: "#8fb7d6",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  name: {
    fontSize: 28,
    color: "#f4f9fd",
    fontWeight: 700,
  },
  title: {
    fontSize: 13,
    color: "#a8c5dd",
    fontWeight: 600,
  },
  bio: {
    color: "#c8d7e5",
    lineHeight: 1.45,
    maxWidth: 340,
  },
  mediaRail: {
    width: 118,
    alignItems: "flex-end",
    gap: 10,
  },
  photo: {
    width: 92,
    height: 92,
    objectFit: "cover",
    borderRadius: 46,
    border: "1 solid rgba(202, 223, 241, 0.28)",
  },
  photoPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#20384c",
    border: "1 solid rgba(202, 223, 241, 0.28)",
    color: "#f4f9fd",
    fontSize: 26,
    fontWeight: 700,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    border: "1 solid rgba(202, 223, 241, 0.22)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    color: "#d7e6f2",
    backgroundColor: "#183140",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  metaRow: {
    marginTop: 12,
    display: "flex",
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  metaPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    border: "1 solid rgba(202, 223, 241, 0.18)",
    backgroundColor: "#162c3b",
    color: "#eff5fa",
    fontSize: 9.5,
  },
  heroHeadline: {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 1.2,
    color: "#f5f9fc",
    fontWeight: 700,
  },
  heroSubtext: {
    marginTop: 8,
    color: "#c7d7e6",
    lineHeight: 1.55,
  },
  support: {
    marginTop: 18,
    paddingTop: 14,
    borderTop: "1 solid rgba(202, 223, 241, 0.16)",
    gap: 12,
  },
  supportSummary: {
    color: "#d7e5f1",
    lineHeight: 1.5,
  },
  supportGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  supportCard: {
    flex: 1,
    gap: 4,
    padding: 10,
    borderRadius: 12,
    border: "1 solid rgba(202, 223, 241, 0.14)",
    backgroundColor: "#162c3b",
  },
  supportLabel: {
    color: "#8fb7d6",
    fontSize: 8.5,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  supportValue: {
    color: "#eff5fa",
    lineHeight: 1.45,
  },
  section: {
    marginTop: 18,
    gap: 8,
  },
  sectionHeading: {
    color: "#9fc2de",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    paddingBottom: 6,
    borderBottom: "1 solid rgba(202, 223, 241, 0.14)",
  },
  panel: {
    borderRadius: 14,
    border: "1 solid rgba(202, 223, 241, 0.12)",
    backgroundColor: "#162c3b",
    padding: 12,
    gap: 6,
  },
  sectionText: {
    color: "#c8d7e5",
    lineHeight: 1.55,
  },
  stack: {
    gap: 10,
  },
  rowGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
    gap: 8,
  },
  itemHeading: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  itemTitle: {
    color: "#f4f9fd",
    fontWeight: 700,
  },
  itemMeta: {
    color: "#9fbcd2",
  },
  chips: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    border: "1 solid rgba(202, 223, 241, 0.14)",
    backgroundColor: "#1a3142",
    color: "#eff5fa",
    fontSize: 9,
  },
  list: {
    gap: 8,
  },
  listItem: {
    gap: 3,
  },
  smallMuted: {
    color: "#9fbcd2",
  },
  socialLinks: {
    gap: 4,
  },
  socialLink: {
    color: "#cae0ef",
    textDecoration: "none",
  },
  footerRow: {
    marginTop: 18,
    display: "flex",
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  qrPanel: {
    width: 118,
    gap: 6,
    alignItems: "center",
  },
  qrCode: {
    width: 90,
    height: 90,
  },
  qrCaption: {
    color: "#a7bfd2",
    fontSize: 8.5,
    textAlign: "center",
    lineHeight: 1.35,
  },
});

interface CvPdfDocumentProps {
  content: PortfolioContent;
  mode: "published" | "preview";
  portfolioUrl: string;
  qrCodeDataUrl: string;
}

export function CvPdfDocument({
  content,
  mode,
  portfolioUrl,
  qrCodeDataUrl,
}: CvPdfDocumentProps) {
  const socialLinks = getPdfSocialLinks(content.contact);

  return (
    <Document title={`${content.profile.name} CV`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <View style={styles.identity}>
              <Text style={styles.eyebrow}>{content.cv.documentLabel}</Text>
              <Text style={styles.name}>{content.profile.name}</Text>
              <Text style={styles.title}>{content.profile.title}</Text>
              <Text style={styles.bio}>{content.profile.bio}</Text>
            </View>

            <View style={styles.mediaRail}>
              <Text style={styles.badge}>
                {mode === "preview" ? content.cv.previewStatusLabel : content.cv.printableStatusLabel}
              </Text>
              {content.profile.photo ? (
                <Image src={content.profile.photo} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text>{content.profile.name.slice(0, 1)}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaPill}>{content.profile.title}</Text>
            <Text style={styles.metaPill}>{content.profile.location}</Text>
            {content.contact.email ? <Text style={styles.metaPill}>{content.contact.email}</Text> : null}
          </View>

          <Text style={styles.heroHeadline}>{content.hero.headline}</Text>
          <Text style={styles.heroSubtext}>{content.hero.subtext}</Text>

          <View style={styles.support}>
            <Text style={styles.supportSummary}>{content.hero.summary}</Text>
            <View style={styles.supportGrid}>
              {content.hero.highlights.map((item, index) => (
                <View key={`${item.label}-${index}`} style={styles.supportCard}>
                  <Text style={styles.supportLabel}>{item.label}</Text>
                  <Text style={styles.supportValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>{content.cv.summaryHeading}</Text>
            <View style={styles.panel}>
              <Text style={styles.sectionText}>{content.about.description}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>{content.cv.experienceHeading}</Text>
            <View style={styles.stack}>
              {content.experience.map((item, index) => (
                <View key={`${item.company}-${index}`} style={styles.panel}>
                  <View style={styles.itemHeading}>
                    <Text style={styles.itemTitle}>{item.role}</Text>
                    <Text style={styles.itemMeta}>{item.duration}</Text>
                  </View>
                  <Text style={styles.smallMuted}>{item.company}</Text>
                  <Text style={styles.sectionText}>{item.details}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.rowGrid}>
            <View style={styles.half}>
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>{content.cv.skillsHeading}</Text>
                <View style={styles.panel}>
                  <View style={styles.chips}>
                    {content.skills.map((skill) => (
                      <Text key={skill} style={styles.chip}>
                        {skill}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionHeading}>{content.cv.certificationsHeading}</Text>
                <View style={styles.panel}>
                  <View style={styles.list}>
                    {content.certifications.map((item, index) => (
                      <View key={`${item.name}-${index}`} style={styles.listItem}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                        <Text style={styles.smallMuted}>
                          {item.issuer} - {item.date}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.half}>
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>{content.cv.toolsHeading}</Text>
                <View style={styles.panel}>
                  <View style={styles.chips}>
                    {content.tools.map((tool) => (
                      <Text key={tool} style={styles.chip}>
                        {tool}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionHeading}>{content.cv.achievementsHeading}</Text>
                <View style={styles.panel}>
                  <View style={styles.list}>
                    {content.achievements.map((achievement) => (
                      <Text key={achievement} style={styles.sectionText}>
                        • {achievement}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>{content.cv.projectsHeading}</Text>
            <View style={styles.rowGrid}>
              {content.projects.map((project, index) => (
                <View key={`${project.name}-${index}`} style={[styles.panel, styles.half]}>
                  <Text style={styles.itemTitle}>{project.name}</Text>
                  <Text style={styles.sectionText}>{project.description}</Text>
                  {project.link ? (
                    <Link src={project.link} style={styles.socialLink}>
                      {project.link}
                    </Link>
                  ) : null}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footerRow}>
            <View style={[styles.section, { flex: 1, marginTop: 0 }]}>
              <Text style={styles.sectionHeading}>{content.cv.contactHeading}</Text>
              <View style={styles.panel}>
                <View style={styles.list}>
                  {content.contact.email ? (
                    <Text style={styles.sectionText}>Email: {content.contact.email}</Text>
                  ) : null}
                  {content.contact.phone ? (
                    <Text style={styles.sectionText}>Phone: {content.contact.phone}</Text>
                  ) : null}
                  {content.profile.location ? (
                    <Text style={styles.sectionText}>Location: {content.profile.location}</Text>
                  ) : null}
                  {socialLinks.length > 0 ? (
                    <View style={styles.socialLinks}>
                      {socialLinks.map((item) => (
                        <Link key={item.label} src={item.href} style={styles.socialLink}>
                          {item.label}: {item.href}
                        </Link>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.qrPanel}>
              <Image src={qrCodeDataUrl} style={styles.qrCode} />
              <Text style={styles.qrCaption}>{content.cv.qrCaption}</Text>
              <Link src={portfolioUrl} style={styles.socialLink}>
                {portfolioUrl}
              </Link>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
