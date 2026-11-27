import { Grid } from "@mdopeace/ui/Layout";
import { projects } from "@/data/projects";
import ProjectCard from "../portfolio/ProjectCard";
import Section from "../portfolio/PortfolioSection";
import styles from "../portfolio/project-media.module.css";

const vidp = projects.find(project => project.id === "vidp");
const workProjects = vidp ? [vidp, ...projects.filter(project => project !== vidp)] : projects;

export default function Projects() {
  return (
    <Section label="Selected work" id="work" index="02">
      <Grid columns={{ base: 1, md: 2 }} gap={6} className={styles.mosaic}>
        {workProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            tone={project.id === "vidp" ? "info" : project.id === "component-library" ? "accent" : "default"}
          />
        ))}
      </Grid>
    </Section>
  );
}
