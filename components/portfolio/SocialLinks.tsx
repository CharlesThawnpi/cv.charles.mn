import type { ReactNode } from "react";
import type { PortfolioContent } from "@/config/contentModel";

type ContactLinks = PortfolioContent["contact"];

interface SocialLinkItem {
  key: keyof ContactLinks;
  label: string;
  href: string;
}

interface SocialLinksProps {
  contact: ContactLinks;
  className?: string;
}

const socialIconMap: Record<string, ReactNode> = {
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A2 2 0 1 0 5.3 7a2 2 0 0 0-.05-4ZM20.44 12.88c0-3.5-1.87-5.13-4.37-5.13a3.78 3.78 0 0 0-3.4 1.87V8.5H9.3V20h3.38v-6.4c0-1.69.32-3.33 2.42-3.33 2.07 0 2.1 1.94 2.1 3.44V20h3.38v-7.12Z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.61-3.37-1.18-3.37-1.18A2.66 2.66 0 0 0 5 16.66c-.92-.63.07-.62.07-.62a2.1 2.1 0 0 1 1.53 1.04 2.15 2.15 0 0 0 2.94.84 2.15 2.15 0 0 1 .64-1.35c-2.22-.25-4.55-1.11-4.55-4.94a3.87 3.87 0 0 1 1.03-2.69 3.6 3.6 0 0 1 .1-2.65s.84-.27 2.75 1.02a9.49 9.49 0 0 1 5 0c1.9-1.3 2.74-1.02 2.74-1.02a3.6 3.6 0 0 1 .1 2.65 3.87 3.87 0 0 1 1.02 2.69c0 3.84-2.33 4.69-4.56 4.94a2.4 2.4 0 0 1 .68 1.86v2.76c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm6.93 9h-3.01a15.62 15.62 0 0 0-1.2-5.02A8.03 8.03 0 0 1 18.93 11ZM12 4.07A13.73 13.73 0 0 1 13.91 11H10.1A13.73 13.73 0 0 1 12 4.07ZM4.06 13h3.02a15.62 15.62 0 0 0 1.2 5.02A8.03 8.03 0 0 1 4.06 13Zm3.02-2H4.06a8.03 8.03 0 0 1 4.22-5.02A15.62 15.62 0 0 0 7.08 11Zm4.92 8.93A13.73 13.73 0 0 1 10.1 13h3.81A13.73 13.73 0 0 1 12 19.93ZM14.4 13H9.6a13.7 13.7 0 0 1 0-2h4.8a13.7 13.7 0 0 1 0 2Zm.32 5.02A15.62 15.62 0 0 0 15.92 13h3.01a8.03 8.03 0 0 1-4.21 5.02Z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.08c0-.87.24-1.46 1.5-1.46H16.7V4.94A22.13 22.13 0 0 0 14.2 4.8c-2.48 0-4.18 1.52-4.18 4.3V11H7.2v3h2.82v8Z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 3H21l-4.58 5.24L21.8 21h-4.22l-3.3-4.98L9.93 21H7.8l4.9-5.6L3 3h4.33l2.98 4.5L14.2 3h2.12Zm-1.48 15.45h1.17L6.7 5.47H5.45Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.95 1.35a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1ZM12 6.86A5.14 5.14 0 1 1 6.86 12 5.14 5.14 0 0 1 12 6.86Zm0 1.8A3.34 3.34 0 1 0 15.34 12 3.34 3.34 0 0 0 12 8.66Z" />
    </svg>
  ),
  threads: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.74 11.35a3.7 3.7 0 0 0-3.51-2.08c-2.3 0-3.82 1.34-3.82 3.39 0 2.17 1.7 3.56 4.3 3.56 2.08 0 3.82-.84 4.47-2.61.33-.92.28-1.93-.14-2.87a5.74 5.74 0 0 0-5.34-3.38c-3.69 0-6.37 2.58-6.37 6.14 0 3.76 2.84 6.3 7.07 6.3 3.56 0 6.04-1.66 6.86-4.55l-1.93-.52c-.57 2.13-2.36 3.31-4.93 3.31-3.1 0-5.12-1.82-5.12-4.63 0-2.45 1.77-4.26 4.25-4.26a3.74 3.74 0 0 1 3.55 2.12Zm-2.96 3.12c-1.34 0-2.21-.67-2.21-1.67 0-.95.73-1.57 1.85-1.57.78 0 1.55.19 2.28.55a2.32 2.32 0 0 1-1.92 2.69Z" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.2 4.8 18.08 19a1.22 1.22 0 0 1-1.8.76l-4.03-2.97-2.06 1.98a1 1 0 0 1-.8.33l.3-4.27 7.78-7.03c.34-.3-.07-.47-.52-.17l-9.62 6.06L3.2 12.4a1.2 1.2 0 0 1 .04-2.27L19.1 4.02a1.22 1.22 0 0 1 1.7 1.38Z" />
    </svg>
  ),
};

const getSocialLinks = (contact: ContactLinks): SocialLinkItem[] => {
  const candidates: Array<{ key: keyof ContactLinks; label: string }> = [
    { key: "linkedin", label: "LinkedIn" },
    { key: "github", label: "GitHub" },
    { key: "website", label: "Website" },
    { key: "facebook", label: "Facebook" },
    { key: "x", label: "X" },
    { key: "instagram", label: "Instagram" },
    { key: "threads", label: "Threads" },
    { key: "telegram", label: "Telegram" },
  ];

  return candidates
    .map((item) => ({
      ...item,
      href: contact[item.key],
    }))
    .filter((item) => item.href);
};

export function SocialLinks({ contact, className }: SocialLinksProps) {
  const links = getSocialLinks(contact);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className={className ?? "social-links"} aria-label="Social media links">
      {links.map((item) => (
        <a key={item.key} className="social-link" href={item.href} target="_blank" rel="noreferrer">
          <span className="social-link-icon">{socialIconMap[item.key]}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </div>
  );
}

export const getPdfSocialLinks = (contact: ContactLinks) =>
  getSocialLinks(contact).map((item) => ({
    label: item.label,
    href: item.href,
  }));
