import { draftMode } from "next/headers";
import { SocialLinks } from "@/components/portfolio/SocialLinks";
import { getPublicPortfolioData } from "@/utils/portfolioRepository";

export const dynamic = "force-dynamic";

export default async function CvPage() {
  const { isEnabled } = await draftMode();
  const data = await getPublicPortfolioData(isEnabled);
  const { content, mode } = data;
  const heroPhoto = content.profile.photo?.trim();

  return (
    <main className="cv-page">
      <div className="cv-shell">
        <header className="cv-header no-print">
          <a href="/">{content.cv.backToPortfolioLabel}</a>
          <div className="cv-actions">
            <a href="/api/cv/download">{content.cv.downloadLabel}</a>
            <span>{mode === "preview" ? content.cv.previewStatusLabel : content.cv.printableStatusLabel}</span>
            <span>{content.cv.printHint}</span>
          </div>
        </header>

        <article className="cv-sheet">
          <section className="cv-hero">
            <div className="cv-kicker">{content.cv.documentLabel}</div>
            <div className="cv-hero-grid">
              <div className="cv-identity">
                <h1>{content.profile.name}</h1>
                <h2>{content.profile.title}</h2>
                <p className="cv-lead">{content.profile.bio}</p>
              </div>

              <aside className="cv-panel cv-contact-panel">
                {heroPhoto ? (
                  <img className="cv-photo" src={heroPhoto} alt={`${content.profile.name} profile`} />
                ) : (
                  <div className="cv-photo-placeholder" aria-label="Profile picture placeholder">
                    <span>{content.profile.name.slice(0, 1)}</span>
                  </div>
                )}
                <p>
                  <span>Location</span>
                  <strong>{content.profile.location}</strong>
                </p>
                <p>
                  <span>Email</span>
                  <strong>{content.contact.email}</strong>
                </p>
                {content.contact.phone && (
                  <p>
                    <span>Phone</span>
                    <strong>{content.contact.phone}</strong>
                  </p>
                )}
                <SocialLinks contact={content.contact} className="social-links social-links-compact" />
              </aside>
            </div>

            <div className="cv-band">
              {content.hero.highlights.map((item, index) => (
                <span key={`${item.label}-${index}`}>{item.value}</span>
              ))}
            </div>
          </section>

          <section className="cv-section">
            <h3>{content.cv.summaryHeading}</h3>
            <div className="cv-panel">
              <p className="cv-summary">{content.about.description}</p>
            </div>
          </section>

          <section className="cv-section">
            <h3>{content.cv.experienceHeading}</h3>
            <div className="cv-stack">
              {content.experience.map((item, index) => (
                <div key={`${item.company}-${index}`} className="cv-item cv-panel">
                  <p className="cv-item-heading">
                    <strong>{item.role}</strong>
                    <span>{item.duration}</span>
                  </p>
                  <p className="cv-item-subheading">{item.company}</p>
                  <p>{item.details}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="cv-grid">
            <section className="cv-section cv-panel">
              <h3>{content.cv.skillsHeading}</h3>
              <ul className="cv-chip-list">
                {content.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>

            <section className="cv-section cv-panel">
              <h3>{content.cv.toolsHeading}</h3>
              <ul className="cv-chip-list cv-chip-list-muted">
                {content.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="cv-grid">
            <section className="cv-section cv-panel">
              <h3>{content.cv.certificationsHeading}</h3>
              <ul className="cv-list">
                {content.certifications.map((item, index) => (
                  <li key={`${item.name}-${index}`}>
                    <strong>{item.name}</strong>
                    <span>
                      {item.issuer} - {item.date}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="cv-section cv-panel">
              <h3>{content.cv.achievementsHeading}</h3>
              <ul className="cv-list">
                {content.achievements.map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="cv-section">
            <h3>{content.cv.projectsHeading}</h3>
            <div className="cv-grid">
              {content.projects.map((project, index) => (
                <article key={`${project.name}-${index}`} className="cv-panel cv-project-card">
                  <strong>{project.name}</strong>
                  <p>{project.description}</p>
                  {project.link ? <p className="cv-project-link">{project.link}</p> : null}
                </article>
              ))}
            </div>
          </section>

          <section className="cv-section cv-panel">
            <h3>{content.cv.contactHeading}</h3>
            <div className="cv-contact-grid">
              <p>
                <span>Email</span>
                <strong>{content.contact.email}</strong>
              </p>
              {content.contact.phone && (
                <p>
                  <span>Phone</span>
                  <strong>{content.contact.phone}</strong>
                </p>
              )}
              {content.contact.linkedin && (
                <p>
                  <span>LinkedIn</span>
                  <strong>{content.contact.linkedin}</strong>
                </p>
              )}
              {content.contact.website && (
                <p>
                  <span>Website</span>
                  <strong>{content.contact.website}</strong>
                </p>
              )}
            </div>
            <SocialLinks contact={content.contact} className="social-links social-links-panel cv-social-links" />
          </section>
        </article>
      </div>
    </main>
  );
}
