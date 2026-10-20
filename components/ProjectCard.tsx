import type { Project } from "@/data/projects";
import CodeBlock from "./CodeBlock";
import LinkList from "./LinkList";
import MultiLineTruncate from "./MultiLineTruncate";
import Tag from "./Tag";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-wrap gap-6 rounded-xl border border-line bg-panel p-5">
      <div className="mx-auto flex w-full max-w-[320px] shrink-0 items-center justify-center">
        {/* Capped at 320 — the width this layout was verified at. */}
        <img
          src={project.shot}
          alt={project.shotAlt}
          className="block w-auto max-w-[min(100%,320px)] rounded-lg border border-line"
        />
      </div>
      <div className="flex-[1_1_420px]">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <img
            src={project.logo}
            alt=""
            width={32}
            height={32}
            className="-mr-1 h-8 w-8"
          />
          <h2 className="text-[20px] font-semibold tracking-[-0.01em]">
            {project.name}
          </h2>
          <ul className="flex flex-wrap gap-1.5">
            {project.pills.map((pill) => (
              <Tag key={pill}>{pill}</Tag>
            ))}
          </ul>
        </div>
        {/* One shared line budget keeps every card the same height. */}
        <MultiLineTruncate
          text={[project.tagline, ...project.paragraphs].join("\n\n")}
          lines={8}
          className="mt-1 whitespace-pre-line text-[14px] leading-[1.6] text-muted"
        />
        <CodeBlock lines={project.commands} />
        <LinkList items={project.links} className="mt-5 text-[14px]" />
      </div>
    </article>
  );
}
