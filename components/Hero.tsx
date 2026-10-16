import { site } from "@/data/site";

export function Hero() {
  return (
    <header className="mx-auto w-full max-w-[980px] px-page pt-24 pb-20">
      <h1 className="text-3xl font-semibold tracking-tight text-text">
        {site.name}
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        {site.role} at {site.company}, {site.location} — web by day.
      </p>
      <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-text">
        I watch a lot of movies, and no Mac player felt right — so I built one.
        Then I kept losing the ideas for improving it, so I built a tool to hold
        them.
      </p>
      <p className="mt-4 text-[15px] text-muted">Both are on Homebrew.</p>
    </header>
  );
}