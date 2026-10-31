import TetrisGameboy from "../hero/TetrisGameboy";

export default function Hero() {
  return (
    <header
      id="top"
      className="hero-grid relative mt-7 grid overflow-hidden border-[3px] border-line bg-panel shadow-comic md:grid-cols-[1.15fr_.85fr]"
    >
      <div className="relative z-10 p-6 sm:p-10 lg:p-12">
        <span className="comic-label">Issue 01 · The maker</span>
        <p className="mt-7 font-mono text-xs font-bold uppercase tracking-[.12em] text-muted">
          Software Engineer · Bengaluru
        </p>
        <h1 className="mt-3 max-w-175 text-[clamp(3rem,8vw,6.5rem)] font-black leading-[.86] tracking-[-.04em]">
          Md Mostafijur <span className="hero-name">Rahman</span>
        </h1>
        <p className="mt-7 max-w-147.5 text-base leading-[1.75] sm:text-lg">
          I notice the little frictions that get in the way of a good
          experience—and I like figuring out how to make them disappear.
        </p>
        <p className="mt-3 max-w-147.5 text-sm leading-[1.7] text-muted">
          At Tracxn, I work across the web platform. Outside work, I turn the
          things I wish existed into small, useful tools.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a className="button-comic" href="#work">
            See what I’ve made <span aria-hidden="true">↘</span>
          </a>
          <a className="button-comic button-secondary" href="#story">
            How I think <span aria-hidden="true">↘</span>
          </a>
        </div>
      </div>
      <div className="hero-art gameboy-stage relative min-h-75 overflow-hidden border-t-[3px] border-line md:border-t-0 md:border-l-[3px]">
        <TetrisGameboy />
      </div>
    </header>
  );
}
