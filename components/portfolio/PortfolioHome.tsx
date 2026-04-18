import type { CSSProperties, SVGProps } from "react";
import type { PortfolioContent } from "@/config/contentModel";
import { SocialLinks } from "@/components/portfolio/SocialLinks";
import { formatDisplayUrl } from "@/utils/publicContent";

interface PortfolioHomeProps {
  content: PortfolioContent;
  source: "postgres" | "local";
  mode: "published" | "preview";
}

function BriefcaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M9 7V6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v1" />
      <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
      <path d="M4 12h16" />
    </svg>
  );
}

function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 19h14" />
    </svg>
  );
}

export function PortfolioHome({ content }: PortfolioHomeProps) {
  const heroStyle = {
    "--hero-name-size": content.hero.nameFontSize,
    "--hero-headline-size": content.hero.headlineFontSize,
  } as CSSProperties;

  const heroPhoto = content.profile.photo?.trim();

  return (
    <main className="portfolio-shell">
      <div className="grain-layer" aria-hidden="true" />
      <div className="aurora-layer" aria-hidden="true" />

      <header className="hero-wrap" style={heroStyle}>
        <div className="hero-stage">
          <div className="hero-copy">
            <p className="hero-kicker">{content.profile.title}</p>
            <h1 className="hero-name">{content.profile.name}</h1>

            <div className="hero-meta">
              <strong>
                <BriefcaseIcon className="meta-icon" />
                {content.profile.title}
              </strong>
              <span>
                <PinIcon className="meta-icon" />
                {content.profile.location}
              </span>
            </div>

            <h2 className="hero-headline">{content.hero.headline}</h2>
            <p className="hero-description">{content.hero.subtext}</p>
          </div>

          <aside className="hero-rail">
            <a className="hero-download-link" href="/api/cv/download">
              <DownloadIcon className="button-icon" />
              {content.hero.downloadLabel}
            </a>

            <div className="hero-photo-shell">
              {heroPhoto ? (
                <img className="hero-photo" src={heroPhoto} alt={`${content.profile.name} profile`} />
              ) : (
                <div className="hero-photo-placeholder" aria-label="Profile picture placeholder">
                  <span>{content.profile.name.slice(0, 1)}</span>
                </div>
              )}
            </div>
          </aside>
        </div>

        <div className="hero-support">
          <p className="hero-support-intro">{content.hero.summary}</p>
          <dl className="hero-support-list">
            {content.hero.highlights.map((item, index) => (
              <div key={`${item.label}-${index}`}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section className="section-shell section-grid two-col">
        <article className="glass-panel feature-panel">
          <div className="section-heading">
            <span>{content.about.eyebrow}</span>
            <h2>{content.about.heading}</h2>
          </div>
          <p className="section-copy">{content.about.description}</p>
        </article>

        <article className="glass-panel feature-panel compact-panel">
          <div className="section-heading">
            <span>{content.focus.eyebrow}</span>
            <h2>{content.focus.heading}</h2>
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
            <span>{content.experienceSection.eyebrow}</span>
            <h2>{content.experienceSection.heading}</h2>
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
            <span>{content.skillsSection.eyebrow}</span>
            <h2>{content.skillsSection.heading}</h2>
          </div>
          <ul className="chip-list">
            {content.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </article>

        <article className="glass-panel surface-card skill-card">
          <div className="section-heading">
            <span>{content.toolsSection.eyebrow}</span>
            <h2>{content.toolsSection.heading}</h2>
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
            <span>{content.certificationsSection.eyebrow}</span>
            <h2>{content.certificationsSection.heading}</h2>
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
            <span>{content.achievementsSection.eyebrow}</span>
            <h2>{content.achievementsSection.heading}</h2>
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
            <span>{content.projectsSection.eyebrow}</span>
            <h2>{content.projectsSection.heading}</h2>
          </div>
        </div>
        <div className="projects-grid premium-projects">
          {content.projects.map((project, index) => (
            <article key={`${project.name}-${index}`} className="project-card glass-panel">
              <div className="project-card-top">
                <span className="card-label">{content.projectsSection.cardLabel}</span>
                <h3>{project.name}</h3>
              </div>
              <p>{project.description}</p>
              {project.link ? (
                <a href={project.link} target="_blank" rel="noreferrer">
                  View reference
                </a>
              ) : (
                <span className="project-muted">{content.projectsSection.emptyLinkLabel}</span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <article className="glass-panel contact-spotlight">
          <div className="section-heading">
            <span>{content.contactSection.eyebrow}</span>
            <h2>{content.contactSection.heading}</h2>
          </div>
          <div className="contact-grid">
            {content.contact.email && (
              <p>
                <span>Email</span>
                <a href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
              </p>
            )}
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
                  {formatDisplayUrl(content.contact.linkedin)}
                </a>
              </p>
            )}
            {content.contact.website && (
              <p>
                <span>Portfolio</span>
                <a href={content.contact.website} target="_blank" rel="noreferrer">
                  {formatDisplayUrl(content.contact.website)}
                </a>
              </p>
            )}
          </div>
          <SocialLinks contact={content.contact} className="social-links social-links-panel" />
        </article>
      </section>

      <footer className="portfolio-footer glass-panel">
        <p>{content.profile.name}</p>
        <p>{content.seo.description}</p>
      </footer>
    </main>
  );
}
