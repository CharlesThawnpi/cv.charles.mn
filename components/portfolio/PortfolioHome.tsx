import Link from "next/link";
import type { PortfolioContent } from "@/config/contentModel";

interface PortfolioHomeProps {
  content: PortfolioContent;
  source: "postgres" | "local";
  mode: "published" | "preview";
}

export function PortfolioHome({ content, source, mode }: PortfolioHomeProps) {
  return (
    <main className="portfolio-shell">
      <div className="grain-layer" aria-hidden="true" />
      <div className="aurora-layer" aria-hidden="true" />

      <header className="hero-wrap">
        <div className="hero-copy">
          <div className="hero-topbar">
            <span className="status-pill">{mode === "preview" ? "Previewing Draft" : "Published"}</span>
            <span className="status-pill">Data source: {source}</span>
          </div>

          <p className="hero-kicker">{content.profile.name}</p>
          <h1>{content.hero.headline}</h1>
          <p className="hero-description">{content.hero.subtext}</p>

          <div className="hero-actions">
            <Link className="hero-primary-link" href="/cv">
              Open Printable CV
            </Link>
            <a className="hero-secondary-link" href={`mailto:${content.contact.email}`}>
              Contact Charles
            </a>
          </div>

          <div className="hero-meta">
            <strong>{content.profile.title}</strong>
            <span>{content.profile.location}</span>
            <span>{content.skills[0] ?? "ICT Leadership"}</span>
          </div>
        </div>

        <div className="hero-support">
          <p className="hero-support-intro">
            Quietly reliable ICT leadership grounded in infrastructure continuity, practical support, and
            mission-aligned execution.
          </p>

          <dl className="hero-support-list">
            <div>
              <dt>Experience</dt>
              <dd>{content.experience.length} roles across KMSS National Office</dd>
            </div>
            <div>
              <dt>Core strengths</dt>
              <dd>Infrastructure, support systems, Microsoft 365, and resilient daily operations</dd>
            </div>
            <div>
              <dt>Selected work</dt>
              <dd>{content.projects.length} portfolio-backed initiatives and operational improvements</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="section-shell section-grid two-col">
        <article className="glass-panel feature-panel">
          <div className="section-heading">
            <span>About</span>
            <h2>Practical technology leadership with a service-first mindset</h2>
          </div>
          <p className="section-copy">{content.about.description}</p>
        </article>

        <article className="glass-panel feature-panel compact-panel">
          <div className="section-heading">
            <span>Current Focus</span>
            <h2>Keeping teams productive and infrastructure dependable</h2>
          </div>
          <ul className="impact-list">
            {content.achievements.slice(0, 3).map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading-inline">
          <div>
            <span>Experience</span>
            <h2>Career timeline built around continuity, support, and infrastructure trust</h2>
          </div>
        </div>
        <ol className="timeline-list premium-timeline">
          {content.experience.map((experience, index) => (
            <li key={`${experience.company}-${index}`}>
              <div className="timeline-topline">
                <div>
                  <strong>{experience.role}</strong>
                  <span>{experience.company}</span>
                </div>
                <em>{experience.duration}</em>
              </div>
              <p>{experience.details}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section-shell section-grid two-col">
        <article className="glass-panel surface-card skill-card">
          <div className="section-heading">
            <span>Capabilities</span>
            <h2>Skills</h2>
          </div>
          <ul className="chip-list">
            {content.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </article>

        <article className="glass-panel surface-card skill-card">
          <div className="section-heading">
            <span>Tooling</span>
            <h2>Platforms & Systems</h2>
          </div>
          <ul className="chip-list chip-list-soft">
            {content.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section-shell section-grid two-col">
        <article className="glass-panel surface-card">
          <div className="section-heading">
            <span>Learning & Credentials</span>
            <h2>Certifications</h2>
          </div>
          <ul className="detail-list certification-list">
            {content.certifications.map((certification, index) => (
              <li key={`${certification.name}-${index}`}>
                <strong>{certification.name}</strong>
                <span>{certification.issuer}</span>
                <span>{certification.date}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-panel surface-card">
          <div className="section-heading">
            <span>Impact</span>
            <h2>Achievements</h2>
          </div>
          <ul className="impact-list">
            {content.achievements.map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading-inline">
          <div>
            <span>Selected Work</span>
            <h2>Projects and operational improvements with visible day-to-day impact</h2>
          </div>
        </div>
        <div className="projects-grid premium-projects">
          {content.projects.map((project, index) => (
            <article key={`${project.name}-${index}`} className="project-card glass-panel">
              <div className="project-card-top">
                <span className="card-label">Key Work</span>
                <h3>{project.name}</h3>
              </div>
              <p>{project.description}</p>
              {project.link ? (
                <a href={project.link} target="_blank" rel="noreferrer">
                  View reference
                </a>
              ) : (
                <span className="project-muted">Internal delivery / operational project</span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <article className="glass-panel contact-spotlight">
          <div className="section-heading">
            <span>Contact</span>
            <h2>Open to practical conversations around infrastructure, systems, and support leadership</h2>
          </div>
          <div className="contact-grid">
            <p>
              <span>Email</span>
              <a href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
            </p>
            {content.contact.phone && (
              <p>
                <span>Phone</span>
                <span>{content.contact.phone}</span>
              </p>
            )}
            {content.contact.linkedin && (
              <p>
                <span>LinkedIn</span>
                <a href={content.contact.linkedin} target="_blank" rel="noreferrer">
                  {content.contact.linkedin}
                </a>
              </p>
            )}
            {content.contact.github && (
              <p>
                <span>GitHub</span>
                <a href={content.contact.github} target="_blank" rel="noreferrer">
                  {content.contact.github}
                </a>
              </p>
            )}
            {content.contact.website && (
              <p>
                <span>Website</span>
                <a href={content.contact.website} target="_blank" rel="noreferrer">
                  {content.contact.website}
                </a>
              </p>
            )}
          </div>
        </article>
      </section>

      <footer className="portfolio-footer glass-panel">
        <p>{content.profile.name}</p>
        <p>{content.seo.description}</p>
      </footer>
    </main>
  );
}
