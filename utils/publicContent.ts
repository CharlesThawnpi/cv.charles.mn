import type { PortfolioContent } from "@/config/contentModel";

export const CANONICAL_PORTFOLIO_URL = "https://cv.charles.mn";

const LEGACY_PORTFOLIO_HOSTS = new Set(["cv-charles-mn.vercel.app"]);
const BARE_SOCIAL_HOSTS = new Set([
  "linkedin.com",
  "www.linkedin.com",
  "github.com",
  "www.github.com",
  "facebook.com",
  "www.facebook.com",
  "instagram.com",
  "www.instagram.com",
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
  "threads.net",
  "www.threads.net",
  "t.me",
  "telegram.me",
  "www.telegram.me",
]);

const LEGACY_COPY = {
  profileBio:
    "ICT / IT Manager at KMSS National Office, Myanmar. I build dependable systems, support teams, and keep mission-critical operations running.",
  heroHeadline: "Reliable IT leadership for real-world operations",
  heroSubtext:
    "From infrastructure and Microsoft 365 to conferencing, CCTV, and support workflows, I help organizations stay stable, secure, and future-ready.",
  heroSummary:
    "Quietly reliable ICT leadership grounded in infrastructure continuity, practical support, and mission-aligned execution.",
  aboutHeading: "Practical technology leadership with a service-first mindset",
  aboutDescription:
    "I have progressed from IT Volunteer to IT Officer to ICT / IT Manager by focusing on service quality, practical troubleshooting, and long-term resilience. My work combines hands-on technical execution with team enablement and process improvement.",
  focusHeading: "Keeping teams productive and infrastructure dependable",
  experienceHeading:
    "Career timeline built around continuity, support, and infrastructure trust",
  projectsHeading:
    "Projects and operational improvements with visible day-to-day impact",
  emptyProjectLinkLabel: "Internal delivery / operational project",
  contactHeading:
    "Open to practical conversations around infrastructure, systems, and support leadership",
  cvDownloadLabel: "Download PDF",
  cvPrintableStatusLabel: "Printable CV",
  cvPreviewStatusLabel: "Previewing Draft CV",
  cvPrintHint: "Use browser Print to save as PDF",
  cvProjectsHeading: "Projects / Key Work",
  cvQrCaption: "Scan the QR code to open the live portfolio",
  seoDescription:
    "Portfolio of Charles, ICT / IT Manager focused on support excellence, infrastructure reliability, and mission-driven technology operations.",
} as const;

const POLISHED_COPY = {
  profileBio:
    "ICT / IT Manager at KMSS National Office, Myanmar, focused on dependable systems, responsive support, and practical day-to-day operations.",
  heroHeadline: "Practical IT leadership for dependable day-to-day operations",
  heroSubtext:
    "I help teams stay connected and productive through dependable infrastructure, Microsoft 365, conferencing, CCTV, and responsive IT support.",
  heroSummary:
    "Hands-on ICT leadership focused on service continuity, reliable infrastructure, and steady improvements that help teams work with confidence.",
  aboutHeading: "Technology leadership built on service, continuity, and trust",
  aboutDescription:
    "My path from IT Volunteer to IT Officer to ICT / IT Manager has been shaped by practical troubleshooting, dependable support, and steady systems improvement. I combine hands-on technical execution with team coordination and long-term operational thinking.",
  focusHeading: "Keeping teams productive through dependable systems and support",
  experienceHeading:
    "Experience shaped by infrastructure continuity, support delivery, and operational trust",
  projectsHeading: "Selected projects and operational improvements with day-to-day impact",
  emptyProjectLinkLabel: "Internal delivery / no public link",
  contactHeading:
    "Open to conversations about IT operations, infrastructure, and support leadership",
  cvDownloadLabel: "Download CV PDF",
  cvPrintableStatusLabel: "Printable version",
  cvPreviewStatusLabel: "Draft preview",
  cvPrintHint: "Print or save as PDF from your browser",
  cvProjectsHeading: "Selected Projects",
  cvQrCaption: "Scan to open the live portfolio at cv.charles.mn",
  seoDescription:
    "Portfolio of Charles, ICT / IT Manager focused on dependable support, infrastructure stability, and practical technology operations.",
} as const;

const trimValue = (value: string | null | undefined) => value?.trim() ?? "";

const addHttpsIfMissing = (value: string) => {
  if (!value) {
    return "";
  }

  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
};

const replaceIfLegacy = (value: string, legacy: string, polished: string) =>
  value === legacy ? polished : value;

const isLikelyPlaceholderEmail = (value: string) => /(^|@)example\.com$/i.test(value);

const isLikelyPlaceholderPhone = (value: string) => /x{2,}/i.test(value) || /0{5,}/.test(value);

const normalizeUrl = (value: string) => {
  const candidate = addHttpsIfMissing(trimValue(value));

  if (!candidate) {
    return "";
  }

  try {
    const url = new URL(candidate);

    if (LEGACY_PORTFOLIO_HOSTS.has(url.hostname)) {
      return CANONICAL_PORTFOLIO_URL;
    }

    url.hash = "";

    return url.toString().replace(/\/$/, "");
  } catch {
    return candidate.replace(/\/$/, "");
  }
};

const isBareSocialUrl = (value: string) => {
  try {
    const url = new URL(addHttpsIfMissing(value));
    const pathname = url.pathname.replace(/\/+$/, "");
    return BARE_SOCIAL_HOSTS.has(url.hostname) && pathname.length === 0;
  } catch {
    return false;
  }
};

