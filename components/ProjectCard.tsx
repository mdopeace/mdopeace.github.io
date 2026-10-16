import type { Project } from "@/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col rounded-xl border border-line bg-panel p-5">
      {project.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.image}
          alt={`${project.name} — ${project.tagline}`}
          className="mb-4 rounded-lg border border-line"
        />
      ) : (
        project.imageFallback && (
          <div className="mb-4 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-line px-4 text-center text-sm text-faint">
            {project.imageFallback}
          </div>
        )
      )}

      <h3 className="text-lg font-semibold text-text">{project.name}</h3>
      <p className="mt-1 text-sm text-muted">{project.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{project.summary}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{project.problem}</p>

      {project.brew && (
        <div className="mt-4 rounded-lg border border-amberline bg-amberbg px-3 py-2">
          <code className="block font-mono text-xs break-all text-amber">
            {project.brew.tap}
          </code>
          <code className="mt-1 block font-mono text-xs break-all text-amber">
            {project.brew.install}
          </code>
        </div>
      )}

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {project.links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted underline underline-offset-4 hover:text-text"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}