import type { ProjectLink } from "@/data/projects";
import type { IconType } from "react-icons";
import { FaGithub, FaGlobe, FaTag } from "react-icons/fa6";

const projectLinkIcons: Record<string, IconType> = {
  Source: FaGithub,
  Releases: FaTag,
  "Live page": FaGlobe,
  "Homebrew tap": FaGithub,
};

export default function LinkList({
  items,
  quiet = false,
  className = "",
}: {
  items: (ProjectLink & { rel?: string })[];
  quiet?: boolean;
  className?: string;
}) {
  // Project actions are styled as compact comic links; quiet remains available
  // for link groups that should read as plain text.
  return (
    <ul className={`project-links ${className}`}>
      {items.map((item) => {
        const Icon = projectLinkIcons[item.label];
        return (
          <li key={item.href}>
            <a
              href={item.href}
              rel={item.rel}
              className={quiet ? "no-underline" : undefined}
            >
              {Icon && (
                <Icon
                  className="project-link-icon"
                  aria-hidden="true"
                  focusable="false"
                />
              )}
              {item.label}
              <span className="external-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