const sanitizeContactUrl = (value: string) => {
  const normalized = normalizeUrl(value);

  if (!normalized || isBareSocialUrl(normalized)) {
    return "";
  }

  return normalized;
};

export const formatDisplayUrl = (value: string) => {
  const normalized = normalizeUrl(value);

  if (!normalized) {
    return "";
  }

  try {
    const url = new URL(normalized);
    const pathname = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    return `${url.hostname}${pathname}`;
  } catch {
    return normalized.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
};

export const preparePublicPortfolioContent = (content: PortfolioContent): PortfolioContent => {
  const portfolioUrlSource = trimValue(content.cv.portfolioUrl) || trimValue(content.contact.website);
  const portfolioUrl = portfolioUrlSource ? normalizeUrl(portfolioUrlSource) : CANONICAL_PORTFOLIO_URL;
  const website = trimValue(content.contact.website)
    ? normalizeUrl(content.contact.website)
    : "";

  return {
    ...content,
    profile: {
      ...content.profile,
      bio: replaceIfLegacy(content.profile.bio, LEGACY_COPY.profileBio, POLISHED_COPY.profileBio),
    },
    hero: {
      ...content.hero,
      headline: replaceIfLegacy(
        content.hero.headline,
        LEGACY_COPY.heroHeadline,
        POLISHED_COPY.heroHeadline
      ),
      subtext: replaceIfLegacy(
        content.hero.subtext,
        LEGACY_COPY.heroSubtext,
        POLISHED_COPY.heroSubtext
      ),
      summary: replaceIfLegacy(
        content.hero.summary,
        LEGACY_COPY.heroSummary,
        POLISHED_COPY.heroSummary
      ),
    },
    about: {
      ...content.about,
      heading: replaceIfLegacy(
        content.about.heading,
        LEGACY_COPY.aboutHeading,
        POLISHED_COPY.aboutHeading
      ),
      description: replaceIfLegacy(
        content.about.description,
        LEGACY_COPY.aboutDescription,
        POLISHED_COPY.aboutDescription
      ),
    },
    focus: {
      ...content.focus,
      heading: replaceIfLegacy(
        content.focus.heading,
        LEGACY_COPY.focusHeading,
        POLISHED_COPY.focusHeading
      ),
    },
    experienceSection: {
      ...content.experienceSection,
      heading: replaceIfLegacy(
        content.experienceSection.heading,
        LEGACY_COPY.experienceHeading,
        POLISHED_COPY.experienceHeading
      ),
    },
    projectsSection: {
      ...content.projectsSection,
      heading: replaceIfLegacy(
        content.projectsSection.heading,
        LEGACY_COPY.projectsHeading,
        POLISHED_COPY.projectsHeading
      ),
      cardLabel: content.projectsSection.cardLabel === "Key Work" ? "Selected Work" : content.projectsSection.cardLabel,
      emptyLinkLabel: replaceIfLegacy(
        content.projectsSection.emptyLinkLabel,
        LEGACY_COPY.emptyProjectLinkLabel,
        POLISHED_COPY.emptyProjectLinkLabel
      ),
    },
    contactSection: {
      ...content.contactSection,
      heading: replaceIfLegacy(
        content.contactSection.heading,
        LEGACY_COPY.contactHeading,
        POLISHED_COPY.contactHeading
      ),
    },
    contact: {
      ...content.contact,
      email: isLikelyPlaceholderEmail(content.contact.email) ? "" : trimValue(content.contact.email),
      phone: isLikelyPlaceholderPhone(content.contact.phone) ? "" : trimValue(content.contact.phone),
      linkedin: sanitizeContactUrl(content.contact.linkedin),
      github: sanitizeContactUrl(content.contact.github),
      website,
      facebook: sanitizeContactUrl(content.contact.facebook),
      x: sanitizeContactUrl(content.contact.x),
      instagram: sanitizeContactUrl(content.contact.instagram),
      threads: sanitizeContactUrl(content.contact.threads),
      telegram: sanitizeContactUrl(content.contact.telegram),
    },
    cv: {
      ...content.cv,
      downloadLabel: replaceIfLegacy(
        content.cv.downloadLabel,
        LEGACY_COPY.cvDownloadLabel,
        POLISHED_COPY.cvDownloadLabel
      ),
      portfolioUrl,
      printableStatusLabel: replaceIfLegacy(
        content.cv.printableStatusLabel,
        LEGACY_COPY.cvPrintableStatusLabel,
        POLISHED_COPY.cvPrintableStatusLabel
      ),
      previewStatusLabel: replaceIfLegacy(
        content.cv.previewStatusLabel,
        LEGACY_COPY.cvPreviewStatusLabel,
        POLISHED_COPY.cvPreviewStatusLabel
      ),
      printHint: replaceIfLegacy(
        content.cv.printHint,
        LEGACY_COPY.cvPrintHint,
        POLISHED_COPY.cvPrintHint
      ),
      projectsHeading: replaceIfLegacy(
        content.cv.projectsHeading,
        LEGACY_COPY.cvProjectsHeading,
        POLISHED_COPY.cvProjectsHeading
      ),
      qrCaption: replaceIfLegacy(
        content.cv.qrCaption,
        LEGACY_COPY.cvQrCaption,
        POLISHED_COPY.cvQrCaption
      ),
    },
    seo: {
      ...content.seo,
      description: replaceIfLegacy(
        content.seo.description,
        LEGACY_COPY.seoDescription,
        POLISHED_COPY.seoDescription
      ),
    },
  };
};
