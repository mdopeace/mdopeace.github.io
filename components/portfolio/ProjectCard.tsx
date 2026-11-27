import type { Project } from "@/data/projects";
import type { ReactNode } from "react";
import { FaArrowRightLong, FaChrome, FaFirefoxBrowser, FaGithub, FaTag } from "react-icons/fa6";
import { LuBlocks } from "react-icons/lu";
import { ComicPanel } from "@mdopeace/ui/ComicPanel";
import { ComicStrip } from "@mdopeace/ui/ComicStrip";
import { CommandBlock } from "@mdopeace/ui/CommandBlock";
import { Divider } from "@mdopeace/ui/Divider";
import { Image } from "@mdopeace/ui/Image";
import { Link } from "@mdopeace/ui/Link";
import { LinkGroup, type LinkItem } from "@mdopeace/ui/LinkGroup";
import { Badge } from "@mdopeace/ui/Badge";
import { Surface, type SurfaceProps } from "@mdopeace/ui/Surface";
import { Stack, Inline } from "@mdopeace/ui/Layout";
import { Heading, Text } from "@mdopeace/ui/Typography";
import { withBasePath } from "@/lib/withBasePath";
import ProjectDetails from "./ProjectDetails";
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

const mastheadStyles: Record<string, Pick<SurfaceProps, "tone" | "variant">> = {
  vidp: { tone: "info", variant: "soft" },
  quicktodo: { tone: "accent", variant: "soft" },
  cookieater: { tone: "emphasis", variant: "solid" },
  "component-library": { tone: "default", variant: "soft" },
};

function ProjectStill({ still, cover = false }: {
  still: Project["strip"]["result"]["still"];
  cover?: boolean;
}) {
  return (
    <Image
      src={withBasePath(still.src)}
      alt={still.alt}
      width={still.width}
      height={still.height}
      className={cover ? styles.cover : styles.still}
      imageClassName={styles.stillImage}
    />
  );
}

function ProjectStamp({ children, tilt = false, tone = "accent" }: {
  children: ReactNode;
  tilt?: boolean;
  tone?: "default" | "accent";
}) {
  return (
    <Badge variant="solid" tone={tone} shape="square" size={tilt ? "md" : "sm"}
      tilt={tilt ? "right" : undefined} aria-hidden="true">
      {children}
    </Badge>
  );
}

function LibraryMark() {
  return <LuBlocks size="var(--ui-icon-md)" focusable="false" />;
}

function ProjectMasthead({ project, action }: {
  project: Project;
  action: LinkItem;
}) {
  return (
    <Surface {...mastheadStyles[project.id]} texture="halftone" elevation="md" padding={3} className={styles.masthead}>
      <Inline gap={4} justify="between">
        <Inline gap={3} wrap={false}>
          <ProjectStamp tilt tone={project.logo ? "default" : "accent"}>
            {project.logo ? <ProjectLogo src={withBasePath(project.logo)} /> : <LibraryMark />}
          </ProjectStamp>
          <Stack gap={1}>
            <Text variant="eyebrow">Project file</Text>
            <Text size="body" weight="bold">{project.modalPitch ?? project.summary ?? project.blurb}</Text>
          </Stack>
        </Inline>
        <LinkGroup items={[action]} aria-label="Try the project" />
      </Inline>
    </Surface>
  );
}

export default function ProjectCard({ project, tone = "default" }: {
  project: Project;
  tone?: "default" | "accent" | "info";
}) {
  const titleId = `${project.id}-title`;
  const isVidp = project.id === "vidp";
  const playground = project.id === "component-library";
  const primaryLabel = playground ? "Explore the playground" : "Try it";
  const primaryAction: LinkItem = {
    label: primaryLabel,
    href: project.tryHref,
    variant: "primary",
    size: "md",
    "aria-label": playground ? primaryLabel : `Try it: ${project.name}`,
    endIcon: <FaArrowRightLong />,
  };
  const resources: LinkItem[] = project.links.map(({ icon, ...item }) => {
    const Icon = icons[icon];
    return { ...item, startIcon: <Icon />, variant: "secondary", size: "md", externalIndicator: true };
  });
  const cover = project.strip[project.cover].still;
  const coverLayout = cover.width / cover.height > 1.4 ? "landscape" : "compact";
  const accentMark = isVidp ? "playback" : playground ? "blocks" : undefined;

  return (
    <Surface as="article" id={project.id} className={styles.project} data-accent-mark={accentMark}
      aria-labelledby={titleId} tone={tone} variant="soft"
      texture={tone === "default" ? undefined : "halftone"} padding={{ base: 4, md: 5 }}>
      <Stack gap={4}>
        <Inline gap={3}>
          <Inline gap={2} wrap={false}>
            {project.logo && (
              <ProjectStamp tone="default"><ProjectLogo src={withBasePath(project.logo)} compact /></ProjectStamp>
            )}
            {playground && <ProjectStamp><LibraryMark /></ProjectStamp>}
            <Heading id={titleId} level={3} size="card" weight="bold">{project.name}</Heading>
          </Inline>
          <Inline as="ul" aria-label="Project tags" gap={2}>
            {project.pills.map(pill => <li key={pill}><Badge>{pill}</Badge></li>)}
          </Inline>
        </Inline>
        <div className={styles.intro} data-cover-layout={coverLayout} data-wide-actions={playground || undefined}>
          <Surface padding={0} border="standard" elevation="none" className={styles.artwork} data-project-cover>
            <ProjectStill still={cover} cover />
          </Surface>
          <Stack gap={4} className={styles.copy}>
            <Text tone="muted">{project.blurb}</Text>
            <Inline gap={3} className={styles.actions}>
              {playground && (
                <Link variant="primary" size="md" href={project.tryHref} endIcon={<FaArrowRightLong />}>
                  {primaryLabel}
                </Link>
              )}
              <ProjectDetails name={project.name} secondary={playground} titleSize="feature">
                <ProjectMasthead project={project} action={primaryAction} />
                <Stack gap={3}>
                  <Heading level={3} size="label">The story in three panels</Heading>
                  <ComicStrip alignCaptions role="group" aria-label={`${project.name} comic strip`}>
                    {stages.map(([stage, label]) => {
                      const { still, caption } = project.strip[stage];
                      return (
                        <ComicPanel
                          key={stage}
                          border="standard"
                          media={<ProjectStill still={still} />}
                          captionTitle={label}
                          caption={caption}
                        />
                      );
                    })}
                  </ComicStrip>
                </Stack>
                <Surface padding={4} elevation="none" texture="halftone-soft">
                  <Stack gap={2}>
                    <Heading level={3} size="label">The thinking behind it</Heading>
                    {project.paragraphs.map(paragraph => <Text key={paragraph} size="sm">{paragraph}</Text>)}
                  </Stack>
                </Surface>
                <Divider variant="dashed" tone="muted" />
                <Stack gap={3}>
                  <Heading level={3} size="label">Project resources</Heading>
                  <LinkGroup items={resources} aria-label="Project resources" />
                  {project.commands.length > 0 && <CommandBlock code={project.commands.join("\n")} />}
                </Stack>
              </ProjectDetails>
            </Inline>
          </Stack>
        </div>
      </Stack>
    </Surface>
  );
}
