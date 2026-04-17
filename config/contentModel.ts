export interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  details: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  link: string;
}

export interface HeroHighlightItem {
  label: string;
  value: string;
}

export interface SectionContent {
  eyebrow: string;
  heading: string;
}

export interface ProjectSectionContent extends SectionContent {
  cardLabel: string;
  emptyLinkLabel: string;
}

export interface CvContentCopy {
  documentLabel: string;
  backToPortfolioLabel: string;
  downloadLabel: string;
  portfolioUrl: string;
  printableStatusLabel: string;
  previewStatusLabel: string;
  printHint: string;
  summaryHeading: string;
  experienceHeading: string;
  skillsHeading: string;
  toolsHeading: string;
  certificationsHeading: string;
  achievementsHeading: string;
  projectsHeading: string;
  contactHeading: string;
  qrCaption: string;
}

export interface PortfolioContent {
  profile: {
    name: string;
    title: string;
    bio: string;
    location: string;
    photo: string;
  };
  hero: {
    headline: string;
    subtext: string;
    downloadLabel: string;
    summary: string;
    nameFontSize: string;
    headlineFontSize: string;
    highlights: HeroHighlightItem[];
  };
  about: {
    eyebrow: string;
    heading: string;
    description: string;
  };
  focus: SectionContent;
  experienceSection: SectionContent;
  skillsSection: SectionContent;
  toolsSection: SectionContent;
  certificationsSection: SectionContent;
  achievementsSection: SectionContent;
  projectsSection: ProjectSectionContent;
  contactSection: SectionContent;
  experience: ExperienceItem[];
  certifications: CertificationItem[];
  skills: string[];
  tools: string[];
  projects: ProjectItem[];
  achievements: string[];
  contact: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    website: string;
    facebook: string;
    x: string;
    instagram: string;
    threads: string;
    telegram: string;
  };
  cv: CvContentCopy;
  seo: {
    title: string;
    description: string;
  };
}

export interface PortfolioRecord {
  draft: PortfolioContent;
  published: PortfolioContent;
  updatedAt: string;
  publishedAt: string | null;
}

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
};

const asString = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const asStringArray = (value: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : fallback;
};

const normalizeExperience = (
  value: unknown,
  fallback: ExperienceItem[]
): ExperienceItem[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => {
      const record = asRecord(item);
      return {
        company: asString(record.company),
        role: asString(record.role),
        duration: asString(record.duration),
        details: asString(record.details),
      };
    })
    .filter((item) => item.company || item.role || item.duration || item.details);

  return normalized.length > 0 ? normalized : fallback;
};

const normalizeCertifications = (
  value: unknown,
  fallback: CertificationItem[]
): CertificationItem[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => {
      const record = asRecord(item);
      return {
        name: asString(record.name),
        issuer: asString(record.issuer),
        date: asString(record.date),
      };
    })
    .filter((item) => item.name || item.issuer || item.date);

  return normalized.length > 0 ? normalized : fallback;
};

const normalizeProjects = (
  value: unknown,
  fallback: ProjectItem[]
): ProjectItem[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => {
      const record = asRecord(item);
      return {
        name: asString(record.name),
        description: asString(record.description),
        link: asString(record.link),
      };
    })
    .filter((item) => item.name || item.description || item.link);

  return normalized.length > 0 ? normalized : fallback;
};

const normalizeHeroHighlights = (
  value: unknown,
  fallback: HeroHighlightItem[]
): HeroHighlightItem[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => {
      const record = asRecord(item);
      return {
        label: asString(record.label),
        value: asString(record.value),
      };
    })
    .filter((item) => item.label || item.value);

  return normalized.length > 0 ? normalized : fallback;
};

const normalizeSectionContent = (
  value: unknown,
  fallback: SectionContent
): SectionContent => {
  const record = asRecord(value);

  return {
    eyebrow: asString(record.eyebrow, fallback.eyebrow),
    heading: asString(record.heading, fallback.heading),
  };
};

