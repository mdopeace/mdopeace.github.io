"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Section } from "../ui/Section";
import { Inline } from "../ui/Layout";
import { Heading } from "../ui/Typography";
import { Badge } from "../ui/Badge";
import { Divider } from "../ui/Divider";

export default function PortfolioSection({
  label,
  id,
  index,
  children,
}: {
  label: string;
  id?: string;
  index: string;
  children: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!id) return;

    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !window.location.hash) return;

        const hash = `#${id}`;
        if (window.location.hash !== hash) {
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}${hash}`,
          );
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [id]);

  return (
    <Section
      ref={sectionRef}
      id={id}
      title={label}
      className="portfolio-section"
      heading={
        <Inline gap={4} wrap={false}>
          <Badge variant="solid" tone="emphasis" decoration="index" aria-hidden="true">
            {index}
          </Badge>
          <Heading level={2} size="section">
            {label}
          </Heading>
          <div className="section-rule">
            <Divider />
          </div>
        </Inline>
      }
    >
      {children}
    </Section>
  );
}
