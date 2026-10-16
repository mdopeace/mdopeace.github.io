import { Section } from "./Section";
import { site } from "@/data/site";

export function Context() {
  return (
    <Section label="Day job" as="h2">
      <div className="max-w-[62ch] space-y-4 text-[15px] leading-relaxed text-muted">
        <p>
          {site.role} at {site.company}, {site.location}, since {site.since}.
          Full-stack web by day — {site.dayStack.join(", ")}.
        </p>
        <p>
          Part of the platform team, where we handle{" "}
          {site.infraScope.join(", ")}.
        </p>
      </div>
    </Section>
  );
}