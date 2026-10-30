import Section from "../Section";

export default function Now() {
  return (
    <Section label="What’s cooking" id="now" index="04">
      <div className="now-grid grid gap-5 md:grid-cols-2">
        <article className="now-panel comic-panel relative overflow-hidden p-6 sm:p-8">
          <div className="now-stamp" aria-hidden="true">IN PROGRESS</div>
          <div className="relative z-10 max-w-[620px]">
            <p className="font-mono text-xs font-bold uppercase tracking-[.12em] text-muted">On the workbench · 01</p>
            <h3 className="mt-3 text-2xl font-black tracking-[-.05em] sm:text-3xl">Vidp is still a work in progress.</h3>
            <p className="mt-4 text-[15px] leading-[1.7] text-muted">
              I use it every day. The features it’s still missing are the ones QuickTodo already has. That gap is part of the work—and a reminder that building something useful means paying attention after the first release.
            </p>
            <a href="https://github.com/mdopeace/vidp" className="mt-5 inline-flex font-mono text-xs font-black uppercase tracking-[.08em] text-text">Follow the build <span className="ml-2" aria-hidden="true">↗</span></a>
          </div>
        </article>
        <article className="next-up comic-panel halftone flex min-h-[250px] flex-col justify-between p-6 sm:p-8">
          <span className="comic-label">More in the works</span>
          <p className="max-w-[420px] text-xl font-black leading-[1.35] tracking-[-.04em]">
            The public projects are only part of what I’m working on. Some ideas are still taking shape; I’ll share them here when they’re ready.
          </p>
          <span className="font-mono text-xs font-bold uppercase tracking-[.12em] text-muted">Stay curious <span aria-hidden="true">✳</span></span>
        </article>
      </div>
    </Section>
  );
}
