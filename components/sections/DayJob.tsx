import Section from "../Section";

export default function DayJob() {
  return (
    <Section label="Experience & toolkit" id="experience" index="03">
      <div className="experience-grid grid gap-5 md:grid-cols-[1fr_.8fr]">
        <article className="comic-panel p-6 sm:p-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[.12em] text-amber">01 · Tracxn</p>
          <h3 className="mt-3 text-2xl font-black tracking-[-.05em]">Software Engineer</h3>
          <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[.08em] text-muted">Bengaluru · Jan 2023 — now</p>
          <div className="mt-6 grid gap-4 text-[15px] leading-[1.7] text-muted">
        <p>
          Software Engineer at Tracxn, Bengaluru, since January 2023.
          Full-stack web by day — React, Next.js, Astro, Express, MongoDB,
          AWS Lambda.
        </p>
        <p>
          Part of the platform team: the app framework and build, logging
          and error tracking, the public and auth pages, the UI components.
          The parts every product ends up needing, and nobody demos.
        </p>
          </div>
        </article>
        <article className="toolkit-panel border-[2px] border-line p-6 sm:p-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[.12em]">Things I work with</p>
          <div className="mt-5">
            <h3 className="font-black uppercase tracking-[.08em]">Web platform</h3>
            <p className="mt-2 text-sm leading-[1.8] text-muted">React · Next.js · Astro · Express · MongoDB · AWS Lambda</p>
          </div>
          <div className="mt-5 border-t border-line pt-5">
            <h3 className="font-black uppercase tracking-[.08em]">Native Mac apps</h3>
            <p className="mt-2 text-sm leading-[1.8] text-muted">SwiftUI · AppKit · mpv · OpenGL</p>
          </div>
          <p className="mt-6 border-l-[4px] border-accent-2 pl-3 font-mono text-xs leading-[1.6] text-muted">From shared platform foundations to small tools with a sharp purpose.</p>
        </article>
      </div>
    </Section>
  );
}
