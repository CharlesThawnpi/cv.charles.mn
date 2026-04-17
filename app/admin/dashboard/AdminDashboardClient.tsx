"use client";

import { useEffect, useState } from "react";
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

  const loadDraft = async () => {
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
  };

  useEffect(() => {
    void loadDraft();
  }, []);

  const saveDraft = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; source?: "postgres" | "local"; updatedAt?: string };

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
    setPublishing(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/admin/publish", { method: "POST" });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; source?: "postgres" | "local"; publishedAt?: string };

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
          <button type="button" onClick={saveDraft} disabled={saving}>
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button type="button" onClick={publishDraft} disabled={publishing}>
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
                setDraft((prev) => ({ ...prev, profile: { ...prev.profile, name: event.target.value } }))
              }
            />
          </label>
          <label>
            Title
            <input
              value={draft.profile.title}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, profile: { ...prev.profile, title: event.target.value } }))
              }
            />
          </label>
          <label className="full">
            Location
            <input
              value={draft.profile.location}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, profile: { ...prev.profile, location: event.target.value } }))
              }
            />
          </label>
          <label className="full">
            Short Bio
            <textarea
              rows={3}
              value={draft.profile.bio}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, profile: { ...prev.profile, bio: event.target.value } }))
              }
            />
          </label>
          <label className="full">
            Hero Headline
            <input
              value={draft.hero.headline}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, hero: { ...prev.hero, headline: event.target.value } }))
              }
            />
          </label>
          <label className="full">
            Hero Subtext
            <textarea
              rows={3}
              value={draft.hero.subtext}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, hero: { ...prev.hero, subtext: event.target.value } }))
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
              setDraft((prev) => ({ ...prev, about: { description: event.target.value } }))
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
                <input value={item.company} onChange={(event) => updateExperience(index, { company: event.target.value })} />
              </label>
              <label>
                Role
                <input value={item.role} onChange={(event) => updateExperience(index, { role: event.target.value })} />
              </label>
              <label>
                Duration
                <input value={item.duration} onChange={(event) => updateExperience(index, { duration: event.target.value })} />
              </label>
            </div>
            <label>
              Details
              <textarea rows={3} value={item.details} onChange={(event) => updateExperience(index, { details: event.target.value })} />
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
              onChange={(event) => setDraft((prev) => ({ ...prev, skills: splitLines(event.target.value) }))}
            />
          </label>
          <label>
            Tools (one per line)
            <textarea
              rows={8}
              value={draft.tools.join("\n")}
              onChange={(event) => setDraft((prev) => ({ ...prev, tools: splitLines(event.target.value) }))}
            />
          </label>
          <label className="full">
            Achievements (one per line)
            <textarea
              rows={6}
              value={draft.achievements.join("\n")}
              onChange={(event) => setDraft((prev) => ({ ...prev, achievements: splitLines(event.target.value) }))}
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
                <input value={item.name} onChange={(event) => updateCertification(index, { name: event.target.value })} />
              </label>
              <label>
                Issuer
                <input value={item.issuer} onChange={(event) => updateCertification(index, { issuer: event.target.value })} />
              </label>
              <label>
                Date
                <input value={item.date} onChange={(event) => updateCertification(index, { date: event.target.value })} />
              </label>
            </div>
            <button
              type="button"
              className="ghost danger"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  certifications: prev.certifications.filter((_, currentIndex) => currentIndex !== index),
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
                <input value={item.name} onChange={(event) => updateProject(index, { name: event.target.value })} />
              </label>
              <label>
                Link (optional)
                <input value={item.link} onChange={(event) => updateProject(index, { link: event.target.value })} />
              </label>
            </div>
            <label>
              Description
              <textarea rows={4} value={item.description} onChange={(event) => updateProject(index, { description: event.target.value })} />
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
        <h2>Contact & SEO</h2>
        <div className="admin-grid two-col">
          <label>
            Email
            <input
              value={draft.contact.email}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, contact: { ...prev.contact, email: event.target.value } }))
              }
            />
          </label>
          <label>
            Phone
            <input
              value={draft.contact.phone}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, contact: { ...prev.contact, phone: event.target.value } }))
              }
            />
          </label>
          <label>
            LinkedIn
            <input
              value={draft.contact.linkedin}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, contact: { ...prev.contact, linkedin: event.target.value } }))
              }
            />
          </label>
          <label>
            GitHub
            <input
              value={draft.contact.github}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, contact: { ...prev.contact, github: event.target.value } }))
              }
            />
          </label>
          <label className="full">
            Website
            <input
              value={draft.contact.website}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, contact: { ...prev.contact, website: event.target.value } }))
              }
            />
          </label>
          <label className="full">
            SEO Title
            <input
              value={draft.seo.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, seo: { ...prev.seo, title: event.target.value } }))}
            />
          </label>
          <label className="full">
            SEO Description
            <textarea
              rows={3}
              value={draft.seo.description}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, seo: { ...prev.seo, description: event.target.value } }))
              }
            />
          </label>
        </div>
      </section>
    </main>
  );
}

