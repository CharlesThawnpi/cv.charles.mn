"use client";

import { type ChangeEvent, useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  seededPortfolioContent,
  type CertificationItem,
  type ExperienceItem,
  type PortfolioContent,
  type PortfolioRecord,
  type ProjectItem,
} from "@/config/contentModel";

interface AdminContentResponse {
  record: PortfolioRecord;
  source: "postgres" | "local";
  postgresConfigured: boolean;
}

const splitLines = (value: string): string[] => {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const readFileAsDataUrl = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });

export default function AdminDashboardClient() {
  const router = useRouter();
  const [draft, setDraft] = useState<PortfolioContent>(seededPortfolioContent);
  const [source, setSource] = useState<"postgres" | "local">("local");
  const [postgresConfigured, setPostgresConfigured] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const persistenceUnavailable = !postgresConfigured;
  const persistenceWarning =
    "Persistent storage is not configured. Connect Vercel Postgres or set DATABASE_URL before editing, or your changes will disappear after a refresh, cold start, or deploy.";

  const loadDraft = useEffectEvent(async () => {
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/content", { cache: "no-store" });

    if (response.status === 401) {
      router.replace("/admin/login");
      return;
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error ?? "Unable to load admin content.");
      setLoading(false);
      return;
    }

    const payload = (await response.json()) as AdminContentResponse;
    setDraft(payload.record.draft);
    setSource(payload.source);
    setPostgresConfigured(payload.postgresConfigured);
    setPublishedAt(payload.record.publishedAt);
    setUpdatedAt(payload.record.updatedAt);
    setLoading(false);
  });

  useEffect(() => {
    void loadDraft();
  }, []);

  const saveDraft = async () => {
    if (persistenceUnavailable) {
      setMessage("");
      setError(persistenceWarning);
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      source?: "postgres" | "local";
      updatedAt?: string;
    };

    setSaving(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to save draft.");
      return;
    }

    if (payload.source) {
      setSource(payload.source);
    }

    if (payload.updatedAt) {
      setUpdatedAt(payload.updatedAt);
    }

    setMessage("Draft saved.");
  };

  const publishDraft = async () => {
    if (persistenceUnavailable) {
      setMessage("");
      setError(persistenceWarning);
      return;
    }

    setPublishing(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/admin/publish", { method: "POST" });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      source?: "postgres" | "local";
      publishedAt?: string;
    };

    setPublishing(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to publish draft.");
      return;
    }

    if (payload.source) {
      setSource(payload.source);
    }

    if (payload.publishedAt) {
      setPublishedAt(payload.publishedAt);
    }

    setMessage("Draft published to live portfolio.");
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  const updateExperience = (index: number, patch: Partial<ExperienceItem>) => {
    setDraft((prev) => {
      const next = [...prev.experience];
      next[index] = { ...next[index], ...patch };
      return { ...prev, experience: next };
    });
  };

  const updateCertification = (index: number, patch: Partial<CertificationItem>) => {
    setDraft((prev) => {
      const next = [...prev.certifications];
      next[index] = { ...next[index], ...patch };
      return { ...prev, certifications: next };
    });
  };

  const updateProject = (index: number, patch: Partial<ProjectItem>) => {
    setDraft((prev) => {
      const next = [...prev.projects];
      next[index] = { ...next[index], ...patch };
      return { ...prev, projects: next };
    });
  };

  const updateHeroHighlight = (
    index: number,
    patch: Partial<PortfolioContent["hero"]["highlights"][number]>
  ) => {
    setDraft((prev) => {
      const next = [...prev.hero.highlights];
      next[index] = { ...next[index], ...patch };
      return { ...prev, hero: { ...prev.hero, highlights: next } };
    });
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setDraft((prev) => ({
        ...prev,
        profile: { ...prev.profile, photo: dataUrl },
      }));
      setMessage("Profile photo loaded into the draft. Save draft to persist it.");
      setError("");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to load image.");
    } finally {
      event.target.value = "";
    }
  };

  if (loading) {
    return (
      <main className="admin-shell">
        <section className="admin-card">
          <p>Loading dashboard...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <section className="admin-card admin-header-card">
        <div>
          <h1>Portfolio Admin</h1>
          <p>Manage draft content, preview updates, and publish when ready.</p>
          <p className="admin-meta">
            Source: {source} | Postgres configured: {postgresConfigured ? "yes" : "no"}
          </p>
          <p className="admin-meta">
            Last updated: {updatedAt ?? "n/a"} | Last published: {publishedAt ?? "not yet"}
          </p>
        </div>
        <div className="admin-actions">
          <button type="button" onClick={saveDraft} disabled={saving || persistenceUnavailable}>
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button type="button" onClick={publishDraft} disabled={publishing || persistenceUnavailable}>
            {publishing ? "Publishing..." : "Publish"}
          </button>
          <a href="/api/preview/enable?redirect=/" target="_blank" rel="noreferrer">
            Open Preview
          </a>
          <a href="/api/preview/disable?redirect=/admin/dashboard">Exit Preview</a>
          <button type="button" onClick={logout} className="danger">
            Logout
          </button>
        </div>
        {persistenceUnavailable && <p className="admin-error">{persistenceWarning}</p>}
        {message && <p className="admin-success">{message}</p>}
        {error && <p className="admin-error">{error}</p>}
      </section>

      <section className="admin-card">
        <h2>Profile & Hero</h2>
        <div className="admin-grid two-col">
          <label>
            Name
            <input
              value={draft.profile.name}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, name: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Title
            <input
              value={draft.profile.title}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, title: event.target.value },
                }))
              }
            />
          </label>
          <label className="full">
            Location
            <input
              value={draft.profile.location}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, location: event.target.value },
                }))
              }
            />
          </label>
          <label className="full">
            Short Bio
            <textarea
              rows={3}
              value={draft.profile.bio}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, bio: event.target.value },
                }))
              }
            />
          </label>
          <label className="full">
            Profile Photo URL or Data URL
            <input
              value={draft.profile.photo}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, photo: event.target.value },
                }))
              }
            />
          </label>
          <label className="full">
            Upload Profile Photo
            <input type="file" accept="image/*" onChange={handlePhotoUpload} />
          </label>
          <label className="full">
            Hero Headline
            <input
              value={draft.hero.headline}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, headline: event.target.value },
                }))
              }
            />
          </label>
          <label className="full">
            Hero Subtext
            <textarea
              rows={3}
              value={draft.hero.subtext}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, subtext: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Download Button Label
            <input
              value={draft.hero.downloadLabel}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, downloadLabel: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Hero Name Font Size
            <input
              value={draft.hero.nameFontSize}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, nameFontSize: event.target.value },
                }))
              }
              placeholder="5.6rem"
            />
          </label>
          <label>
            Hero Headline Font Size
            <input
              value={draft.hero.headlineFontSize}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, headlineFontSize: event.target.value },
                }))
              }
              placeholder="2.3rem"
            />
          </label>
          <label className="full">
            Hero Summary
            <textarea
              rows={3}
              value={draft.hero.summary}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, summary: event.target.value },
                }))
              }
            />
          </label>
        </div>

        <h3>Hero Highlights</h3>
        {draft.hero.highlights.map((item, index) => (
          <div key={`${item.label}-${index}`} className="admin-group">
            <div className="admin-grid two-col">
              <label>
                Label
                <input
                  value={item.label}
                  onChange={(event) => updateHeroHighlight(index, { label: event.target.value })}
                />
              </label>
              <label>
                Value
                <input
                  value={item.value}
                  onChange={(event) => updateHeroHighlight(index, { value: event.target.value })}
                />
              </label>
            </div>
            <button
              type="button"
              className="ghost danger"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  hero: {
                    ...prev.hero,
                    highlights: prev.hero.highlights.filter((_, currentIndex) => currentIndex !== index),
                  },
                }))
              }
            >
              Remove Highlight
            </button>
          </div>
        ))}
        <button
          type="button"
          className="ghost"
          onClick={() =>
            setDraft((prev) => ({
              ...prev,
              hero: {
                ...prev.hero,
                highlights: [...prev.hero.highlights, { label: "", value: "" }],
              },
            }))
          }
        >
          Add Highlight
        </button>
      </section>

      <section className="admin-card">
        <h2>Section Labels & CV Copy</h2>
        <div className="admin-grid two-col">
          <label>
            About Eyebrow
            <input
              value={draft.about.eyebrow}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  about: { ...prev.about, eyebrow: event.target.value },
                }))
              }
            />
          </label>
          <label>
            About Heading
            <input
              value={draft.about.heading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  about: { ...prev.about, heading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Focus Eyebrow
            <input
              value={draft.focus.eyebrow}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, focus: { ...prev.focus, eyebrow: event.target.value } }))
              }
            />
          </label>
          <label>
            Focus Heading
            <input
              value={draft.focus.heading}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, focus: { ...prev.focus, heading: event.target.value } }))
              }
            />
          </label>
          <label>
            Experience Eyebrow
            <input
              value={draft.experienceSection.eyebrow}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  experienceSection: { ...prev.experienceSection, eyebrow: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Experience Heading
            <input
              value={draft.experienceSection.heading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  experienceSection: { ...prev.experienceSection, heading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Skills Eyebrow
            <input
              value={draft.skillsSection.eyebrow}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  skillsSection: { ...prev.skillsSection, eyebrow: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Skills Heading
            <input
              value={draft.skillsSection.heading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  skillsSection: { ...prev.skillsSection, heading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Tools Eyebrow
            <input
              value={draft.toolsSection.eyebrow}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  toolsSection: { ...prev.toolsSection, eyebrow: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Tools Heading
            <input
              value={draft.toolsSection.heading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  toolsSection: { ...prev.toolsSection, heading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Certifications Eyebrow
            <input
              value={draft.certificationsSection.eyebrow}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  certificationsSection: {
                    ...prev.certificationsSection,
                    eyebrow: event.target.value,
                  },
                }))
              }
            />
          </label>
          <label>
            Certifications Heading
            <input
              value={draft.certificationsSection.heading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  certificationsSection: {
                    ...prev.certificationsSection,
                    heading: event.target.value,
                  },
                }))
              }
            />
          </label>
          <label>
            Achievements Eyebrow
            <input
              value={draft.achievementsSection.eyebrow}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  achievementsSection: {
                    ...prev.achievementsSection,
                    eyebrow: event.target.value,
                  },
                }))
              }
            />
          </label>
          <label>
            Achievements Heading
            <input
              value={draft.achievementsSection.heading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  achievementsSection: {
                    ...prev.achievementsSection,
                    heading: event.target.value,
                  },
                }))
              }
            />
          </label>
          <label>
            Projects Eyebrow
            <input
              value={draft.projectsSection.eyebrow}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  projectsSection: { ...prev.projectsSection, eyebrow: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Projects Heading
            <input
              value={draft.projectsSection.heading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  projectsSection: { ...prev.projectsSection, heading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Project Card Label
            <input
              value={draft.projectsSection.cardLabel}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  projectsSection: { ...prev.projectsSection, cardLabel: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Empty Project Link Label
            <input
              value={draft.projectsSection.emptyLinkLabel}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  projectsSection: { ...prev.projectsSection, emptyLinkLabel: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Contact Eyebrow
            <input
              value={draft.contactSection.eyebrow}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  contactSection: { ...prev.contactSection, eyebrow: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Contact Heading
            <input
              value={draft.contactSection.heading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  contactSection: { ...prev.contactSection, heading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV Document Label
            <input
              value={draft.cv.documentLabel}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, documentLabel: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV Download Label
            <input
              value={draft.cv.downloadLabel}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, downloadLabel: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV / QR Portfolio URL
            <input
              value={draft.cv.portfolioUrl}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, portfolioUrl: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV Back Link Label
            <input
              value={draft.cv.backToPortfolioLabel}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, backToPortfolioLabel: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV Print Hint
            <input
              value={draft.cv.printHint}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, printHint: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV Summary Heading
            <input
              value={draft.cv.summaryHeading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, summaryHeading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV Experience Heading
            <input
              value={draft.cv.experienceHeading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, experienceHeading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV Skills Heading
            <input
              value={draft.cv.skillsHeading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, skillsHeading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV Tools Heading
            <input
              value={draft.cv.toolsHeading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, toolsHeading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV Certifications Heading
            <input
              value={draft.cv.certificationsHeading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, certificationsHeading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV Achievements Heading
            <input
              value={draft.cv.achievementsHeading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, achievementsHeading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV Projects Heading
            <input
              value={draft.cv.projectsHeading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, projectsHeading: event.target.value },
                }))
              }
            />
          </label>
          <label>
            CV Contact Heading
            <input
              value={draft.cv.contactHeading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, contactHeading: event.target.value },
                }))
              }
            />
          </label>
          <label className="full">
            PDF QR Caption
            <input
              value={draft.cv.qrCaption}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  cv: { ...prev.cv, qrCaption: event.target.value },
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className="admin-card">
        <h2>About</h2>
        <label>
          Description
          <textarea
            rows={5}
            value={draft.about.description}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                about: { ...prev.about, description: event.target.value },
              }))
            }
          />
        </label>
      </section>

      <section className="admin-card">
        <h2>Experience Timeline</h2>
        {draft.experience.map((item, index) => (
          <div key={`${item.company}-${index}`} className="admin-group">
            <div className="admin-grid two-col">
              <label>
                Company
                <input
                  value={item.company}
                  onChange={(event) => updateExperience(index, { company: event.target.value })}
                />
              </label>
              <label>
                Role
                <input
                  value={item.role}
                  onChange={(event) => updateExperience(index, { role: event.target.value })}
                />
              </label>
              <label>
                Duration
                <input
                  value={item.duration}
                  onChange={(event) => updateExperience(index, { duration: event.target.value })}
                />
              </label>
            </div>
            <label>
              Details
              <textarea
                rows={3}
                value={item.details}
                onChange={(event) => updateExperience(index, { details: event.target.value })}
              />
            </label>
            <button
              type="button"
              className="ghost danger"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  experience: prev.experience.filter((_, currentIndex) => currentIndex !== index),
                }))
              }
            >
              Remove Experience
            </button>
          </div>
        ))}
        <button
          type="button"
          className="ghost"
          onClick={() =>
            setDraft((prev) => ({
              ...prev,
              experience: [...prev.experience, { company: "", role: "", duration: "", details: "" }],
            }))
          }
        >
          Add Experience
        </button>
      </section>

      <section className="admin-card">
        <h2>Skills, Tools, Achievements</h2>
        <div className="admin-grid two-col">
          <label>
            Skills (one per line)
            <textarea
              rows={8}
              value={draft.skills.join("\n")}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, skills: splitLines(event.target.value) }))
              }
            />
          </label>
          <label>
            Tools (one per line)
            <textarea
              rows={8}
              value={draft.tools.join("\n")}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, tools: splitLines(event.target.value) }))
              }
            />
          </label>
          <label className="full">
            Achievements (one per line)
            <textarea
              rows={6}
              value={draft.achievements.join("\n")}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  achievements: splitLines(event.target.value),
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className="admin-card">
        <h2>Certifications</h2>
        {draft.certifications.map((item, index) => (
          <div key={`${item.name}-${index}`} className="admin-group">
            <div className="admin-grid three-col">
              <label>
                Name
                <input
                  value={item.name}
                  onChange={(event) => updateCertification(index, { name: event.target.value })}
                />
              </label>
              <label>
                Issuer
                <input
                  value={item.issuer}
                  onChange={(event) => updateCertification(index, { issuer: event.target.value })}
                />
              </label>
              <label>
                Date
                <input
                  value={item.date}
                  onChange={(event) => updateCertification(index, { date: event.target.value })}
                />
              </label>
            </div>
            <button
              type="button"
              className="ghost danger"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  certifications: prev.certifications.filter(
                    (_, currentIndex) => currentIndex !== index
                  ),
                }))
              }
            >
              Remove Certification
            </button>
          </div>
        ))}

        <button
          type="button"
          className="ghost"
          onClick={() =>
            setDraft((prev) => ({
              ...prev,
              certifications: [...prev.certifications, { name: "", issuer: "", date: "" }],
            }))
          }
        >
          Add Certification
        </button>
      </section>

      <section className="admin-card">
        <h2>Projects / Key Work</h2>
        {draft.projects.map((item, index) => (
          <div key={`${item.name}-${index}`} className="admin-group">
            <div className="admin-grid two-col">
              <label>
                Name
                <input
                  value={item.name}
                  onChange={(event) => updateProject(index, { name: event.target.value })}
                />
              </label>
              <label>
                Link (optional)
                <input
                  value={item.link}
                  onChange={(event) => updateProject(index, { link: event.target.value })}
                />
              </label>
            </div>
            <label>
              Description
              <textarea
                rows={4}
                value={item.description}
                onChange={(event) => updateProject(index, { description: event.target.value })}
              />
            </label>
            <button
              type="button"
              className="ghost danger"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  projects: prev.projects.filter((_, currentIndex) => currentIndex !== index),
                }))
              }
            >
              Remove Project
            </button>
          </div>
        ))}

        <button
          type="button"
          className="ghost"
          onClick={() =>
            setDraft((prev) => ({
              ...prev,
              projects: [...prev.projects, { name: "", description: "", link: "" }],
            }))
          }
        >
          Add Project
        </button>
      </section>

      <section className="admin-card">
        <h2>Contact, Social & SEO</h2>
        <div className="admin-grid two-col">
          <label>
            Email
            <input
              value={draft.contact.email}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, email: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Phone
            <input
              value={draft.contact.phone}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, phone: event.target.value },
                }))
              }
            />
          </label>
          <label>
            LinkedIn
            <input
              value={draft.contact.linkedin}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, linkedin: event.target.value },
                }))
              }
            />
          </label>
          <label>
            GitHub
            <input
              value={draft.contact.github}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, github: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Website / Portfolio URL
            <input
              value={draft.contact.website}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, website: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Facebook
            <input
              value={draft.contact.facebook}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, facebook: event.target.value },
                }))
              }
            />
          </label>
          <label>
            X / Twitter
            <input
              value={draft.contact.x}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, x: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Instagram
            <input
              value={draft.contact.instagram}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, instagram: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Threads
            <input
              value={draft.contact.threads}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, threads: event.target.value },
                }))
              }
            />
          </label>
          <label>
            Telegram
            <input
              value={draft.contact.telegram}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, telegram: event.target.value },
                }))
              }
            />
          </label>
          <label className="full">
            SEO Title
            <input
              value={draft.seo.title}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, seo: { ...prev.seo, title: event.target.value } }))
              }
            />
          </label>
          <label className="full">
            SEO Description
            <textarea
              rows={3}
              value={draft.seo.description}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, description: event.target.value },
                }))
              }
            />
          </label>
        </div>
      </section>
    </main>
  );
}
