import type { Project } from "@/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    // Row layout: the 980px measure split in half made each card 454x982 —
    // a 2.2:1 vertical ribbon where every paragraph wrapped at ~40
    // characters. Full-width rows keep the text readable and the screenshot
    // visible at the same time.
    <article className="grid gap-6 rounded-xl border border-line bg-panel p-5 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <div className="flex items-center">
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt={`${project.name} — ${project.tagline}`}
            className="w-full rounded-lg border border-line"
          />
        ) : (
          project.imageFallback && (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-line px-4 text-center text-sm text-faint">
              {project.imageFallback}
            </div>
          )
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-text">{project.name}</h3>
        <p className="mt-1 text-sm text-muted">{project.tagline}</p>
        <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-muted">
          {project.summary}
        </p>
        <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-muted">
          {project.problem}
        </p>

        {project.brew && (
          <>
            <div className="mt-5 max-w-[62ch] rounded-lg border border-amberline bg-amberbg px-3 py-2">
              <code className="block font-mono text-xs break-words text-amber">
                {project.brew.tap}
              </code>
              <code className="mt-1 block font-mono text-xs break-words text-amber">
                {project.brew.install}
              </code>
            </div>
            <ul className="mt-2 space-y-0.5">
              {project.requires.map((r) => (
                <li key={r} className="text-xs leading-relaxed text-faint">
                  {r}
                </li>
              ))}
            </ul>
          </>
        )}

        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1">
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
      </div>
    </article>
  );
}