import type { Project } from "@/data/projects";
import Image from "next/image";
import CodeBlock from "./CodeBlock";
import LinkList from "./LinkList";
import MultiLineTruncate from "./MultiLineTruncate";
import Tag from "./Tag";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card grid gap-5 p-4 sm:p-6 md:grid-cols-[.82fr_1.18fr]">
      <div className="project-shot-wrap mx-auto w-full max-w-97.5 p-3 sm:p-4">
        <Image
          src={project.shot}
          alt={project.shotAlt}
          width={800}
          height={600}
          unoptimized
          className="block h-auto w-auto max-h-90 rounded-lg"
        />
      </div>
      <div className="min-w-0 py-1">
        <div className="project-title-row">
          <Image
            src={project.logo}
            alt=""
            width={32}
            height={32}
            unoptimized
            className="-mr-1 h-8 w-8"
          />
          <h3 className="text-[20px] font-semibold tracking-[-0.01em]">
            {project.name}
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {project.pills.map((pill) => (
              <Tag key={pill}>{pill}</Tag>
            ))}
          </ul>
        </div>
        <p className="project-detail-label">Why I built it</p>
        <p className="project-intro mt-2 text-muted">{project.tagline}</p>
        <p className="project-detail-label">The thinking behind it</p>
        <MultiLineTruncate
          text={project.paragraphs.join("\n\n")}
          lines={7}
          className="mt-2 whitespace-pre-line text-[14px] leading-[1.7] text-muted"
        />
        <CodeBlock lines={project.commands} />
        <LinkList items={project.links} />
      </div>
    </article>
  );
}
