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
      <header className="hero-wrap">
        <div className="hero-topbar">
          <span className="status-pill">{mode === "preview" ? "Previewing Draft" : "Published"}</span>
          <span className="status-pill">Data source: {source}</span>
          <Link className="status-link" href="/cv">
            Printable CV
          </Link>
        </div>
        <h1>{content.hero.headline}</h1>
        <p>{content.hero.subtext}</p>
        <div className="hero-meta">
          <strong>{content.profile.name}</strong>
          <span>{content.profile.title}</span>
          <span>{content.profile.location}</span>
        </div>
      </header>

      <section className="surface-card">
        <h2>About</h2>
        <p>{content.about.description}</p>
      </section>

      <section className="surface-card">
        <h2>Career Timeline</h2>
        <ol className="timeline-list">
          {content.experience.map((experience, index) => (
            <li key={`${experience.company}-${index}`}>
              <div>
                <strong>{experience.role}</strong>
                <span>{experience.company}</span>
              </div>
              <span>{experience.duration}</span>
              <p>{experience.details}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="surface-grid two-col">
        <article className="surface-card">
          <h2>Skills</h2>
          <ul className="chip-list">
            {content.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </article>

        <article className="surface-card">
          <h2>Tools</h2>
          <ul className="chip-list">
            {content.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="surface-card">
        <h2>Certifications</h2>
        <ul className="detail-list">
          {content.certifications.map((certification, index) => (
            <li key={`${certification.name}-${index}`}>
              <strong>{certification.name}</strong>
              <span>{certification.issuer}</span>
              <span>{certification.date}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-card">
        <h2>Projects / Key Work</h2>
        <div className="projects-grid">
          {content.projects.map((project, index) => (
            <article key={`${project.name}-${index}`} className="project-card">
              <h3>{project.name}</h3>
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

      <section className="surface-card">
        <h2>Achievements / Impact</h2>
        <ul className="impact-list">
          {content.achievements.map((achievement) => (
            <li key={achievement}>{achievement}</li>
          ))}
        </ul>
      </section>

      <section className="surface-card contact-card">
        <h2>Contact</h2>
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
      </section>

      <footer className="portfolio-footer">
        <p>{content.profile.name}</p>
        <p>{content.seo.description}</p>
      </footer>
    </main>
  );
}

