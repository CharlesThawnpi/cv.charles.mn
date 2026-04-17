import {
  Document,
  Font,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { PortfolioContent } from "@/config/contentModel";
import { getPdfSocialLinks } from "@/components/portfolio/SocialLinks";

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 18,
    fontSize: 9.6,
    color: "#1f2933",
    fontFamily: "Helvetica",
  },
  sheet: {
    borderRadius: 12,
    border: "1 solid #c7ced6",
    backgroundColor: "#ffffff",
    padding: 16,
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  identity: {
    flexGrow: 1,
    gap: 4,
  },
  eyebrow: {
    color: "#52677e",
    fontSize: 8.4,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  name: {
    color: "#111827",
    fontWeight: 700,
    lineHeight: 1.02,
  },
  title: {
    fontSize: 11,
    color: "#334155",
    fontWeight: 600,
  },
  bio: {
    color: "#4b5563",
    lineHeight: 1.28,
    maxWidth: 360,
  },
  mediaRail: {
    width: 104,
    alignItems: "flex-end",
    gap: 8,
  },
  photo: {
    width: 78,
    height: 78,
    objectFit: "cover",
    borderRadius: 12,
    border: "1 solid #c7ced6",
  },
  photoPlaceholder: {
    width: 78,
    height: 78,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2f6",
    border: "1 solid #c7ced6",
  },
  photoPlaceholderText: {
    color: "#334155",
    fontSize: 22,
    fontWeight: 700,
  },
  metaRow: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  metaPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    border: "1 solid #d1d7df",
    backgroundColor: "#f7f9fb",
    color: "#334155",
    fontSize: 8.8,
  },
  heroHeadline: {
    marginTop: 10,
    color: "#111827",
    fontWeight: 700,
    lineHeight: 1.12,
    maxWidth: 380,
  },
  heroSubtext: {
    marginTop: 6,
    color: "#4b5563",
    lineHeight: 1.28,
  },
  support: {
    marginTop: 14,
    paddingTop: 10,
    borderTop: "1 solid #d5dbe3",
    gap: 8,
  },
  supportSummary: {
    color: "#374151",
    lineHeight: 1.26,
  },
  supportGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  supportCard: {
    flex: 1,
    gap: 3,
    padding: 8,
    borderRadius: 10,
    border: "1 solid #d5dbe3",
    backgroundColor: "#fafbfc",
  },
  supportLabel: {
    color: "#52677e",
    fontSize: 7.8,
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  supportValue: {
    color: "#1f2933",
    lineHeight: 1.2,
    fontSize: 9.1,
  },
  section: {
    marginTop: 12,
    gap: 6,
  },
  sectionHeading: {
    color: "#334155",
    fontSize: 9.8,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingBottom: 5,
    borderBottom: "1 solid #d7dde5",
  },
  panel: {
    borderRadius: 10,
    border: "1 solid #d5dbe3",
    backgroundColor: "#ffffff",
    padding: 8,
    gap: 3,
  },
  sectionText: {
    color: "#374151",
    lineHeight: 1.16,
    fontSize: 9.2,
  },
  stack: {
    gap: 7,
  },
  itemHeading: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTitle: {
    color: "#111827",
    fontWeight: 700,
    lineHeight: 1.18,
    fontSize: 9.5,
  },
  itemMeta: {
    color: "#52677e",
    fontSize: 8.3,
  },
  chips: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 999,
    border: "1 solid #d5dbe3",
    backgroundColor: "#f7f9fb",
    color: "#1f2933",
    fontSize: 8,
  },
  list: {
    gap: 5,
  },
  listItem: {
    gap: 2,
  },
  smallMuted: {
    color: "#52677e",
    fontSize: 8.6,
    lineHeight: 1.2,
  },
  socialLinks: {
    gap: 3,
  },
  socialLink: {
    color: "#334155",
    textDecoration: "none",
    lineHeight: 1.2,
    fontSize: 8.5,
  },
  footerRow: {
    marginTop: 12,
    display: "flex",
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  qrPanel: {
    width: 108,
    gap: 5,
    alignItems: "center",
  },
  qrCode: {
    width: 82,
    height: 82,
  },
  qrCaption: {
    color: "#52677e",
    fontSize: 7.8,
    textAlign: "center",
    lineHeight: 1.2,
  },
});

interface CvPdfDocumentProps {
  content: PortfolioContent;
  portfolioUrl: string;
  displayPortfolioUrl: string;
  qrCodeDataUrl: string;
}

const getAdaptiveNameSize = (value: string) => {
  if (value.length > 26) return 22;
  if (value.length > 20) return 24;
  return 27;
};

const getAdaptiveHeadlineSize = (value: string) => {
  if (value.length > 80) return 12.8;
  if (value.length > 56) return 14;
  return 15.8;
};

const getAdaptiveSummarySize = (value: string) => {
  if (value.length > 160) return 9;
  return 9.4;
};

const getAdaptiveSupportSize = (value: string) => {
  if (value.length > 100) return 8.4;
  if (value.length > 68) return 8.8;
  return 9.1;
};

const getAdaptiveParagraphSize = (value: string) => {
  if (value.length > 220) return 8.8;
  if (value.length > 160) return 9;
  return 9.2;
};

interface SectionBlockProps {
  heading: string;
  children: ReactNode;
  minPresenceAhead?: number;
}

function SectionBlock({ heading, children, minPresenceAhead = 90 }: SectionBlockProps) {
  return (
    <View style={styles.section} minPresenceAhead={minPresenceAhead}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      {children}
    </View>
  );
}