const normalizeProjectSectionContent = (
  value: unknown,
  fallback: ProjectSectionContent
): ProjectSectionContent => {
  const record = asRecord(value);

  return {
    eyebrow: asString(record.eyebrow, fallback.eyebrow),
    heading: asString(record.heading, fallback.heading),
    cardLabel: asString(record.cardLabel, fallback.cardLabel),
    emptyLinkLabel: asString(record.emptyLinkLabel, fallback.emptyLinkLabel),
  };
};

const normalizeCvContentCopy = (
  value: unknown,
  fallback: CvContentCopy
): CvContentCopy => {
  const record = asRecord(value);

  return {
    documentLabel: asString(record.documentLabel, fallback.documentLabel),
    backToPortfolioLabel: asString(record.backToPortfolioLabel, fallback.backToPortfolioLabel),
    downloadLabel: asString(record.downloadLabel, fallback.downloadLabel),
    portfolioUrl: asString(record.portfolioUrl, fallback.portfolioUrl),
    printableStatusLabel: asString(record.printableStatusLabel, fallback.printableStatusLabel),
    previewStatusLabel: asString(record.previewStatusLabel, fallback.previewStatusLabel),
    printHint: asString(record.printHint, fallback.printHint),
    summaryHeading: asString(record.summaryHeading, fallback.summaryHeading),
    experienceHeading: asString(record.experienceHeading, fallback.experienceHeading),
    skillsHeading: asString(record.skillsHeading, fallback.skillsHeading),
    toolsHeading: asString(record.toolsHeading, fallback.toolsHeading),
    certificationsHeading: asString(record.certificationsHeading, fallback.certificationsHeading),
    achievementsHeading: asString(record.achievementsHeading, fallback.achievementsHeading),
    projectsHeading: asString(record.projectsHeading, fallback.projectsHeading),
    contactHeading: asString(record.contactHeading, fallback.contactHeading),
    qrCaption: asString(record.qrCaption, fallback.qrCaption),
  };
};

