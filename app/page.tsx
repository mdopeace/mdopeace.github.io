import { Hero } from "@/components/Hero";
import { ProjectCard } from "@/components/ProjectCard";
import { Loop } from "@/components/Loop";
import { Context } from "@/components/Context";
import { Contact } from "@/components/Contact";
import { Section } from "@/components/Section";
import { projects } from "@/data/site";

export default function Home() {
  return (
    // One page-level wrapper carries the measure and the gutter, exactly as
    // .wrap does on the QuickTodo page. Sections below then carry no
    // horizontal padding of their own, so their rules span the content box
    // rather than the full 980px.
    <div className="mx-auto w-full max-w-[980px] px-page">
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
    </div>
  );
}