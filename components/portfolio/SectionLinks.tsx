"use client";

import { useEffect, useRef, useState } from "react";
import { NavbarLinks } from "@mdopeace/ui/NavbarLinks";

const links = [
  { id: "story", label: "Story", href: "#story" },
  { id: "work", label: "Work", href: "#work" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "now", label: "Now", href: "#now" },
  { id: "contact", label: "Contact", href: "#contact" },
] as const;
type SectionId = (typeof links)[number]["id"];

export default function SectionLinks() {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    const header = container.current?.closest("nav");
    const sections = links.map(link => ({
      id: link.id,
      element: document.getElementById(link.id),
    }));
    let frame = 0;
    const update = () => {
      frame = 0;
      const headerLine = (header?.getBoundingClientRect().bottom ?? 0) + 24;
      const scrollPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      let current: SectionId | null = null;
      for (const section of sections) {
        if (section.element) {
          // Native anchors combine the page's scroll padding and section margin.
          // Use that landing line too, so clicking a link selects its destination.
          const scrollMargin = parseFloat(getComputedStyle(section.element).scrollMarginTop) || 0;
          const readingLine = Math.max(headerLine, scrollPadding + scrollMargin) + 2;
          if (section.element.getBoundingClientRect().top <= readingLine) current = section.id;
        }
      }
      // The final section can be too short to reach the reading line.
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2)
        current = "contact";
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    if (header) observer.observe(header);
    for (const section of sections) if (section.element) observer.observe(section.element);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);


  return <NavbarLinks ref={container} items={links} activeId={active ?? undefined} current="location" />;
}
