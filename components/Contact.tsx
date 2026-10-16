import { Section } from "./Section";
import { site } from "@/data/site";

const linkClass =
  "text-text underline underline-offset-4 hover:text-muted";

export function Contact() {
  return (
    <Section label="Get in touch">
      <ul className="flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
        <li>
          <a href={`mailto:${site.email}`} className={linkClass}>
            {site.email}
          </a>
        </li>
        <li>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GitHub
          </a>
        </li>
        <li>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            LinkedIn
          </a>
        </li>
      </ul>
    </Section>
  );
}