import { Section } from "./Section";
import { loopSteps } from "@/data/site";

export function Loop() {
  return (
    <Section label="How this happened">
      <ol className="max-w-[62ch] space-y-4">
        {loopSteps.map((step, i) => (
          <li key={step} className="flex gap-4">
            <span className="font-mono text-sm text-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[15px] leading-relaxed text-muted">{step}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}