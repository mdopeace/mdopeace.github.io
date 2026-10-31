import type { ReactNode } from "react";

export default function Section({
  label,
  id,
  index,
  children,
}: {
  label: string;
  id?: string;
  index: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="portfolio-section py-16 sm:py-20">
      <div className="mb-8 flex items-center gap-4">
        <span className="section-index" aria-hidden="true">
          {index}
        </span>
        <h2 className="section-title">{label}</h2>
        <span className="h-[2px] flex-1 bg-line" />
      </div>
      {children}
    </section>
  );
}
