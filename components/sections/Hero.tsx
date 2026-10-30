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
        <svg className="maker-art" viewBox="0 0 420 380" role="img" aria-labelledby="maker-title maker-desc">
          <title id="maker-title">A maker at work</title>
          <desc id="maker-desc">A playful comic illustration of a person thinking through an idea at a desk.</desc>
          <g stroke="var(--ink)" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">
            <path fill="var(--accent-2)" d="M75 330h280v24H75z" />
            <path fill="var(--blue)" d="M95 320V216h153v104" />
            <path fill="var(--paper)" d="M110 230h123v78H110z" />
            <path fill="var(--accent)" d="M111 230h122v18H111z" />
            <path fill="var(--paper)" d="m130 270 18-16 16 14 24-21 26 28" fillOpacity=".75" />
            <path fill="var(--ink)" d="M152 320h40v14h-40z" />
            <path fill="var(--accent-2)" d="M215 186c0-52 30-91 74-91 43 0 72 36 72 89v31H215z" />
            <path fill="#d99268" d="M231 179c0-41 24-69 59-69 37 0 58 28 58 69v31c0 36-24 59-58 59s-59-23-59-59z" />
            <path fill="var(--ink)" d="M222 177c-9-49 12-93 61-102 32-6 62 14 69 47-23-11-49-15-74-10-13 22-31 40-56 54z" />
            <path fill="none" d="M260 185h2m47 0h2" strokeWidth="9" />
            <path fill="none" d="M277 218q13 12 27 0" strokeWidth="5" />
            <path fill="var(--blue)" d="M220 267q34-18 69-1 37-17 69 3l35 52H194z" />
            <path fill="#d99268" d="M266 281q14-19 27 0l21 23q8 12-5 19-9 5-17-4l-26-22" />
            <path fill="var(--accent)" d="M190 310h141l-17 17H202z" />
            <path fill="var(--ink)" d="m85 120 10-24 10 24 25 10-25 10-10 25-10-25-25-10z" />
            <path fill="var(--accent)" d="m358 76 7-17 7 17 18 7-18 7-7 18-7-18-18-7z" />
          </g>
          <path d="M249 287q17-8 30 4" fill="none" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" />
        </svg>
        <span className="art-caption">curiosity → idea → build</span>
      </div>
    </header>
  );
}
