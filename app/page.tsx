import { Hero } from "@/components/Hero";
import { ProjectCard } from "@/components/ProjectCard";
import { Loop } from "@/components/Loop";
import { Context } from "@/components/Context";
import { Contact } from "@/components/Contact";
import { Section } from "@/components/Section";
import { projects } from "@/data/site";

export default function Home() {
  return (
    <main>
      <Hero />
      <Section label="Projects" as="h2">
        <div className="space-y-6">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </Section>
      <Loop />
      <Context />
      <Contact />
    </main>
  );
}