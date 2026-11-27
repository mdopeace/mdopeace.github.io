import type { Project } from "@/data/projects";
import { FaArrowRightLong, FaChrome, FaFirefoxBrowser, FaGithub, FaTag } from "react-icons/fa6";
import { ComicPanel } from "@mdopeace/ui/ComicPanel";
import { ComicStrip } from "@mdopeace/ui/ComicStrip";
import { CommandBlock } from "@mdopeace/ui/CommandBlock";
import { Image } from "@mdopeace/ui/Image";
import { LinkGroup } from "@mdopeace/ui/LinkGroup";
import { ExpandableText } from "@mdopeace/ui/ExpandableText";
import { Badge } from "@mdopeace/ui/Badge";
import { Surface } from "@mdopeace/ui/Surface";
import { Stack, Inline } from "@mdopeace/ui/Layout";
import { Heading, Text } from "@mdopeace/ui/Typography";
import { withBasePath } from "@/lib/withBasePath";
import ProjectLogo from "./ProjectLogo";
import styles from "./project-media.module.css";

const icons = {
  github: FaGithub,
  tag: FaTag,
  chrome: FaChrome,
  firefox: FaFirefoxBrowser,
};

const stages = [
  ["problem", "Problem"],
  ["idea", "Idea"],
  ["result", "Result"],
] as const;

export default function ProjectCard({ project }: { project: Project }) {
  const titleId = `${project.id}-title`;

  return (
    <Surface as="article" id={project.id} className={styles.project} aria-labelledby={titleId}>
      <Stack gap={5}>
        <Inline gap={3}>
          {project.logo && (
            <ProjectLogo src={withBasePath(project.logo)} />
          )}
          <Heading id={titleId} level={3} size="card">{project.name}</Heading>
          <Inline as="ul" gap={2}>
            {project.pills.map((pill) => (
              <li key={pill}>
                <Badge>{pill}</Badge>
              </li>
            ))}
          </Inline>
        </Inline>
        <ComicStrip role="group" aria-label={`${project.name} comic strip`}>
          {stages.map(([stage, label]) => {
            const { still, caption } = project.strip[stage];
            return (
              <ComicPanel
                key={stage}
                className={styles.panel}
                media={still && (
                  <Image
                    src={withBasePath(still.src)}
                    alt={still.alt}
                    width={still.width}
                    height={still.height}
                    className={styles.still}
                    imageClassName={styles.stillImage}
                  />
                )}
                caption={<><strong className={styles.stage}>{label}</strong>{" "}{caption}</>}
              />
            );
          })}
        </ComicStrip>
        <LinkGroup
          items={[
            {
              label: "Try it",
              href: project.tryHref,
              variant: "primary",
              size: "sm",
              "aria-label": `Try it: ${project.name}`,
              endIcon: <FaArrowRightLong />,
            },
            ...project.links.map(({ icon, ...item }) => {
              const Icon = icons[icon];
              return {
                ...item,
                startIcon: <Icon />,
                variant: "secondary",
                size: "sm",
                externalIndicator: true,
              } as const;
            }),
          ]}
        />
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
      </Stack>
    </Surface>
  );
}
