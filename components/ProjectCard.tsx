import type { Project } from "@/data/projects";
import CodeBlock from "./CodeBlock";
import LinkList from "./LinkList";
import Tag from "./Tag";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-wrap gap-6 rounded-xl border border-line bg-panel p-5">
      {/* flex-none with a capped width rather than a flex basis, so that when
          the row wraps the shot still spans its line and centres itself
          instead of sitting 320px wide against the left edge of a card. */}
      <div className="mx-auto flex w-full max-w-[320px] shrink-0 items-center justify-center">
        {/* The screenshots are 600x672 — taller than wide. Capped at the
            desktop column width they render 320x358 on every viewport,
            which is the size the desktop layout was verified at. */}
        <img
          src={project.shot}
          alt={project.shotAlt}
          className="block w-auto max-w-[min(100%,320px)] rounded-lg border border-line"
        />
      </div>
      <div className="flex-[1_1_420px]">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          {/* macOS icons ship their own padding, so this reads closer to a
              24px glyph. -4px pulls it to 6px off the title, so icon+title
              read as one unit and the shared 10px gap only separates the
              pills. */}
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
        <p className="mt-1 text-[14px] text-muted">{project.tagline}</p>
        {project.paragraphs.map((text, i) => (
          <p
            key={text}
            className={`text-[14px] leading-[1.6] text-muted ${
              i === 0 ? "mt-4" : "mt-3"
            }`}
          >
            {text}
          </p>
        ))}
        <CodeBlock lines={project.commands} />
        <LinkList items={project.links} className="mt-5 text-[14px]" />
      </div>
    </article>
  );
}
