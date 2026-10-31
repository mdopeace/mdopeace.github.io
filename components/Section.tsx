"use client";

import { useEffect, useRef, type ReactNode } from "react";

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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!id) return;

    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !window.location.hash) return;

        const hash = `#${id}`;
        if (window.location.hash !== hash) {
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}${hash}`,
          );
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [id]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="portfolio-section py-16 sm:py-20"
    >
      <div className="mb-8 flex items-center gap-4">
        <span className="section-index" aria-hidden="true">
          {index}
        </span>
        <h2 className="section-title">{label}</h2>
        <span className="h-0.5 flex-1 bg-line" />
      </div>
      {children}
    </section>
  );
}
