import Section from "../Section";

export default function DayJob() {
  return (
    <Section label="Day job">
      <div className="grid gap-4 text-[15px] leading-[1.6] text-muted">
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
    </Section>
  );
}
