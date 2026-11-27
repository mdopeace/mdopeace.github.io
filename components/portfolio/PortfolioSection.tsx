import type { ReactNode } from "react";
import { Section } from "@mdopeace/ui/Section";
import { Inline } from "@mdopeace/ui/Layout";
import { Heading } from "@mdopeace/ui/Typography";
import { Badge } from "@mdopeace/ui/Badge";
import { Divider } from "@mdopeace/ui/Divider";

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
      contentGap={{ base: 5, md: 6, lg: 8 }}
      padding={{ base: 10, md: 12, lg: 16 }}
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
