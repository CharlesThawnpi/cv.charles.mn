import Link from "next/link";
import type { PortfolioContent } from "@/config/contentModel";

interface PrintableCvProps {
  content: PortfolioContent;
  mode: "published" | "preview";
}

export function PrintableCv({ content, mode }: PrintableCvProps) {
  return (
    <main className="cv-page">
      <header className="cv-header no-print">
        <Link href="/">Back to Portfolio</Link>
        <div>
          <span>{mode === "preview" ? "Draft Preview" : "Published"}</span>
          <span>Use browser Print to save as PDF</span>
        </div>
      </header>

      <article className="cv-sheet">
        <section className="cv-identity">
          <h1>{content.profile.name}</h1>
          <h2>{content.profile.title}</h2>
          <p>{content.profile.location}</p>
          <p>{content.profile.bio}</p>
        </section>

        <section className="cv-section">
          <h3>Experience</h3>
          {content.experience.map((item, index) => (
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
          <h3>Skills & Tools</h3>
          <p>{content.skills.join(" · ")}</p>
          <p className="cv-muted">{content.tools.join(" · ")}</p>
        </section>

        <section className="cv-section">
          <h3>Certifications</h3>
          <ul>
            {content.certifications.map((item, index) => (
              <li key={`${item.name}-${index}`}>
                {item.name} - {item.issuer} ({item.date})
              </li>
            ))}
          </ul>
        </section>

        <section className="cv-section">
          <h3>Projects / Key Work</h3>
          <ul>
            {content.projects.map((project, index) => (
              <li key={`${project.name}-${index}`}>
                <strong>{project.name}:</strong> {project.description}
              </li>
            ))}
          </ul>
        </section>

        <section className="cv-section">
          <h3>Achievements</h3>
          <ul>
            {content.achievements.map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>
        </section>

        <section className="cv-section">
          <h3>Contact</h3>
          <p>{content.contact.email}</p>
          {content.contact.phone && <p>{content.contact.phone}</p>}
          {content.contact.linkedin && <p>{content.contact.linkedin}</p>}
          {content.contact.website && <p>{content.contact.website}</p>}
        </section>
      </article>
    </main>
  );
}

