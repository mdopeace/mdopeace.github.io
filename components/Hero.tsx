import { site } from "@/data/site";

export function Hero() {
  return (
    <header className="pt-[72px] pb-16">
      <h1 className="text-[clamp(32px,5vw,46px)] leading-[1.1] font-bold tracking-[-0.025em] text-text">
        {site.name}
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        {site.role} at {site.company}, {site.location} — web by day.
      </p>
      <p className="mt-6 max-w-[34ch] text-lg leading-relaxed text-text sm:max-w-[52ch]">
        I watch a lot of movies, and no Mac player felt right — so I built one.
        Then I kept losing the ideas for improving it, so I built a tool to hold
        them.
      </p>
      <p className="mt-4 text-[15px] text-muted">Both are on Homebrew.</p>
    </header>
  );
}