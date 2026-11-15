import type { ReactNode } from "react";
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
  return (
    <Section
      id={id}
      title={label}
      className="portfolio-section"
      heading={
        <Inline gap={4} wrap={false}>
          <Badge variant="solid" tone="emphasis" decoration="index" size="md" aria-hidden="true">
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
