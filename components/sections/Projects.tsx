import { HuntSticker } from "../portfolio/StickerHunt";
import { Inline, Stack } from "@mdopeace/ui/Layout";
import { projects } from "@/data/projects";
import ProjectCard from "../portfolio/ProjectCard";
import Section from "../portfolio/PortfolioSection";

export default function Projects() {
  return (
    <Section label="Selected work" id="work" index="02">
      <Stack gap={6}>
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
        <Inline justify="end">
          <HuntSticker id="shipped" />
        </Inline>
      </Stack>
    </Section>
  );
}