export const seededPortfolioContent: PortfolioContent = {
  profile: {
    name: "Charles",
    title: "ICT / IT Manager",
    bio: "ICT / IT Manager at KMSS National Office, Myanmar. I build dependable systems, support teams, and keep mission-critical operations running.",
    location: "Yangon, Myanmar",
    photo: "",
  },
  hero: {
    headline: "Reliable IT leadership for real-world operations",
    subtext:
      "From infrastructure and Microsoft 365 to conferencing, CCTV, and support workflows, I help organizations stay stable, secure, and future-ready.",
    downloadLabel: "Download CV",
    summary:
      "Quietly reliable ICT leadership grounded in infrastructure continuity, practical support, and mission-aligned execution.",
    nameFontSize: "5.6rem",
    headlineFontSize: "2.3rem",
    highlights: [
      {
        label: "Experience",
        value: "3 roles across KMSS National Office",
      },
      {
        label: "Core strengths",
        value: "Infrastructure, support systems, Microsoft 365, and resilient daily operations",
      },
      {
        label: "Selected work",
        value: "2 portfolio-backed initiatives and operational improvements",
      },
    ],
  },
  about: {
    eyebrow: "About",
    heading: "Practical technology leadership with a service-first mindset",
    description:
      "I have progressed from IT Volunteer to IT Officer to ICT / IT Manager by focusing on service quality, practical troubleshooting, and long-term resilience. My work combines hands-on technical execution with team enablement and process improvement.",
  },
  focus: {
    eyebrow: "Current Focus",
    heading: "Keeping teams productive and infrastructure dependable",
  },
  experienceSection: {
    eyebrow: "Experience",
    heading: "Career timeline built around continuity, support, and infrastructure trust",
  },
  skillsSection: {
    eyebrow: "Capabilities",
    heading: "Skills",
  },
  toolsSection: {
    eyebrow: "Tooling",
    heading: "Platforms & Systems",
  },
  certificationsSection: {
    eyebrow: "Learning & Credentials",
    heading: "Certifications",
  },
  achievementsSection: {
    eyebrow: "Impact",
    heading: "Achievements",
  },
  projectsSection: {
    eyebrow: "Selected Work",
    heading: "Projects and operational improvements with visible day-to-day impact",
    cardLabel: "Key Work",
    emptyLinkLabel: "Internal delivery / operational project",
  },
  contactSection: {
    eyebrow: "Contact",
    heading: "Open to practical conversations around infrastructure, systems, and support leadership",
  },
  experience: [
    {
      company: "KMSS National Office",
      role: "ICT / IT Manager",
      duration: "2023 - Present",
      details:
        "Lead ICT strategy, operations support, infrastructure improvements, and cross-team technical coordination.",
    },
    {
      company: "KMSS National Office",
      role: "IT Officer",
      duration: "2020 - 2023",
      details:
        "Managed user support, networking, systems administration, and business-critical IT services.",
    },
    {
      company: "KMSS National Office",
      role: "IT Volunteer",
      duration: "2018 - 2020",
      details:
        "Supported daily operations, device setup, connectivity troubleshooting, and on-site technical assistance.",
    },
  ],
  certifications: [
    {
      name: "Microsoft 365 Administration",
      issuer: "Microsoft Learn",
      date: "2024",
    },
    {
      name: "Network Administration Fundamentals",
      issuer: "Cisco Networking Academy",
      date: "2023",
    },
  ],
  skills: [
    "IT Support",
    "Systems Administration",
    "Networking & Infrastructure",
    "Windows Server",
    "Microsoft 365",
    "Troubleshooting",
    "Website Administration",
    "Conferencing Systems",
  ],
  tools: [
    "Microsoft 365 Admin Center",
    "Windows Server Tools",
    "Remote Support Tooling",
    "Network Monitoring Utilities",
    "CCTV Management Systems",
  ],
  projects: [
    {
      name: "National Office Infrastructure Stabilization",
      description:
        "Improved system reliability and support responsiveness across office operations by standardizing network and device practices.",
      link: "",
    },
    {
      name: "Hybrid Collaboration Setup",
      description:
        "Delivered meeting-room conferencing and support flows for distributed coordination across teams.",
      link: "",
    },
  ],
  achievements: [
    "Reduced recurring IT downtime through proactive support routines",
    "Strengthened operational readiness for remote and on-site collaboration",
    "Helped modernize office workflows with practical, low-risk improvements",
  ],
  contact: {
    email: "charles@example.com",
    phone: "+95 9 xxx xxx xxx",
    linkedin: "https://linkedin.com",
    github: "",
    website: "https://cv-charles-mn.vercel.app",
    facebook: "",
    x: "",
    instagram: "",
    threads: "",
    telegram: "",
  },
  cv: {
    documentLabel: "Curriculum Vitae",
    backToPortfolioLabel: "Back to Portfolio",
    downloadLabel: "Download PDF",
    portfolioUrl: "https://cv-charles-mn.vercel.app",
    printableStatusLabel: "Printable CV",
    previewStatusLabel: "Previewing Draft CV",
    printHint: "Use browser Print to save as PDF",
    summaryHeading: "Professional Summary",
    experienceHeading: "Experience",
    skillsHeading: "Skills",
    toolsHeading: "Tools",
    certificationsHeading: "Certifications",
    achievementsHeading: "Achievements",
    projectsHeading: "Projects / Key Work",
    contactHeading: "Contact",
    qrCaption: "Scan the QR code to open the live portfolio",
  },
  seo: {
    title: "Charles | ICT / IT Manager Portfolio",
    description:
      "Portfolio of Charles, ICT / IT Manager focused on support excellence, infrastructure reliability, and mission-driven technology operations.",
  },
};

