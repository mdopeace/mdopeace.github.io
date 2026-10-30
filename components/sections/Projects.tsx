import { projects } from "@/data/projects";
import ProjectCard from "../ProjectCard";
import Section from "../Section";

export default function Projects() {
  return (
    <Section label="Selected work" id="work" index="02">
      <div className="grid gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </Section>
  );
}
