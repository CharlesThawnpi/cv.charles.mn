export const runtime = "edge";

const cvContent = {
  profile: {
    name: "Charles",
    title: "ICT / IT Manager",
    bio: "ICT / IT Manager at KMSS National Office, Myanmar. I build dependable systems, support teams, and keep mission-critical operations running.",
    location: "Yangon, Myanmar",
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
    },
    {
      name: "Hybrid Collaboration Setup",
      description:
        "Delivered meeting-room conferencing and support flows for distributed coordination across teams.",
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
    website: "",
  },
} as const;

export default function CvPage() {
  return (
    <main className="cv-page">
      <header className="cv-header no-print">
        <a href="/">Back to Portfolio</a>
        <div>
          <span>Printable CV</span>
          <span>Use browser Print to save as PDF</span>
        </div>
      </header>

      <article className="cv-sheet">
        <section className="cv-identity">
          <h1>{cvContent.profile.name}</h1>
          <h2>{cvContent.profile.title}</h2>
          <p>{cvContent.profile.location}</p>
          <p>{cvContent.profile.bio}</p>
        </section>

        <section className="cv-section">
          <h3>Experience</h3>
          {cvContent.experience.map((item, index) => (
            <div key={`${item.company}-${index}`} className="cv-item">
              <p className="cv-item-heading">
                <strong>{item.role}</strong>
                <span>{item.duration}</span>
              </p>
              <p className="cv-item-subheading">{item.company}</p>
              <p>{item.details}</p>
            </div>
          ))}
        </section>

        <section className="cv-section">
          <h3>Skills &amp; Tools</h3>
          <p>{cvContent.skills.join(" | ")}</p>
          <p className="cv-muted">{cvContent.tools.join(" | ")}</p>
        </section>

        <section className="cv-section">
          <h3>Certifications</h3>
          <ul>
            {cvContent.certifications.map((item, index) => (
              <li key={`${item.name}-${index}`}>
                {item.name} - {item.issuer} ({item.date})
              </li>
            ))}
          </ul>
        </section>

        <section className="cv-section">
          <h3>Projects / Key Work</h3>
          <ul>
            {cvContent.projects.map((project, index) => (
              <li key={`${project.name}-${index}`}>
                <strong>{project.name}:</strong> {project.description}
              </li>
            ))}
          </ul>
        </section>

        <section className="cv-section">
          <h3>Achievements</h3>
          <ul>
            {cvContent.achievements.map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>
        </section>

        <section className="cv-section">
          <h3>Contact</h3>
          <p>{cvContent.contact.email}</p>
          <p>{cvContent.contact.phone}</p>
          <p>{cvContent.contact.linkedin}</p>
          {cvContent.contact.website && <p>{cvContent.contact.website}</p>}
        </section>
      </article>
    </main>
  );
}
