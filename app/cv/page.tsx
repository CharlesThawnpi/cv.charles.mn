import { draftMode } from "next/headers";
import { getPublicPortfolioData } from "@/utils/portfolioRepository";

export const dynamic = "force-dynamic";

export default async function CvPage() {
  const { isEnabled } = await draftMode();
  const data = await getPublicPortfolioData(isEnabled);
  const { content, mode, source } = data;

  return (
    <main className="cv-page">
      <div className="cv-shell">
        <header className="cv-header no-print">
          <a href="/">Back to Portfolio</a>
          <div className="cv-actions">
            <span>{mode === "preview" ? "Previewing Draft CV" : "Printable CV"}</span>
            <span>Source: {source}</span>
            <span>Use browser Print to save as PDF</span>
          </div>
        </header>

        <article className="cv-sheet">
          <section className="cv-hero">
            <div className="cv-kicker">Curriculum Vitae</div>
            <div className="cv-hero-grid">
              <div className="cv-identity">
                <h1>{content.profile.name}</h1>
                <h2>{content.profile.title}</h2>
                <p className="cv-lead">{content.profile.bio}</p>
              </div>

              <aside className="cv-panel cv-contact-panel">
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
                {content.contact.linkedin && (
                  <p>
                    <span>LinkedIn</span>
                    <strong>{content.contact.linkedin}</strong>
                  </p>
                )}
                {content.contact.github && (
                  <p>
                    <span>GitHub</span>
                    <strong>{content.contact.github}</strong>
                  </p>
                )}
                {content.contact.website && (
                  <p>
                    <span>Website</span>
                    <strong>{content.contact.website}</strong>
                  </p>
                )}
              </aside>
            </div>

            <div className="cv-band">
              {content.skills.slice(0, 3).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </section>

          <section className="cv-section">
            <h3>Professional Summary</h3>
            <div className="cv-panel">
              <p className="cv-summary">{content.about.description}</p>
            </div>
          </section>

          <section className="cv-section">
            <h3>Experience</h3>
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
              <h3>Skills</h3>
              <ul className="cv-chip-list">
                {content.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>

            <section className="cv-section cv-panel">
              <h3>Tools</h3>
              <ul className="cv-chip-list cv-chip-list-muted">
                {content.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="cv-grid">
            <section className="cv-section cv-panel">
              <h3>Certifications</h3>
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
              <h3>Achievements</h3>
              <ul className="cv-list">
                {content.achievements.map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="cv-section">
            <h3>Projects / Key Work</h3>
            <div className="cv-grid">
              {content.projects.map((project, index) => (
                <article key={`${project.name}-${index}`} className="cv-panel cv-project-card">
                  <strong>{project.name}</strong>
                  <p>{project.description}</p>
                  {project.link ? (
                    <p className="cv-project-link">{project.link}</p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="cv-section cv-panel">
            <h3>Contact</h3>
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
              {content.contact.github && (
                <p>
                  <span>GitHub</span>
                  <strong>{content.contact.github}</strong>
                </p>
              )}
              {content.contact.website && (
                <p>
                  <span>Website</span>
                  <strong>{content.contact.website}</strong>
                </p>
              )}
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