export function CvPdfDocument({
  content,
  portfolioUrl,
  displayPortfolioUrl,
  qrCodeDataUrl,
}: CvPdfDocumentProps) {
  const socialLinks = getPdfSocialLinks(content.contact);
  const nameFontSize = getAdaptiveNameSize(content.profile.name);
  const headlineFontSize = getAdaptiveHeadlineSize(content.hero.headline);
  const summaryFontSize = getAdaptiveSummarySize(content.hero.summary);
  const supportHighlights = content.hero.highlights.slice(0, 3);

  return (
    <Document title={`${content.profile.name} CV`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <View style={styles.identity}>
              <Text style={styles.eyebrow}>{content.cv.documentLabel}</Text>
              <Text style={[styles.name, { fontSize: nameFontSize }]}>{content.profile.name}</Text>
              <Text style={styles.title}>{content.profile.title}</Text>
              <Text style={styles.bio}>{content.profile.bio}</Text>
            </View>

            <View style={styles.mediaRail}>
              {content.profile.photo ? (
                <Image src={content.profile.photo} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>{content.profile.name.slice(0, 1)}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaPill}>{content.profile.title}</Text>
            <Text style={styles.metaPill}>{content.profile.location}</Text>
            {content.contact.email ? <Text style={styles.metaPill}>{content.contact.email}</Text> : null}
          </View>

          <Text style={[styles.heroHeadline, { fontSize: headlineFontSize }]}>{content.hero.headline}</Text>
          <Text style={styles.heroSubtext}>{content.hero.subtext}</Text>

          <View style={styles.support} wrap={false}>
            <Text style={[styles.supportSummary, { fontSize: summaryFontSize }]}>{content.hero.summary}</Text>
            <View style={styles.supportGrid}>
              {supportHighlights.map((item, index) => (
                <View key={`${item.label}-${index}`} style={styles.supportCard}>
                  <Text style={styles.supportLabel}>{item.label}</Text>
                  <Text style={[styles.supportValue, { fontSize: getAdaptiveSupportSize(item.value) }]}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <SectionBlock heading={content.cv.summaryHeading} minPresenceAhead={80}>
            <View style={styles.panel}>
              <Text style={[styles.sectionText, { fontSize: getAdaptiveParagraphSize(content.about.description) }]}>
                {content.about.description}
              </Text>
            </View>
          </SectionBlock>

          <SectionBlock heading={content.cv.experienceHeading} minPresenceAhead={120}>
            <View style={styles.stack}>
              {content.experience.map((item, index) => (
                <View key={`${item.company}-${index}`} style={styles.panel} wrap={false}>
                  <View style={styles.itemHeading}>
                    <Text style={styles.itemTitle}>{item.role}</Text>
                    <Text style={styles.itemMeta}>{item.duration}</Text>
                  </View>
                  <Text style={styles.smallMuted}>{item.company}</Text>
                  <Text style={[styles.sectionText, { fontSize: getAdaptiveParagraphSize(item.details) }]}>
                    {item.details}
                  </Text>
                </View>
              ))}
            </View>
          </SectionBlock>

          <SectionBlock heading={content.cv.skillsHeading} minPresenceAhead={95}>
            <View style={styles.panel} wrap={false}>
              <View style={styles.chips}>
                {content.skills.map((skill) => (
                  <Text key={skill} style={styles.chip}>
                    {skill}
                  </Text>
                ))}
              </View>
            </View>
          </SectionBlock>

          <SectionBlock heading={content.cv.certificationsHeading} minPresenceAhead={110}>
            <View style={styles.panel}>
              <View style={styles.list}>
                {content.certifications.map((item, index) => (
                  <View key={`${item.name}-${index}`} style={styles.listItem} wrap={false}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <Text style={styles.smallMuted}>
                      {item.issuer} - {item.date}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </SectionBlock>

          <SectionBlock heading={content.cv.toolsHeading} minPresenceAhead={95}>
            <View style={styles.panel} wrap={false}>
              <View style={styles.chips}>
                {content.tools.map((tool) => (
                  <Text key={tool} style={styles.chip}>
                    {tool}
                  </Text>
                ))}
              </View>
            </View>
          </SectionBlock>

          <SectionBlock heading={content.cv.achievementsHeading} minPresenceAhead={105}>
            <View style={styles.panel}>
              <View style={styles.list}>
                {content.achievements.map((achievement) => (
                  <Text key={achievement} style={styles.sectionText}>
                    • {achievement}
                  </Text>
                ))}
              </View>
            </View>
          </SectionBlock>

          <SectionBlock heading={content.cv.projectsHeading} minPresenceAhead={120}>
            <View style={styles.stack}>
              {content.projects.map((project, index) => (
                <View key={`${project.name}-${index}`} style={styles.panel} wrap={false}>
                  <Text style={styles.itemTitle}>{project.name}</Text>
                  <Text style={[styles.sectionText, { fontSize: getAdaptiveParagraphSize(project.description) }]}>
                    {project.description}
                  </Text>
                  {project.link ? (
                    <Link src={project.link} style={styles.socialLink}>
                      {project.link}
                    </Link>
                  ) : null}
                </View>
              ))}
            </View>
          </SectionBlock>

          <View style={styles.footerRow} wrap={false} minPresenceAhead={120}>
            <View style={{ flex: 1 }}>
              <SectionBlock heading={content.cv.contactHeading} minPresenceAhead={80}>
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
              </SectionBlock>
            </View>

            <View style={styles.qrPanel} wrap={false}>
              <Image src={qrCodeDataUrl} style={styles.qrCode} />
              <Text style={styles.qrCaption}>{content.cv.qrCaption}</Text>
              {displayPortfolioUrl ? (
                <Link src={portfolioUrl} style={styles.socialLink}>
                  {displayPortfolioUrl}
                </Link>
              ) : null}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
