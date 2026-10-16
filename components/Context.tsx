import { Section } from "./Section";
import { site } from "@/data/site";

export function Context() {
  return (
    <Section label="Day job">
      <div className="max-w-[62ch] space-y-4 text-[15px] leading-relaxed text-muted">
        <p>
          {site.role} at {site.company}, {site.location}, since {site.since}.
          Full-stack web by day — {site.dayStack.join(", ")}.
        </p>
        <p>
          Alongside features I own the platform work:{" "}
          {site.infraScope.join(", ")}.
        </p>
      </div>
      <ul className="mt-6 flex flex-wrap gap-2">
        {site.dayStack.map((t) => (
          <li
            key={t}
            className="rounded-full border border-line px-3 py-1 text-xs text-muted"
          >
            {t}
          </li>
        ))}
      </ul>
    </Section>
  );
}