export const normalizePortfolioContent = (
  input: unknown,
  fallback: PortfolioContent = seededPortfolioContent
): PortfolioContent => {
  const data = asRecord(input);
  const profile = asRecord(data.profile);
  const hero = asRecord(data.hero);
  const about = asRecord(data.about);
  const contact = asRecord(data.contact);
  const cv = asRecord(data.cv);
  const seo = asRecord(data.seo);

  return {
    profile: {
      name: asString(profile.name, fallback.profile.name),
      title: asString(profile.title, fallback.profile.title),
      bio: asString(profile.bio, fallback.profile.bio),
      location: asString(profile.location, fallback.profile.location),
      photo: asString(profile.photo, fallback.profile.photo),
    },
    hero: {
      headline: asString(hero.headline, fallback.hero.headline),
      subtext: asString(hero.subtext, fallback.hero.subtext),
      downloadLabel: asString(hero.downloadLabel, fallback.hero.downloadLabel),
      summary: asString(hero.summary, fallback.hero.summary),
      nameFontSize: asString(hero.nameFontSize, fallback.hero.nameFontSize),
      headlineFontSize: asString(hero.headlineFontSize, fallback.hero.headlineFontSize),
      highlights: normalizeHeroHighlights(hero.highlights, fallback.hero.highlights),
    },
    about: {
      eyebrow: asString(about.eyebrow, fallback.about.eyebrow),
      heading: asString(about.heading, fallback.about.heading),
      description: asString(about.description, fallback.about.description),
    },
    focus: normalizeSectionContent(data.focus, fallback.focus),
    experienceSection: normalizeSectionContent(
      data.experienceSection,
      fallback.experienceSection
    ),
    skillsSection: normalizeSectionContent(data.skillsSection, fallback.skillsSection),
    toolsSection: normalizeSectionContent(data.toolsSection, fallback.toolsSection),
    certificationsSection: normalizeSectionContent(
      data.certificationsSection,
      fallback.certificationsSection
    ),
    achievementsSection: normalizeSectionContent(
      data.achievementsSection,
      fallback.achievementsSection
    ),
    projectsSection: normalizeProjectSectionContent(
      data.projectsSection,
      fallback.projectsSection
    ),
    contactSection: normalizeSectionContent(data.contactSection, fallback.contactSection),
    experience: normalizeExperience(data.experience, fallback.experience),
    certifications: normalizeCertifications(data.certifications, fallback.certifications),
    skills: asStringArray(data.skills, fallback.skills),
    tools: asStringArray(data.tools, fallback.tools),
    projects: normalizeProjects(data.projects, fallback.projects),
    achievements: asStringArray(data.achievements, fallback.achievements),
    contact: {
      email: asString(contact.email, fallback.contact.email),
      phone: asString(contact.phone, fallback.contact.phone),
      linkedin: asString(contact.linkedin, fallback.contact.linkedin),
      github: asString(contact.github, fallback.contact.github),
      website: asString(contact.website, fallback.contact.website),
      facebook: asString(contact.facebook, fallback.contact.facebook),
      x: asString(contact.x, fallback.contact.x),
      instagram: asString(contact.instagram, fallback.contact.instagram),
      threads: asString(contact.threads, fallback.contact.threads),
      telegram: asString(contact.telegram, fallback.contact.telegram),
    },
    cv: normalizeCvContentCopy(cv, fallback.cv),
    seo: {
      title: asString(seo.title, fallback.seo.title),
      description: asString(seo.description, fallback.seo.description),
    },
  };
};

export const createSeededPortfolioRecord = (): PortfolioRecord => {
  const timestamp = new Date().toISOString();

  return {
    draft: structuredClone(seededPortfolioContent),
    published: structuredClone(seededPortfolioContent),
    updatedAt: timestamp,
    publishedAt: timestamp,
  };
};
