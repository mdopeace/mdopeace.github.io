import MakerPortrait from "../illustrations/MakerPortrait";

export default function Hero() {
  return (
    <header id="top" className="hero-grid relative mt-7 grid overflow-hidden border-[3px] border-line bg-panel shadow-comic md:grid-cols-[1.15fr_.85fr]">
      <div className="relative z-10 p-6 sm:p-10 lg:p-12">
        <span className="comic-label">Issue 01 · The maker</span>
        <p className="mt-7 font-mono text-xs font-bold uppercase tracking-[.12em] text-muted">Software Engineer · Bengaluru</p>
        <h1 className="mt-3 max-w-175 text-[clamp(3rem,8vw,6.5rem)] font-black leading-[.86] tracking-[-.085em]">
          Md Mostafijur <span className="hero-name">Rahman</span>
        </h1>
        <p className="mt-7 max-w-147.5 text-base leading-[1.75] sm:text-lg">
          I notice the little frictions that get in the way of a good experience—and I like figuring out how to make them disappear.
        </p>
        <p className="mt-3 max-w-147.5 text-sm leading-[1.7] text-muted">
          At Tracxn, I work across the web platform. Outside work, I turn the things I wish existed into small, useful tools.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a className="button-comic" href="#work">See what I’ve made <span aria-hidden="true">↘</span></a>
          <a className="button-comic button-secondary" href="#story">How I think <span aria-hidden="true">↘</span></a>
        </div>
      </div>
      <div className="hero-art relative min-h-75 overflow-hidden border-t-[3px] border-line md:border-t-0 md:border-l-[3px]">
        <div className="hero-sun" aria-hidden="true" />
        <div className="hero-speech comic-panel">“Could this work a little better?”</div>
        <div className="tech-floats" aria-hidden="true">
          <div className="tech-float tech-float--code">
            <svg viewBox="0 0 48 40">
              <rect x="2" y="2" width="44" height="36" rx="2" fill="#172a34" />
              <path d="m19 13-7 7 7 7m10-14 7 7-7 7" fill="none" stroke="#f5cb56" strokeWidth="3" strokeLinecap="square" />
            </svg>
            <span>CODE</span>
          </div>
          <div className="tech-float tech-float--react">
            <svg viewBox="0 0 48 40">
              <g fill="none" stroke="#167d9b" strokeWidth="2">
                <ellipse cx="24" cy="20" rx="20" ry="7" />
                <ellipse cx="24" cy="20" rx="20" ry="7" transform="rotate(60 24 20)" />
                <ellipse cx="24" cy="20" rx="20" ry="7" transform="rotate(120 24 20)" />
              </g>
              <circle cx="24" cy="20" r="3.5" fill="#167d9b" />
            </svg>
            <span>REACT</span>
          </div>
          <div className="tech-float tech-float--html">
            <svg viewBox="0 0 40 44">
              <path fill="#e95d32" d="M3 2h34l-3 35-14 5L6 37z" />
              <path fill="#fffaf0" d="M11 10h19l-1 5H16l1 5h11l-2 12-7 2-7-2-1-7h5l1 3 4-1 1-3H13z" />
            </svg>
            <span>HTML</span>
          </div>
          <div className="tech-float tech-float--css">
            <svg viewBox="0 0 40 44">
              <path fill="#2777b8" d="M3 2h34l-3 35-14 5L6 37z" />
              <text x="20" y="32" fill="#fffaf0" fontFamily="sans-serif" fontSize="24" fontWeight="900" textAnchor="middle">3</text>
            </svg>
            <span>CSS</span>
          </div>
          <div className="tech-float tech-float--mongo">
            <svg viewBox="0 0 40 44">
              <path d="M21 4C10 14 10 27 20 39 30 28 31 15 21 4Z" fill="#43a047" />
              <path d="M20 13v25m0-12-6-6m6 11 6-7" fill="none" stroke="#fffaf0" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>MONGO</span>
          </div>
        </div>
        <svg className="maker-art" viewBox="0 0 420 380" role="img" aria-labelledby="maker-title maker-desc">
          <title id="maker-title">A maker at work</title>
          <desc id="maker-desc">A hooded developer wearing dark glasses works at a laptop, surrounded by floating web technology icons.</desc>
          <g stroke="var(--ink)" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">
            <MakerPortrait x={127} y={5} scale={1.1} />
            <path fill="#263b46" d="M162 224q-24 7-29 31l21 29 23-4 17-25-18-32z" />
            <path fill="#263b46" d="M258 224q24 7 29 31l-21 29-23-4-17-25 18-32z" />
            <path fill="var(--ink)" d="M80 194q0-9 9-9h242q9 0 9 9v109H80z" />
            <path fill="#bfe4e5" d="M94 201h232v87H94z" />
            <path fill="#fffaf0" d="M94 201h232v16H94z" />
            <circle cx="106" cy="209" r="3" fill="#e95d32" stroke="none" />
            <circle cx="117" cy="209" r="3" fill="#f5cb56" stroke="none" />
            <circle cx="128" cy="209" r="3" fill="#43a047" stroke="none" />
            <path fill="none" stroke="#167d9b" strokeWidth="5" d="m121 237-10 10 10 10m22-20 10 10-10 10m18 0 10-20" />
            <path fill="none" stroke="#a13c24" strokeWidth="4" d="M113 270h132m-132 10h89" />
            <path fill="#e9dfc9" d="M69 303h282l-21 25H91z" />
            <path fill="#56646a" d="M153 308h112l-6 12h-99z" />
            <path fill="#263b46" d="M157 274q-17 14-21 30l16 11 21-16 17-12m56-13q17 14 21 30l-16 11-21-16-17-12" />
            <path fill="#172a34" d="M151 306h118l-8 17h-102z" />
            <path fill="none" stroke="#bfe4e5" strokeWidth="3" d="m162 310 4 0m8 0 4 0m8 0 4 0m8 0 4 0m8 0 4 0m8 0 4 0m8 0 4 0m8 0 4 0m8 0 4 0" />
            <path fill="#d99268" strokeWidth="4" d="M137 298q2-7 9-5l16 8q5 3 2 8-3 4-7 1l-5-3 6 8q3 5-2 8-5 3-8-2l-11-14q-3-4 0-9zm146 0q-2-7-9-5l-16 8q-5 3-2 8 3 4 7 1l5-3-6 8q-3 5 2 8 5 3 8-2l11-14q3-4 0-9z" />
            <path fill="none" stroke="#5b392b" strokeWidth="2.5" d="m142 297 9 9m-1-11 10 10m117-8-9 9m1-11-10 10" />
          </g>
          <path fill="var(--accent-2)" stroke="var(--ink)" strokeWidth="6" d="M72 333h276v17H72z" />
        </svg>
        <span className="art-caption">curiosity → idea → build</span>
      </div>
    </header>
  );
}
