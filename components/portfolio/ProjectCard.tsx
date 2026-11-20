import type { Project } from "@/data/projects";
import { FaChrome, FaFirefoxBrowser, FaGithub, FaGlobe, FaTag } from "react-icons/fa6";
import { CommandBlock } from "@mdopeace/ui/CommandBlock";
import { LinkGroup } from "@mdopeace/ui/LinkGroup";
import { ExpandableText } from "@mdopeace/ui/ExpandableText";
import { Badge } from "@mdopeace/ui/Badge";
import { Surface } from "@mdopeace/ui/Surface";
import { Stack, Inline } from "@mdopeace/ui/Layout";
import { Heading, Text } from "@mdopeace/ui/Typography";
import ComponentLibraryPreview from "./ComponentLibraryPreview";
import ProjectImage from "./ProjectImage";
import ProjectLogo from "./ProjectLogo";
const icons = {
  github: FaGithub,
  tag: FaTag,
  globe: FaGlobe,
  chrome: FaChrome,
  firefox: FaFirefoxBrowser,
};
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Surface as="article" id={project.id} className="project-layout">
      <Surface
        tone={project.preview === "component-library" ? "subtle" : "info"}
        padding={4}
        elevation="none"
        className="project-media"
      >
        {project.preview === "component-library" ? (
          <ComponentLibraryPreview />
        ) : (
          <ProjectImage
            src={project.shot}
            alt={project.shotAlt}
            width={project.shotWidth}
            height={project.shotHeight}
            loading={project.name === "QuickTodo" ? "eager" : "lazy"}
          />
        )}
      </Surface>
      <Stack gap={4} className="project-copy">
        <Inline gap={3}>
          {project.logo && (
            <ProjectLogo src={project.logo} />
          )}
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
          <CommandBlock code={project.commands.join("\n")} />
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
