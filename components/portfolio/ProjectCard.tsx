import type { Project } from "@/data/projects";
import Image from "next/image";
import { FaChrome, FaFirefoxBrowser, FaGithub, FaGlobe, FaTag } from "react-icons/fa6";
import { CodeBlock } from "../ui/CodeBlock";
import { LinkGroup } from "../ui/LinkGroup";
import { ExpandableText } from "../ui/ExpandableText";
import { Badge } from "../ui/Badge";
import { Surface } from "../ui/Surface";
import { Stack, Inline } from "../ui/Layout";
import { Heading, Text } from "../ui/Typography";
const icons = {
  github: FaGithub,
  tag: FaTag,
  globe: FaGlobe,
  chrome: FaChrome,
  firefox: FaFirefoxBrowser,
};
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Surface as="article" className="project-layout">
      <Surface
        tone="info"
        padding={4}
        elevation="none"
        className="project-media"
      >
        <Image
          src={project.shot}
          alt={project.shotAlt}
          width={800}
          height={600}
          loading={project.name === "QuickTodo" ? "eager" : "lazy"}
          unoptimized
          className="project-image"
        />
      </Surface>
      <Stack gap={4} className="project-copy">
        <Inline gap={3}>
          <Image src={project.logo} alt="" width={32} height={32} unoptimized className="project-logo" />
          <Heading level={3} size="card">{project.name}</Heading>
          <Inline as="ul" gap={2}>
            {project.pills.map((pill) => (
              <li key={pill}>
                <Badge>{pill}</Badge>
              </li>
            ))}
          </Inline>
        </Inline>
        <Stack gap={2}>
          <Text variant="eyebrow" size="caption">
            Why I built it
          </Text>
          <Text variant="callout" tone="muted">{project.tagline}</Text>
        </Stack>
        <Stack gap={2}>
          <Text variant="eyebrow" size="caption">
            The thinking behind it
          </Text>
          <ExpandableText expandLabel="Read more" collapseLabel="Read less">
            {project.paragraphs.join("\n\n")}
          </ExpandableText>
        </Stack>
        {project.commands.length > 0 && (
          <CodeBlock code={project.commands.join("\n")} />
        )}
        <LinkGroup
          items={project.links.map(({ icon, ...item }) => {
            const Icon = icons[icon];
            return {
              ...item,
              startIcon: <Icon />,
              variant: "secondary",
              size: "sm",
              externalIndicator: true,
            };
          })}
        />
      </Stack>
    </Surface>
  );
}
