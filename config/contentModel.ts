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

export interface PortfolioContent {
  profile: {
    name: string;
    title: string;
    bio: string;
    location: string;
  };
  hero: {
    headline: string;
    subtext: string;
  };
  about: {
    description: string;
  };
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
  };
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

  const normalized = value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : fallback;
};

const normalizeExperience = (value: unknown, fallback: ExperienceItem[]): ExperienceItem[] => {
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

const normalizeProjects = (value: unknown, fallback: ProjectItem[]): ProjectItem[] => {
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

export const seededPortfolioContent: PortfolioContent = {
  profile: {
    name: "Charles",
    title: "ICT / IT Manager",
    bio: "ICT / IT Manager at KMSS National Office, Myanmar. I build dependable systems, support teams, and keep mission-critical operations running.",
    location: "Yangon, Myanmar",
  },
  hero: {
    headline: "Reliable IT leadership for real-world operations",
    subtext:
      "From infrastructure and Microsoft 365 to conferencing, CCTV, and support workflows, I help organizations stay stable, secure, and future-ready.",
  },
  about: {
    description:
      "I have progressed from IT Volunteer to IT Officer to ICT / IT Manager by focusing on service quality, practical troubleshooting, and long-term resilience. My work combines hands-on technical execution with team enablement and process improvement.",
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
    website: "",
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
  const seo = asRecord(data.seo);

  return {
    profile: {
      name: asString(profile.name, fallback.profile.name),
      title: asString(profile.title, fallback.profile.title),
      bio: asString(profile.bio, fallback.profile.bio),
      location: asString(profile.location, fallback.profile.location),
    },
    hero: {
      headline: asString(hero.headline, fallback.hero.headline),
      subtext: asString(hero.subtext, fallback.hero.subtext),
    },
    about: {
      description: asString(about.description, fallback.about.description),
    },
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
    },
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

